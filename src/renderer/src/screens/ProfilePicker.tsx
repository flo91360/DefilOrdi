import type { Profile } from '../../../shared/data'
import { Avatar } from '../avatar/Avatar'
import { IconLock, IconPlus } from '../components/Icons'
import { FullscreenButton } from '../components/FullscreenButton'
import { themeStyle } from '../theme'

interface Props {
  profiles: Profile[]
  onPick: (p: Profile) => void
  onCreate: () => void
  onErgo: () => void
}

export function ProfilePicker({ profiles, onPick, onCreate, onErgo }: Props) {
  const sorted = [...profiles].sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr'))
  return (
    <div className="screen picker">
      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={onErgo}>
            <IconLock /> Espace ergothérapeute
          </button>
          <FullscreenButton />
        </div>
      </header>

      <main className="picker-main">
        <h1 className="picker-title">Qui joue aujourd’hui ?</h1>
        <div className="profile-grid">
          {sorted.map((p) => (
            <button key={p.id} className="profile-card" style={themeStyle(p)} onClick={() => onPick(p)}>
              <Avatar config={p.avatar} fond={p.couleurPrincipale} size={132} />
              <span className="profile-card-name">{p.prenom}</span>
            </button>
          ))}
          <button className="profile-card profile-card-new" onClick={onCreate}>
            <span className="profile-card-plus">
              <IconPlus size={44} />
            </span>
            <span className="profile-card-name">Nouveau joueur</span>
          </button>
        </div>
      </main>
    </div>
  )
}

export function Logo() {
  return (
    <div className="logo" aria-label="DefilOrdi">
      <span className="logo-keys" aria-hidden="true">
        <span>D</span>
        <span>O</span>
      </span>
      <span className="logo-text">
        Defil<strong>Ordi</strong>
      </span>
    </div>
  )
}
