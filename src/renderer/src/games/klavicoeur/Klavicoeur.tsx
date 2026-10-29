import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { NIVEAU_KLAVICOEUR_MAX, type Profile, type ProgressionKlavicoeur, type ResultatKlavicoeur } from '../../../../shared/data'
import { IconBack } from '../../components/Icons'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { formatDuree } from '../dactylo/engine'
import { BoutonPause, EcranPause, useChrono, usePauseAuto } from '../pause'
import { FinHero, GameTopbar, StatTile } from '../ui'
import {
  avancerProgression,
  type Changement,
  DECALAGES_RANGEES,
  descriptionNiveau,
  enGras,
  type EtatPartie,
  formatLimite,
  lettreEnCours,
  lettresHesitees,
  NIVEAUX_KLAVICOEUR,
  niveauKlavicoeur,
  NOMS_ZONES,
  nouvellePartie,
  partieFinie,
  placer,
  RANGEES_KLAVICOEUR,
  zoneDe
} from './engine'

interface Props {
  profile: Profile
  onResult: (r: ResultatKlavicoeur) => void
  onProgression: (p: ProgressionKlavicoeur) => void
  onQuit: () => void
}

type Phase =
  | { nom: 'choix' }
  | { nom: 'jeu'; n: number; niveau: number }
  | { nom: 'fin'; niveau: number; resultat: ResultatKlavicoeur; suite: ProgressionKlavicoeur; changement: Changement }

// Une lettre aux couleurs du code de l'ergothérapeute (main gauche, main
// droite, milieu), T, G et V en gras.
function classeLettre(lettre: string): string {
  return `kc-lettre kc-${zoneDe(lettre)}${enGras(lettre) ? ' kc-gras' : ''}`
}

