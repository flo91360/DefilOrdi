import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  LETTRES_ALPHABET,
  MOT_BAC_MAX,
  type Profile,
  type ReglagesPetitBac,
  type ReponseBac,
  type Resultat,
  type ResultatPetitBac
} from '../../../../shared/data'
import { IconBack, IconCheck } from '../../components/Icons'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { formatDuree } from '../dactylo/engine'
import { pourcentage } from '../commun'
import { EcranPause, useChrono, usePauseAuto } from '../pause'
import { Chips, FinHero, GameTopbar, StatTile } from '../ui'
import {
  choisirCategories,
  type EtatReponse,
  etatReponse,
  formatTemps,
  nombreConseille,
  nombresPossibles,
  TEMPS,
  tempsParNiveau,
  texteEtat,
  tirerLettre
} from './engine'

interface Props {
  profile: Profile
  reglages: ReglagesPetitBac
  resultats: Resultat[]
  onResult: (r: ResultatPetitBac) => void
  onQuit: () => void
}

interface Grille {
  lettre: string
  categories: string[]
  tempsLimite: number // secondes, 0 = sans limite
}

type Phase =
  | { nom: 'choix' }
  | { nom: 'jeu'; grille: Grille }
  | { nom: 'verif'; grille: Grille; mots: string[]; dureeMs: number; tempsEcoule: boolean }
  | { nom: 'fin'; grille: Grille; resultat: ResultatPetitBac; record: boolean }

