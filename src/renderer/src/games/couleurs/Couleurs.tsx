import { useEffect, useRef, useState } from 'react'
import { DUREES_TIMER_COULEURS, type ModeCouleurs, Profile, ReglagesCouleurs, Resultat, ResultatCouleurs } from '../../../../shared/data'
import { Avatar } from '../../avatar/Avatar'
import { IconBack, IconCheck } from '../../components/Icons'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { formatDuree } from '../dactylo/engine'
import { pourcentage } from '../commun'
import { EcranPause, useChrono, usePauseAuto } from '../pause'
import { Chips, FinHero, GameTopbar, ReponseInput, StatTile } from '../ui'
import {
  CLICS_VALIDATION,
  type ClicValidation,
  clicValide,
  type Couleur,
  couleursPourNiveau,
  estJuste,
  estPiege,
  genererManches,
  indiceUtile,
  indicesTimer,
  type Manche,
  nbPropositions,
  propositionsIndice,
  reponseALaSouris,
  reponseAttendue
} from './engine'

const NB_MANCHES = [10, 20] as const

const MODES: { id: ModeCouleurs; titre: string; consigne: string; niveauMin: number }[] = [
  { id: 'mot', titre: 'Le mot', consigne: 'Écris le mot que tu lis, sans regarder sa couleur.', niveauMin: 1 },
  { id: 'couleur', titre: 'La couleur', consigne: 'Écris la couleur de l’encre, pas le mot !', niveauMin: 1 },
  { id: 'melange', titre: 'Les deux', consigne: 'La consigne change à chaque fois : regarde bien !', niveauMin: 3 },
  {
    id: 'timer',
    titre: 'Couleurs piégées timer',
    consigne: 'Comme « Les deux », mais contre la montre : réussis un maximum de manches !',
    niveauMin: 3
  }
]

const MANCHES_TIMER = 300 // réserve de manches : le temps s'arrête avant

interface Props {
  profile: Profile
  resultats: Resultat[]
  reglages: ReglagesCouleurs
  onResult: (r: ResultatCouleurs) => void
  onQuit: () => void
}

type Phase =
  | { nom: 'choix' }
  | { nom: 'jeu'; mode: ModeCouleurs; manches: Manche[]; clic: ClicValidation | null; minutes: number }
  | { nom: 'fin'; mode: ModeCouleurs; resultat: ResultatCouleurs; record: boolean }

