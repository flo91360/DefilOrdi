import { useState } from 'react'
import type { Profile, ResultatDactylo } from '../../../shared/data'
import { api } from '../api'
import { Avatar } from '../avatar/Avatar'
import { LineChart } from '../components/LineChart'
import { ConfirmDialog } from '../components/Modal'
import { IconBack, IconDownload, IconTrash } from '../components/Icons'
import { formatDuree, motsParMinute, precision, vitesse } from '../games/dactylo/engine'
import { toucheDe } from '../keyboard/azerty'
import { couleurChaleur, Keyboard } from '../keyboard/Keyboard'

const NB_PARTIES_CARTE = 10

interface Props {
  profile: Profile
  resultats: ResultatDactylo[]
  onSupprimer: (id: string) => void
  onRetour: () => void
}

const dateCourte = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
const dateLongue = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function ErgoStats({ profile, resultats, onSupprimer, onRetour }: Props) {
  const [aSupprimer, setASupprimer] = useState<ResultatDactylo | null>(null)
  const parties = resultats
    .filter((r) => r.profileId === profile.id)
    .sort((a, b) => a.date.localeCompare(b.date))

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

  const exporter = () => {
    const lignes = [
      ['Date', 'Liste', 'Phrases', 'Durée (s)', 'Frappes', 'Erreurs', 'Frappes justes/min', 'Mots/min', 'Précision (%)'],
      ...parties.map((r) => [
        dateLongue(r.date),
        r.listeNom,
        r.phrases,
        Math.round(r.dureeMs / 1000),
        r.frappes,
        r.erreurs,
        vitesse(r),
        motsParMinute(r),
        precision(r)
      ])
    ]
    const csv = lignes.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    void api.exportCsv(`DefilOrdi-${profile.prenom}-dactylo.csv`, csv)
  }

  return (
    <section className="stats">
      <button className="btn btn-ghost btn-sm" onClick={onRetour}>
        <IconBack size={18} /> Patients
      </button>
      <div className="stats-head">
        <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={64} zoom />
        <div>
          <h1 className="ergo-title">{profile.prenom}</h1>
          <p className="stats-sub">Dactylo · niveau {profile.niveau}</p>
        </div>
        {parties.length > 0 && (
          <button className="btn btn-ghost stats-export" onClick={exporter}>
            <IconDownload /> Exporter (Excel)
          </button>
        )}
      </div>

      {parties.length === 0 ? (
        <p className="empty">{profile.prenom} n’a pas encore joué à Dactylo.</p>
      ) : (
        <>
          <div className="stats-tiles">
            <Tile valeur={String(parties.length)} label="parties jouées" detail={`${formatDuree(tempsTotal)} de frappe au total`} />
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
                <LineChart
                  titre="Vitesse (frappes justes par minute)"
                  points={parties.map((r) => ({ label: `${dateLongue(r.date)} · ${r.listeNom}`, axe: dateCourte(r.date), y: vitesse(r) }))}
                />
              </div>
              <div className="card">
                <LineChart
                  titre="Précision"
                  unite=" %"
                  max={100}
                  points={parties.map((r) => ({ label: `${dateLongue(r.date)} · ${r.listeNom}`, axe: dateCourte(r.date), y: precision(r) }))}
                />
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

          <div className="card">
            <h2 className="card-title">Historique</h2>
            <table className="patients-table history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Liste</th>
                  <th className="num">Phrases</th>
                  <th className="num">Temps</th>
                  <th className="num">Frappes/min</th>
                  <th className="num">Mots/min</th>
                  <th className="num">Précision</th>
                  <th className="num">Erreurs</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {[...parties].reverse().map((r) => (
                  <tr key={r.id}>
                    <td>{dateLongue(r.date)}</td>
                    <td>{r.listeNom}</td>
                    <td className="num">{r.phrases}</td>
                    <td className="num">{formatDuree(r.dureeMs)}</td>
                    <td className="num">{vitesse(r)}</td>
                    <td className="num">{motsParMinute(r)}</td>
                    <td className="num">{precision(r)} %</td>
                    <td className="num">{r.erreurs}</td>
                    <td className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" aria-label="Supprimer cette partie" title="Supprimer cette partie" onClick={() => setASupprimer(r)}>
                        <IconTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