export function PetitBac({ profile, reglages, resultats, onResult, onQuit }: Props) {
  const possibles = nombresPossibles(reglages.categories.length)
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const [nombre, setNombre] = useState(() => nombreConseille(profile.niveau, possibles))
  const [temps, setTemps] = useState(tempsParNiveau(profile.niveau))
  const precedente = useRef<string | null>(null)
  const pret = possibles.length > 0 && reglages.lettres.length > 0
  const nb = possibles.includes(nombre) ? nombre : nombreConseille(profile.niveau, possibles)

  const lancer = () => {
    const lettre = tirerLettre(reglages.lettres, precedente.current)
    precedente.current = lettre
    setPhase({ nom: 'jeu', grille: { lettre, categories: choisirCategories(reglages.categories, nb), tempsLimite: temps } })
  }

  const resultatDe = (grille: Grille, reponses: ReponseBac[], dureeMs: number): ResultatPetitBac => ({
    id: uid(),
    profileId: profile.id,
    jeu: 'petitbac',
    date: new Date().toISOString(),
    lettre: grille.lettre,
    tempsLimite: grille.tempsLimite,
    dureeMs,
    categories: grille.categories.length,
    justes: reponses.filter((x) => x.valide).length,
    reponses
  })

  // Partie arrêtée avant la fin : enregistrée si au moins une case est remplie,
  // sans l'étape de vérification (seule la première lettre est contrôlée).
  const abandonner = (grille: Grille, mots: string[], dureeMs: number) => {
    if (mots.some((m) => m !== '')) {
      onResult(
        resultatDe(
          grille,
          grille.categories.map((categorie, i) => ({ categorie, mot: mots[i], valide: etatReponse(mots[i], grille.lettre) === 'ok' })),
          dureeMs
        )
      )
    }
    onQuit()
  }

  const terminer = (grille: Grille, reponses: ReponseBac[], dureeMs: number) => {
    const anciens = resultats.filter(
      (r): r is ResultatPetitBac => r.jeu === 'petitbac' && r.profileId === profile.id && r.categories === grille.categories.length
    )
    const r = resultatDe(grille, reponses, dureeMs)
    onResult(r)
    if (r.justes > 0) playSound(profile.sonReussite)
    const meilleur = Math.max(0, ...anciens.map((a) => a.justes))
    setPhase({ nom: 'fin', grille, resultat: r, record: anciens.length > 0 && r.justes > meilleur })
  }

  if (phase.nom === 'jeu') {
    return (
      <Partie
        grille={phase.grille}
        lettres={reglages.lettres}
        onFini={(mots, dureeMs, tempsEcoule) => setPhase({ nom: 'verif', grille: phase.grille, mots, dureeMs, tempsEcoule })}
        onQuitter={(mots, dureeMs) => abandonner(phase.grille, mots, dureeMs)}
      />
    )
  }

  if (phase.nom === 'verif') {
    return (
      <Verification
        grille={phase.grille}
        mots={phase.mots}
        tempsEcoule={phase.tempsEcoule}
        onValider={(reponses) => terminer(phase.grille, reponses, phase.dureeMs)}
      />
    )
  }

  if (phase.nom === 'fin') {
    const r = phase.resultat
    return (
      <div className="screen dactylo">
        <GameTopbar titre="Petit bac" />
        <main className="fin-main">
          <FinHero
            profile={profile}
            message={
              r.justes === r.categories
                ? 'Un mot pour chaque catégorie, grille complète !'
                : r.justes >= r.categories / 2
                  ? 'Belle grille !'
                  : `Pas facile avec la lettre ${r.lettre}… on en tire une autre ?`
            }
            record={phase.record ? 'Nouveau record !' : undefined}
          />
          <div className="fin-stats">
            <StatTile value={`${r.justes} / ${r.categories}`} label="mots acceptés" detail={`${pourcentage(r.justes, r.categories)} %`} />
            <StatTile value={r.lettre} label="lettre tirée au sort" detail={`${r.categories} catégories`} />
            <StatTile
              value={formatDuree(r.dureeMs)}
              label="pour remplir la grille"
              detail={r.tempsLimite > 0 ? `limite : ${formatTemps(r.tempsLimite)}` : 'sans limite de temps'}
            />
          </div>
          <div className="mots-grille fin-mots">
            {r.reponses.map((x) => (
              <span key={x.categorie} className={x.valide ? 'mot-carte bac-carte trouve' : 'mot-carte bac-carte oublie'}>
                <span className="bac-carte-categorie">{x.categorie}</span>
                <span>
                  {x.valide && <IconCheck size={20} />} {x.mot || '—'}
                </span>
              </span>
            ))}
          </div>
          <div className="fin-actions">
            <button className="btn btn-ghost btn-lg" onClick={onQuit}>
              <IconBack /> Menu
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'choix' })}>
              Changer les réglages
            </button>
            <button className="btn btn-primary btn-lg" onClick={lancer} autoFocus>
              Nouvelle lettre
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="screen dactylo">
      <GameTopbar titre="Petit bac" onBack={onQuit} />
      <main className="choix-main">
        <h2 className="choix-title">Prêt pour le petit bac ?</h2>
        {!pret ? (
          <p className="empty">Le petit bac n’est pas encore prêt. Demande à ton ergothérapeute de choisir des catégories et des lettres.</p>
        ) : (
          <>
            <p className="bac-regle">
              Une lettre va être tirée au sort. Pour chaque catégorie, trouve un mot qui commence par cette lettre !
            </p>
            <Chips label="Nombre de catégories" values={possibles} value={nb} onChange={setNombre} />
            <Chips label="Temps" values={TEMPS} value={temps} onChange={setTemps} format={formatTemps} />
            <p className="choix-note bac-lettres-possibles">
              Lettres possibles :{' '}
              {reglages.lettres.map((l) => (
                <kbd key={l}>{l}</kbd>
              ))}
            </p>
            <button className="btn btn-primary btn-lg bac-lancer" onClick={lancer} autoFocus>
              Tirer une lettre !
            </button>
          </>
        )}
      </main>
    </div>
  )
}

// Durée entre deux lettres de la roue : elle ralentit jusqu'à s'arrêter.
const ROUE_DEPART_MS = 60
const ROUE_FREIN = 1.18
const ROUE_ARRET_MS = 330

