import { useEffect, useMemo, useRef, useState } from 'react'
import type { Profile, Resultat, ResultatQuiz } from '../../../../shared/data'
import { IconBack, IconCheck } from '../../components/Icons'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { pourcentage } from '../commun'
import { formatDuree } from '../dactylo/engine'
import { BoutonPause, EcranPause, usePauseAuto } from '../pause'
import { Chips, FinHero, GameTopbar, StatTile } from '../ui'
import { type ElementQuiz, melangerChoix, questionsDisponibles, tirerPartie } from './engine'
import { RelierVue } from './RelierVue'
import { NB_ACTIONS_RELIER, NOM_THEME_RELIER, THEME_RELIER } from './relier'
import { SceneCadre } from './scenes/commun'
import { type Question, type QuestionSituation, THEMES, type ThemeId } from './types'
import { AfficherVisuel, Ecran } from './visuels'
import './quiz.css'

const NOMBRES = [5, 10, 15, 20] as const
type Nombre = (typeof NOMBRES)[number]

type ChoixTheme = ThemeId | 'tout' | typeof THEME_RELIER

const NOMS_THEMES: Record<ChoixTheme, string> = {
  tout: 'Tout mélanger',
  relier: NOM_THEME_RELIER,
  ...Object.fromEntries(THEMES.map((t) => [t.id, t.nom]))
} as Record<ChoixTheme, string>

const DESCRIPTIONS: Record<ChoixTheme, string> = {
  tout: 'Des questions de tous les thèmes.',
  relier: 'Relie les actions faites sur l’ordinateur au bon logiciel.',
  materiel: 'Souris, clé USB, écran, Wi-Fi…',
  windows: 'Le bureau, les dossiers, éteindre l’ordinateur…',
  internet: 'Naviguer, se protéger, repérer les pièges…',
  bureautique: 'Écrire, mettre en forme, imprimer, faire un PDF…',
  clavier: 'Les touches et raccourcis utiles.'
}

interface Props {
  profile: Profile
  banque: Question[] // questions fournies actives + questions de l'ergothérapeute
  resultats: Resultat[]
  onResult: (r: ResultatQuiz) => void
  onQuit: () => void
}

interface Reponse {
  question: ElementQuiz
  juste: boolean
}

type Phase =
  | { nom: 'choix' }
  | { nom: 'jeu'; theme: ChoixTheme; questions: ElementQuiz[] }
  | { nom: 'fin'; theme: ChoixTheme; reponses: Reponse[]; resultat: ResultatQuiz; record: boolean }

