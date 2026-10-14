import { useState } from 'react'
import type {
  JeuId,
  Profile,
  QuestionPerso,
  Resultat,
  ResultatCouleurs,
  ResultatDactylo,
  ResultatEspace,
  ResultatMemoire,
  ResultatPetitBac,
  ResultatQuiz,
  ReponseBac
} from '../../../shared/data'
import { api } from '../api'
import { Avatar } from '../avatar/Avatar'
import { LineChart, type Point } from '../components/LineChart'
import { ConfirmDialog } from '../components/Modal'
import { IconBack, IconCheck, IconDownload, IconTrash } from '../components/Icons'
import { pourcentage } from '../games/commun'
import { formatDuree, moyennesParJour, motsParMinute, precision, vitesse } from '../games/dactylo/engine'
import { cadence } from '../games/espace/engine'
import { etatReponse, formatTemps } from '../games/petitbac/engine'
import { construireBanque } from '../games/quiz/engine'
import { toucheDe } from '../keyboard/azerty'
import { couleurChaleur, Keyboard } from '../keyboard/Keyboard'

const NB_PARTIES_CARTE = 10
const NB_GRILLES = 6

export const NOMS_JEUX: Record<JeuId, string> = {
  dactylo: 'Dactylo',
  couleurs: 'Couleurs piégées',
  memoire: 'Mots à retenir',
  espace: 'Chasse aux lettres',
  quiz: 'Quiz',
  petitbac: 'Petit bac'
}

export const MODES_COULEURS_LABELS: Record<ResultatCouleurs['mode'], string> = {
  mot: 'Écrire le mot',
  couleur: 'Écrire la couleur',
  melange: 'Les deux'
}

// Résumé d'une partie en quelques mots (liste des patients).
export function resumePartie(r: Resultat): string {
  if (r.jeu === 'dactylo') return `${vitesse(r)} frappes/min`
  if (r.jeu === 'couleurs') return `${r.justes}/${r.manches} justes`
  if (r.jeu === 'memoire') return `${r.trouves}/${r.mots} mots`
  if (r.jeu === 'quiz') return `${r.justes}/${r.questions} bonnes réponses`
  if (r.jeu === 'petitbac') return `${r.justes}/${r.categories} mots (lettre ${r.lettre})`
  return `${r.detruites} lettres attrapées`
}

const dateCourte = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
const dateLongue = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

interface Colonne<R> {
  titre: string
  valeur: (r: R) => string | number
  num?: boolean
  exportSeul?: boolean // trop long pour l'historique : seulement dans l'export Excel
}

const COLONNES_DACTYLO: Colonne<ResultatDactylo>[] = [
  { titre: 'Liste', valeur: (r) => r.listeNom },
  { titre: 'Phrases', valeur: (r) => r.phrases, num: true },
  { titre: 'Temps', valeur: (r) => formatDuree(r.dureeMs), num: true },
  { titre: 'Frappes/min', valeur: (r) => vitesse(r), num: true },
  { titre: 'Mots/min', valeur: (r) => motsParMinute(r), num: true },
  { titre: 'Précision', valeur: (r) => `${precision(r)} %`, num: true },
  { titre: 'Erreurs', valeur: (r) => r.erreurs, num: true }
]

const COLONNES_COULEURS: Colonne<ResultatCouleurs>[] = [
  { titre: 'Mode', valeur: (r) => MODES_COULEURS_LABELS[r.mode] },
  { titre: 'Justes', valeur: (r) => `${r.justes} / ${r.manches}`, num: true },
  { titre: 'Réussite', valeur: (r) => `${pourcentage(r.justes, r.manches)} %`, num: true },
  { titre: 'Pièges déjoués', valeur: (r) => `${r.piegesJustes} / ${r.pieges}`, num: true },
  { titre: 'Temps moyen', valeur: (r) => `${secondes(r.dureeMs / Math.max(1, r.manches))} s`, num: true }
]

const COLONNES_MEMOIRE: Colonne<ResultatMemoire>[] = [
  { titre: 'Liste', valeur: (r) => r.listeNom },
  { titre: 'Trouvés', valeur: (r) => `${r.trouves} / ${r.mots}`, num: true },
  { titre: 'Réussite', valeur: (r) => `${pourcentage(r.trouves, r.mots)} %`, num: true },
  { titre: 'Mots en trop', valeur: (r) => r.erreurs, num: true },
  { titre: 'Temps', valeur: (r) => formatDuree(r.dureeMs), num: true }
]

