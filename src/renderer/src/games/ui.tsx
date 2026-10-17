import { type ReactNode, useEffect, useRef } from 'react'
import type { Profile } from '../../../shared/data'
import { Avatar } from '../avatar/Avatar'
import { FullscreenButton } from '../components/FullscreenButton'
import { IconBack } from '../components/Icons'

// Morceaux d'interface communs aux jeux.

export function GameTopbar({
  titre,
  onBack,
  backLabel = 'Menu',
  children
}: {
  titre?: string
  onBack?: () => void
  backLabel?: string
  children?: ReactNode
}) {
  return (
    <header className="topbar">
      {onBack && (
        <button className="btn btn-ghost" onClick={onBack}>
          <IconBack /> {backLabel}
        </button>
      )}
      {titre && <h1 className="game-heading">{titre}</h1>}
      <div className="topbar-actions">
        {children}
        <FullscreenButton />
      </div>
    </header>
  )
}

export function StatTile({ value, label, detail, smiley }: { value: string; label: string; detail: string; smiley?: ReactNode }) {
  return (
    <div className="stat-tile">
      <span className="stat-value">
        {value}
        {smiley && <span className="stat-smiley">{smiley}</span>}
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-detail">{detail}</span>
    </div>
  )
}

export function FinHero({ profile, message, record }: { profile: Profile; message: string; record?: string }) {
  return (
    <div className="fin-hero">
      <div className="hub-avatar">
        <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={130} />
      </div>
      <div>
        <h2 className="fin-title">Bravo {profile.prenom} !</h2>
        <p className="fin-message">{message}</p>
        {record && <span className="record">★ {record}</span>}
      </div>
    </div>
  )
}

export function Chips<T extends string | number>({
  label,
  values,
  value,
  onChange,
  format = String
}: {
  label: string
  values: readonly T[]
  value: T
  onChange: (v: T) => void
  format?: (v: T) => string
}) {
  return (
    <div className="choix-nombre" role="radiogroup" aria-label={label}>
      <span>{label} :</span>
      {values.map((v) => (
        <button key={v} role="radio" aria-checked={v === value} className={v === value ? 'chip selected' : 'chip'} onClick={() => onChange(v)}>
          {format(v)}
        </button>
      ))}
    </div>
  )
}

// Grand champ de réponse : Entrée valide. Le focus revient toujours dedans
// pour que l'enfant n'ait pas à cliquer.
export function ReponseInput({
  onSubmit,
  disabled,
  placeholder,
  etat
}: {
  onSubmit: (v: string) => void
  disabled?: boolean
  placeholder?: string
  etat?: 'juste' | 'faux' | null
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) ref.current?.focus()
  }, [disabled])

  useEffect(() => {
    const refocus = () => {
      if (!disabled) requestAnimationFrame(() => ref.current?.focus())
    }
    window.addEventListener('mouseup', refocus)
    return () => window.removeEventListener('mouseup', refocus)
  }, [disabled])

  return (
    <input
      ref={ref}
      className={`reponse-input${etat ? ` reponse-${etat}` : ''}`}
      placeholder={placeholder}
      readOnly={disabled}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      aria-label="Ta réponse"
      onPaste={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !disabled) {
          e.preventDefault()
          const v = e.currentTarget.value
          if (v.trim() === '') return
          e.currentTarget.value = ''
          onSubmit(v)
        }
      }}
    />
  )
}
