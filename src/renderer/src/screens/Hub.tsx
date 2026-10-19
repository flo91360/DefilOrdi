import { useState } from 'react'
import type { JeuId, Profile } from '../../../shared/data'
import { JEUX, ORDRE_JEUX } from '../games/jeux'
import { Avatar } from '../avatar/Avatar'
import { FullscreenButton } from '../components/FullscreenButton'
import { GameArt, IconPencil, IconUsers } from '../components/Icons'
import { CoffreBouton, ListeMedailles } from '../components/Medailles'
import { Modal } from '../components/Modal'
import { Logo } from './ProfilePicker'

// Les jeux affichés, dans l'ordre de la liste unique (games/jeux.ts).
export const GAMES = ORDRE_JEUX.map((id) => ({ id, ...JEUX[id] }))

interface Props {
  profile: Profile
  onEdit: () => void
  onSwitch: () => void
  onPlay: (jeu: JeuId) => void
}

export function Hub({ profile, onEdit, onSwitch, onPlay }: Props) {
  const [coffre, setCoffre] = useState(false)
  return (
    <div className="screen hub">
      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={onSwitch}>
            <IconUsers /> Changer de joueur
          </button>
          <FullscreenButton />
        </div>
      </header>

      <main className="hub-main">
        <section className="hub-hello">
          <div className="hub-avatar">
            <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={150} title={profile.prenom} />
          </div>
          <div>
            <h1 className="hub-title">Salut {profile.prenom} !</h1>
            <p className="hub-subtitle">À quoi veux-tu jouer ?</p>
            <button className="btn btn-soft" onClick={onEdit}>
              <IconPencil /> Modifier mon personnage
            </button>
          </div>
          <CoffreBouton nombre={profile.medailles.length} onClick={() => setCoffre(true)} />
        </section>

        <section className="game-grid" aria-label="Jeux">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              className={i % 2 === 0 ? 'game-tile' : 'game-tile game-tile-alt'}
              onClick={() => onPlay(g.id)}
              aria-label={g.titre}
            >
              <div className="game-art">
                <GameArt game={g.id} />
              </div>
              <div className="game-text">
                <span className="game-title">{g.titre}</span>
                <span className="game-desc">{g.description}</span>
              </div>
            </button>
          ))}
        </section>
      </main>
      {coffre && (
        <Modal title="Mon coffre à médailles" onClose={() => setCoffre(false)} width={520}>
          <ListeMedailles medailles={profile.medailles} vide="Ton coffre est vide pour l’instant. Gagne une médaille en réussissant une partie de Dactylo de 5 phrases !" />
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setCoffre(false)} autoFocus>
              Fermer
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
