import { useState } from 'react'
import { type AppData, isValidCode, NIVEAUX, type OptionsDactylo, type Profile } from '../../../shared/data'
import { api, isDesktop } from '../api'
import { Avatar } from '../avatar/Avatar'
import { ConfirmDialog, Modal } from '../components/Modal'
import { FullscreenButton } from '../components/FullscreenButton'
import { IconBack, IconChart, IconDownload, IconFolder, IconPencil, IconSettings, IconSpeaker, IconTrash, IconUpload } from '../components/Icons'
import { defaultListes, defaultListesMots } from '../../../shared/phrases'
import { playSound } from '../sounds'
import { ErgoStats, NOMS_JEUX, resumePartie } from './ErgoStats'
import { NIVEAU_LABELS } from './niveaux'
import { PetitBacEditor } from './PetitBacEditor'
import { PhrasesEditor, type TextesEditeur } from './PhrasesEditor'
import { QuizEditor } from './QuizEditor'
import { Logo } from './ProfilePicker'

type Section = 'patients' | 'phrases' | 'mots' | 'petitbac' | 'quiz' | 'reglages' | 'sauvegarde'

const TEXTES_PHRASES: TextesEditeur = {
  titre: 'Phrases',
  aide: 'Les listes de phrases du jeu Dactylo. Chaque enfant voit d’abord les listes de son niveau. Vous pouvez les modifier avec l’enfant : une phrase par ligne.',
  element: 'phrase',
  origine: defaultListes
}

const TEXTES_MOTS: TextesEditeur = {
  titre: 'Mots',
  aide: 'Les listes de mots du jeu Mots à retenir. À chaque partie, quelques mots sont tirés au hasard dans la liste choisie : prévoyez-en au moins 8 par liste. Un mot par ligne.',
  element: 'mot',
  origine: defaultListesMots
}

interface Props {
  data: AppData
  onChange: (d: AppData) => void
  onEditProfile: (p: Profile) => void
  onExit: () => void
}

export function ErgoSpace({ data, onChange, onEditProfile, onExit }: Props) {
  const [section, setSection] = useState<Section>('patients')
  // Recliquer sur une section la remet à zéro (ex. retour à la liste des patients).
  const [visite, setVisite] = useState(0)

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
              ['phrases', 'Phrases'],
              ['mots', 'Mots'],
              ['petitbac', 'Petit bac'],
              ['quiz', 'Quiz'],
              ['reglages', 'Réglages'],
              ['sauvegarde', 'Sauvegarde']
            ] as const
          ).map(([id, label]) => (
            <button key={id} className={section === id ? 'ergo-nav-item active' : 'ergo-nav-item'} onClick={() => {
                setSection(id)
                setVisite((v) => v + 1)
              }}
            >
              {label}
            </button>
          ))}
          <p className="ergo-version">Version {__APP_VERSION__}</p>
        </nav>

        <main className="ergo-main" key={visite}>
          {section === 'patients' && <Patients data={data} onChange={onChange} onEditProfile={onEditProfile} />}
          {section === 'phrases' && (
            <PhrasesEditor textes={TEXTES_PHRASES} listes={data.listes} onChange={(listes) => onChange({ ...data, listes })} />
          )}
          {section === 'quiz' && (
            <QuizEditor
              perso={data.questionsPerso}
              masquees={data.questionsMasquees}
              onChange={(questionsPerso, questionsMasquees) => onChange({ ...data, questionsPerso, questionsMasquees })}
            />
          )}
          {section === 'mots' && <PhrasesEditor textes={TEXTES_MOTS} listes={data.mots} onChange={(mots) => onChange({ ...data, mots })} />}
          {section === 'petitbac' && <PetitBacEditor reglages={data.petitBac} onChange={(petitBac) => onChange({ ...data, petitBac })} />}
          {section === 'reglages' && <Reglages data={data} onChange={onChange} />}
          {section === 'sauvegarde' && <Sauvegarde data={data} onChange={onChange} />}
        </main>
      </div>
    </div>
  )
}

