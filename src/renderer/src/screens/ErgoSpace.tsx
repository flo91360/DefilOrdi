import { useEffect, useRef, useState } from 'react'
import {
  type AppData,
  CODE_DEFAUT,
  COPIES_MAX,
  INDICES_PAR_PARTIE,
  isValidCode,
  NIVEAUX,
  type OptionsDactylo,
  type Profile,
  PROPOSITIONS_DEPART
} from '../../../shared/data'
import { api, isDesktop } from '../api'
import { Avatar } from '../avatar/Avatar'
import { ConfirmDialog, Modal } from '../components/Modal'
import { FullscreenButton } from '../components/FullscreenButton'
import { IconBack, IconChart, IconDownload, IconFolder, IconPencil, IconSettings, IconSpeaker, IconTrash, IconUpload } from '../components/Icons'
import { defaultListes, defaultListesMots } from '../../../shared/phrases'
import { imageDuMot } from '../games/memoire/images'
import { playSound, setVolume } from '../sounds'
import { ErgoStats, NOMS_JEUX, resumePartie } from './ErgoStats'
import { NIVEAU_LABELS } from './niveaux'
import { PetitBacEditor } from './PetitBacEditor'
import { PhrasesEditor, type TextesEditeur } from './PhrasesEditor'
import { PhrasesMemoireEditor } from './PhrasesMemoireEditor'
import { QuizEditor } from './QuizEditor'
import { PhrasesEnfantsEditor } from './PhrasesEnfantsEditor'
import { ListeMedailles } from '../components/Medailles'
import { Logo } from './ProfilePicker'

type Section = 'patients' | 'phrases' | 'enfants' | 'mots' | 'petitbac' | 'quiz' | 'reglages' | 'sauvegarde'

const TEXTES_PHRASES: TextesEditeur = {
  titre: 'Phrases',
  aide: 'Les listes de phrases du jeu Dactylo. Chaque enfant voit d’abord les listes de son niveau. Vous pouvez les modifier avec l’enfant : une phrase par ligne.',
  element: 'phrase',
  origine: defaultListes
}

const TEXTES_MOTS: TextesEditeur = {
  titre: 'Mots',
  aide: 'Les listes de mots du jeu Mots à retenir. À chaque partie, quelques mots sont tirés au hasard dans la liste choisie : prévoyez-en au moins 7 par liste. Le nombre de mots augmente après 3 réussites et redescend après 2 échecs ; après 7 mots, l’enfant retient une phrase (voir plus bas). Un mot par ligne. Chaque mot reçoit automatiquement une petite image, affichée pendant la mémorisation si l’option « Avec images » est choisie avant la partie.',
  element: 'mot',
  origine: defaultListesMots,
  image: imageDuMot
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
  const aVerifier = data.phrasesEnfants.filter((p) => p.statut === 'a_verifier').length

  // Rien n'est affiché (ni profils ni statistiques) tant que le code par défaut n'est pas changé.
  if (data.settings.codeErgo === CODE_DEFAUT) {
    return (
      <div className="screen ergo">
        <ChoixCodeObligatoire data={data} onChange={onChange} onExit={onExit} />
      </div>
    )
  }

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
              ['enfants', 'Phrases des enfants'],
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
              {id === 'enfants' && aVerifier > 0 && (
                <span className="ergo-badge-notif" aria-label={`${aVerifier} phrase${aVerifier > 1 ? 's' : ''} à vérifier`}>
                  {aVerifier}
                </span>
              )}
            </button>
          ))}
          <p className="ergo-version">Version {__APP_VERSION__}</p>
        </nav>

        <main className="ergo-main" key={visite}>
          {section === 'patients' && <Patients data={data} onChange={onChange} onEditProfile={onEditProfile} />}
          {section === 'phrases' && (
            <PhrasesEditor textes={TEXTES_PHRASES} listes={data.listes} onChange={(listes) => onChange({ ...data, listes })} />
          )}
          {section === 'enfants' && (
            <PhrasesEnfantsEditor
              phrases={data.phrasesEnfants}
              onChange={(phrasesEnfants) => onChange({ ...data, phrasesEnfants })}
            />
          )}
          {section === 'quiz' && (
            <QuizEditor
              perso={data.questionsPerso}
              masquees={data.questionsMasquees}
              onChange={(questionsPerso, questionsMasquees) => onChange({ ...data, questionsPerso, questionsMasquees })}
            />
          )}
          {section === 'mots' && <MotsSection data={data} onChange={onChange} />}
          {section === 'petitbac' && <PetitBacEditor reglages={data.petitBac} onChange={(petitBac) => onChange({ ...data, petitBac })} />}
          {section === 'reglages' && <Reglages data={data} onChange={onChange} />}
          {section === 'sauvegarde' && <Sauvegarde data={data} onChange={onChange} />}
        </main>
      </div>
    </div>
  )
}