export function Quiz({ profile, banque, resultats, onResult, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const [nombre, setNombre] = useState<Nombre>(10)

  const lancer = (theme: ChoixTheme) => setPhase({ nom: 'jeu', theme, questions: tirerPartie(banque, profile.niveau, theme, nombre) })

  const terminer = (theme: ChoixTheme, reponses: Reponse[], dureeMs: number, complete: boolean) => {
    if (reponses.length === 0) return onQuit()
    const anciens = resultats.filter(
      (r): r is ResultatQuiz => r.jeu === 'quiz' && r.profileId === profile.id && r.themeNom === NOMS_THEMES[theme]
    )
    const r: ResultatQuiz = {
      id: uid(),
      profileId: profile.id,
      jeu: 'quiz',
      date: new Date().toISOString(),
      complete,
      themeNom: NOMS_THEMES[theme],
      dureeMs,
      questions: reponses.length,
      justes: reponses.filter((x) => x.juste).length,
      ratees: reponses.filter((x) => !x.juste).map((x) => x.question.id)
    }
    onResult(r)
    if (!complete) return onQuit()
    const meilleur = Math.max(0, ...anciens.map((a) => pourcentage(a.justes, a.questions)))
    setPhase({ nom: 'fin', theme, reponses, resultat: r, record: anciens.length > 0 && pourcentage(r.justes, r.questions) > meilleur })
  }

  if (phase.nom === 'jeu') {
    return (
      <Partie
        profile={profile}
        questions={phase.questions}
        onFin={(rep, d) => terminer(phase.theme, rep, d, true)}
        onQuitter={(rep, d) => terminer(phase.theme, rep, d, false)}
      />
    )
  }

  if (phase.nom === 'fin') {
    const r = phase.resultat
    const p = pourcentage(r.justes, r.questions)
    const ratees = phase.reponses.filter((x) => !x.juste)
    return (
      <div className="screen dactylo">
        <GameTopbar titre="Quiz : l’ordinateur et moi" />
        <main className="fin-main">
          <FinHero
            profile={profile}
            message={p === 100 ? 'Sans faute, tu es un as de l’informatique !' : p >= 70 ? 'Très bien, tu connais bien l’ordinateur !' : 'Bien joué, tu as appris plein de choses !'}
            record={phase.record ? 'Nouveau record !' : undefined}
          />
          <div className="fin-stats">
            <StatTile value={`${r.justes} / ${r.questions}`} label="bonnes réponses" detail={`${p} %`} />
            <StatTile value={String(ratees.length)} label={ratees.length > 1 ? 'questions à revoir' : 'question à revoir'} detail={NOMS_THEMES[phase.theme]} />
            <StatTile value={formatDuree(r.dureeMs)} label="de quiz" detail={`${r.questions} questions`} />
          </div>
          {ratees.length > 0 && (
            <section className="quiz-revoir">
              <h3>À retenir</h3>
              {ratees.map(({ question: q }) => (
                <div key={q.id} className="quiz-revoir-item">
                  <strong>{q.question}</strong>
                  <p>{q.explication}</p>
                </div>
              ))}
            </section>
          )}
          <div className="fin-actions">
            <button className="btn btn-ghost btn-lg" onClick={onQuit}>
              <IconBack /> Menu
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'choix' })}>
              Autre thème
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => lancer(phase.theme)}>
              Rejouer
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="screen dactylo">
      <GameTopbar titre="Quiz : l’ordinateur et moi" onBack={onQuit} />
      <main className="choix-main">
        <h2 className="choix-title">Choisis ton thème</h2>
        <Chips label="Nombre de questions" values={NOMBRES} value={nombre} onChange={setNombre} />
        <div className="liste-grid">
          {(['tout', ...THEMES.map((t) => t.id), THEME_RELIER] as ChoixTheme[]).map((t) => {
            if (t === THEME_RELIER) {
              return (
                <button key={t} className="liste-card" onClick={() => lancer(t)}>
                  <span className="liste-nom">{NOMS_THEMES[t]}</span>
                  <span className="liste-exemple wrap">{DESCRIPTIONS[t]}</span>
                  <span className="liste-info">{NB_ACTIONS_RELIER} actions à relier</span>
                </button>
              )
            }
            const n = questionsDisponibles(banque, profile.niveau, t).length
            return (
              <button key={t} className="liste-card" onClick={() => lancer(t)} disabled={n === 0}>
                <span className="liste-nom">{NOMS_THEMES[t]}</span>
                <span className="liste-exemple wrap">{DESCRIPTIONS[t]}</span>
                <span className="liste-info">
                  {n} question{n > 1 ? 's' : ''}
                  {n < nombre ? ` (le quiz en aura ${n})` : ''}
                </span>
              </button>
            )
          })}
        </div>
        <p className="choix-note">Réponds avec la souris, ou au clavier : V / F, ou les touches 1 à 4. Entrée passe à la question suivante.</p>
      </main>
    </div>
  )
}