export function Klavicoeur({ profile, onResult, onProgression, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const compteur = useRef(0)
  const prog = profile.klavicoeur

  const lancer = (niveau: number) => {
    compteur.current += 1
    setPhase({ nom: 'jeu', n: compteur.current, niveau })
  }

  const terminer = (niveau: number, etat: EtatPartie, dureeMs: number, fin: 'reussi' | 'temps' | 'arret') => {
    const lettres = etat.placees.length + etat.pioche.length + etat.deCote.length
    // Arrêt avant toute lettre posée : rien à enregistrer.
    if (fin === 'arret' && etat.placees.length === 0 && etat.hesitations === 0) return onQuit()
    const info = niveauKlavicoeur(niveau)
    const avance = fin === 'arret' ? null : avancerProgression(prog, niveau, fin === 'reussi')
    const suite = avance?.progression ?? prog
    const r: ResultatKlavicoeur = {
      id: uid(),
      profileId: profile.id,
      jeu: 'klavicoeur',
      date: new Date().toISOString(),
      complete: fin !== 'arret',
      niveau,
      tempsLimite: info.tempsLimite,
      dureeMs,
      lettres,
      placees: etat.placees.length,
      hesitations: etat.hesitations,
      hesitationsParLettre: etat.hesitationsParLettre,
      reussi: fin === 'reussi',
      tempsDepasse: fin === 'temps',
      niveauSuivant: suite.niveau
    }
    onResult(r)
    if (avance) onProgression(suite)
    if (fin === 'arret') return onQuit()
    if (fin === 'reussi') playSound(profile.sonReussite)
    setPhase({ nom: 'fin', niveau, resultat: r, suite, changement: avance?.changement ?? null })
  }

  if (phase.nom === 'jeu') {
    const niveau = phase.niveau
    return (
      <Partie
        key={phase.n}
        profile={profile}
        niveau={niveau}
        onFin={(etat, d, fin) => terminer(niveau, etat, d, fin)}
      />
    )
  }

  if (phase.nom === 'fin') {
    const r = phase.resultat
    const hesitees = lettresHesitees(r.hesitationsParLettre)
    return (
      <div className="screen dactylo">
        <GameTopbar titre="Klavicoeur" />
        <main className="fin-main">
          <FinHero
            profile={profile}
            message={
              r.reussi
                ? r.hesitations === 0
                  ? 'Toutes les lettres à leur place, sans hésiter !'
                  : 'Toutes les lettres sont à leur place !'
                : 'Le temps est écoulé. Ce n’est pas grave, on recommence ?'
            }
            record={phase.changement === 'debloque' ? `Niveau ${phase.suite.niveau} débloqué !` : undefined}
          />
          <p className="memoire-progression">{messageProgression(phase.niveau, phase.suite, phase.changement)}</p>
          <div className="fin-stats">
            <StatTile
              value={formatDuree(r.dureeMs)}
              label={r.reussi ? 'pour placer les lettres' : 'de jeu'}
              detail={r.tempsLimite > 0 ? `limite : ${formatLimite(r.tempsLimite)}` : 'sans limite de temps'}
            />
            <StatTile
              value={String(r.hesitations)}
              label={r.hesitations > 1 ? 'hésitations' : 'hésitation'}
              detail={r.hesitations > 0 ? 'lettres mises de côté puis replacées' : 'aucune lettre mise de côté'}
            />
            <StatTile value={`Niveau ${r.niveau}`} label={`${r.placees} / ${r.lettres} lettres placées`} detail={descriptionNiveau(r.niveau)} />
          </div>
          {hesitees.length > 0 && (
            <div className="kc-recap" aria-label="Lettres hésitées">
              <span className="kc-recap-titre">Lettres où tu as hésité :</span>
              {hesitees.map(([l, n]) => (
                <span key={l} className="kc-recap-lettre">
                  <span className={classeLettre(l)}>{l}</span>
                  {n > 1 && <span className="kc-recap-fois">× {n}</span>}
                </span>
              ))}
            </div>
          )}
          <div className="fin-actions">
            <button className="btn btn-ghost btn-lg" onClick={onQuit}>
              <IconBack /> Menu
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'choix' })}>
              Choisir un niveau
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => lancer(phase.suite.niveau)} autoFocus>
              {phase.suite.niveau === phase.niveau ? 'Rejouer' : `Niveau ${phase.suite.niveau}`}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="screen dactylo">
      <GameTopbar titre="Klavicoeur" onBack={onQuit} />
      <main className="choix-main">
        <h2 className="choix-title">Apprends le clavier par cœur !</h2>
        <p className="kc-regle">
          Le clavier est caché. Avec la souris, pose chaque lettre à sa place. Si tu te trompes, la lettre est mise de côté et
          tu la replaceras à la fin.
        </p>
        <Legende />
        <div className="memoire-reprendre">
          <button className="btn btn-primary btn-lg" onClick={() => lancer(prog.niveau)} autoFocus>
            Jouer au niveau {prog.niveau}
          </button>
          <span className="memoire-reprendre-info">{descriptionNiveau(prog.niveau)}</span>
        </div>
        <h2 className="choix-title">Les niveaux</h2>
        <div className="liste-grid kc-niveaux">
          {NIVEAUX_KLAVICOEUR.map((n) => {
            const ouvert = n.numero <= prog.debloque
            return (
              <button
                key={n.numero}
                className={ouvert ? 'liste-card' : 'liste-card kc-verrouille'}
                disabled={!ouvert}
                onClick={() => lancer(n.numero)}
                aria-label={`Niveau ${n.numero}${ouvert ? '' : ' (verrouillé)'}`}
              >
                {n.numero === prog.niveau && <span className="liste-badge">Pour toi</span>}
                <span className="liste-nom">Niveau {n.numero}</span>
                <span className="liste-exemple">{descriptionNiveau(n.numero)}</span>
                <span className="liste-info">
                  {!ouvert ? '🔒 Réussis le niveau précédent' : n.numero < prog.debloque ? 'Réussi' : 'À toi de jouer'}
                </span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function Legende() {
  const exemples: [string, string][] = [
    ['A', 'gauche'],
    ['B', 'droite'],
    ['H', 'milieu']
  ]
  return (
    <div className="kc-legende" aria-label="Code couleur">
      {exemples.map(([l, z]) => (
        <span key={z} className="kc-legende-item">
          <span className={classeLettre(l)}>{l}</span> {NOMS_ZONES[zoneDe(l)]}
        </span>
      ))}
      <span className="kc-legende-item">
        <span className={classeLettre('T')}>T</span>
        <span className={classeLettre('G')}>G</span>
        <span className={classeLettre('V')}>V</span> en gras
      </span>
    </div>
  )
}

// Ce qui se passe ensuite, en mots simples pour l'enfant.
function messageProgression(niveau: number, suite: ProgressionKlavicoeur, changement: Changement): string {
  switch (changement) {
    case 'debloque':
    case 'suivant':
      return `Niveau ${niveau} réussi ! Prochaine étape : ${descriptionNiveau(suite.niveau).toLowerCase()}.`
    case 'rejoue':
      return `On rejoue le niveau ${suite.niveau} : tu peux y arriver !`
    case 'descend':
      return `On retourne au niveau ${suite.niveau} pour bien s’entraîner.`
    default:
      return niveau === NIVEAU_KLAVICOEUR_MAX ? 'Tu as réussi le dernier niveau, bravo !' : `Niveau ${niveau} réussi !`
  }
}

type Message = { type: 'juste' | 'faux' | 'info'; texte: string } | null

function Partie({
  profile,
  niveau,
  onFin
}: {
  profile: Profile
  niveau: number
  onFin: (etat: EtatPartie, dureeMs: number, fin: 'reussi' | 'temps' | 'arret') => void
}) {
  const info = niveauKlavicoeur(niveau)
  const [etat, setEtat] = useState<EtatPartie>(() => nouvellePartie(niveau))
  const [message, setMessage] = useState<Message>(null)
  const [erreurSur, setErreurSur] = useState<string | null>(null) // emplacement qui clignote après une erreur
  const [fini, setFini] = useState(false)
  const finiRef = useRef(false)
  const minuteur = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { enPause, reprendre, mettreEnPause } = usePauseAuto(!fini)
  const { ecoule, lire } = useChrono(!fini && !enPause)
  const etatRef = useRef(etat)
  etatRef.current = etat
  useEffect(() => () => clearTimeout(minuteur.current), [])

  // Fin de partie : enregistrée une seule fois ; « Arrêter » est alors sans effet.
  const finir = (e: EtatPartie, dureeMs: number, fin: 'reussi' | 'temps' | 'arret', delaiMs = 0) => {
    if (finiRef.current) return
    finiRef.current = true
    setFini(true)
    if (delaiMs > 0) minuteur.current = setTimeout(() => onFin(e, dureeMs, fin), delaiMs)
    else onFin(e, dureeMs, fin)
  }

  const limiteMs = info.tempsLimite * 1000
  useEffect(() => {
    if (limiteMs > 0 && ecoule >= limiteMs && !finiRef.current) {
      setMessage({ type: 'faux', texte: 'Le temps est écoulé !' })
      finir(etatRef.current, limiteMs, 'temps', 1200)
    }
  }, [ecoule])

  const lettre = lettreEnCours(etat)

  const poser = (cible: string) => {
    if (finiRef.current || enPause || lettre === null || etat.placees.includes(cible)) return
    const { etat: suivant, juste } = placer(etat, cible)
    setEtat(suivant)
    if (juste) {
      setErreurSur(null)
      if (partieFinie(suivant)) {
        setMessage({ type: 'juste', texte: 'Bravo, le clavier est complet !' })
        finir(suivant, lire(), 'reussi', 900)
        return
      }
      setMessage(
        suivant.rattrapage && !etat.rattrapage
          ? { type: 'info', texte: 'Replace maintenant les lettres mises de côté.' }
          : { type: 'juste', texte: `Oui ! ${lettre} est à sa place.` }
      )
      playSound(profile.sonReussite)
    } else {
      setErreurSur(cible)
      setMessage({
        type: 'faux',
        texte:
          suivant.rattrapage && !etat.rattrapage
            ? `Pas là ! Replace maintenant les lettres mises de côté.`
            : `Pas là ! Le ${lettre} est mis de côté : tu le replaceras à la fin.`
      })
      playSound(profile.sonEchec)
    }
  }

  const reste = Math.max(0, limiteMs - ecoule)
  const total = etat.placees.length + etat.pioche.length + etat.deCote.length

  return (
    <div className="screen dactylo">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => finir(etatRef.current, lire(), 'arret')}>
          <IconBack /> Arrêter
        </button>
        <BoutonPause onClick={mettreEnPause} />
        <div className="live-stats">
          <div className="live-stat">
            <span className="live-stat-value">
              {etat.placees.length} / {total}
            </span>
            <span className="live-stat-label">Placées</span>
          </div>
          <div className="live-stat">
            <span className="live-stat-value">{etat.hesitations}</span>
            <span className="live-stat-label">{etat.hesitations > 1 ? 'Hésitations' : 'Hésitation'}</span>
          </div>
          <div className="live-stat">
            <span className="live-stat-value">{formatDuree(limiteMs > 0 ? reste + 999 : ecoule)}</span>
            <span className="live-stat-label">{limiteMs > 0 ? 'Restant' : 'Temps'}</span>
          </div>
        </div>
      </header>
      <main className="kc-main">
        <h2 className="memoire-titre">
          Niveau {niveau} · {descriptionNiveau(niveau)}
        </h2>
        {limiteMs > 0 && (
          <div className="compte-a-rebours" aria-hidden="true">
            <div className={reste < 15000 ? 'compte-barre bac-bientot' : 'compte-barre'} style={{ width: `${(reste / limiteMs) * 100}%` }} />
          </div>
        )}
        <div className="kc-pioche">
          <span className="kc-consigne">{etat.rattrapage ? 'Replace cette lettre :' : 'Place cette lettre :'}</span>
          {lettre !== null ? (
            <span
              className={`${classeLettre(lettre)} kc-en-cours`}
              draggable={!fini}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', lettre)
                e.dataTransfer.effectAllowed = 'move'
              }}
              aria-label={`Lettre ${lettre}`}
            >
              {lettre}
            </span>
          ) : (
            <span className="kc-lettre kc-en-cours kc-vide" aria-hidden="true" />
          )}
          <span className="kc-aide">Clique sur la bonne touche du clavier (ou glisse la lettre dessus).</span>
        </div>
        <div className="kc-clavier" role="group" aria-label="Clavier caché">
          {info.rangees.map((ri) => (
            <div key={ri} className="kc-rangee" style={{ '--kc-decalage': DECALAGES_RANGEES[ri] } as CSSProperties}>
              {RANGEES_KLAVICOEUR[ri].map((l) => {
                const place = etat.placees.includes(l)
                return (
                  <button
                    key={l}
                    className={place ? `kc-touche kc-placee ${classeLettre(l)}` : erreurSur === l ? 'kc-touche kc-erreur' : 'kc-touche'}
                    disabled={place || fini}
                    aria-label={place ? `Touche ${l}` : 'Touche cachée'}
                    onClick={() => poser(l)}
                    onDragOver={(e) => {
                      if (!place) e.preventDefault()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      poser(l)
                    }}
                    onAnimationEnd={() => setErreurSur((x) => (x === l ? null : x))}
                  >
                    {place ? l : ''}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <p className={`reponse-retour ${message?.type ?? ''}`} aria-live="polite">
          {message?.texte ?? 'Prends ton temps et regarde bien le clavier dans ta tête.'}
        </p>
        <div className="kc-de-cote" aria-label="Lettres mises de côté">
          <span className="kc-consigne">Mises de côté :</span>
          {etat.deCote.length === 0 ? (
            <span className="muted">aucune</span>
          ) : (
            etat.deCote.map((l, i) => (
              <span key={`${l}-${i}`} className={`${classeLettre(l)} kc-petite`}>
                {l}
              </span>
            ))
          )}
        </div>
      </main>
      {enPause && <EcranPause onReprendre={reprendre} />}
    </div>
  )
}
