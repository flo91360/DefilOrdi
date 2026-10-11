import { useState } from 'react'
import { type AppData, isValidCode, NIVEAUX, type Profile } from '../../../shared/data'
import { api, isDesktop } from '../api'
import { Avatar } from '../avatar/Avatar'
import { ConfirmDialog } from '../components/Modal'
import { FullscreenButton } from '../components/FullscreenButton'
import { IconBack, IconDownload, IconFolder, IconPencil, IconSpeaker, IconTrash, IconUpload } from '../components/Icons'
import { playSound } from '../sounds'
import { Logo } from './ProfilePicker'

export const NIVEAU_LABELS: Record<number, string> = {
  1: '1 – Débutant',
  2: '2 – Intermédiaire',
  3: '3 – Avancé',
  4: '4 – Expert'
}

type Section = 'patients' | 'reglages' | 'sauvegarde'

interface Props {
  data: AppData
  onChange: (d: AppData) => void
  onEditProfile: (p: Profile) => void
  onExit: () => void
}

export function ErgoSpace({ data, onChange, onEditProfile, onExit }: Props) {
  const [section, setSection] = useState<Section>('patients')

  return (
    <div className="screen ergo">
      <header className="topbar">
        <Logo />
        <span className="ergo-badge">Espace ergothérapeute</span>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={onExit}>
            <IconBack /> Retour aux joueurs
          </button>
          <FullscreenButton />
        </div>
      </header>

      <div className="ergo-layout">
        <nav className="ergo-nav" aria-label="Sections">
          {(
            [
              ['patients', 'Patients'],
              ['reglages', 'Réglages'],
              ['sauvegarde', 'Sauvegarde']
            ] as const
          ).map(([id, label]) => (
            <button key={id} className={section === id ? 'ergo-nav-item active' : 'ergo-nav-item'} onClick={() => setSection(id)}>
              {label}
            </button>
          ))}
          <p className="ergo-version">Version {__APP_VERSION__}</p>
        </nav>

        <main className="ergo-main">
          {section === 'patients' && <Patients data={data} onChange={onChange} onEditProfile={onEditProfile} />}
          {section === 'reglages' && <Reglages data={data} onChange={onChange} />}
          {section === 'sauvegarde' && <Sauvegarde data={data} onChange={onChange} />}
        </main>
      </div>
    </div>
  )
}

