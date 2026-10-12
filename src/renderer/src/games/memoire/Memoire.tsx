import { useEffect, useRef, useState } from 'react'
import type { ListePhrases, Profile, Resultat, ResultatMemoire } from '../../../../shared/data'
import { Avatar } from '../../avatar/Avatar'
import { IconBack, IconCheck } from '../../components/Icons'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { formatDuree } from '../dactylo/engine'
import { pourcentage } from '../commun'
import { Chips, FinHero, GameTopbar, ReponseInput, StatTile } from '../ui'
import { choisirMots, dureeMemorisation, nombreParNiveau, proposer } from './engine'

const NOMBRES = [3, 4, 5, 6, 7, 8] as const
type Nombre = (typeof NOMBRES)[number]

interface Props {
  profile: Profile
  listes: ListePhrases[]
  resultats: Resultat[]
  onResult: (r: ResultatMemoire) => void
  onQuit: () => void
}

type Phase =
  | { nom: 'choix' }
  | { nom: 'jeu'; liste: ListePhrases; mots: string[] }
  | { nom: 'fin'; liste: ListePhrases; mots: string[]; trouves: boolean[]; resultat: ResultatMemoire; record: boolean }

export function Memoire({ profile, listes, resultats, onResult, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const [nombre, setNombre] = useState<Nombre>(nombreParNiveau(profile.niveau) as Nombre)

  const lancer = (liste: ListePhrases) => setPhase({ nom: 'jeu', liste, mots: choisirMots(liste.phrases, nombre) })

  const terminer = (liste: ListePhrases, mots: string[], trouves: boolean[], erreurs: number, dureeMs: number, complete: boolean) => {
    if (!complete && dureeMs === 0) return onQuit()
    const anciens = resultats.filter((r): r is ResultatMemoire => r.jeu === 'memoire' && r.profileId === profile.id && r.mots === mots.length)
    const r: ResultatMemoire = {
      id: uid(),
      profileId: profile.id,
      jeu: 'memoire',
      date: new Date().toISOString(),
      listeNom: liste.nom,
      mots: mots.length,
      trouves: trouves.filter(Boolean).length,
      erreurs,
      dureeMs
    }
    onResult(r)
    if (!complete) return onQuit()
    const meilleur = Math.max(0, ...anciens.map((a) => a.trouves))
    setPhase({ nom: 'fin', liste, mots, trouves, resultat: r, record: anciens.length > 0 && r.trouves > meilleur })
  }

  if (phase.nom === 'jeu') {
    return (
      <Partie
        key={phase.mots.join('|')}
        profile={profile}
        mots={phase.mots}
        onFin={(t, e, d) => terminer(phase.liste, phase.mots, t, e, d, true)}
        onQuitter={(t, e, d) => terminer(phase.liste, phase.mots, t, e, d, false)}
      />
    )
  }

  if (phase.nom === 'fin') {
    const r = phase.resultat
    const tous = r.trouves === r.mots
    return (
      <div className="screen dactylo">
        <GameTopbar titre="Mots à retenir" />
        <main className="fin-main">
          <FinHero
            profile={profile}
            message={tous ? 'Tu as retrouvé tous les mots !' : r.trouves >= r.mots / 2 ? 'Très bonne mémoire !' : 'Bien essayé, on recommence ?'}
            record={phase.record ? 'Nouveau record !' : undefined}
          />
          <div className="fin-stats">
            <StatTile value={`${r.trouves} / ${r.mots}`} label="mots retrouvés" detail={`${pourcentage(r.trouves, r.mots)} %`} />
            <StatTile value={String(r.erreurs)} label={`mot${r.erreurs > 1 ? 's' : ''} en trop`} detail={r.erreurs > 1 ? 'qui n’étaient pas dans la liste' : 'qui n’était pas dans la liste'} />
            <StatTile value={formatDuree(r.dureeMs)} label="pour retrouver les mots" detail={phase.liste.nom} />
          </div>
          <div className="mots-grille fin-mots">
            {phase.mots.map((m, i) => (
              <span key={m} className={phase.trouves[i] ? 'mot-carte trouve' : 'mot-carte oublie'}>
                {phase.trouves[i] && <IconCheck size={20} />} {m}
              </span>
            ))}
          </div>
          <div className="fin-actions">
            <button className="btn btn-ghost btn-lg" onClick={onQuit}>
              <IconBack /> Menu
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'choix' })}>
              Autres mots
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => lancer(phase.liste)} autoFocus>
              Rejouer
            </button>
          </div>
        </main>
      </div>
    )
  }

  const jouables = listes.filter((l) => l.phrases.length > 0)
  const triees = [...jouables].sort(
    (a, b) => Number(b.niveau === profile.niveau) - Number(a.niveau === profile.niveau) || a.niveau - b.niveau
  )
  return (
    <div className="screen dactylo">
      <GameTopbar titre="Mots à retenir" onBack={onQuit} />
      <main className="choix-main">
        <h2 className="choix-title">Choisis tes mots</h2>
        <Chips label="Nombre de mots à retenir" values={NOMBRES} value={nombre} onChange={setNombre} />
        {triees.length === 0 ? (
          <p className="empty">Aucune liste de mots. Demande à ton ergothérapeute d’en ajouter.</p>
        ) : (
          <div className="liste-grid">
            {triees.map((l) => (
              <button key={l.id} className="liste-card" onClick={() => lancer(l)}>
                {l.niveau === profile.niveau && <span className="liste-badge">Pour toi</span>}
                <span className="liste-nom">{l.nom}</span>
                <span className="liste-exemple">{l.phrases.slice(0, 4).join(', ')}…</span>
                <span className="liste-info">
                  Niveau {l.niveau} · {l.phrases.length} mots
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Partie({
  profile,
  mots,
  onFin,
  onQuitter
}: {
  profile: Profile
  mots: string[]
  onFin: (trouves: boolean[], erreurs: number, dureeMs: number) => void
  onQuitter: (trouves: boolean[], erreurs: number, dureeMs: number) => void
}) {
  const duree = dureeMemorisation(mots.length)
  const [etape, setEtape] = useState<'memoriser' | 'rappel'>('memoriser')
  const [reste, setReste] = useState(duree)
  const [trouves, setTrouves] = useState<boolean[]>(() => mots.map(() => false))
  const [erreurs, setErreurs] = useState(0)
  const [message, setMessage] = useState<{ type: 'juste' | 'faux' | 'info'; texte: string } | null>(null)
  const [dernier, setDernier] = useState<number | null>(null)
  const debutRappel = useRef(0)
  const dernierSon = useRef(0)
  const fini = useRef(false)

  const finir = (t: boolean[], e: number, d: number) => {
    if (fini.current) return
    fini.current = true
    onFin(t, e, d)
  }

  // Compte à rebours de mémorisation
  useEffect(() => {
    if (etape !== 'memoriser') return
    const fin = Date.now() + reste
    const t = setInterval(() => {
      const r = Math.max(0, fin - Date.now())
      setReste(r)
      if (r === 0) commencerRappel()
    }, 100)
    return () => clearInterval(t)
  }, [etape])

  const commencerRappel = () => {
    debutRappel.current = Date.now()
    setEtape('rappel')
  }

  const dureeRappel = () => (etape === 'rappel' ? Date.now() - debutRappel.current : 0)

  const valider = (saisie: string) => {
    if (fini.current) return
    const p = proposer(mots, trouves, saisie)
    if (p.type === 'trouve') {
      const t = trouves.map((x, i) => x || i === p.index)
      setTrouves(t)
      setDernier(p.index)
      setMessage({ type: 'juste', texte: `Oui ! « ${mots[p.index]} »` })
      playSound(profile.sonReussite)
      if (t.every(Boolean)) {
        const d = dureeRappel()
        setTimeout(() => finir(t, erreurs, d), 900)
      }
    } else if (p.type === 'deja') {
      setMessage({ type: 'info', texte: `Tu as déjà trouvé « ${mots[p.index]} ».` })
    } else if (p.type === 'absent') {
      setErreurs((e) => e + 1)
      setMessage({ type: 'faux', texte: `« ${saisie.trim()} » n’était pas dans la liste.` })
      const now = Date.now()
      if (profile.dactylo.sonErreur && now - dernierSon.current > 700) {
        dernierSon.current = now
        playSound(profile.sonEchec)
      }
    }
  }

  const nbTrouves = trouves.filter(Boolean).length

  if (etape === 'memoriser') {
    return (
      <div className="screen dactylo">
        <GameTopbar onBack={() => onQuitter(trouves, 0, 0)} backLabel="Arrêter" />
        <main className="memoire-main">
          <h2 className="memoire-titre">Retiens bien ces {mots.length} mots !</h2>
          <div className="mots-grille">
            {mots.map((m) => (
              <span key={m} className="mot-carte visible">
                {m}
              </span>
            ))}
          </div>
          <div className="compte-a-rebours" aria-label={`${Math.ceil(reste / 1000)} secondes`}>
            <div className="compte-barre" style={{ width: `${(reste / duree) * 100}%` }} />
          </div>
          <button className="btn btn-primary btn-lg" onClick={commencerRappel}>
            Je suis prêt !
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="screen dactylo">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => onQuitter(trouves, erreurs, dureeRappel())}>
          <IconBack /> Arrêter
        </button>
        <div className="live-stats">
          <div className="live-stat">
            <span className="live-stat-value">
              {nbTrouves} / {mots.length}
            </span>
            <span className="live-stat-label">Trouvés</span>
          </div>
        </div>
      </header>
      <main className="memoire-main">
        <div className="memoire-entete">
          <div className="partie-avatar">
            <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={84} />
          </div>
          <h2 className="memoire-titre">Quels étaient les mots ?</h2>
        </div>
        <div className="mots-grille">
          {mots.map((m, i) => (
            <span key={m} className={trouves[i] ? `mot-carte trouve${dernier === i ? ' nouveau' : ''}` : 'mot-carte cache'}>
              {trouves[i] ? m : '?'}
            </span>
          ))}
        </div>
        <div className="reponse-zone">
          <ReponseInput onSubmit={valider} placeholder="Tape un mot puis Entrée" etat={message?.type === 'juste' ? 'juste' : message?.type === 'faux' ? 'faux' : null} />
          <p className={`reponse-retour ${message?.type ?? ''}`}>
            {message ? message.texte : 'L’ordre n’a pas d’importance. Les accents et les majuscules non plus.'}
          </p>
        </div>
        <button className="btn btn-soft" onClick={() => finir(trouves, erreurs, dureeRappel())}>
          Je ne me souviens plus des autres
        </button>
      </main>
    </div>
  )
}