export function Couleurs({ profile, resultats, reglages, onResult, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const [nb, setNb] = useState<(typeof NB_MANCHES)[number]>(10)
  // Entraînement à la souris (état local, non enregistré).
  const [souris, setSouris] = useState(false)
  const [clic, setClic] = useState<ClicValidation>('gauche')
  const [minutes, setMinutes] = useState<(typeof DUREES_TIMER_COULEURS)[number]>(1)
  const couleurs = couleursPourNiveau(profile.niveau)

  const lancer = (mode: ModeCouleurs) =>
    setPhase({
      nom: 'jeu',
      mode,
      manches: genererManches(mode === 'timer' ? MANCHES_TIMER : nb, mode, couleurs),
      clic: souris && mode !== 'mot' ? clic : null,
      minutes: mode === 'timer' ? minutes : 0
    })

  const terminer = (mode: ModeCouleurs, reponses: Reponse[], complete: boolean, minutesPartie: number) => {
    if (reponses.length === 0) return onQuit()
    const anciens = resultats.filter((r): r is ResultatCouleurs => r.jeu === 'couleurs' && r.profileId === profile.id && r.mode === mode && r.minutes === minutesPartie)
    const r: ResultatCouleurs = {
      id: uid(),
      profileId: profile.id,
      jeu: 'couleurs',
      date: new Date().toISOString(),
      mode,
      manches: reponses.length,
      justes: reponses.filter((x) => x.juste).length,
      dureeMs: reponses.reduce((t, x) => t + x.dureeMs, 0),
      pieges: reponses.filter((x) => estPiege(x.manche)).length,
      piegesJustes: reponses.filter((x) => x.juste && estPiege(x.manche)).length,
      indices: reponses.filter((x) => x.indice).length,
      minutes: minutesPartie
    }
    onResult(r)
    if (!complete) return onQuit()
    const meilleur = Math.max(0, ...anciens.map((a) => pourcentage(a.justes, a.manches)))
    const record =
      mode === 'timer'
        ? anciens.length > 0 && r.justes > Math.max(0, ...anciens.map((a) => a.justes))
        : anciens.length > 0 && pourcentage(r.justes, r.manches) > meilleur
    setPhase({ nom: 'fin', mode, resultat: r, record })
  }

  if (phase.nom === 'jeu') {
    return (
      <Partie
        profile={profile}
        manches={phase.manches}
        couleurs={couleurs}
        reglages={reglages}
        clic={phase.clic}
        minutes={phase.minutes}
        onFin={(rep) => terminer(phase.mode, rep, true, phase.minutes)}
        onQuitter={(rep) => terminer(phase.mode, rep, false, phase.minutes)}
      />
    )
  }

  if (phase.nom === 'fin') {
    const r = phase.resultat
    const p = pourcentage(r.justes, r.manches)
    return (
      <div className="screen dactylo couleurs-jeu">
        <GameTopbar titre="Couleurs piégées" />
        <main className="fin-main">
          <FinHero
            profile={profile}
            message={p === 100 ? 'Aucune erreur, tu ne t’es jamais fait piéger !' : p >= 80 ? 'Très bon travail !' : 'Bien joué, les pièges sont difficiles !'}
            record={phase.record ? 'Nouveau record !' : undefined}
          />
          <div className="fin-stats">
            {phase.mode === 'timer' ? (
              <StatTile
                value={String(r.justes)}
                label={r.justes > 1 ? 'bonnes réponses' : 'bonne réponse'}
                detail={`Couleurs piégées timer · ${r.minutes} minute${r.minutes > 1 ? 's' : ''}`}
              />
            ) : (
              <StatTile value={`${r.justes} / ${r.manches}`} label="bonnes réponses" detail={`${p} % de réussite`} />
            )}
            <StatTile
              value={`${r.piegesJustes} / ${r.pieges}`}
              label="pièges déjoués"
              detail="quand le mot et la couleur sont différents"
            />
            <StatTile
              value={`${(r.dureeMs / r.manches / 1000).toFixed(1).replace('.', ',')} s`}
              label="par réponse en moyenne"
              detail={`${formatDuree(r.dureeMs)} au total`}
            />
            {r.indices > 0 && (
              <StatTile
                value={String(r.indices)}
                label={r.indices > 1 ? 'indices utilisés' : 'indice utilisé'}
                detail="pour t’aider à trouver"
              />
            )}
          </div>
          <div className="fin-actions">
            <button className="btn btn-ghost btn-lg" onClick={onQuit}>
              <IconBack /> Menu
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'choix' })}>
              Changer de mode
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => lancer(phase.mode)} autoFocus>
              Rejouer
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="screen dactylo couleurs-jeu">
      <GameTopbar titre="Couleurs piégées" onBack={onQuit} />
      <main className="choix-main">
        <h2 className="choix-title">Que dois-tu écrire ?</h2>
        <Chips label="Nombre de manches" values={NB_MANCHES} value={nb} onChange={setNb} />
        <Chips
          label="Durée du mode timer"
          values={DUREES_TIMER_COULEURS}
          value={minutes}
          onChange={setMinutes}
          format={(m) => `${m} minute${m > 1 ? 's' : ''}`}
        />
        <div className="entrainement-souris">
          <label className="entrainement-case">
            <input type="checkbox" checked={souris} onChange={(e) => setSouris(e.target.checked)} /> Entraînement à la souris
            (pour « La couleur » et « Les deux »)
          </label>
          {souris && (
            <Chips
              label="Clic qui valide la réponse"
              values={CLICS_VALIDATION.map((c) => c.id)}
              value={clic}
              onChange={setClic}
              format={(id) => CLICS_VALIDATION.find((c) => c.id === id)?.titre ?? id}
            />
          )}
        </div>
        <div className="liste-grid">
          {MODES.map((m) => (
            <button key={m.id} className="liste-card mode-card" onClick={() => lancer(m.id)}>
              {m.niveauMin > profile.niveau && <span className="liste-badge liste-badge-neutre">Difficile</span>}
              <ModeExemple mode={m.id} />
              <span className="liste-nom">{m.titre}</span>
              <span className="liste-exemple wrap">{m.consigne}</span>
            </button>
          ))}
        </div>
        <p className="choix-note">
          Les couleurs du jeu : {couleurs.map((c) => c.nom).join(', ')}.
        </p>
      </main>
    </div>
  )
}