function Patients({ data, onChange, onEditProfile }: Omit<Props, 'onExit'>) {
  const [toDelete, setToDelete] = useState<Profile | null>(null)
  const profiles = [...data.profiles].sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr'))

  const setNiveau = (p: Profile, niveau: number) =>
    onChange({ ...data, profiles: data.profiles.map((x) => (x.id === p.id ? { ...x, niveau } : x)) })

  return (
    <section>
      <h1 className="ergo-title">Patients</h1>
      <p className="ergo-help">
        Le niveau règle la difficulté des jeux pour chaque enfant (longueur des phrases, accents, vitesse…).
      </p>
      {profiles.length === 0 ? (
        <p className="empty">Aucun profil pour l’instant. Les enfants créent le leur depuis l’écran d’accueil.</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Enfant</th>
              <th>Créé le</th>
              <th>Niveau</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="patient-cell">
                    <Avatar config={p.avatar} fond={p.couleurPrincipale} size={48} zoom />
                    <strong>{p.prenom}</strong>
                  </div>
                </td>
                <td>{new Date(p.creeLe).toLocaleDateString('fr-FR')}</td>
                <td>
                  <select
                    className="select"
                    value={p.niveau}
                    onChange={(e) => setNiveau(p, Number(e.target.value))}
                    aria-label={`Niveau de ${p.prenom}`}
                  >
                    {NIVEAUX.map((n) => (
                      <option key={n} value={n}>
                        {NIVEAU_LABELS[n]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="row-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onEditProfile(p)}>
                    <IconPencil size={18} /> Modifier
                  </button>
                  <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => setToDelete(p)}>
                    <IconTrash size={18} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce profil ?"
          message={
            <>
              Le profil de <strong>{toDelete.prenom}</strong> sera supprimé définitivement de ce PC.
            </>
          }
          confirmLabel="Supprimer"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            onChange({ ...data, profiles: data.profiles.filter((x) => x.id !== toDelete.id) })
            setToDelete(null)
          }}
        />
      )}
    </section>
  )
}

function Reglages({ data, onChange }: Pick<Props, 'data' | 'onChange'>) {
  const [code1, setCode1] = useState('')
  const [code2, setCode2] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const changeCode = () => {
    if (!isValidCode(code1)) return setMessage({ ok: false, text: 'Le code doit faire exactement 4 chiffres.' })
    if (code1 !== code2) return setMessage({ ok: false, text: 'Les deux codes ne sont pas identiques.' })
    onChange({ ...data, settings: { ...data.settings, codeErgo: code1 } })
    setCode1('')
    setCode2('')
    setMessage({ ok: true, text: 'Nouveau code enregistré.' })
  }

  const digitsOnly = (v: string) => v.replace(/\D/g, '').slice(0, 4)

  return (
    <section>
      <h1 className="ergo-title">Réglages</h1>

      <div className="card">
        <h2 className="card-title">Volume des sons</h2>
        <div className="volume-row">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={data.settings.volume}
            aria-label="Volume"
            onChange={(e) => onChange({ ...data, settings: { ...data.settings, volume: Number(e.target.value) } })}
          />
          <span className="volume-value">{Math.round(data.settings.volume * 100)} %</span>
          <button className="btn btn-ghost btn-sm" onClick={() => playSound('carillon')}>
            <IconSpeaker size={18} /> Tester
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Code de l’espace ergothérapeute</h2>
        {data.settings.codeErgo === '0000' && (
          <p className="warning">Le code est encore celui par défaut (0000). Pensez à le changer.</p>
        )}
        <div className="code-row">
          <label>
            Nouveau code
            <input className="input code-input" inputMode="numeric" type="password" value={code1} onChange={(e) => setCode1(digitsOnly(e.target.value))} />
          </label>
          <label>
            Confirmer
            <input
              className="input code-input"
              inputMode="numeric"
              type="password"
              value={code2}
              onChange={(e) => setCode2(digitsOnly(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && changeCode()}
            />
          </label>
          <button className="btn btn-primary" onClick={changeCode}>
            Changer le code
          </button>
        </div>
        {message && <p className={message.ok ? 'success' : 'error'}>{message.text}</p>}
      </div>
    </section>
  )
}

function Sauvegarde({ data, onChange }: Pick<Props, 'data' | 'onChange'>) {
  const [pending, setPending] = useState<AppData | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const exporter = async () => {
    const res = await api.exportBackup(data).catch(() => null)
    if (res === 'ok') setMessage({ ok: true, text: 'Sauvegarde enregistrée.' })
    else if (res === null) setMessage({ ok: false, text: 'La sauvegarde n’a pas pu être enregistrée.' })
  }

  const importer = async () => {
    const res = await api.importBackup().catch(() => null)
    if (!res || res.status === 'invalide') setMessage({ ok: false, text: 'Ce fichier n’est pas une sauvegarde DefilOrdi valide.' })
    else if (res.status === 'ok') setPending(res.data)
  }

  return (
    <section>
      <h1 className="ergo-title">Sauvegarde</h1>
      <p className="ergo-help">
        Toutes les données restent sur ce PC, rien n’est envoyé sur Internet. Faites régulièrement une sauvegarde sur une
        clé USB pour ne rien perdre si le PC tombe en panne, ou pour transférer les profils sur un autre PC.
      </p>
      <div className="card backup-actions">
        <button className="btn btn-primary" onClick={exporter}>
          <IconDownload /> Enregistrer une sauvegarde
        </button>
        <button className="btn btn-soft" onClick={importer}>
          <IconUpload /> Restaurer une sauvegarde
        </button>
        {isDesktop && (
          <button className="btn btn-ghost" onClick={() => void api.openDataFolder()}>
            <IconFolder /> Ouvrir le dossier des données
          </button>
        )}
      </div>
      {message && <p className={message.ok ? 'success' : 'error'}>{message.text}</p>}

      {pending && (
        <ConfirmDialog
          title="Restaurer cette sauvegarde ?"
          message={
            <>
              La sauvegarde contient <strong>{pending.profiles.length}</strong> profil(s). Elle remplacera toutes les données
              actuelles de ce PC ({data.profiles.length} profil(s)).
            </>
          }
          confirmLabel="Restaurer"
          danger
          onCancel={() => setPending(null)}
          onConfirm={() => {
            // Le code de l'espace ergothérapeute reste celui de ce PC.
            onChange({ ...pending, settings: { ...pending.settings, codeErgo: data.settings.codeErgo } })
            setPending(null)
            setMessage({ ok: true, text: 'Sauvegarde restaurée.' })
          }}
        />
      )}
    </section>
  )
}