function Patients({ data, onChange, onEditProfile }: Omit<Props, 'onExit'>) {
  const [toDelete, setToDelete] = useState<Profile | null>(null)
  const [statsDe, setStatsDe] = useState<string | null>(null)
  const [reglagesDe, setReglagesDe] = useState<Profile | null>(null)
  const profiles = [...data.profiles].sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr'))

  const majProfil = (p: Profile) => onChange({ ...data, profiles: data.profiles.map((x) => (x.id === p.id ? p : x)) })
  const setNiveau = (p: Profile, niveau: number) => majProfil({ ...p, niveau })

  const derniere = (p: Profile) => {
    const r = data.resultats.filter((x) => x.profileId === p.id).sort((a, b) => b.date.localeCompare(a.date))[0]
    return r ? `${new Date(r.date).toLocaleDateString('fr-FR')} · ${NOMS_JEUX[r.jeu]} · ${resumePartie(r)}` : '—'
  }

  const statsProfile = statsDe ? data.profiles.find((p) => p.id === statsDe) : undefined
  if (statsProfile) {
    return (
      <ErgoStats
        profile={statsProfile}
        resultats={data.resultats}
        questionsPerso={data.questionsPerso}
        onSupprimer={(id) => onChange({ ...data, resultats: data.resultats.filter((r) => r.id !== id) })}
        onRetour={() => setStatsDe(null)}
      />
    )
  }

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
              <th>Niveau</th>
              <th>Dernière partie</th>
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
                <td className="muted">{derniere(p)}</td>
                <td className="row-actions">
                  <button className="btn btn-soft btn-sm" onClick={() => setStatsDe(p.id)}>
                    <IconChart size={18} /> Statistiques
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setReglagesDe(p)}>
                    <IconSettings size={18} /> Réglages
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEditProfile(p)} title="Modifier le profil" aria-label={`Modifier le profil de ${p.prenom}`}>
                    <IconPencil size={18} />
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon btn-danger-text" onClick={() => setToDelete(p)} title="Supprimer le profil" aria-label={`Supprimer le profil de ${p.prenom}`}>
                    <IconTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {reglagesDe && (
        <OptionsModal
          profile={reglagesDe}
          onCancel={() => setReglagesDe(null)}
          onSave={(dactylo) => {
            majProfil({ ...reglagesDe, dactylo })
            setReglagesDe(null)
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce profil ?"
          message={
            <>
              Le profil de <strong>{toDelete.prenom}</strong> et ses statistiques seront supprimés définitivement de ce PC.
            </>
          }
          confirmLabel="Supprimer"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            onChange({
              ...data,
              profiles: data.profiles.filter((x) => x.id !== toDelete.id),
              resultats: data.resultats.filter((r) => r.profileId !== toDelete.id)
            })
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

const OPTIONS: { key: keyof OptionsDactylo; titre: string; detail: string }[] = [
  { key: 'accents', titre: 'Exiger les accents', detail: 'Sinon, « e » est accepté à la place de « é ».' },
  { key: 'majuscules', titre: 'Exiger les majuscules', detail: 'Sinon, « a » est accepté à la place de « A ».' },
  {
    key: 'bloquer',
    titre: 'Bloquer sur les erreurs',
    detail: 'L’enfant doit taper la bonne lettre pour avancer. Sinon, il doit effacer ses erreurs avec ⌫.'
  },
  { key: 'clavier', titre: 'Afficher le clavier à l’écran', detail: 'Avec la touche à taper et les couleurs des doigts.' },
  { key: 'sonErreur', titre: 'Son à chaque erreur', detail: 'Le son d’erreur choisi par l’enfant.' }
]

function OptionsModal({
  profile,
  onCancel,
  onSave
}: {
  profile: Profile
  onCancel: () => void
  onSave: (o: OptionsDactylo) => void
}) {
  const [o, setO] = useState(profile.dactylo)
  return (
    <Modal title={`Dactylo : réglages de ${profile.prenom}`} onClose={onCancel} width={560}>
      <div className="options-list">
        {OPTIONS.map((opt) => (
          <label key={opt.key} className="option-row">
            <input type="checkbox" className="switch" checked={o[opt.key]} onChange={(e) => setO({ ...o, [opt.key]: e.target.checked })} />
            <span>
              <strong>{opt.titre}</strong>
              <span className="option-detail">{opt.detail}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button className="btn btn-primary" onClick={() => onSave(o)}>
          Enregistrer
        </button>
      </div>
    </Modal>
  )
}
