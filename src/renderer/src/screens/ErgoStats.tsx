import { useState } from 'react'
import type { JeuId, Profile, Resultat, ResultatCouleurs, ResultatDactylo, ResultatMemoire } from '../../../shared/data'
import { api } from '../api'
import { Avatar } from '../avatar/Avatar'
import { LineChart, type Point } from '../components/LineChart'
import { ConfirmDialog } from '../components/Modal'
import { IconBack, IconDownload, IconTrash } from '../components/Icons'
import { pourcentage } from '../games/commun'
import { formatDuree, motsParMinute, precision, vitesse } from '../games/dactylo/engine'
import { toucheDe } from '../keyboard/azerty'
import { couleurChaleur, Keyboard } from '../keyboard/Keyboard'

const NB_PARTIES_CARTE = 10

export const NOMS_JEUX: Record<JeuId, string> = {
  dactylo: 'Dactylo',
  couleurs: 'Couleurs piégées',
  memoire: 'Mots à retenir'
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
  return `${r.trouves}/${r.mots} mots`
}

const dateCourte = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
const dateLongue = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

interface Colonne<R> {
  titre: string
  valeur: (r: R) => string | number
  num?: boolean
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

function secondes(ms: number): string {
  return (ms / 1000).toFixed(1).replace('.', ',')
}

interface Props {
  profile: Profile
  resultats: Resultat[]
  onSupprimer: (id: string) => void
  onRetour: () => void
}

export function ErgoStats({ profile, resultats, onSupprimer, onRetour }: Props) {
  const [aSupprimer, setASupprimer] = useState<Resultat | null>(null)
  const siens = resultats.filter((r) => r.profileId === profile.id).sort((a, b) => a.date.localeCompare(b.date))
  const parJeu = {
    dactylo: siens.filter((r): r is ResultatDactylo => r.jeu === 'dactylo'),
    couleurs: siens.filter((r): r is ResultatCouleurs => r.jeu === 'couleurs'),
    memoire: siens.filter((r): r is ResultatMemoire => r.jeu === 'memoire')
  }
  // Onglet de départ : le jeu de la dernière partie.
  const [jeu, setJeu] = useState<JeuId>(siens[siens.length - 1]?.jeu ?? 'dactylo')

  const exporter = () => {
    const csv =
      jeu === 'dactylo'
        ? versCsv(parJeu.dactylo, COLONNES_DACTYLO)
        : jeu === 'couleurs'
          ? versCsv(parJeu.couleurs, COLONNES_COULEURS)
          : versCsv(parJeu.memoire, COLONNES_MEMOIRE)
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
          <p className="stats-sub">Niveau {profile.niveau}</p>
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
      ) : (
        <StatsMemoire parties={parJeu.memoire} onSupprimer={supprimer} />
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
  const erreursCaracteres: Record<string, number> = {}
  for (const r of recentes) {
    for (const [c, n] of Object.entries(r.erreursParTouche)) erreursCaracteres[c] = (erreursCaracteres[c] ?? 0) + n
  }
  const chaleur: Record<string, number> = {}
  for (const [c, n] of Object.entries(erreursCaracteres)) {
    const id = toucheDe(c)
    if (id) chaleur[id] = (chaleur[id] ?? 0) + n
  }
  const pires = Object.entries(erreursCaracteres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxChaleur = Math.max(0, ...Object.values(chaleur))

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

      <div className="card">
        <h2 className="card-title">
          Erreurs par touche{' '}
          <span className="card-title-sub">
            ({recentes.length < parties.length ? `${recentes.length} dernières parties` : 'toutes les parties'})
          </span>
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
              Caractères les plus souvent manqués :{' '}
              {pires.map(([c, n]) => (
                <span key={c} className="stats-pire">
                  <kbd>{c === ' ' ? 'Espace' : c}</kbd> {n}
                </span>
              ))}
            </p>
          </>
        )}
      </div>

      <Historique parties={parties} colonnes={COLONNES_DACTYLO} onSupprimer={onSupprimer} />
    </>
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

function Historique<R extends Resultat>({
  parties,
  colonnes,
  onSupprimer
}: {
  parties: R[]
  colonnes: Colonne<R>[]
  onSupprimer: (r: Resultat) => void
}) {
  return (
    <div className="card">
      <h2 className="card-title">Historique</h2>
      <table className="patients-table history-table">
        <thead>
          <tr>
            <th>Date</th>
            {colonnes.map((c) => (
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
              {colonnes.map((c) => (
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
