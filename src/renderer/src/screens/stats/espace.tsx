import type { Resultat, ResultatEspace } from '../../../../shared/data'
import { LineChart } from '../../components/LineChart'
import { pourcentage } from '../../games/commun'
import { formatDuree } from '../../games/dactylo/engine'
import { cadence, mesureRecord, NOMS_MODES } from '../../games/espace/engine'
import { CarteErreurs, type Colonne, cumulerCompteurs, Historique, type Indicateur, NB_PARTIES_CARTE, points, Tile } from './commun'

export const tirsReussis = (r: ResultatEspace) => pourcentage(r.detruites, r.detruites + r.erreurs)

export const NOMS_AVENTURES: Record<ResultatEspace['theme'], string> = { espace: 'Fusée', western: 'Cow-boy', ocean: 'Sous-marin' }

export const COLONNES_ESPACE: Colonne<ResultatEspace>[] = [
  { titre: 'Aventure', valeur: (r) => NOMS_AVENTURES[r.theme] },
  { titre: 'Mode', valeur: (r) => NOMS_MODES[r.mode] },
  { titre: 'Lettres', valeur: (r) => r.serieNom },
  { titre: 'Durée', valeur: (r) => formatDuree(r.dureeMs), num: true },
  { titre: 'Attrapées', valeur: (r) => r.detruites, num: true },
  { titre: 'Par minute', valeur: (r) => cadence(r.detruites, r.dureeMs), num: true },
  { titre: 'Lettres justes', valeur: (r) => `${tirsReussis(r)} %`, num: true },
  { titre: 'Tombées', valeur: (r) => r.manquees, num: true },
  { titre: 'Pièges tapés', valeur: (r) => (r.mode === 'pieges' ? r.pieges : ''), num: true },
  { titre: 'Cadeaux', valeur: (r) => (r.mode === 'pieges' ? r.cadeaux : ''), num: true },
  { titre: 'Palier', valeur: (r) => (r.mode === 'chrono' ? '' : r.palier + 1), num: true }
]

export function StatsEspace({ parties, onSupprimer }: { parties: ResultatEspace[]; onSupprimer: (r: Resultat) => void }) {
  const derniere = parties[parties.length - 1]
  const recentes = parties.slice(-NB_PARTIES_CARTE)
  // Records séparés par mode : en chrono, lettres par minute ; sinon lettres attrapées.
  const meilleur = Math.max(...parties.filter((r) => r.mode === derniere.mode).map((r) => mesureRecord(r.mode, r.detruites, r.dureeMs)))
  return (
    <>
      <div className="stats-tiles">
        <Tile
          valeur={String(parties.length)}
          label={parties.length > 1 ? 'parties jouées' : 'partie jouée'}
          detail={`${parties.reduce((t, r) => t + r.detruites, 0)} lettres attrapées au total`}
        />
        <Tile
          valeur={String(derniere.mode === 'chrono' ? cadence(derniere.detruites, derniere.dureeMs) : derniere.detruites)}
          label={derniere.mode === 'chrono' ? 'lettres attrapées/min' : 'lettres attrapées'}
          detail={`dernière partie (${NOMS_MODES[derniere.mode]}) · record ${meilleur}`}
        />
        <Tile valeur={`${tirsReussis(derniere)} %`} label="de lettres justes" detail={`dernière partie · ${derniere.manquees} tombées`} />
      </div>
      {parties.length > 1 && (
        <div className="stats-charts">
          <div className="card">
            <LineChart titre="Lettres attrapées par minute" points={points(parties, (r) => cadence(r.detruites, r.dureeMs), (r) => `${NOMS_AVENTURES[r.theme]} · ${NOMS_MODES[r.mode]} · ${r.serieNom}`)} />
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

export const INDICATEURS_ESPACE: Indicateur<ResultatEspace>[] = [
  { nom: 'Lettres attrapées par minute', unite: '/min', valeur: (r) => cadence(r.detruites, r.dureeMs) },
  { nom: 'Lettres justes', unite: '%', valeur: tirsReussis }
]
