import type { QuestionPerso, Resultat, ResultatQuiz } from '../../../../shared/data'
import { LineChart } from '../../components/LineChart'
import { pourcentage } from '../../games/commun'
import { formatDuree } from '../../games/dactylo/engine'
import { construireBanque } from '../../games/quiz/engine'
import { type Colonne, cumulerCompteurs, Historique, type Indicateur, points, Tile } from './commun'

export const COLONNES_QUIZ: Colonne<ResultatQuiz>[] = [
  { titre: 'Thème', valeur: (r) => r.themeNom },
  { titre: 'Bonnes réponses', valeur: (r) => `${r.justes} / ${r.questions}`, num: true },
  { titre: 'Réussite', valeur: (r) => `${pourcentage(r.justes, r.questions)} %`, num: true },
  { titre: 'Durée', valeur: (r) => formatDuree(r.dureeMs), num: true }
]

export function StatsQuiz({
  parties,
  questionsPerso,
  onSupprimer
}: {
  parties: ResultatQuiz[]
  questionsPerso: QuestionPerso[]
  onSupprimer: (r: Resultat) => void
}) {
  // Toutes les questions, même désactivées, pour retrouver leur texte.
  const parId = new Map(construireBanque(questionsPerso, []).map((q) => [q.id, q]))
  const derniere = parties[parties.length - 1]
  const reussite = (r: ResultatQuiz) => pourcentage(r.justes, r.questions)
  const totalQuestions = parties.reduce((t, r) => t + r.questions, 0)
  const totalJustes = parties.reduce((t, r) => t + r.justes, 0)
  const ratees = cumulerCompteurs(parties.map((r) => Object.fromEntries(r.ratees.map((id) => [id, 1]))))
  const pires = Object.entries(ratees)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, n]) => ({ q: parId.get(id), n }))
    .filter((x) => x.q)
  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'quiz joués' : 'quiz joué'} detail={`${totalQuestions} questions au total`} />
        <Tile valeur={`${reussite(derniere)} %`} label="de réussite" detail={`dernier quiz (${derniere.themeNom.toLowerCase()})`} />
        <Tile valeur={`${pourcentage(totalJustes, totalQuestions)} %`} label="de réussite en tout" detail="sur tous les quiz" />
      </div>
      {parties.length > 1 && (
        <div className="card">
          <LineChart titre="Réussite" unite=" %" max={100} points={points(parties, reussite, (r) => r.themeNom)} />
        </div>
      )}
      <div className="card">
        <h2 className="card-title">Questions le plus souvent ratées</h2>
        {pires.length === 0 ? (
          <p className="ergo-help">Aucune question ratée, bravo !</p>
        ) : (
          <ul className="quiz-ratees">
            {pires.map(({ q, n }) => (
              <li key={q!.id}>
                <span className="quiz-ratees-n">{n}×</span>
                <span>
                  <strong>{q!.question}</strong>
                  <span className="quiz-ratees-theme"> · niveau {q!.niveau}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Historique parties={parties} colonnes={COLONNES_QUIZ} onSupprimer={onSupprimer} />
    </>
  )
}

export const INDICATEURS_QUIZ: Indicateur<ResultatQuiz>[] = [{ nom: 'Réussite', unite: '%', valeur: (r) => pourcentage(r.justes, r.questions) }]

// Bilan : un thème par groupe.
export const GROUPE_QUIZ = (r: ResultatQuiz) => r.themeNom
