import { useState } from 'react'
import {
  AVATAR_OPTIONS,
  type AvatarConfig,
  COULEURS_PREFEREES,
  newProfile,
  PRENOM_MAX,
  type Profile,
  SONS_ECHEC,
  SONS_REUSSITE
} from '../../../shared/data'
import { Avatar } from '../avatar/Avatar'
import { type AvatarSection, LABELS, PERSONNAGE_SECTIONS, ROBOT_SECTIONS } from '../avatar/labels'
import { IconBack, IconCheck, IconNext, IconSpeaker } from '../components/Icons'
import { playSound, SOUND_LABELS } from '../sounds'
import { themeStyle } from '../theme'
import { uid } from '../uid'

const STEPS = [
  { id: 'prenom', titre: 'Prénom' },
  { id: 'personnage', titre: 'Personnage' },
  { id: 'couleurs', titre: 'Couleurs' },
  { id: 'sons', titre: 'Sons' }
] as const

type StepId = (typeof STEPS)[number]['id']

interface Props {
  initial?: Profile
  onCancel: () => void
  onDone: (p: Profile) => void
}

export function ProfileEditor({ initial, onCancel, onDone }: Props) {
  const [draft, setDraft] = useState<Profile>(() => initial ?? newProfile(uid(), new Date().toISOString()))
  const [step, setStep] = useState<StepId>('prenom')
  const index = STEPS.findIndex((s) => s.id === step)
  const prenomOk = draft.prenom.trim() !== ''
  const isLast = index === STEPS.length - 1

  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }))
  const setAvatar = (patch: Partial<AvatarConfig>) => setDraft((d) => ({ ...d, avatar: { ...d.avatar, ...patch } }))

  const finish = () => {
    if (prenomOk) onDone({ ...draft, prenom: draft.prenom.trim() })
  }
  const next = () => {
    if (!prenomOk) return
    if (isLast) finish()
    else setStep(STEPS[index + 1].id)
  }
  const back = () => (index === 0 ? onCancel() : setStep(STEPS[index - 1].id))

  return (
    <div className="screen editor" style={themeStyle(draft)}>
      <header className="topbar">
        <h1 className="editor-heading">{initial ? 'Modifier mon profil' : 'Nouveau joueur'}</h1>
        <nav className="stepper" aria-label="Étapes">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={s.id === step ? 'step active' : i < index ? 'step done' : 'step'}
              disabled={!prenomOk && s.id !== 'prenom'}
              onClick={() => setStep(s.id)}
              aria-current={s.id === step ? 'step' : undefined}
            >
              <span className="step-num">{i + 1}</span>
              {s.titre}
            </button>
          ))}
        </nav>
        <button className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
      </header>

      <main className="editor-main">
        <aside className="editor-preview">
          <div className="editor-preview-card">
            <Avatar config={draft.avatar} fond={draft.couleurPrincipale} size="100%" title="Aperçu du personnage" />
          </div>
          <p className="editor-preview-name">{draft.prenom.trim() || '…'}</p>
        </aside>

        <section className="editor-panel">
          {step === 'prenom' && (
            <StepPrenom value={draft.prenom} onChange={(prenom) => set({ prenom })} onEnter={next} />
          )}
          {step === 'personnage' && <StepPersonnage draft={draft} onChange={setAvatar} />}
          {step === 'couleurs' && <StepCouleurs draft={draft} onChange={set} />}
          {step === 'sons' && <StepSons draft={draft} onChange={set} />}
        </section>
      </main>

      <footer className="editor-footer">
        <button className="btn btn-ghost btn-lg" onClick={back}>
          <IconBack /> {index === 0 ? 'Annuler' : 'Retour'}
        </button>
        <div className="editor-footer-right">
          {initial && !isLast && (
            <button className="btn btn-soft btn-lg" onClick={finish} disabled={!prenomOk}>
              <IconCheck /> Enregistrer
            </button>
          )}
          <button className="btn btn-primary btn-lg" onClick={next} disabled={!prenomOk}>
            {isLast ? (
              <>
                <IconCheck /> {initial ? 'Enregistrer' : 'C’est parti !'}
              </>
            ) : (
              <>
                Suivant <IconNext />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}

function StepPrenom({ value, onChange, onEnter }: { value: string; onChange: (v: string) => void; onEnter: () => void }) {
  return (
    <div className="step-body">
      <h2 className="step-title">Comment t’appelles-tu ?</h2>
      <p className="step-help">Écris ton prénom avec le clavier.</p>
      <input
        className="big-input"
        value={value}
        maxLength={PRENOM_MAX}
        autoFocus
        spellCheck={false}
        autoComplete="off"
        placeholder="Ton prénom"
        aria-label="Prénom"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
      />
    </div>
  )
}

function StepPersonnage({ draft, onChange }: { draft: Profile; onChange: (patch: Partial<AvatarConfig>) => void }) {
  const sections = draft.avatar.style === 'robot' ? ROBOT_SECTIONS : PERSONNAGE_SECTIONS
  const [tab, setTab] = useState<string>(sections[0].key)
  const section = sections.find((s) => s.key === tab) ?? sections[0]

  return (
    <div className="step-body">
      <h2 className="step-title">Crée ton personnage</h2>
      <div className="style-switch" role="radiogroup" aria-label="Style">
        {AVATAR_OPTIONS.style.map((style) => (
          <button
            key={style}
            role="radio"
            aria-checked={draft.avatar.style === style}
            className={draft.avatar.style === style ? 'style-option selected' : 'style-option'}
            onClick={() => {
              onChange({ style })
              setTab((style === 'robot' ? ROBOT_SECTIONS : PERSONNAGE_SECTIONS)[0].key)
            }}
          >
            <Avatar config={{ ...draft.avatar, style }} fond={draft.couleurPrincipale} size={56} zoom />
            {LABELS[style]}
          </button>
        ))}
      </div>

      <div className="tabs" role="tablist">
        {sections.map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={s.key === section.key}
            className={s.key === section.key ? 'tab active' : 'tab'}
            onClick={() => setTab(s.key)}
          >
            {s.title}
          </button>
        ))}
      </div>

      <OptionGrid section={section} draft={draft} onChange={onChange} />
    </div>
  )
}

