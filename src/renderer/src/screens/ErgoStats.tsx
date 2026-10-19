import { useState } from 'react'
import type { JeuId, Profile, QuestionPerso, Resultat } from '../../../shared/data'
import { api } from '../api'
import { Avatar } from '../avatar/Avatar'
import { ConfirmDialog } from '../components/Modal'
import { IconBack, IconDownload } from '../components/Icons'
import { JEUX, nomJeu, ORDRE_JEUX } from '../games/jeux'
import { Bilan } from './stats/Bilan'
import { dateLongue } from './stats/commun'
import { csvComplet, csvDuJeu, StatsDuJeu } from './stats/parJeu'

export { resumePartie } from './stats/parJeu'

// Noms des jeux, dans les tableaux de l'espace ergothérapeute.
export const NOMS_JEUX: Record<JeuId, string> = Object.fromEntries(ORDRE_JEUX.map((j) => [j, JEUX[j].titre])) as Record<JeuId, string>

interface Props {
  profile: Profile
  resultats: Resultat[]
  questionsPerso: QuestionPerso[]
  onSupprimer: (id: string) => void
  onRetour: () => void
}

export function ErgoStats({ profile, resultats, questionsPerso, onSupprimer, onRetour }: Props) {
  const [aSupprimer, setASupprimer] = useState<Resultat | null>(null)
  const [bilan, setBilan] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const siens = resultats.filter((r) => r.profileId === profile.id).sort((a, b) => a.date.localeCompare(b.date))
  const nombre = (j: JeuId) => siens.filter((r) => r.jeu === j).length
  // Onglet de départ : le jeu de la dernière partie.
  const [jeu, setJeu] = useState<JeuId>(siens[siens.length - 1]?.jeu ?? ORDRE_JEUX[0])

  const enregistrer = async (nomFichier: string, csv: string) => {
    const res = await api.exportCsv(nomFichier, csv).catch(() => null)
    if (res === 'ok') setMessage({ ok: true, text: 'Tableau enregistré.' })
    else if (res === null) setMessage({ ok: false, text: 'Le tableau n’a pas pu être enregistré (est-il ouvert dans Excel ?).' })
  }

  if (bilan) return <Bilan profile={profile} resultats={siens} onRetour={() => setBilan(false)} />

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
        {siens.length > 0 && (
          <div className="stats-export">
            <button className="btn btn-soft" onClick={() => setBilan(true)}>
              Bilan imprimable
            </button>
            <button className="btn btn-ghost" onClick={() => void enregistrer(`DefilOrdi-${profile.prenom}-tout.csv`, csvComplet(profile, siens))}>
              <IconDownload /> Tout exporter (Excel)
            </button>
            {nombre(jeu) > 0 && (
              <button
                className="btn btn-ghost"
                onClick={() => void enregistrer(`DefilOrdi-${profile.prenom}-${jeu}.csv`, csvDuJeu(jeu, siens, profile))}
              >
                <IconDownload /> Exporter ce jeu
              </button>
            )}
          </div>
        )}
      </div>
      {message && <p className={message.ok ? 'success' : 'error'}>{message.text}</p>}

      <div className="tabs stats-tabs" role="tablist">
        {ORDRE_JEUX.map((j) => (
          <button key={j} role="tab" aria-selected={j === jeu} className={j === jeu ? 'tab active' : 'tab'} onClick={() => setJeu(j)}>
            {nomJeu(j)} ({nombre(j)})
          </button>
        ))}
      </div>

      {nombre(jeu) === 0 ? (
        <p className="empty">
          {profile.prenom} n’a pas encore joué à {nomJeu(jeu)}.
        </p>
      ) : (
        <StatsDuJeu jeu={jeu} resultats={siens} profile={profile} questionsPerso={questionsPerso} onSupprimer={setASupprimer} />
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
