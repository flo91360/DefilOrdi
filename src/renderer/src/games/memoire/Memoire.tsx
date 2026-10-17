import { useEffect, useRef, useState } from 'react'
import {
  type ListePhrases,
  PALIER_PHRASE,
  PALIERS_MEMOIRE,
  type Profile,
  type ProgressionMemoire,
  type Resultat,
  type ResultatMemoire
} from '../../../../shared/data'
import { Avatar } from '../../avatar/Avatar'
import { IconBack, IconCheck } from '../../components/Icons'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { formatDuree } from '../dactylo/engine'
import { pourcentage } from '../commun'
import { Chips, FinHero, GameTopbar, ReponseInput, StatTile } from '../ui'
import {
  avancerProgression,
  type Changement,
  choisirMots,
  choisirPhrase,
  departProgression,
  dureeMemorisation,
  ECHECS_POUR_DESCENDRE,
  estPhrase,
  libellePalier,
  motProche,
  motsDePhrase,
  nombreParNiveau,
  orthographesPossibles,
  proposer,
  REUSSITES_POUR_MONTER,
  toleranceAccents,
  verifierPhrase
} from './engine'
import { imageDuMot } from './images'

type Palier = (typeof PALIERS_MEMOIRE)[number]

const formatPalier = (p: number) => (estPhrase(p) ? 'Phrase' : String(p))

// Images au-dessus des mots : choisies avant chaque partie, non mémorisées.
const CHOIX_IMAGES = ['oui', 'non'] as const
const formatImages = (v: (typeof CHOIX_IMAGES)[number]) => (v === 'oui' ? 'Avec images' : 'Sans images')

// Aide dys : choisie avant chaque partie, non mémorisée.
const CHOIX_AIDE = ['non', 'oui'] as const
const formatAide = (v: (typeof CHOIX_AIDE)[number]) => (v === 'oui' ? 'Aide dys activée' : 'Sans aide dys')

interface Props {
  profile: Profile
  listes: ListePhrases[]
  phrases: string[] // phrases du palier « phrase »
  resultats: Resultat[]
  onResult: (r: ResultatMemoire) => void
  onProgression: (m: ProgressionMemoire) => void
  onQuit: () => void
}

// Une partie : la liste de mots (null au palier phrase sans liste), les mots
// à retenir et l'état de la progression avant la partie.
interface Jeu {
  n: number // numéro de partie, pour recréer l'écran même si les mots sont identiques
  liste: ListePhrases | null
  mots: string[]
  phrase: string // '' hors palier phrase
  etat: ProgressionMemoire
}

type Phase =
  | { nom: 'choix' }
  | ({ nom: 'jeu' } & Jeu)
  | ({ nom: 'fin'; trouves: boolean[]; resultat: ResultatMemoire; record: boolean; suite: ProgressionMemoire; changement: Changement } & Jeu)