function Partie({
  grille,
  lettres,
  onFini,
  onQuitter
}: {
  grille: Grille
  lettres: string[]
  onFini: (mots: string[], dureeMs: number, tempsEcoule: boolean) => void
  onQuitter: (mots: string[], dureeMs: number) => void
}) {
  const n = grille.categories.length
  const [tirage, setTirage] = useState(true)
  const [affichee, setAffichee] = useState('?')
  const [mots, setMots] = useState<string[]>(() => grille.categories.map(() => ''))
  const [focus, setFocus] = useState<number | null>(null)
  const fini = useRef(false)
  // Pause automatique (fenêtre quittée) : le chronomètre s'arrête.
  const { enPause, reprendre } = usePauseAuto(!tirage)
  const { ecoule: ecouleChrono, lire } = useChrono(!tirage && !enPause)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const boutonFini = useRef<HTMLButtonElement>(null)
  const motsRef = useRef(mots)
  motsRef.current = mots

  // Roue des lettres. Avec une ou deux lettres possibles, elle défile sur tout
  // l'alphabet pour garder le suspense.
  useEffect(() => {
    const roue = lettres.length >= 3 ? lettres : LETTRES_ALPHABET
    let i = Math.floor(Math.random() * roue.length)
    let delai = ROUE_DEPART_MS
    let t: ReturnType<typeof setTimeout>
    const tourner = () => {
      if (delai > ROUE_ARRET_MS) {
        setAffichee(grille.lettre)
        setTirage(false)
        playSound('partez')
        return
      }
      i = (i + 1) % roue.length
      setAffichee(roue[i])
      playSound('tic')
      delai *= ROUE_FREIN
      t = setTimeout(tourner, delai)
    }
    t = setTimeout(tourner, delai)
    return () => clearTimeout(t)
  }, [])

  const finir = (tempsEcoule: boolean) => {
    if (fini.current) return
    fini.current = true
    onFini(
      motsRef.current.map((m) => m.trim()),
      tempsEcoule ? grille.tempsLimite * 1000 : lire(),
      tempsEcoule
    )
  }

  // La lettre est tirée : le chronomètre démarre, première case prête.
  useEffect(() => {
    if (!tirage) inputs.current[0]?.focus()
  }, [tirage])

  useEffect(() => {
    if (!tirage && grille.tempsLimite > 0 && ecouleChrono >= grille.tempsLimite * 1000) finir(true)
  }, [ecouleChrono, tirage])

  const reprendrePartie = () => {
    reprendre()
    requestAnimationFrame(() => inputs.current[focus ?? 0]?.focus())
  }

  // « Arrêter » : la grille commencée est enregistrée, comme dans les autres jeux.
  const arreter = () => {
    if (fini.current) return
    fini.current = true
    onQuitter(
      motsRef.current.map((m) => m.trim()),
      lire()
    )
  }

  const aller = (i: number) => inputs.current[i]?.focus()

  // Entrée ou ↓ : ligne suivante. Après la dernière ligne, Entrée va à la
  // première case vide, ou sur « J'ai fini » si tout est rempli.
  const naviguer = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'ArrowUp' && i > 0) {
      e.preventDefault()
      aller(i - 1)
    } else if (e.key === 'ArrowDown' && i < n - 1) {
      e.preventDefault()
      aller(i + 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (i < n - 1) return aller(i + 1)
      const vide = motsRef.current.findIndex((m) => m.trim() === '')
      if (vide === -1) boutonFini.current?.focus()
      else aller(vide)
    }
  }

  const ecoule = tirage ? 0 : ecouleChrono
  const limiteMs = grille.tempsLimite * 1000
  const reste = Math.max(0, limiteMs - ecoule)
  const remplies = mots.filter((m) => m.trim() !== '').length

  return (
    <div className="screen dactylo">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={arreter}>
          <IconBack /> Arrêter
        </button>
        <div className="live-stats">
          <div className="live-stat">
            <span className="live-stat-value">
              {remplies} / {n}
            </span>
            <span className="live-stat-label">Remplies</span>
          </div>
          <div className="live-stat">
            <span className="live-stat-value">{formatDuree(limiteMs > 0 ? reste + 999 : ecoule)}</span>
            <span className="live-stat-label">{limiteMs > 0 ? 'Restant' : 'Temps'}</span>
          </div>
        </div>
      </header>
      <main className="bac-main">
        <div className="bac-entete">
          <div className={tirage ? 'bac-lettre tourne' : 'bac-lettre'} aria-live="polite" aria-label={tirage ? 'Tirage de la lettre' : `Lettre ${grille.lettre}`}>
            {affichee}
          </div>
          <div>
            <h2 className="bac-titre">{tirage ? 'Tirage de la lettre…' : `Des mots en ${grille.lettre} !`}</h2>
            <p className="bac-consigne">{tirage ? 'Prépare-toi…' : 'Entrée pour passer à la ligne suivante.'}</p>
          </div>
        </div>
        {limiteMs > 0 && (
          <div className="compte-a-rebours" aria-hidden="true">
            <div className={reste < 15000 && !tirage ? 'compte-barre bac-bientot' : 'compte-barre'} style={{ width: `${(reste / limiteMs) * 100}%` }} />
          </div>
        )}
        <div className="bac-grille">
          {grille.categories.map((c, i) => {
            const etat = etatReponse(mots[i], grille.lettre)
            // Une erreur ne s'affiche qu'en quittant la case, pas pendant la frappe.
            const retour: EtatReponse | null = etat === 'ok' ? 'ok' : etat !== 'vide' && focus !== i ? etat : null
            return (
              <div key={c} className="bac-ligne">
                <label className="bac-categorie" htmlFor={`bac-${i}`}>
                  {c}
                </label>
                <input
                  id={`bac-${i}`}
                  ref={(el) => {
                    inputs.current[i] = el
                  }}
                  className={`bac-input${retour === 'ok' ? ' bac-ok' : retour ? ' bac-faux' : ''}`}
                  value={mots[i]}
                  maxLength={MOT_BAC_MAX}
                  disabled={tirage}
                  placeholder={tirage ? '' : `${grille.lettre}…`}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onPaste={(e) => e.preventDefault()}
                  onFocus={() => setFocus(i)}
                  onBlur={() => setFocus((f) => (f === i ? null : f))}
                  onChange={(e) => {
                    const v = e.target.value
                    setMots((m) => m.map((x, j) => (j === i ? v : x)))
                  }}
                  onKeyDown={(e) => naviguer(e, i)}
                />
                <span className={`bac-indice${retour === 'ok' ? ' ok' : ''}`}>
                  {retour === 'ok' ? <IconCheck size={26} /> : retour === 'court' ? 'Trop court' : retour === 'lettre' ? `Commence par ${grille.lettre}` : ''}
                </span>
              </div>
            )
          })}
        </div>
        <button ref={boutonFini} className="btn btn-primary btn-lg" disabled={tirage} onClick={() => finir(false)}>
          J’ai fini !
        </button>
      </main>
      {enPause && <EcranPause onReprendre={reprendrePartie} />}
    </div>
  )
}