function OptionGrid({
  section,
  draft,
  onChange
}: {
  section: AvatarSection
  draft: Profile
  onChange: (patch: Partial<AvatarConfig>) => void
}) {
  const values = AVATAR_OPTIONS[section.key] as readonly string[]
  const current = draft.avatar[section.key]

  if (section.kind === 'color') {
    return (
      <div className="swatch-grid" role="radiogroup" aria-label={section.title}>
        {values.map((v) => (
          <button
            key={v}
            role="radio"
            aria-checked={v === current}
            aria-label={v}
            className={v === current ? 'swatch selected' : 'swatch'}
            style={{ background: v }}
            onClick={() => onChange({ [section.key]: v })}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="option-grid" role="radiogroup" aria-label={section.title}>
      {values.map((v) => (
        <button
          key={v}
          role="radio"
          aria-checked={v === current}
          className={v === current ? 'option-card selected' : 'option-card'}
          onClick={() => onChange({ [section.key]: v })}
        >
          <Avatar config={{ ...draft.avatar, [section.key]: v }} fond={draft.couleurPrincipale} size={84} zoom />
          <span>{LABELS[v] ?? v}</span>
        </button>
      ))}
    </div>
  )
}

function StepCouleurs({ draft, onChange }: { draft: Profile; onChange: (patch: Partial<Profile>) => void }) {
  return (
    <div className="step-body">
      <h2 className="step-title">Tes couleurs préférées</h2>
      <p className="step-help">Elles décoreront tes écrans et tes jeux.</p>
      <h3 className="step-subtitle">Ma couleur préférée</h3>
      <ColorChoice value={draft.couleurPrincipale} onPick={(c) => onChange({ couleurPrincipale: c })} label="Couleur préférée" />
      <h3 className="step-subtitle">Ma deuxième couleur</h3>
      <ColorChoice value={draft.couleurSecondaire} onPick={(c) => onChange({ couleurSecondaire: c })} label="Deuxième couleur" />
    </div>
  )
}

function ColorChoice({ value, onPick, label }: { value: string; onPick: (c: string) => void; label: string }) {
  return (
    <div className="swatch-grid swatch-grid-lg" role="radiogroup" aria-label={label}>
      {COULEURS_PREFEREES.map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={c === value}
          aria-label={c}
          className={c === value ? 'swatch selected' : 'swatch'}
          style={{ background: c }}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  )
}

function StepSons({ draft, onChange }: { draft: Profile; onChange: (patch: Partial<Profile>) => void }) {
  return (
    <div className="step-body">
      <h2 className="step-title">Tes sons</h2>
      <p className="step-help">Clique sur un son pour l’écouter et le choisir.</p>
      <div className="sound-columns">
        <SoundChoice
          title="Quand je réussis"
          sounds={SONS_REUSSITE}
          value={draft.sonReussite}
          onPick={(s) => onChange({ sonReussite: s })}
        />
        <SoundChoice
          title="Quand je me trompe"
          sounds={SONS_ECHEC}
          value={draft.sonEchec}
          onPick={(s) => onChange({ sonEchec: s })}
        />
      </div>
    </div>
  )
}

function SoundChoice({
  title,
  sounds,
  value,
  onPick
}: {
  title: string
  sounds: string[]
  value: string
  onPick: (s: string) => void
}) {
  return (
    <div className="sound-column">
      <h3 className="step-subtitle">{title}</h3>
      <div className="sound-list" role="radiogroup" aria-label={title}>
        {sounds.map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={s === value}
            className={s === value ? 'sound-option selected' : 'sound-option'}
            onClick={() => {
              onPick(s)
              playSound(s)
            }}
          >
            <span className="sound-icon">{s === 'aucun' ? '–' : <IconSpeaker size={20} />}</span>
            {SOUND_LABELS[s]}
            {s === value && (
              <span className="sound-check">
                <IconCheck size={20} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