export function Memoire({ profile, listes, phrases, resultats, onResult, onProgression, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const [nombre, setNombre] = useState<Palier>(nombreParNiveau(profile.niveau) as Palier)
  const compteur = useRef(0)
  // Option choisie avant la partie (pas un réglage du profil) : aide visuelle
  // pendant la mémorisation des paliers 3 à 7 mots.
  const [images, setImages] = useState<(typeof CHOIX_IMAGES)[number]>('oui')
  // Aide dys : après une faute proche d'un mot, l'enfant choisit entre 3 orthographes.
  const [aideDys, setAideDys] = useState<(typeof CHOIX_AIDE)[number]>('non')

  const jouables = listes.filter((l) => l.phrases.length > 0)
  const triees = [...jouables].sort(
    (a, b) => Number(b.niveau === profile.niveau) - Number(a.niveau === profile.niveau) || a.niveau - b.niveau
  )

  // Lance une partie au palier de la progression donnée.
  const lancer = (liste: ListePhrases | null, etat: ProgressionMemoire) => {
    compteur.current += 1
    const phrase = estPhrase(etat.palier) ? choisirPhrase(phrases) : ''
    const mots = phrase ? motsDePhrase(phrase) : choisirMots(liste?.phrases ?? [], etat.palier)
    setPhase({ nom: 'jeu', n: compteur.current, liste, mots, phrase, etat })
  }

  // Nouveau départ choisi par l'enfant : nouvelle progression, qui remplacera
  // celle du profil dès la première partie jouée (l'ancienne reste dans
  // l'historique de l'ergothérapeute).
  const nouveauDepart = (liste: ListePhrases) =>
    lancer(liste, { progressionId: uid(), listeId: liste.id, ...departProgression(nombre) })

  // « Reprendre ma partie » : palier et compteurs mémorisés dans le profil.
  const memo = profile.memoire
  const listeReprise = triees.find((l) => l.id === memo.listeId) ?? triees[0] ?? null
  const peutReprendre = memo.progressionId !== '' && (estPhrase(memo.palier) || listeReprise !== null)
  const reprendre = () => lancer(listeReprise, { ...memo, listeId: listeReprise?.id ?? memo.listeId })

  // La liste à utiliser quand la progression redescend de la phrase aux mots.
  const listePour = (jeu: Jeu, etat: ProgressionMemoire) =>
    estPhrase(etat.palier) ? jeu.liste : (jeu.liste ?? triees.find((l) => l.id === etat.listeId) ?? triees[0] ?? null)

  const terminer = (jeu: Jeu, trouves: boolean[], erreurs: number, dureeMs: number, reussie: boolean, complete: boolean) => {
    if (!complete && dureeMs === 0) return onQuit()
    const phrase = jeu.phrase !== ''
    const anciens = resultats.filter(
      (r): r is ResultatMemoire => r.jeu === 'memoire' && r.profileId === profile.id && r.mots === jeu.mots.length && (r.phrase !== '') === phrase
    )
    const avance = avancerProgression(jeu.etat, reussie)
    const suite: ProgressionMemoire = {
      progressionId: jeu.etat.progressionId,
      listeId: jeu.liste?.id ?? jeu.etat.listeId,
      palier: avance.palier,
      reussites: avance.reussites,
      echecs: avance.echecs
    }
    const r: ResultatMemoire = {
      id: uid(),
      profileId: profile.id,
      jeu: 'memoire',
      date: new Date().toISOString(),
      listeNom: phrase ? 'Phrase' : (jeu.liste?.nom ?? ''),
      mots: jeu.mots.length,
      trouves: trouves.filter(Boolean).length,
      erreurs,
      dureeMs,
      progressionId: jeu.etat.progressionId,
      palier: jeu.etat.palier,
      phrase: jeu.phrase,
      reussie,
      palierSuivant: suite.palier
    }
    onResult(r)
    onProgression(suite)
    if (!complete) return onQuit()
    const meilleur = Math.max(0, ...anciens.map((a) => a.trouves))
    setPhase({ ...jeu, nom: 'fin', trouves, resultat: r, record: anciens.length > 0 && r.trouves > meilleur, suite, changement: avance.changement })
  }

  if (phase.nom === 'jeu') {
    const jeu: Jeu = phase
    const props = {
      profile,
      mots: phase.mots,
      phrase: phase.phrase,
      palier: phase.etat.palier,
      images: images === 'oui',
      aideDys: aideDys === 'oui',
      onFin: (t: boolean[], e: number, d: number, ok: boolean) => terminer(jeu, t, e, d, ok, true),
      onQuitter: (t: boolean[], e: number, d: number) => terminer(jeu, t, e, d, false, false)
    }
    return phase.phrase ? <PartiePhrase key={phase.n} {...props} /> : <Partie key={phase.n} {...props} />
  }

  if (phase.nom === 'fin') {
    const r = phase.resultat
    const phrase = phase.phrase !== ''
    const suiteListe = listePour(phase, phase.suite)
    const peutContinuer = estPhrase(phase.suite.palier) || suiteListe !== null
    return (
      <div className="screen dactylo">
        <GameTopbar titre="Mots à retenir" />
        <main className="fin-main">
          <FinHero
            profile={profile}
            message={
              r.reussie
                ? phrase
                  ? 'Tu as retrouvé toute la phrase !'
                  : 'Tu as retrouvé tous les mots !'
                : r.trouves >= r.mots / 2
                  ? 'Très bonne mémoire !'
                  : 'Bien essayé, on recommence ?'
            }
            record={phase.changement === 'monte' ? `Tu passes à ${libellePalier(phase.suite.palier)} !` : phase.record ? 'Nouveau record !' : undefined}
          />
          <p className="memoire-progression">{messageProgression(phase.suite, phase.changement, r.reussie)}</p>
          <div className="fin-stats">
            <StatTile value={`${r.trouves} / ${r.mots}`} label={phrase ? 'mots à la bonne place' : 'mots retrouvés'} detail={`${pourcentage(r.trouves, r.mots)} %`} />
            <StatTile
              value={String(r.erreurs)}
              label={`mot${r.erreurs > 1 ? 's' : ''} en trop`}
              detail={phrase ? 'qui n’étaient pas dans la phrase' : r.erreurs > 1 ? 'qui n’étaient pas dans la liste' : 'qui n’était pas dans la liste'}
            />
            <StatTile value={formatDuree(r.dureeMs)} label={phrase ? 'pour retrouver la phrase' : 'pour retrouver les mots'} detail={r.listeNom} />
          </div>
          <div className="mots-grille fin-mots">
            {phase.mots.map((m, i) => (
              <span key={`${i}-${m}`} className={phase.trouves[i] ? 'mot-carte trouve' : 'mot-carte oublie'}>
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
            {peutContinuer && (
              <button className="btn btn-primary btn-lg" onClick={() => lancer(suiteListe, phase.suite)} autoFocus>
                Continuer
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="screen dactylo">
      <GameTopbar titre="Mots à retenir" onBack={onQuit} />
      <main className="choix-main">
        <Chips label="Images au-dessus des mots" values={CHOIX_IMAGES} value={images} onChange={setImages} format={formatImages} />
        <Chips label="Aide dys" values={CHOIX_AIDE} value={aideDys} onChange={setAideDys} format={formatAide} />
        {aideDys === 'oui' && (
          <p className="memoire-aide">Si tu fais une faute d’orthographe, tu choisis la bonne écriture parmi 3 propositions.</p>
        )}
        {peutReprendre && (
          <div className="memoire-reprendre">
            <button className="btn btn-primary btn-lg" onClick={reprendre}>
              Reprendre ma partie
            </button>
            <span className="memoire-reprendre-info">
              {estPhrase(memo.palier) ? 'Avec une phrase' : `Avec ${memo.palier} mots`}
              {!estPhrase(memo.palier) && listeReprise ? ` · ${listeReprise.nom}` : ''}
            </span>
          </div>
        )}
        <h2 className="choix-title">{peutReprendre ? 'Ou recommence avec tes mots' : 'Choisis tes mots'}</h2>
        <Chips label="Nombre de mots à retenir" values={PALIERS_MEMOIRE} value={nombre} onChange={setNombre} format={formatPalier} />
        {peutReprendre && <p className="memoire-aide">Si tu choisis une liste, tu recommences avec ce nombre de mots.</p>}
        {triees.length === 0 ? (
          <p className="empty">Aucune liste de mots. Demande à ton ergothérapeute d’en ajouter.</p>
        ) : (
          <div className="liste-grid">
            {triees.map((l) => (
              <button key={l.id} className="liste-card" onClick={() => nouveauDepart(l)}>
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

// Ce qui se passe à la partie suivante, en mots simples pour l'enfant.
function messageProgression(suite: ProgressionMemoire, changement: Changement, reussie: boolean): string {
  const palier = libellePalier(suite.palier)
  if (changement === 'monte') return estPhrase(suite.palier) ? 'Prochaine étape : retenir une vraie phrase !' : `La prochaine fois, retiens ${palier} !`
  if (changement === 'descend') return `On continue avec ${palier} pour bien s’entraîner.`
  if (reussie) {
    if (suite.palier >= PALIER_PHRASE) return 'Tu es au plus haut niveau, continue comme ça !'
    const reste = REUSSITES_POUR_MONTER - suite.reussites
    return `Encore ${reste} réussite${reste > 1 ? 's' : ''} pour passer à ${libellePalier(suite.palier + 1)}.`
  }
  if (suite.echecs > 0 && suite.echecs < ECHECS_POUR_DESCENDRE) return `Ce n’est pas grave : on réessaie avec ${palier}.`
  return `On réessaie avec ${palier}.`
}

interface PartieProps {
  profile: Profile
  mots: string[]
  phrase: string // texte de la phrase (palier phrase), '' sinon
  palier: number
  images: boolean // une image au-dessus de chaque mot pendant la mémorisation (paliers 3 à 7)
  aideDys: boolean // paliers 3 à 7 : 3 orthographes proposées après une faute proche d'un mot
  onFin: (trouves: boolean[], erreurs: number, dureeMs: number, reussie: boolean) => void
  onQuitter: (trouves: boolean[], erreurs: number, dureeMs: number) => void
}

// Mémorisation puis rappel : partie commune aux mots et à la phrase.
function useMemorisation(nbMots: number) {
  const duree = dureeMemorisation(nbMots)
  const [etape, setEtape] = useState<'memoriser' | 'rappel'>('memoriser')
  const [reste, setReste] = useState(duree)
  const debutRappel = useRef(0)

  const commencerRappel = () => {
    debutRappel.current = Date.now()
    setEtape('rappel')
  }

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

  const dureeRappel = () => (etape === 'rappel' ? Date.now() - debutRappel.current : 0)
  return { duree, etape, reste, commencerRappel, dureeRappel }
}

function EcranMemoriser({
  titre,
  mots,
  phrase,
  images,
  reste,
  duree,
  onPret,
  onArreter
}: {
  titre: string
  mots: string[]
  phrase: string // '' = liste de mots
  images: boolean // jamais pour une phrase
  reste: number
  duree: number
  onPret: () => void
  onArreter: () => void
}) {
  return (
    <div className="screen dactylo">
      <GameTopbar onBack={onArreter} backLabel="Arrêter" />
      <main className="memoire-main">
        <h2 className="memoire-titre">{titre}</h2>
        {phrase ? (
          <p className="memoire-phrase">{phrase}</p>
        ) : (
          <div className="mots-grille">
            {mots.map((m) => (
              <span key={m} className={images ? 'mot-carte visible avec-image' : 'mot-carte visible'}>
                {images && (
                  <span className="mot-image" aria-hidden="true">
                    {imageDuMot(m)}
                  </span>
                )}
                {m}
              </span>
            ))}
          </div>
        )}
        <div className="compte-a-rebours" aria-label={`${Math.ceil(reste / 1000)} secondes`}>
          <div className="compte-barre" style={{ width: `${(reste / duree) * 100}%` }} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={onPret}>
          Je suis prêt !
        </button>
      </main>
    </div>
  )
}

function useSonErreur(profile: Profile) {
  const dernierSon = useRef(0)
  return () => {
    const now = Date.now()
    if (profile.dactylo.sonErreur && now - dernierSon.current > 700) {
      dernierSon.current = now
      playSound(profile.sonEchec)
    }
  }
}

function EnteteRappel({
  profile,
  titre,
  compteur,
  label,
  onArreter
}: {
  profile: Profile
  titre: string
  compteur: string
  label: string
  onArreter: () => void
}) {
  return (
    <>
      <header className="topbar">
        <button className="btn btn-ghost" onClick={onArreter}>
          <IconBack /> Arrêter
        </button>
        <div className="live-stats">
          <div className="live-stat">
            <span className="live-stat-value">{compteur}</span>
            <span className="live-stat-label">{label}</span>
          </div>
        </div>
      </header>
      <div className="memoire-entete">
        <div className="partie-avatar">
          <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={84} />
        </div>
        <h2 className="memoire-titre">{titre}</h2>
      </div>
    </>
  )
}

// Paliers 3 à 7 : les mots sont retapés un par un, dans n'importe quel ordre.
function Partie({ profile, mots, palier, images, aideDys, onFin, onQuitter }: PartieProps) {
  const { duree, etape, reste, commencerRappel, dureeRappel } = useMemorisation(mots.length)
  const [trouves, setTrouves] = useState<boolean[]>(() => mots.map(() => false))
  const [erreurs, setErreurs] = useState(0)
  const [message, setMessage] = useState<{ type: 'juste' | 'faux' | 'info'; texte: string } | null>(null)
  const [dernier, setDernier] = useState<number | null>(null)
  // Aide dys : mot visé et orthographes proposées en attendant le choix.
  const [choix, setChoix] = useState<{ index: number; options: string[] } | null>(null)
  const sonErreur = useSonErreur(profile)
  const fini = useRef(false)

  const finir = (t: boolean[], e: number, d: number) => {
    if (fini.current) return
    fini.current = true
    onFin(t, e, d, t.length > 0 && t.every(Boolean))
  }

  const trouver = (index: number) => {
    const t = trouves.map((x, i) => x || i === index)
    setTrouves(t)
    setDernier(index)
    setMessage({ type: 'juste', texte: `Oui ! « ${mots[index]} »` })
    playSound(profile.sonReussite)
    if (t.every(Boolean)) {
      const d = dureeRappel()
      setTimeout(() => finir(t, erreurs, d), 900)
    }
  }

  const choisir = (option: string) => {
    if (fini.current || !choix) return
    const { index } = choix
    setChoix(null)
    if (option === mots[index]) return trouver(index)
    setErreurs((e) => e + 1)
    setMessage({ type: 'faux', texte: `Ce n’était pas la bonne orthographe de « ${option} ». Tu peux réessayer.` })
    sonErreur()
  }

  const valider = (saisie: string) => {
    if (fini.current) return
    const p = proposer(mots, trouves, saisie, palier)
    if (p.type !== 'trouve') setChoix(null)
    if (p.type === 'trouve') {
      trouver(p.index)
    } else if (p.type === 'absent' && aideDys && motProche(mots, trouves, saisie) !== null) {
      // Mot bien mémorisé mais mal écrit : pas d'erreur tout de suite.
      const index = motProche(mots, trouves, saisie) as number
      setChoix({ index, options: orthographesPossibles(mots[index], palier) })
      setMessage({ type: 'info', texte: 'Presque ! Quelle est la bonne orthographe ?' })
    } else if (p.type === 'deja') {
      setMessage({ type: 'info', texte: `Tu as déjà trouvé « ${mots[p.index]} ».` })
    } else if (p.type === 'absent') {
      setErreurs((e) => e + 1)
      setMessage({
        type: 'faux',
        texte: toleranceAccents(palier)
          ? `« ${saisie.trim()} » n’était pas dans la liste.`
          : `« ${saisie.trim()} » n’était pas dans la liste. Vérifie les accents et les majuscules.`
      })
      sonErreur()
    }
  }

  if (etape === 'memoriser') {
    return (
      <EcranMemoriser
        titre={`Retiens bien ces ${mots.length} mots !`}
        mots={mots}
        phrase=""
        images={images}
        reste={reste}
        duree={duree}
        onPret={commencerRappel}
        onArreter={() => onQuitter(trouves, 0, 0)}
      />
    )
  }

  return (
    <div className="screen dactylo">
      <EnteteRappel
        profile={profile}
        titre="Quels étaient les mots ?"
        compteur={`${trouves.filter(Boolean).length} / ${mots.length}`}
        label="Trouvés"
        onArreter={() => onQuitter(trouves, erreurs, dureeRappel())}
      />
      <main className="memoire-main">
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
            {message
              ? message.texte
              : toleranceAccents(palier)
                ? 'L’ordre n’a pas d’importance. Les accents et les majuscules non plus.'
                : 'L’ordre n’a pas d’importance. Écris chaque mot exactement comme il était.'}
          </p>
        </div>
        {choix && (
          <div className="choix-orthographe" role="group" aria-label="Choisis la bonne orthographe">
            {choix.options.map((o) => (
              <button key={o} className="btn btn-soft btn-lg mot-option" onClick={() => choisir(o)}>
                {o}
              </button>
            ))}
          </div>
        )}
        <button className="btn btn-soft" onClick={() => finir(trouves, erreurs, dureeRappel())}>
          Je ne me souviens plus des autres
        </button>
      </main>
    </div>
  )
}

// Palier « phrase » : la phrase entière est retapée, dans l'ordre. Accents,
// majuscules et ponctuation ne comptent pas. L'enfant peut réessayer : les
// mots bien placés de son meilleur essai s'affichent.
function PartiePhrase({ profile, mots, phrase, onFin, onQuitter }: PartieProps) {
  const { duree, etape, reste, commencerRappel, dureeRappel } = useMemorisation(mots.length)
  const [trouves, setTrouves] = useState<boolean[]>(() => mots.map(() => false))
  const [erreurs, setErreurs] = useState(0)
  const [message, setMessage] = useState<{ type: 'juste' | 'faux'; texte: string } | null>(null)
  const sonErreur = useSonErreur(profile)
  const fini = useRef(false)

  const finir = (t: boolean[], e: number, d: number, ok: boolean) => {
    if (fini.current) return
    fini.current = true
    onFin(t, e, d, ok)
  }

  const valider = (saisie: string) => {
    if (fini.current) return
    const v = verifierPhrase(mots, saisie)
    const e = erreurs + v.enTrop
    setErreurs(e)
    const justes = v.trouves.filter(Boolean).length
    // On garde le meilleur essai.
    const t = justes >= trouves.filter(Boolean).length ? v.trouves : trouves
    setTrouves(t)
    if (v.reussie) {
      setMessage({ type: 'juste', texte: 'Bravo, c’est toute la phrase !' })
      playSound(profile.sonReussite)
      const d = dureeRappel()
      setTimeout(() => finir(v.trouves, e, d, true), 900)
    } else {
      setMessage({
        type: 'faux',
        texte:
          justes === mots.length
            ? 'Tous les mots sont là, mais il y en a en trop. Essaie encore !'
            : `${justes} mot${justes > 1 ? 's' : ''} sur ${mots.length} à la bonne place. Essaie encore !`
      })
      sonErreur()
    }
  }

  if (etape === 'memoriser') {
    return (
      <EcranMemoriser
        titre="Retiens bien cette phrase !"
        mots={mots}
        phrase={phrase}
        images={false}
        reste={reste}
        duree={duree}
        onPret={commencerRappel}
        onArreter={() => onQuitter(trouves, 0, 0)}
      />
    )
  }

  return (
    <div className="screen dactylo">
      <EnteteRappel
        profile={profile}
        titre="Quelle était la phrase ?"
        compteur={`${trouves.filter(Boolean).length} / ${mots.length}`}
        label="Mots"
        onArreter={() => onQuitter(trouves, erreurs, dureeRappel())}
      />
      <main className="memoire-main">
        <div className="mots-grille">
          {mots.map((m, i) => (
            <span key={`${i}-${m}`} className={trouves[i] ? 'mot-carte trouve' : 'mot-carte cache'}>
              {trouves[i] ? m : '?'}
            </span>
          ))}
        </div>
        <div className="reponse-zone">
          <ReponseInput onSubmit={valider} placeholder="Tape toute la phrase puis Entrée" etat={message?.type ?? null} />
          <p className={`reponse-retour ${message?.type ?? ''}`}>
            {message ? message.texte : 'Tape la phrase entière, dans l’ordre. Les accents, les majuscules et la ponctuation ne comptent pas.'}
          </p>
        </div>
        <button className="btn btn-soft" onClick={() => finir(trouves, erreurs, dureeRappel(), false)}>
          Je ne me souviens plus
        </button>
      </main>
    </div>
  )
}