// Seule la première lettre est vérifiée par le jeu : on regarde ensemble si
// chaque mot va bien dans sa catégorie, et on refuse ceux qui ne vont pas.
function Verification({
  grille,
  mots,
  tempsEcoule,
  onValider
}: {
  grille: Grille
  mots: string[]
  tempsEcoule: boolean
  onValider: (reponses: ReponseBac[]) => void
}) {
  const [refusees, setRefusees] = useState<boolean[]>(() => mots.map(() => false))
  const etats = mots.map((m) => etatReponse(m, grille.lettre))
  const reponses: ReponseBac[] = grille.categories.map((categorie, i) => ({
    categorie,
    mot: mots[i],
    valide: etats[i] === 'ok' && !refusees[i]
  }))
  const justes = reponses.filter((r) => r.valide).length
  const aVerifier = etats.some((e) => e === 'ok')

  return (
    <div className="screen dactylo">
      <GameTopbar titre="Petit bac" />
      <main className="bac-main">
        <div className="bac-entete">
          <div className="bac-lettre">{grille.lettre}</div>
          <div>
            <h2 className="bac-titre">{tempsEcoule ? 'Temps écoulé ! On vérifie.' : 'On vérifie !'}</h2>
            <p className="bac-consigne">
              {aVerifier
                ? 'Avec ton ergothérapeute, regarde si chaque mot va bien dans sa catégorie. Clique sur un mot pour le refuser.'
                : 'Aucun mot ne commence par la bonne lettre cette fois-ci.'}
            </p>
          </div>
        </div>
        <div className="bac-grille">
          {reponses.map((r, i) => (
            <div key={r.categorie} className="bac-ligne">
              <span className="bac-categorie">{r.categorie}</span>
              {etats[i] === 'ok' ? (
                <button
                  className={refusees[i] ? 'bac-verif refuse' : 'bac-verif accepte'}
                  aria-pressed={!refusees[i]}
                  onClick={() => setRefusees((x) => x.map((v, j) => (j === i ? !v : v)))}
                >
                  <span className="bac-verif-mot">{r.mot}</span>
                  <span className="bac-verif-etat">
                    {refusees[i] ? (
                      'Refusé'
                    ) : (
                      <>
                        <IconCheck size={18} /> Accepté
                      </>
                    )}
                  </span>
                </button>
              ) : (
                <div className="bac-verif sans">
                  <span className="bac-verif-mot">{r.mot || '—'}</span>
                  <span className="bac-verif-etat">{texteEtat(etats[i], grille.lettre)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="bac-verif-pied">
          <span className="bac-score">
            {justes} / {grille.categories.length} mot{justes > 1 ? 's' : ''} accepté{justes > 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary btn-lg" onClick={() => onValider(reponses)}>
            Voir mon score
          </button>
        </div>
      </main>
    </div>
  )
}