const tirsReussis = (r: ResultatEspace) => pourcentage(r.detruites, r.detruites + r.erreurs)

const NOMS_AVENTURES: Record<ResultatEspace['theme'], string> = { espace: 'Fusée', western: 'Cow-boy', ocean: 'Sous-marin' }

const COLONNES_ESPACE: Colonne<ResultatEspace>[] = [
  { titre: 'Aventure', valeur: (r) => NOMS_AVENTURES[r.theme] },
  { titre: 'Lettres', valeur: (r) => r.serieNom },
  { titre: 'Durée', valeur: (r) => formatDuree(r.dureeMs), num: true },
  { titre: 'Attrapées', valeur: (r) => r.detruites, num: true },
  { titre: 'Par minute', valeur: (r) => cadence(r.detruites, r.dureeMs), num: true },
  { titre: 'Lettres justes', valeur: (r) => `${tirsReussis(r)} %`, num: true },
  { titre: 'Tombées', valeur: (r) => r.manquees, num: true }
]

const COLONNES_QUIZ: Colonne<ResultatQuiz>[] = [
  { titre: 'Thème', valeur: (r) => r.themeNom },
  { titre: 'Bonnes réponses', valeur: (r) => `${r.justes} / ${r.questions}`, num: true },
  { titre: 'Réussite', valeur: (r) => `${pourcentage(r.justes, r.questions)} %`, num: true },
  { titre: 'Durée', valeur: (r) => formatDuree(r.dureeMs), num: true }
]

const COLONNES_PETITBAC: Colonne<ResultatPetitBac>[] = [
  { titre: 'Lettre', valeur: (r) => r.lettre },
  { titre: 'Mots acceptés', valeur: (r) => `${r.justes} / ${r.categories}`, num: true },
  { titre: 'Réussite', valeur: (r) => `${pourcentage(r.justes, r.categories)} %`, num: true },
  { titre: 'Temps', valeur: (r) => formatDuree(r.dureeMs), num: true },
  { titre: 'Limite', valeur: (r) => formatTemps(r.tempsLimite) },
  {
    titre: 'Réponses',
    valeur: (r) => r.reponses.map((x) => `${x.categorie} : ${x.mot || '—'}${x.mot && !x.valide ? ' (refusé)' : ''}`).join(' ; '),
    exportSeul: true
  }
]

function secondes(ms: number): string {
  return (ms / 1000).toFixed(1).replace('.', ',')
}

interface Props {
  profile: Profile
  resultats: Resultat[]
  questionsPerso: QuestionPerso[]
  onSupprimer: (id: string) => void
  onRetour: () => void
}

