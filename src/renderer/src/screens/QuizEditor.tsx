import { useState } from 'react'
import { NIVEAUX, QUESTION_MAX, type QuestionPerso, questionPersoValide, type ThemeQuiz } from '../../../shared/data'
import { ConfirmDialog, Modal } from '../components/Modal'
import { IconPencil, IconPlus, IconTrash } from '../components/Icons'
import { versQuestion } from '../games/quiz/engine'
import { QUESTIONS } from '../games/quiz/questions'
import { type Question, THEMES } from '../games/quiz/types'
import { ICONES } from '../games/quiz/visuels'
import { uid } from '../uid'
import { NIVEAU_LABELS } from './niveaux'

interface Props {
  perso: QuestionPerso[]
  masquees: string[]
  onChange: (perso: QuestionPerso[], masquees: string[]) => void
}

const NOM_THEME = Object.fromEntries(THEMES.map((t) => [t.id, t.nom])) as Record<ThemeQuiz, string>
const TYPES: Record<Question['type'], string> = { vraifaux: 'Vrai / Faux', choix: 'QCM', situation: 'Mise en situation' }

export function QuizEditor({ perso, masquees, onChange }: Props) {
  const [onglet, setOnglet] = useState<'perso' | 'fournies'>('perso')
  const [edition, setEdition] = useState<QuestionPerso | null>(null)
  const [aSupprimer, setASupprimer] = useState<QuestionPerso | null>(null)
  const [filtre, setFiltre] = useState<ThemeQuiz | 'tout'>('tout')
  const off = new Set(masquees)
  const actives = QUESTIONS.filter((q) => !off.has(q.id)).length

  const nouvelle = () =>
    setEdition({
      id: `perso-${uid()}`,
      type: 'vraifaux',
      theme: filtre === 'tout' ? 'materiel' : filtre,
      niveau: 1,
      question: '',
      explication: '',
      icone: '',
      reponse: true,
      choix: ['', '', '', ''],
      bonne: 0
    })

  const enregistrer = (q: QuestionPerso) => {
    const existe = perso.some((x) => x.id === q.id)
    onChange(existe ? perso.map((x) => (x.id === q.id ? q : x)) : [...perso, q], masquees)
    setEdition(null)
  }

  const basculer = (id: string) => onChange(perso, off.has(id) ? masquees.filter((m) => m !== id) : [...masquees, id])

  const fournies = QUESTIONS.filter((q) => filtre === 'tout' || q.theme === filtre)
  const miennes = perso.filter((q) => filtre === 'tout' || q.theme === filtre)

  return (
    <section>
      <h1 className="ergo-title">Quiz</h1>
      <p className="ergo-help">
        Ajoutez vos propres questions (Vrai/Faux ou QCM), et désactivez les questions fournies qui ne conviennent pas. Chaque
        enfant reçoit les questions jusqu’à son niveau + 1.
      </p>

      <div className="quiz-ed-barre">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={onglet === 'perso'} className={onglet === 'perso' ? 'tab active' : 'tab'} onClick={() => setOnglet('perso')}>
            Mes questions ({perso.length})
          </button>
          <button
            role="tab"
            aria-selected={onglet === 'fournies'}
            className={onglet === 'fournies' ? 'tab active' : 'tab'}
            onClick={() => setOnglet('fournies')}
          >
            Questions fournies ({actives} / {QUESTIONS.length} actives)
          </button>
        </div>
        <select className="select" value={filtre} onChange={(e) => setFiltre(e.target.value as ThemeQuiz | 'tout')} aria-label="Thème">
          <option value="tout">Tous les thèmes</option>
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom}
            </option>
          ))}
        </select>
      </div>

      {onglet === 'perso' ? (
        <>
          <button className="btn btn-primary quiz-ed-nouvelle" onClick={nouvelle}>
            <IconPlus /> Nouvelle question
          </button>
          {miennes.length === 0 ? (
            <p className="empty">Aucune question pour l’instant. Cliquez sur « Nouvelle question ».</p>
          ) : (
            <div className="quiz-ed-liste">
              {miennes.map((q) => (
                <div key={q.id} className="quiz-ed-item">
                  <Apercu q={versQuestion(q)} />
                  <div className="quiz-ed-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEdition(q)}>
                      <IconPencil size={16} /> Modifier
                    </button>
                    <button className="btn btn-ghost btn-sm btn-icon btn-danger-text" aria-label="Supprimer" title="Supprimer" onClick={() => setASupprimer(q)}>
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {masquees.length > 0 && (
            <button className="btn btn-ghost btn-sm quiz-ed-nouvelle" onClick={() => onChange(perso, [])}>
              Tout réactiver
            </button>
          )}
          <div className="quiz-ed-liste">
            {fournies.map((q) => (
              <label key={q.id} className={off.has(q.id) ? 'quiz-ed-item eteinte' : 'quiz-ed-item'}>
                <input type="checkbox" className="switch" checked={!off.has(q.id)} onChange={() => basculer(q.id)} aria-label="Question active" />
                <Apercu q={q} />
              </label>
            ))}
          </div>
        </>
      )}

      {edition && <QuestionForm initiale={edition} onCancel={() => setEdition(null)} onSave={enregistrer} />}
      {aSupprimer && (
        <ConfirmDialog
          title="Supprimer cette question ?"
          message={<>« {aSupprimer.question} » sera supprimée.</>}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setASupprimer(null)}
          onConfirm={() => {
            onChange(
              perso.filter((x) => x.id !== aSupprimer.id),
              masquees
            )
            setASupprimer(null)
          }}
        />
      )}
    </section>
  )
}

function Apercu({ q }: { q: Question }) {
  let reponse = ''
  if (q.type === 'vraifaux') reponse = q.reponse ? 'Vrai' : 'Faux'
  else if (q.type === 'choix') reponse = q.choix[q.bonne]
  return (
    <div className="quiz-ed-texte">
      <div className="quiz-ed-tags">
        <span className="quiz-ed-tag">{TYPES[q.type]}</span>
        <span className="quiz-ed-tag">{NOM_THEME[q.theme]}</span>
        <span className="quiz-ed-tag">Niveau {q.niveau}</span>
        {q.visuel && <span className="quiz-ed-tag">Avec image</span>}
      </div>
      <strong>{q.question}</strong>
      {reponse && <span className="quiz-ed-reponse">Réponse : {reponse}</span>}
    </div>
  )
}

function QuestionForm({ initiale, onCancel, onSave }: { initiale: QuestionPerso; onCancel: () => void; onSave: (q: QuestionPerso) => void }) {
  const [q, setQ] = useState(initiale)
  const [essai, setEssai] = useState(false)
  const set = (patch: Partial<QuestionPerso>) => setQ((x) => ({ ...x, ...patch }))
  const nettoyee: QuestionPerso = {
    ...q,
    question: q.question.trim(),
    explication: q.explication.trim(),
    choix: q.choix.map((c) => c.trim()) as QuestionPerso['choix']
  }
  const valide = questionPersoValide(nettoyee)

  return (
    <Modal title={initiale.question ? 'Modifier la question' : 'Nouvelle question'} onClose={onCancel} width={760}>
      <div className="quiz-form">
        <div className="quiz-form-ligne">
          <div className="segment" role="radiogroup" aria-label="Type de question">
            {(['vraifaux', 'choix'] as const).map((t) => (
              <button key={t} role="radio" aria-checked={q.type === t} className={q.type === t ? 'segment-item actif' : 'segment-item'} onClick={() => set({ type: t })}>
                {t === 'vraifaux' ? 'Vrai / Faux' : 'QCM (4 réponses)'}
              </button>
            ))}
          </div>
          <label className="field">
            Thème
            <select className="select" value={q.theme} onChange={(e) => set({ theme: e.target.value as ThemeQuiz })}>
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Niveau
            <select className="select" value={q.niveau} onChange={(e) => set({ niveau: Number(e.target.value) })}>
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>
                  {NIVEAU_LABELS[n]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          {q.type === 'vraifaux' ? 'Affirmation (l’enfant répond Vrai ou Faux)' : 'Question'}
          <textarea
            className="input quiz-form-question"
            value={q.question}
            maxLength={QUESTION_MAX}
            autoFocus
            onChange={(e) => set({ question: e.target.value })}
            placeholder={q.type === 'vraifaux' ? 'Ex. : La touche Entrée sert à aller à la ligne.' : 'Ex. : Quelle touche permet d’effacer une lettre ?'}
          />
        </label>
        {essai && q.question.trim() === '' && <p className="error">Écrivez la question.</p>}

        {q.type === 'vraifaux' ? (
          <div className="field">
            Bonne réponse
            <div className="segment" role="radiogroup" aria-label="Bonne réponse">
              {[true, false].map((v) => (
                <button key={String(v)} role="radio" aria-checked={q.reponse === v} className={q.reponse === v ? 'segment-item actif' : 'segment-item'} onClick={() => set({ reponse: v })}>
                  {v ? 'Vrai' : 'Faux'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="field">
            Réponses (cochez la bonne ; elles seront mélangées pendant le quiz)
            <div className="quiz-form-choix">
              {q.choix.map((c, i) => (
                <div key={i} className={q.bonne === i ? 'quiz-form-choix-ligne bonne' : 'quiz-form-choix-ligne'}>
                  <input type="radio" name="bonne" checked={q.bonne === i} onChange={() => set({ bonne: i })} aria-label={`Réponse ${i + 1} est la bonne`} />
                  <input
                    className="input"
                    value={c}
                    maxLength={QUESTION_MAX}
                    placeholder={i === 0 ? 'Réponse 1' : `Réponse ${i + 1}`}
                    onChange={(e) => set({ choix: q.choix.map((x, j) => (j === i ? e.target.value : x)) as QuestionPerso['choix'] })}
                  />
                </div>
              ))}
            </div>
            {essai && q.choix.some((x) => x.trim() === '') && <p className="error">Remplissez les quatre réponses.</p>}
          </div>
        )}

        <label className="field">
          Explication affichée après la réponse (conseillé)
          <textarea
            className="input quiz-form-explication"
            value={q.explication}
            maxLength={QUESTION_MAX}
            onChange={(e) => set({ explication: e.target.value })}
            placeholder="Ex. : La touche Retour arrière efface la lettre juste avant le curseur."
          />
        </label>

        <div className="field">
          Image (facultatif)
          <div className="quiz-form-icones" role="radiogroup" aria-label="Image">
            <button role="radio" aria-checked={q.icone === ''} className={q.icone === '' ? 'quiz-form-icone actif' : 'quiz-form-icone'} onClick={() => set({ icone: '' })}>
              Aucune
            </button>
            {Object.keys(ICONES).map((id) => (
              <button key={id} role="radio" aria-checked={q.icone === id} title={id} className={q.icone === id ? 'quiz-form-icone actif' : 'quiz-form-icone'} onClick={() => set({ icone: id })}>
                {ICONES[id]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEssai(true)
            if (valide) onSave(nettoyee)
          }}
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  )
}