function ModeExemple({ mode }: { mode: ModeCouleurs }) {
  return (
    <span className="mode-exemple" aria-hidden="true">
      <span style={{ color: '#4f8bff' }}>ROUGE</span>
      <span className="mode-fleche">→</span>
      <span className="mode-reponse">{mode === 'mot' ? 'rouge' : mode === 'couleur' ? 'bleu' : '?'}</span>
    </span>
  )
}

interface Reponse {
  manche: Manche
  saisie: string
  juste: boolean
  dureeMs: number
  indice: boolean // bouton Indice utilisé pour ce mot
}

function Partie({
  profile,
  manches,
  couleurs,
  reglages,
  clic,
  minutes,
  onFin,
  onQuitter
}: {
  profile: Profile
  manches: Manche[]
  couleurs: Couleur[]
  reglages: ReglagesCouleurs
  clic: ClicValidation | null
  minutes: number // > 0 : mode chronométré
  onFin: (r: Reponse[]) => void
  onQuitter: (r: Reponse[]) => void
}) {
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [retour, setRetour] = useState<Reponse | null>(null)
  // Propositions de l'indice du mot en cours (null = pas d'indice demandé).
  const [propositions, setPropositions] = useState<string[] | null>(null)
  const debut = useRef(Date.now())
  const chrono = minutes > 0
  const index = reponses.length
  const manche = manches[Math.min(index, manches.length - 1)]
  const affichee = retour ? retour.manche : manche
  const numero = retour ? index - 1 : index
  const reponsesRef = useRef(reponses)
  reponsesRef.current = reponses
  const onFinRef = useRef(onFin)
  onFinRef.current = onFin
  // Pause automatique : le temps de la pause ne compte ni dans le chrono ni
  // dans le temps de réponse de la manche.
  const { enPause, reprendre } = usePauseAuto(true, (d) => {
    debut.current += d
  })
  const { ecoule } = useChrono(chrono && !enPause, 250)
  const restantMs = Math.max(0, minutes * 60000 - ecoule)
  const finChrono = useRef(false)

  const valider = (saisie: string) => {
    if (retour) return
    const juste = estJuste(manche, saisie)
    const r: Reponse = { manche, saisie, juste, dureeMs: Date.now() - debut.current, indice: propositions !== null }
    playSound(juste ? profile.sonReussite : profile.dactylo.sonErreur ? profile.sonEchec : 'aucun')
    setRetour(r)
    setReponses((all) => [...all, r])
  }

  // Mode chronométré : fin de la partie quand le temps est écoulé (la manche
  // en cours n'est pas comptée).
  useEffect(() => {
    if (!chrono || restantMs > 0 || finChrono.current) return
    finChrono.current = true
    onFinRef.current(reponsesRef.current)
  }, [chrono, restantMs])

  // Après la correction, manche suivante (ou fin).
  useEffect(() => {
    if (!retour) return
    const t = setTimeout(
      () => {
        setRetour(null)
        setPropositions(null)
        debut.current = Date.now()
        if (!chrono && reponsesRef.current.length >= manches.length) onFinRef.current(reponsesRef.current)
      },
      retour.juste ? 700 : 1800
    )
    return () => clearTimeout(t)
  }, [retour, manches.length, chrono])

  const justes = reponses.filter((r) => r.juste).length
  const consigneMot = affichee.consigne === 'mot'

  // Bouton Indice : limité par partie (réglage de l'ergothérapeute), inutile
  // quand la réponse est le mot déjà écrit à l'écran.
  const indicesUtilises = reponses.filter((r) => r.indice).length + (propositions && !retour ? 1 : 0)
  const indicesParPartie = chrono ? (reglages.indicesParPartie > 0 ? indicesTimer(minutes) : 0) : reglages.indicesParPartie
  const indicesRestants = Math.max(0, indicesParPartie - indicesUtilises)
  const alaSouris = !retour && clic !== null && reponseALaSouris(manche, true)
  const montrerBoutonIndice = !alaSouris && indicesParPartie > 0 && !retour && propositions === null && indiceUtile(manche)
  const demanderIndice = () => {
    if (retour || propositions !== null || indicesRestants === 0 || !indiceUtile(manche)) return
    const n = nbPropositions(reglages.propositionsDepart, indicesUtilises)
    setPropositions(propositionsIndice(manche, n, couleurs))
  }

  return (
    <div className="screen dactylo couleurs-jeu">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => onQuitter(reponsesRef.current)}>
          <IconBack /> Arrêter
        </button>
        {chrono ? (
          <div className="progress" aria-label="Temps restant">
            <strong>
              ⏱ {Math.floor(Math.ceil(restantMs / 1000) / 60)}:{String(Math.ceil(restantMs / 1000) % 60).padStart(2, '0')}
            </strong>
          </div>
        ) : (
        <div className="progress" aria-label={`Manche ${Math.min(index + 1, manches.length)} sur ${manches.length}`}>
          {manches.map((_, i) => (
            <span
              key={i}
              className={
                i < reponses.length ? (reponses[i].juste ? 'progress-dot done' : 'progress-dot faux') : i === index ? 'progress-dot current' : 'progress-dot'
              }
            />
          ))}
        </div>
        )}
        <div className="live-stats">
          <div className="live-stat">
            <span className="live-stat-value">
              {chrono ? justes : `${justes} / ${reponses.length}`}
            </span>
            <span className="live-stat-label">{chrono ? 'Bonnes réponses' : 'Justes'}</span>
          </div>
        </div>
      </header>

      <main className="stroop-main">
        <div className={consigneMot ? 'consigne consigne-mot' : 'consigne consigne-couleur'} key={numero}>
          {consigneMot ? (
            <>
              Écris le <strong>MOT</strong>
            </>
          ) : (
            <>
              Écris la <strong>COULEUR</strong> de l’encre
            </>
          )}
        </div>

        <div className="stroop-row">
          <div className="partie-avatar">
            <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={96} />
          </div>
          <div className="stroop-card" key={numero}>
            <span className="stroop-mot" style={{ color: affichee.encre.hex }}>
              {affichee.mot.nom.toUpperCase()}
            </span>
          </div>
          <div className="stroop-spacer" />
        </div>

        <div className="indice-zone">
          {propositions && (!retour || retour.indice) ? (
            <div className="indice-propositions" aria-live="polite">
              <span className="indice-titre">C’est peut-être :</span>
              {propositions.map((p) => (
                <span key={p} className="indice-mot">
                  {p}
                </span>
              ))}
            </div>
          ) : montrerBoutonIndice ? (
            <button
              type="button"
              className="btn btn-soft indice-bouton"
              onClick={demanderIndice}
              disabled={indicesRestants === 0}
              title={indicesRestants === 0 ? 'Plus d’indice pour cette partie' : undefined}
            >
              💡 Indice{' '}
              <span className="indice-reste">
                {indicesRestants === 0 ? '(plus d’indice, tu vas y arriver !)' : `(${indicesRestants} restant${indicesRestants > 1 ? 's' : ''})`}
              </span>
            </button>
          ) : null}
        </div>

        <div className="reponse-zone">
          {clic !== null && reponseALaSouris(affichee, true) ? (
            <div className="choix-couleurs" role="group" aria-label="Choisis la couleur de l’encre">
              {couleurs.map((c) => (
                <button
                  key={c.nom}
                  type="button"
                  className="btn btn-soft choix-couleur"
                  disabled={retour !== null}
                  onClick={() => clicValide(clic, 'click') && valider(c.nom)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (clicValide(clic, 'contextmenu')) valider(c.nom)
                  }}
                  onDoubleClick={() => clicValide(clic, 'dblclick') && valider(c.nom)}
                >
                  {c.nom}
                </button>
              ))}
            </div>
          ) : (
            <ReponseInput onSubmit={valider} disabled={retour !== null || enPause} placeholder="Tape ta réponse puis Entrée" etat={retour ? (retour.juste ? 'juste' : 'faux') : null} />
          )}
          <p className={retour ? (retour.juste ? 'reponse-retour juste' : 'reponse-retour faux') : 'reponse-retour'}>
            {retour ? (
              retour.juste ? (
                <>
                  <IconCheck /> Bravo !
                </>
              ) : (
                <span>
                  Tu as répondu « {retour.saisie.trim()} ». La bonne réponse était <strong>{reponseAttendue(retour.manche)}</strong>.
                </span>
              )
            ) : alaSouris ? (
              <>
                Clique avec le {clic === 'gauche' ? 'clic gauche' : clic === 'droit' ? 'clic droit' : 'double clic'} sur la couleur de l’encre.
              </>
            ) : null}
          </p>
        </div>
      </main>
      {enPause && <EcranPause onReprendre={reprendre} />}
    </div>
  )
}