export function ErgoStats({ profile, resultats, questionsPerso, onSupprimer, onRetour }: Props) {
  const [aSupprimer, setASupprimer] = useState<Resultat | null>(null)
  const siens = resultats.filter((r) => r.profileId === profile.id).sort((a, b) => a.date.localeCompare(b.date))
  const parJeu = {
    dactylo: siens.filter((r): r is ResultatDactylo => r.jeu === 'dactylo'),
    couleurs: siens.filter((r): r is ResultatCouleurs => r.jeu === 'couleurs'),
    memoire: siens.filter((r): r is ResultatMemoire => r.jeu === 'memoire'),
    espace: siens.filter((r): r is ResultatEspace => r.jeu === 'espace'),
    quiz: siens.filter((r): r is ResultatQuiz => r.jeu === 'quiz'),
    petitbac: siens.filter((r): r is ResultatPetitBac => r.jeu === 'petitbac')
  }
  // Onglet de départ : le jeu de la dernière partie.
  const [jeu, setJeu] = useState<JeuId>(siens[siens.length - 1]?.jeu ?? 'dactylo')

  const exporter = () => {
    const csv =
      jeu === 'dactylo'
        ? versCsv(parJeu.dactylo, COLONNES_DACTYLO)
        : jeu === 'couleurs'
          ? versCsv(parJeu.couleurs, COLONNES_COULEURS)
          : jeu === 'memoire'
            ? versCsv(parJeu.memoire, COLONNES_MEMOIRE)
            : jeu === 'espace'
              ? versCsv(parJeu.espace, COLONNES_ESPACE)
              : jeu === 'quiz'
                ? versCsv(parJeu.quiz, COLONNES_QUIZ)
                : versCsv(parJeu.petitbac, COLONNES_PETITBAC)
    void api.exportCsv(`DefilOrdi-${profile.prenom}-${jeu}.csv`, csv)
  }

  const supprimer = (r: Resultat) => setASupprimer(r)

  return (
    <section className="stats">
      <button className="btn btn-ghost btn-sm" onClick={onRetour}>
        <IconBack size={18} /> Patients
      </button>
      <div className="stats-head">
        <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={64} zoom />
        <div>
          <h1 className="ergo-title">{profile.prenom}</h1>
          <p className="stats-sub">
            Niveau {profile.niveau} · {profile.classe}
            {profile.age !== null && ` · ${profile.age} ans`}
          </p>
        </div>
        {parJeu[jeu].length > 0 && (
          <button className="btn btn-ghost stats-export" onClick={exporter}>
            <IconDownload /> Exporter (Excel)
          </button>
        )}
      </div>

      <div className="tabs stats-tabs" role="tablist">
        {(Object.keys(NOMS_JEUX) as JeuId[]).map((j) => (
          <button key={j} role="tab" aria-selected={j === jeu} className={j === jeu ? 'tab active' : 'tab'} onClick={() => setJeu(j)}>
            {NOMS_JEUX[j]} ({parJeu[j].length})
          </button>
        ))}
      </div>

      {parJeu[jeu].length === 0 ? (
        <p className="empty">
          {profile.prenom} n’a pas encore joué à {NOMS_JEUX[jeu]}.
        </p>
      ) : jeu === 'dactylo' ? (
        <StatsDactylo parties={parJeu.dactylo} onSupprimer={supprimer} />
      ) : jeu === 'couleurs' ? (
        <StatsCouleurs parties={parJeu.couleurs} onSupprimer={supprimer} />
      ) : jeu === 'memoire' ? (
        <StatsMemoire parties={parJeu.memoire} onSupprimer={supprimer} />
      ) : jeu === 'espace' ? (
        <StatsEspace parties={parJeu.espace} onSupprimer={supprimer} />
      ) : jeu === 'quiz' ? (
        <StatsQuiz parties={parJeu.quiz} questionsPerso={questionsPerso} onSupprimer={supprimer} />
      ) : (
        <StatsPetitBac parties={parJeu.petitbac} onSupprimer={supprimer} />
      )}

      {aSupprimer && (
        <ConfirmDialog
          title="Supprimer cette partie ?"
          message={<>La partie du {dateLongue(aSupprimer.date)} sera retirée des statistiques.</>}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setASupprimer(null)}
          onConfirm={() => {
            onSupprimer(aSupprimer.id)
            setASupprimer(null)
          }}
        />
      )}
    </section>
  )
}

function versCsv<R extends Resultat>(parties: R[], colonnes: Colonne<R>[]): string {
  const lignes = [
    ['Date', ...colonnes.map((c) => c.titre)],
    ...parties.map((r) => [dateLongue(r.date), ...colonnes.map((c) => c.valeur(r))])
  ]
  return lignes.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n')
}

function points<R extends Resultat>(parties: R[], y: (r: R) => number, detail: (r: R) => string): Point[] {
  return parties.map((r) => ({ label: `${dateLongue(r.date)} · ${detail(r)}`, axe: dateCourte(r.date), y: y(r) }))
}

