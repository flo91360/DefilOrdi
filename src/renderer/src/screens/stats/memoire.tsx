import type { Profile, Resultat, ResultatMemoire } from '../../../../shared/data'
import { PALIER_PHRASE } from '../../../../shared/data'
import { LineChart } from '../../components/LineChart'
import { pourcentage } from '../../games/commun'
import { formatDuree } from '../../games/dactylo/engine'
import { type Colonne, dateLongue, Historique, type Indicateur, points, Tile } from './commun'

// Mots à retenir : 3 à 7 mots, ou « Phrase » (PALIER_PHRASE).
export function nomPalier(palier: number): string {
  return palier === PALIER_PHRASE ? 'Phrase' : palier > 0 ? `${palier} mots` : '—'
}

// Une progression de Mots à retenir : de « Nouveau départ » jusqu'au suivant.
// Les progressions remplacées restent visibles (elles ne sont jamais effacées).
export interface ProgressionResume {
  id: string
  numero: number // P1, P2… dans l'ordre chronologique
  enCours: boolean // celle mémorisée dans le profil (« Reprendre ma partie »)
  parties: ResultatMemoire[]
  depart: number
  plusHaut: number
  actuel: number // palier de la prochaine partie
  reussies: number
}

export function resumerProgressions(parties: ResultatMemoire[], profile: Profile): ProgressionResume[] {
  const groupes = new Map<string, ResultatMemoire[]>()
  for (const r of [...parties].sort((a, b) => a.date.localeCompare(b.date))) {
    if (r.progressionId === '') continue
    groupes.set(r.progressionId, [...(groupes.get(r.progressionId) ?? []), r])
  }
  return [...groupes.entries()].map(([id, ps], i) => {
    const enCours = id === profile.memoire.progressionId
    const derniere = ps[ps.length - 1]
    return {
      id,
      numero: i + 1,
      enCours,
      parties: ps,
      depart: ps[0].palier,
      plusHaut: Math.max(...ps.map((r) => r.palier)),
      actuel: enCours ? profile.memoire.palier : derniere.palierSuivant || derniere.palier,
      reussies: ps.filter((r) => r.reussie).length
    }
  })
}

function nomProgression(r: ResultatMemoire, progressions: ProgressionResume[]): string {
  const p = progressions.find((x) => x.id === r.progressionId)
  return p ? `P${p.numero} (${p.enCours ? 'en cours' : 'remplacée'})` : '—'
}

export function colonnesMemoire(progressions: ProgressionResume[]): Colonne<ResultatMemoire>[] {
  return [
    { titre: 'Progression', valeur: (r) => nomProgression(r, progressions) },
    { titre: 'Palier', valeur: (r) => nomPalier(r.palier) },
    { titre: 'Liste', valeur: (r) => r.listeNom },
    { titre: 'Trouvés', valeur: (r) => `${r.trouves} / ${r.mots}`, num: true },
    { titre: 'Réussie', valeur: (r) => (r.reussie ? 'Oui' : 'Non') },
    { titre: 'Réussite', valeur: (r) => `${pourcentage(r.trouves, r.mots)} %`, num: true },
    { titre: 'Mots en trop', valeur: (r) => r.erreurs, num: true },
    { titre: 'Temps', valeur: (r) => formatDuree(r.dureeMs), num: true },
    { titre: 'Palier suivant', valeur: (r) => nomPalier(r.palierSuivant) },
    { titre: 'Phrase', valeur: (r) => r.phrase, exportSeul: true }
  ]
}

export function StatsMemoire({
  parties,
  profile,
  onSupprimer
}: {
  parties: ResultatMemoire[]
  profile: Profile
  onSupprimer: (r: Resultat) => void
}) {
  const derniere = parties[parties.length - 1]
  const meilleur = Math.max(...parties.map((r) => r.trouves))
  const progressions = resumerProgressions(parties, profile)
  const memo = profile.memoire
  return (
    <>
      <div className="stats-tiles">
        <Tile valeur={String(parties.length)} label={parties.length > 1 ? 'parties jouées' : 'partie jouée'} detail={`${parties.reduce((t, r) => t + r.trouves, 0)} mots retrouvés au total`} />
        <Tile valeur={`${derniere.trouves} / ${derniere.mots}`} label="mots retrouvés" detail="dernière partie" />
        {memo.progressionId !== '' ? (
          <Tile
            valeur={nomPalier(memo.palier)}
            label="palier mémorisé"
            detail={`${memo.reussites} réussite${memo.reussites > 1 ? 's' : ''} · ${memo.echecs} échec${memo.echecs > 1 ? 's' : ''} à la suite`}
          />
        ) : (
          <Tile valeur={String(meilleur)} label="mots retrouvés au mieux" detail="en une partie" />
        )}
      </div>
      {progressions.length > 0 && (
        <div className="card">
          <h2 className="card-title">
            Progressions <span className="card-title-sub">(un nouveau départ remplace la progression mémorisée ; les précédentes restent ici)</span>
          </h2>
          <table className="patients-table history-table">
            <thead>
              <tr>
                <th>Progression</th>
                <th>Début</th>
                <th>Dernière partie</th>
                <th>Départ</th>
                <th>Plus haut</th>
                <th>Palier actuel</th>
                <th className="num">Parties</th>
                <th className="num">Réussies</th>
              </tr>
            </thead>
            <tbody>
              {[...progressions].reverse().map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>P{p.numero}</strong> <span className="muted">{p.enCours ? '· en cours' : '· remplacée'}</span>
                  </td>
                  <td>{dateLongue(p.parties[0].date)}</td>
                  <td>{dateLongue(p.parties[p.parties.length - 1].date)}</td>
                  <td>{nomPalier(p.depart)}</td>
                  <td>{nomPalier(p.plusHaut)}</td>
                  <td>{nomPalier(p.actuel)}</td>
                  <td className="num">{p.parties.length}</td>
                  <td className="num">
                    {p.reussies} / {p.parties.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      <Historique parties={parties} colonnes={colonnesMemoire(progressions)} onSupprimer={onSupprimer} />
    </>
  )
}

export const INDICATEURS_MEMOIRE: Indicateur<ResultatMemoire>[] = [
  { nom: 'Mots retrouvés', unite: 'mots', valeur: (r) => r.trouves },
  { nom: 'Réussite', unite: '%', valeur: (r) => pourcentage(r.trouves, r.mots) }
]