function Partie({
  profile,
  questions,
  onFin,
  onQuitter
}: {
  profile: Profile
  questions: ElementQuiz[]
  onFin: (r: Reponse[], dureeMs: number) => void
  onQuitter: (r: Reponse[], dureeMs: number) => void
}) {
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [corrigee, setCorrigee] = useState<{ juste: boolean; choix?: number; detail?: string } | null>(null)
  const debut = useRef(Date.now())
  // Pause automatique : le temps de la pause ne compte pas dans la durée du quiz.
  const { enPause, reprendre, mettreEnPause } = usePauseAuto(true, (d) => {
    debut.current += d
  })
  const index = reponses.length - (corrigee ? 1 : 0)
  const q = questions[index]
  const justes = reponses.filter((r) => r.juste).length

  const repondre = (juste: boolean, choix?: number, detail?: string) => {
    if (corrigee) return
    playSound(juste ? profile.sonReussite : profile.dactylo.sonErreur ? profile.sonEchec : 'aucun')
    setCorrigee({ juste, choix, detail })
    setReponses((r) => [...r, { question: q, juste }])
  }

  const suivante = () => {
    if (!corrigee) return
    if (reponses.length >= questions.length) onFin(reponses, Date.now() - debut.current)
    else setCorrigee(null)
  }

  // Entrée : question suivante
  const suivanteRef = useRef(suivante)
  suivanteRef.current = suivante
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Un bouton qui a le focus gère déjà Entrée lui-même.
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        suivanteRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="screen dactylo">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => onQuitter(reponses, Date.now() - debut.current)}>
          <IconBack /> Arrêter
        </button>
        <BoutonPause onClick={mettreEnPause} />
        <div className="progress" aria-label={`Question ${index + 1} sur ${questions.length}`}>
          {questions.map((_, i) => (
            <span
              key={i}
              className={
                i < reponses.length ? (reponses[i].juste ? 'progress-dot done' : 'progress-dot faux') : i === index ? 'progress-dot current' : 'progress-dot'
              }
            />
          ))}
        </div>
        <div className="live-stats">
          <div className="live-stat">
            <span className="live-stat-value">
              {justes} / {reponses.length}
            </span>
            <span className="live-stat-label">Justes</span>
          </div>
        </div>
      </header>
      <main className="quiz-main">
        {q.type === 'relier' ? (
          <div className="quiz-question">
            <p className="quiz-theme">{NOM_THEME_RELIER}</p>
            <h2 className="quiz-texte">{q.question}</h2>
            <RelierVue key={q.id} question={q} fini={corrigee !== null} onFin={(juste, detail) => repondre(juste, undefined, detail)} />
          </div>
        ) : (
          <QuestionVue key={q.id} question={q} profile={profile} corrigee={corrigee} onRepondre={repondre} />
        )}
        {corrigee && (
          <div
            className={corrigee.juste ? 'quiz-retour juste' : 'quiz-retour faux'}
            role="status"
            ref={(el) => el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })}
          >
            <div>
              <strong>
                {corrigee.juste ? 'Bonne réponse !' : q.type === 'relier' ? 'Presque, regarde la correction !' : q.type === 'situation' ? 'Tu y es arrivé, avec un peu d’aide !' : 'Pas tout à fait…'}
              </strong>
              <p>{corrigee.detail ?? q.explication}</p>
              {q.type === 'situation' && q.raccourci && <p className="quiz-raccourci">Ça peut aussi se faire avec {q.raccourci}.</p>}
            </div>
            <button className="btn btn-primary btn-lg" onClick={suivante} autoFocus>
              {reponses.length >= questions.length ? 'Voir mon score' : 'Question suivante'}
            </button>
          </div>
        )}
      </main>
      {enPause && <EcranPause onReprendre={reprendre} />}
    </div>
  )
}