// Section Mots : listes de mots et phrases du palier « phrase ». Les deux
// éditeurs peuvent enregistrer en même temps (en quittant la section) :
// chacun part des données les plus récentes.
function MotsSection({ data, onChange }: Pick<Props, 'data' | 'onChange'>) {
  const dataRef = useRef(data)
  dataRef.current = data
  const modifier = (changement: Partial<AppData>) => {
    const d = { ...dataRef.current, ...changement }
    dataRef.current = d
    onChange(d)
  }
  return (
    <>
      <PhrasesEditor textes={TEXTES_MOTS} listes={data.mots} onChange={(mots) => modifier({ mots })} />
      <PhrasesMemoireEditor phrases={data.phrasesMemoire} onChange={(phrasesMemoire) => modifier({ phrasesMemoire })} />
    </>
  )
}

function Patients({ data, onChange, onEditProfile }: Omit<Props, 'onExit'>) {
  const [toDelete, setToDelete] = useState<Profile | null>(null)
  const [statsDe, setStatsDe] = useState<string | null>(null)
  const [reglagesDe, setReglagesDe] = useState<Profile | null>(null)
  const [medaillesDe, setMedaillesDe] = useState<Profile | null>(null)
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
                  <button className="btn btn-soft btn-sm" onClick={() => setMedaillesDe(p)}>
                    🏅 Médailles ({p.medailles.length})
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

      {medaillesDe && (
        <Modal title={`Médailles de ${medaillesDe.prenom}`} onClose={() => setMedaillesDe(null)} width={520}>
          <ListeMedailles medailles={medaillesDe.medailles} vide="Aucune médaille gagnée pour l’instant." />
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setMedaillesDe(null)}>
              Fermer
            </button>
          </div>
        </Modal>
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

// Saisie d'un nouveau code à 4 chiffres (Réglages, et premier accès avec le code par défaut).
function FormulaireCode({ onCode }: { onCode: (code: string) => void }) {
  const [code1, setCode1] = useState('')
  const [code2, setCode2] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const changeCode = () => {
    if (!isValidCode(code1)) return setMessage({ ok: false, text: 'Le code doit faire exactement 4 chiffres.' })
    if (code1 !== code2) return setMessage({ ok: false, text: 'Les deux codes ne sont pas identiques.' })
    if (code1 === CODE_DEFAUT) return setMessage({ ok: false, text: 'Choisissez un autre code que 0000.' })
    onCode(code1)
    setCode1('')
    setCode2('')
    setMessage({ ok: true, text: 'Nouveau code enregistré.' })
  }

  const digitsOnly = (v: string) => v.replace(/\D/g, '').slice(0, 4)

  return (
    <>
      <div className="code-row">
        <label>
          Nouveau code
          <input className="input code-input" inputMode="numeric" type="password" value={code1} onChange={(e) => setCode1(digitsOnly(e.target.value))} autoFocus />
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
    </>
  )
}

// Code encore à 0000 : l'ergothérapeute en choisit un avant d'entrer, pour
// qu'un enfant ne puisse pas ouvrir son espace.
function ChoixCodeObligatoire({ data, onChange, onExit }: Pick<Props, 'data' | 'onChange' | 'onExit'>) {
  return (
    <Modal title="Choisissez votre code" onClose={onExit} width={560}>
      <p className="modal-body">
        Le code de l’espace ergothérapeute est encore celui par défaut (0000), que les enfants peuvent deviner. Choisissez
        un code à 4 chiffres que les enfants ne connaissent pas : il sera demandé à chaque ouverture de cet espace.
      </p>
      <FormulaireCode onCode={(codeErgo) => onChange({ ...data, settings: { ...data.settings, codeErgo } })} />
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onExit}>
          Retour aux joueurs
        </button>
      </div>
    </Modal>
  )
}

function Reglages({ data, onChange }: Pick<Props, 'data' | 'onChange'>) {
  return (
    <section>
      <h1 className="ergo-title">Réglages</h1>

      <ReglageVolume data={data} onChange={onChange} />

      <ReglagesIndice data={data} onChange={onChange} />

      <div className="card">
        <h2 className="card-title">Code de l’espace ergothérapeute</h2>
        <FormulaireCode onCode={(codeErgo) => onChange({ ...data, settings: { ...data.settings, codeErgo } })} />
      </div>
    </section>
  )
}

// Volume : appliqué tout de suite, enregistré quand le curseur s'arrête
// (et pas à chaque cran, ce qui réécrirait tout le fichier de données).
const DELAI_VOLUME_MS = 400

function ReglageVolume({ data, onChange }: Pick<Props, 'data' | 'onChange'>) {
  const [volume, setVolumeAffiche] = useState(data.settings.volume)
  const minuteur = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dernier = useRef({ data, onChange, volume })
  dernier.current = { data, onChange, volume }

  const enregistrer = () => {
    clearTimeout(minuteur.current)
    const d = dernier.current
    if (d.volume !== d.data.settings.volume) d.onChange({ ...d.data, settings: { ...d.data.settings, volume: d.volume } })
  }
  // Section quittée avant la fin du délai : le dernier volume est enregistré.
  useEffect(() => () => enregistrer(), [])

  const changer = (v: number) => {
    setVolumeAffiche(v)
    dernier.current.volume = v
    setVolume(v)
    clearTimeout(minuteur.current)
    minuteur.current = setTimeout(enregistrer, DELAI_VOLUME_MS)
  }

  return (
    <div className="card">
      <h2 className="card-title">Volume des sons</h2>
      <div className="volume-row">
        <input type="range" min={0} max={1} step={0.05} value={volume} aria-label="Volume" onChange={(e) => changer(Number(e.target.value))} />
        <span className="volume-value">{Math.round(volume * 100)} %</span>
        <button className="btn btn-ghost btn-sm" onClick={() => playSound('carillon')}>
          <IconSpeaker size={18} /> Tester
        </button>
      </div>
    </div>
  )
}

// Couleurs piégées : bouton Indice, même réglage pour tous les enfants.
function ReglagesIndice({ data, onChange }: Pick<Props, 'data' | 'onChange'>) {
  const r = data.couleurs
  const maj = (changement: Partial<AppData['couleurs']>) => onChange({ ...data, couleurs: { ...r, ...changement } })
  const progression = Array.from({ length: r.indicesParPartie }, (_, i) => Math.min(4, r.propositionsDepart + i))
  return (
    <div className="card">
      <h2 className="card-title">Couleurs piégées : bouton Indice</h2>
      <p className="ergo-help">
        Quand l’enfant doit écrire la couleur de l’encre, le bouton Indice affiche quelques couleurs, dont toujours la
        bonne réponse (le mot piège peut en faire partie). L’enfant tape toujours sa réponse au clavier. Ce réglage
        s’applique à tous les enfants.
      </p>
      <div className="code-row">
        <label>
          Indices par partie
          <select
            className="select"
            value={r.indicesParPartie}
            onChange={(e) => maj({ indicesParPartie: Number(e.target.value) })}
          >
            {INDICES_PAR_PARTIE.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? 'Aucun (bouton retiré)' : n === 1 ? '1 indice' : `${n} indices`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Propositions au premier indice
          <select
            className="select"
            value={r.propositionsDepart}
            disabled={r.indicesParPartie === 0}
            onChange={(e) => maj({ propositionsDepart: Number(e.target.value) })}
          >
            {PROPOSITIONS_DEPART.map((n) => (
              <option key={n} value={n}>
                {n} propositions
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted">
        {r.indicesParPartie === 0
          ? 'Le bouton Indice n’apparaît plus dans le jeu.'
          : `Chaque indice montre une proposition de plus que le précédent (4 au plus) : ${progression
              .map((n, i) => `${i + 1}${i === 0 ? 'er' : 'e'} indice = ${n}`)
              .join(', ')}.`}
      </p>
    </div>
  )
}

function Sauvegarde({ data, onChange }: Pick<Props, 'data' | 'onChange'>) {
  const [pending, setPending] = useState<{ data: AppData; plusRecente: boolean } | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const exporter = async () => {
    const res = await api.exportBackup(data).catch(() => null)
    if (res === 'ok') setMessage({ ok: true, text: 'Sauvegarde enregistrée.' })
    else if (res === null) setMessage({ ok: false, text: 'La sauvegarde n’a pas pu être enregistrée.' })
  }

  const importer = async () => {
    const res = await api.importBackup().catch(() => null)
    if (!res || res.status === 'invalide') setMessage({ ok: false, text: 'Ce fichier n’est pas une sauvegarde DefilOrdi valide.' })
    else if (res.status === 'ok') setPending({ data: res.data, plusRecente: res.plusRecente })
  }

  return (
    <section>
      <h1 className="ergo-title">Sauvegarde</h1>
      <p className="ergo-help">
        Toutes les données restent sur ce PC, rien n’est envoyé sur Internet. Faites régulièrement une sauvegarde sur une
        clé USB pour ne rien perdre si le PC tombe en panne, ou pour transférer les profils sur un autre PC.
      </p>
      {isDesktop && (
        <p className="ergo-help">
          Le logiciel garde aussi tout seul des copies datées sur ce PC (une par jour d’utilisation, et avant chaque
          restauration ou mise à jour), dans le dossier des données, sous-dossier « sauvegardes ». Les {COPIES_MAX} plus
          récentes sont conservées ; chacune peut être rechargée avec « Restaurer une sauvegarde ».
        </p>
      )}
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
              La sauvegarde contient <strong>{pending.data.profiles.length}</strong> profil(s). Elle remplacera toutes les données
              actuelles de ce PC ({data.profiles.length} profil(s)).
              {isDesktop && ' Une copie des données actuelles est gardée dans le dossier des données, sous-dossier « sauvegardes ».'}
              {pending.plusRecente && (
                <p className="warning">
                  Cette sauvegarde a été faite avec une version plus récente de DefilOrdi : les jeux et réglages que cette
                  version ne connaît pas ne seront pas repris. Installez plutôt la dernière version sur ce PC.
                </p>
              )}
            </>
          }
          confirmLabel="Restaurer"
          danger
          onCancel={() => setPending(null)}
          onConfirm={() => {
            // Le code de l'espace ergothérapeute reste celui de ce PC.
            onChange({ ...pending.data, settings: { ...pending.data.settings, codeErgo: data.settings.codeErgo } })
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
  { key: 'sonErreur', titre: 'Son à chaque erreur', detail: 'Le son d’erreur choisi par l’enfant.' },
  {
    key: 'afficherErreurs',
    titre: 'Afficher le nombre d’erreurs',
    detail: 'À la fin de chaque phrase et dans le récapitulatif. À désactiver si le nombre d’erreurs met l’enfant sous pression ou le rend trop perfectionniste.'
  }
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
