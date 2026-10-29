import type { Profile, Resultat, ResultatKlavicoeur } from '../../../../shared/data'
import { LineChart } from '../../components/LineChart'
import { formatDuree } from '../../games/dactylo/engine'
import { descriptionNiveau, formatLimite, lettresHesitees } from '../../games/klavicoeur/engine'
import { CarteErreurs, type Colonne, cumulerCompteurs, Historique, type Indicateur, NB_PARTIES_CARTE, points, Tile } from './commun'

function issue(r: ResultatKlavicoeur): string {
  if (r.reussi) return 'Réussi'
  if (r.tempsDepasse) return 'Temps dépassé'
  return r.complete ? 'Non réussi' : 'Arrêtée'
}

export const COLONNES_KLAVICOEUR: Colonne<ResultatKlavicoeur>[] = [
  { titre: 'Niveau', valeur: (r) => r.niveau, num: true },
  { titre: 'Rangées', valeur: (r) => descriptionNiveau(r.niveau) },
  { titre: 'Temps', valeur: (r) => formatDuree(r.dureeMs), num: true },
  { titre: 'Limite', valeur: (r) => formatLimite(r.tempsLimite) },
  { titre: 'Lettres placées', valeur: (r) => `${r.placees} / ${r.lettres}`, num: true },
  { titre: 'Hésitations', valeur: (r) => r.hesitations, num: true },
  {
    titre: 'Lettres hésitées',
    valeur: (r) =>
      lettresHesitees(r.hesitationsParLettre)
        .map(([l, n]) => (n > 1 ? `${l} (${n})` : l))
        .join(' ')
  },
  { titre: 'Résultat', valeur: issue },
  { titre: 'Niveau suivant', valeur: (r) => (r.niveauSuivant > 0 ? r.niveauSuivant : '—'), num: true }
]

export function StatsKlavicoeur({
  parties,
  profile,
  onSupprimer
}: {
  parties: ResultatKlavicoeur[]
  profile: Profile
  onSupprimer: (r: Resultat) => void
}) {
  const derniere = parties[parties.length - 1]
  const recentes = parties.slice(-NB_PARTIES_CARTE)
  const prog = profile.klavicoeur
  const reussis = new Set(parties.filter((r) => r.reussi).map((r) => r.niveau))
  const detail = (r: ResultatKlavicoeur) => `Niveau ${r.niveau} · ${issue(r).toLowerCase()}`
  return (
    <>
      <div className="stats-tiles">
        <Tile
          valeur={`Niveau ${prog.niveau}`}
          label="niveau proposé"
          detail={`${prog.debloque} niveau${prog.debloque > 1 ? 'x' : ''} débloqué${prog.debloque > 1 ? 's' : ''} sur 11${prog.echecs > 0 ? ' · 1 temps dépassé à ce niveau' : ''}`}
        />
        <Tile
          valeur={formatDuree(derniere.dureeMs)}
          label="dernière partie"
          detail={`${detail(derniere)} · ${derniere.hesitations} hésitation${derniere.hesitations > 1 ? 's' : ''}`}
        />
        <Tile
          valeur={String(parties.length)}
          label={parties.length > 1 ? 'parties jouées' : 'partie jouée'}
          detail={`${reussis.size} niveau${reussis.size > 1 ? 'x' : ''} réussi${reussis.size > 1 ? 's' : ''}`}
        />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Temps (secondes)" points={points(parties, (r) => Math.round(r.dureeMs / 1000), detail)} min={0} />
          </div>
          <div className="card">
            <LineChart titre="Hésitations" points={points(parties, (r) => r.hesitations, detail)} min={0} />
          </div>
          <div className="card">
            <LineChart titre="Niveau" points={points(parties, (r) => r.niveau, detail)} min={1} max={11} />
          </div>
        </div>
      )}
      <CarteErreurs
        titre="Lettres hésitées"
        sousTitre={recentes.length < parties.length ? `${recentes.length} dernières parties` : 'toutes les parties'}
        erreurs={cumulerCompteurs(recentes.map((r) => r.hesitationsParLettre))}
        legende="Lettres le plus souvent mises de côté"
      />
      <Historique parties={parties} colonnes={COLONNES_KLAVICOEUR} onSupprimer={onSupprimer} />
    </>
  )
}

export const INDICATEURS_KLAVICOEUR: Indicateur<ResultatKlavicoeur>[] = [
  { nom: 'Temps', unite: 's', valeur: (r) => r.dureeMs / 1000, plusPetitMieux: true },
  { nom: 'Hésitations', unite: 'lettres mises de côté', valeur: (r) => r.hesitations, plusPetitMieux: true }
]

// Bilan : on compare les parties d'un même niveau (rangées et limite de temps) ;
// le niveau figure dans le nom du groupe.
export const GROUPE_KLAVICOEUR = (r: ResultatKlavicoeur) => `Niveau ${r.niveau} · ${descriptionNiveau(r.niveau)}`