function StatsDactylo({ parties, onSupprimer }: { parties: ResultatDactylo[]; onSupprimer: (r: Resultat) => void }) {
  const recentes = parties.slice(-NB_PARTIES_CARTE)
  const derniere = parties[parties.length - 1]
  const premiere = parties[0]
  const tempsTotal = parties.reduce((t, r) => t + r.dureeMs, 0)

  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${formatDuree(tempsTotal)} de frappe au total`} />
        <Tile
          valeur={String(vitesse(derniere))}
          label="frappes justes/min"
          detail={parties.length > 1 ? `${ecart(vitesse(derniere) - vitesse(premiere))} depuis la 1re partie` : 'dernière partie'}
        />
        <Tile
          valeur={`${precision(derniere)} %`}
          label="de précision"
          detail={parties.length > 1 ? `${ecart(precision(derniere) - precision(premiere), ' pt')} depuis la 1re partie` : 'dernière partie'}
        />
      </div>

      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Vitesse (frappes justes par minute)" points={points(parties, vitesse, (r) => r.listeNom)} />
          </div>
          <div className="card">
            <LineChart titre="Précision" unite=" %" max={100} points={points(parties, precision, (r) => r.listeNom)} />
          </div>
        </div>
      )}

      <MoyennesParJour parties={parties} />

      <CarteErreurs
        titre="Erreurs par touche"
        sousTitre={recentes.length < parties.length ? `${recentes.length} dernières parties` : 'toutes les parties'}
        erreurs={cumulerCompteurs(recentes.map((r) => r.erreursParTouche))}
        legende="Caractères les plus souvent manqués"
      />

      <Historique parties={parties} colonnes={COLONNES_DACTYLO} onSupprimer={onSupprimer} />
    </>
  )
}

// Dactylo : moyenne de vitesse et de précision par jour d'utilisation, pour
// voir la progression d'un jour à l'autre (pas dans l'export Excel).
function MoyennesParJour({ parties }: { parties: ResultatDactylo[] }) {
  const jours = moyennesParJour(parties)
  const dateJour = (jour: string) => {
    const [a, m, j] = jour.split('-').map(Number)
    return new Date(a, m - 1, j)
  }
  const court = (jour: string) => dateJour(jour).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  const long = (jour: string) => dateJour(jour).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const pts = (y: (m: (typeof jours)[number]) => number): Point[] =>
    jours.map((m) => ({ label: `${long(m.jour)} · ${m.parties} partie${m.parties > 1 ? 's' : ''}`, axe: court(m.jour), y: y(m) }))
  return (
    <div className="card">
      <h2 className="card-title">
        Moyenne par jour <span className="card-title-sub">({jours.length} jour{jours.length > 1 ? 's' : ''} d’utilisation)</span>
      </h2>
      {jours.length > 1 && (
        <div className="stats-charts">
          <LineChart titre="Vitesse moyenne (frappes justes par minute)" points={pts((m) => m.vitesse)} />
          <LineChart titre="Précision moyenne" unite=" %" max={100} points={pts((m) => m.precision)} />
        </div>
      )}
      <table className="patients-table history-table stats-jours">
        <thead>
          <tr>
            <th>Jour</th>
            <th className="num">Parties</th>
            <th className="num">Frappes/min</th>
            <th className="num">Précision</th>
          </tr>
        </thead>
        <tbody>
          {[...jours].reverse().map((m) => (
            <tr key={m.jour}>
              <td>{long(m.jour)}</td>
              <td className="num">{m.parties}</td>
              <td className="num">{m.vitesse}</td>
              <td className="num">{m.precision} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatsCouleurs({ parties, onSupprimer }: { parties: ResultatCouleurs[]; onSupprimer: (r: Resultat) => void }) {
  const derniere = parties[parties.length - 1]
  const reussite = (r: ResultatCouleurs) => pourcentage(r.justes, r.manches)
  const piegesTotal = parties.reduce((t, r) => t + r.pieges, 0)
  const piegesJustes = parties.reduce((t, r) => t + r.piegesJustes, 0)
  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${parties.reduce((t, r) => t + r.manches, 0)} manches au total`} />
        <Tile valeur={`${reussite(derniere)} %`} label="de réussite" detail={`dernière partie (${MODES_COULEURS_LABELS[derniere.mode].toLowerCase()})`} />
        <Tile valeur={`${pourcentage(piegesJustes, piegesTotal)} %`} label="de pièges déjoués" detail="sur toutes les parties" />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Réussite" unite=" %" max={100} points={points(parties, reussite, (r) => MODES_COULEURS_LABELS[r.mode])} />
          </div>
          <div className="card">
            <LineChart
              titre="Temps moyen de réponse (secondes)"
              points={points(parties, (r) => Math.round(r.dureeMs / Math.max(1, r.manches) / 100) / 10, (r) => MODES_COULEURS_LABELS[r.mode])}
            />
          </div>
        </div>
      )}
      <Historique parties={parties} colonnes={COLONNES_COULEURS} onSupprimer={onSupprimer} />
    </>
  )
}