function QuestionVue({
  question: q,
  profile,
  corrigee,
  onRepondre
}: {
  question: Question
  profile: Profile
  corrigee: { juste: boolean; choix?: number } | null
  onRepondre: (juste: boolean, choix?: number) => void
}) {
  const melange = useMemo(() => (q.type === 'choix' ? melangerChoix(q) : null), [q])
  const theme = THEMES.find((t) => t.id === q.theme)?.nom

  // Clavier : V / F, ou 1 à 4 (et A à D)
  const repondreRef = useRef(onRepondre)
  repondreRef.current = onRepondre
  useEffect(() => {
    if (q.type === 'situation' || corrigee) return
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return
      const k = e.key.toLowerCase()
      if (q.type === 'vraifaux') {
        if (k === 'v') repondreRef.current(q.reponse === true, 1)
        if (k === 'f') repondreRef.current(q.reponse === false, 0)
      } else if (melange) {
        const i = ['1', '2', '3', '4'].indexOf(k) >= 0 ? ['1', '2', '3', '4'].indexOf(k) : ['a', 'b', 'c', 'd'].indexOf(k)
        if (i >= 0) repondreRef.current(i === melange.bonne, i)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, melange, corrigee])

  return (
    <div className="quiz-question">
      <p className="quiz-theme">{theme}</p>
      <h2 className="quiz-texte">{q.question}</h2>

      {q.type === 'situation' ? (
        <Situation question={q} profile={profile} fini={corrigee !== null} onFin={(juste) => onRepondre(juste)} />
      ) : (
        <div className={q.visuel ? 'quiz-corps avec-visuel' : 'quiz-corps'}>
          {q.visuel && <AfficherVisuel visuel={q.visuel} />}
          {q.type === 'vraifaux' ? (
            <div className="quiz-reponses vf">
              {[
                { label: 'Vrai', touche: 'V', valeur: true, i: 1 },
                { label: 'Faux', touche: 'F', valeur: false, i: 0 }
              ].map((r) => (
                <button
                  key={r.label}
                  className={classeReponse(corrigee, r.i, q.reponse === r.valeur)}
                  disabled={corrigee !== null}
                  onClick={() => onRepondre(q.reponse === r.valeur, r.i)}
                >
                  <span className="quiz-touche">{r.touche}</span>
                  {r.label}
                </button>
              ))}
            </div>
          ) : (
            melange && (
              <div className="quiz-reponses">
                {melange.textes.map((t, i) => (
                  <button
                    key={t}
                    className={classeReponse(corrigee, i, i === melange.bonne)}
                    disabled={corrigee !== null}
                    onClick={() => onRepondre(i === melange.bonne, i)}
                  >
                    <span className="quiz-touche">{i + 1}</span>
                    {t}
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

function classeReponse(corrigee: { choix?: number } | null, i: number, bonne: boolean): string {
  if (!corrigee) return 'quiz-reponse'
  if (bonne) return 'quiz-reponse bonne'
  if (corrigee.choix === i) return 'quiz-reponse mauvaise'
  return 'quiz-reponse eteinte'
}

// Mise en situation : l'enfant clique sur l'écran, étape par étape.
// Juste si toutes les étapes sont faites sans mauvais clic.
function Situation({
  question: q,
  profile,
  fini,
  onFin
}: {
  question: QuestionSituation
  profile: Profile
  fini: boolean
  onFin: (juste: boolean) => void
}) {
  const [etape, setEtape] = useState(0)
  const [menu, setMenu] = useState<string | null>(q.menuDepart ?? null)
  const [erreurs, setErreurs] = useState(0) // dans l'étape en cours
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const dernierSon = useRef(0)
  const e = q.etapes[Math.min(etape, q.etapes.length - 1)]

  // Raccourci clavier : valide l'action demandée, en plus du clic
  const finRef = useRef(onFin)
  finRef.current = onFin
  const raccourciTouche = q.raccourci?.split('+').pop()?.toLowerCase()
  useEffect(() => {
    if (!raccourciTouche || fini) return
    const onKey = (ev: KeyboardEvent) => {
      if (!(ev.ctrlKey || ev.metaKey) || ev.altKey || ev.shiftKey || ev.key.toLowerCase() !== raccourciTouche) return
      ev.preventDefault()
      setEtape(q.etapes.length)
      setMessage(null)
      finRef.current(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [raccourciTouche, fini, q.etapes.length])

  const clic = (zone: string) => {
    if (fini) return
    // Un clic droit n'est une erreur que s'il est attendu à ce moment-là :
    // sinon il est simplement ignoré (le menu du navigateur est déjà bloqué).
    if (zone.endsWith('@droit') && !e.cibles.some((c) => c.endsWith('@droit'))) return
    if (e.cibles.includes(zone)) {
      const ouvre = e.ouvrePar?.[zone] ?? e.ouvre
      if (ouvre) setMenu(ouvre)
      setErreurs(0)
      setMessage(null)
      if (etape + 1 >= q.etapes.length) {
        setEtape(etape + 1)
        onFin(total === 0)
      } else {
        setEtape(etape + 1)
        playSound('bulles')
      }
    } else {
      setErreurs((n) => n + 1)
      setTotal((n) => n + 1)
      setMessage(erreurs + 1 >= 2 ? e.aide : 'Ce n’est pas ça, essaie encore !')
      const t = Date.now()
      if (profile.dactylo.sonErreur && t - dernierSon.current > 700) {
        dernierSon.current = t
        playSound(profile.sonEchec)
      }
    }
  }

  return (
    <div className="quiz-situation">
      <div className="quiz-etapes">
        {q.etapes.length > 1 &&
          q.etapes.map((_, i) => (
            <span key={i} className={i < etape ? 'quiz-etape faite' : i === etape ? 'quiz-etape en-cours' : 'quiz-etape'}>
              {i < etape ? <IconCheck size={14} /> : i + 1}
            </span>
          ))}
        <span className={message ? 'quiz-situation-msg visible' : 'quiz-situation-msg'}>
          {fini ? '' : message ?? (q.etapes.length > 1 ? `Étape ${etape + 1} sur ${q.etapes.length}` : 'Clique au bon endroit sur l’écran.')}
        </span>
      </div>
      <SceneCadre interactive={!fini} onZone={clic} indice={!fini && erreurs >= 2 ? e.cibles[0] : null}>
        <Ecran scene={q.scene} menu={menu} />
      </SceneCadre>
    </div>
  )
}