function StatsMemoire({ parties, onSupprimer }: { parties: ResultatMemoire[]; onSupprimer: (r: Resultat) => void }) {
  const derniere = parties[parties.length - 1]
  const meilleur = Math.max(...parties.map((r) => r.trouves))
  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${parties.reduce((t, r) => t + r.trouves, 0)} mots retrouvés au total`} />
        <Tile valeur={`${derniere.trouves} / ${derniere.mots}`} label="mots retrouvés" detail="dernière partie" />
        <Tile valeur={String(meilleur)} label="mots retrouvés au mieux" detail="en une partie" />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Mots retrouvés" points={points(parties, (r) => r.trouves, (r) => `${r.mots} mots à retenir`)} min={0} />
          </div>
          <div className="card">
            <LineChart titre="Réussite" unite=" %" max={100} points={points(parties, (r) => pourcentage(r.trouves, r.mots), (r) => r.listeNom)} />
          </div>
        </div>
      )}
      <Historique parties={parties} colonnes={COLONNES_MEMOIRE} onSupprimer={onSupprimer} />
    </>
  )
}

function StatsEspace({ parties, onSupprimer }: { parties: ResultatEspace[]; onSupprimer: (r: Resultat) => void }) {
  const derniere = parties[parties.length - 1]
  const recentes = parties.slice(-NB_PARTIES_CARTE)
  const meilleur = Math.max(...parties.map((r) => cadence(r.detruites, r.dureeMs)))
  return (
    <>
      <div className="stats-tiles">
        <Tile
          valeur={String(parties.length)}
          label={parties.length > 1 ? 'parties jouées' : 'partie jouée'}
          detail={`${parties.reduce((t, r) => t + r.detruites, 0)} lettres attrapées au total`}
        />
        <Tile valeur={String(cadence(derniere.detruites, derniere.dureeMs))} label="lettres attrapées/min" detail={`dernière partie · record ${meilleur}`} />
        <Tile valeur={`${tirsReussis(derniere)} %`} label="de lettres justes" detail={`dernière partie · ${derniere.manquees} tombées`} />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Lettres attrapées par minute" points={points(parties, (r) => cadence(r.detruites, r.dureeMs), (r) => `${NOMS_AVENTURES[r.theme]} · ${r.serieNom}`)} />
          </div>
          <div className="card">
            <LineChart titre="Lettres justes" unite=" %" max={100} points={points(parties, tirsReussis, (r) => `${NOMS_AVENTURES[r.theme]} · ${r.serieNom}`)} />
          </div>
        </div>
      )}
      <CarteErreurs
        titre="Lettres ratées"
        sousTitre={recentes.length < parties.length ? `${recentes.length} dernières parties` : 'toutes les parties'}
        erreurs={cumulerCompteurs(recentes.map((r) => r.lettresRatees))}
        legende="Lettres le plus souvent tombées ou manquées"
      />
      <Historique parties={parties} colonnes={COLONNES_ESPACE} onSupprimer={onSupprimer} />
    </>
  )
}

function StatsQuiz({
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

// Pourquoi une réponse n'a pas compté (rien pour une case vide).
function raisonRefus(x: ReponseBac, lettre: string): string {
  const etat = etatReponse(x.mot, lettre)
  return etat === 'vide' ? '' : etat === 'ok' ? 'Refusé' : etat === 'court' ? 'Trop court' : 'Autre lettre'
}

function StatsPetitBac({ parties, onSupprimer }: { parties: ResultatPetitBac[]; onSupprimer: (r: Resultat) => void }) {
  const derniere = parties[parties.length - 1]
  const reussite = (r: ResultatPetitBac) => pourcentage(r.justes, r.categories)
  const totalCategories = parties.reduce((t, r) => t + r.categories, 0)
  const totalJustes = parties.reduce((t, r) => t + r.justes, 0)
  const lettre = (r: ResultatPetitBac) => `lettre ${r.lettre}`
  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${totalJustes} mot${totalJustes > 1 ? 's' : ''} accepté${totalJustes > 1 ? 's' : ''} au total`} />
        <Tile valeur={`${derniere.justes} / ${derniere.categories}`} label="mots acceptés" detail={`dernière partie (${lettre(derniere)})`} />
        <Tile valeur={`${pourcentage(totalJustes, totalCategories)} %`} label="de réussite en tout" detail="sur toutes les parties" />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Réussite" unite=" %" max={100} points={points(parties, reussite, lettre)} />
          </div>
          <div className="card">
            <LineChart
              titre="Temps moyen par catégorie (secondes)"
              points={points(parties, (r) => Math.round(r.dureeMs / Math.max(1, r.categories) / 100) / 10, lettre)}
            />
          </div>
        </div>
      )}
      <div className="card">
        <h2 className="card-title">
          Dernières grilles <span className="card-title-sub">(mots tels que l’enfant les a tapés)</span>
        </h2>
        <div className="bac-stats-grilles">
          {parties
            .slice(-NB_GRILLES)
            .reverse()
            .map((r) => (
              <div key={r.id} className="bac-stats-grille">
                <div className="bac-stats-tete">
                  <span className="bac-stats-lettre">{r.lettre}</span>
                  <span>
                    <strong>
                      {r.justes} / {r.categories}
                    </strong>{' '}
                    <span className="muted">· {dateLongue(r.date)}</span>
                  </span>
                </div>
                <table className="bac-stats-table">
                  <tbody>
                    {r.reponses.map((x, i) => (
                      <tr key={i} className={x.mot && !x.valide ? 'refuse' : undefined}>
                        <td className="muted">{x.categorie}</td>
                        <td>
                          <strong>{x.mot || '—'}</strong>
                        </td>
                        <td className="bac-stats-etat">
                          {x.valide ? <IconCheck size={16} /> : raisonRefus(x, r.lettre)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
      <Historique parties={parties} colonnes={COLONNES_PETITBAC} onSupprimer={onSupprimer} />
    </>
  )
}

function cumulerCompteurs(liste: Record<string, number>[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const c of liste) for (const [k, n] of Object.entries(c)) out[k] = (out[k] ?? 0) + n
  return out
}

// Clavier coloré selon le nombre d'erreurs par touche.
function CarteErreurs({
  titre,
  sousTitre,
  erreurs,
  legende
}: {
  titre: string
  sousTitre: string
  erreurs: Record<string, number>
  legende: string
}) {
  const chaleur: Record<string, number> = {}
  for (const [c, n] of Object.entries(erreurs)) {
    const id = toucheDe(c)
    if (id) chaleur[id] = (chaleur[id] ?? 0) + n
  }
  const pires = Object.entries(erreurs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxChaleur = Math.max(0, ...Object.values(chaleur))
  return (
    <div className="card">
      <h2 className="card-title">
        {titre} <span className="card-title-sub">({sousTitre})</span>
      </h2>
      {pires.length === 0 ? (
        <p className="ergo-help">Aucune erreur, bravo !</p>
      ) : (
        <>
          <div className="stats-kb">
            <Keyboard chaleur={chaleur} />
          </div>
          <div className="heat-legend">
            <span>Moins</span>
            {[0.15, 0.35, 0.55, 0.75, 1].map((t) => (
              <span key={t} className="heat-swatch" style={{ background: couleurChaleur(t * maxChaleur, maxChaleur) }} />
            ))}
            <span>Plus d’erreurs</span>
          </div>
          <p className="stats-pires">
            {legende} :{' '}
            {pires.map(([c, n]) => (
              <span key={c} className="stats-pire">
                <kbd>{c === ' ' ? 'Espace' : c}</kbd> {n}
              </span>
            ))}
          </p>
        </>
      )}
    </div>
  )
}

function Historique<R extends Resultat>({
  parties,
  colonnes,
  onSupprimer
}: {
  parties: R[]
  colonnes: Colonne<R>[]
  onSupprimer: (r: Resultat) => void
}) {
  const visibles = colonnes.filter((c) => !c.exportSeul)
  return (
    <div className="card">
      <h2 className="card-title">Historique</h2>
      <table className="patients-table history-table">
        <thead>
          <tr>
            <th>Date</th>
            {visibles.map((c) => (
              <th key={c.titre} className={c.num ? 'num' : undefined}>
                {c.titre}
              </th>
            ))}
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {[...parties].reverse().map((r) => (
            <tr key={r.id}>
              <td>{dateLongue(r.date)}</td>
              {visibles.map((c) => (
                <td key={c.titre} className={c.num ? 'num' : undefined}>
                  {c.valeur(r)}
                </td>
              ))}
              <td className="row-actions">
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  aria-label="Supprimer cette partie"
                  title="Supprimer cette partie"
                  onClick={() => onSupprimer(r)}
                >
                  <IconTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ecart(n: number, unite = ''): string {
  return `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n)}${unite}`
}

function Tile({ valeur, label, detail }: { valeur: string; label: string; detail: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-value">{valeur}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-detail">{detail}</span>
    </div>
  )
}
