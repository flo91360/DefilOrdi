import type { JeuId, Profile } from '../../../shared/data'
import { Avatar } from '../avatar/Avatar'
import { FullscreenButton } from '../components/FullscreenButton'
import { GameArt, IconPencil, IconUsers } from '../components/Icons'
import { Logo } from './ProfilePicker'

export const GAMES: { id: JeuId; titre: string; description: string; disponible: boolean }[] = [
  {
    id: 'dactylo',
    titre: 'Dactylo',
    description: 'Tape les phrases le plus juste et le plus vite possible.',
    disponible: true
  },
  {
    id: 'memoire',
    titre: 'Mots à retenir',
    description: 'Mémorise une liste de mots, puis retape-les de tête.',
    disponible: true
  },
  {
    id: 'couleurs',
    titre: 'Couleurs piégées',
    description: 'Le mot ou sa couleur ? Ne te laisse pas piéger !',
    disponible: true
  },
  {
    id: 'espace',
    titre: 'Lettres de l’espace',
    description: 'Détruis les lettres qui tombent avant qu’elles n’atterrissent.',
    disponible: true
  },
  {
    id: 'quiz',
    titre: 'Quiz de l’ordinateur',
    description: 'Vrai ou faux, QCM et mises en situation sur de vrais écrans.',
    disponible: true
  }
]

interface Props {
  profile: Profile
  onEdit: () => void
  onSwitch: () => void
  onPlay: (jeu: JeuId) => void
}

export function Hub({ profile, onEdit, onSwitch, onPlay }: Props) {
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
        </section>

        <section className="game-grid" aria-label="Jeux">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              className={i % 2 === 0 ? 'game-tile' : 'game-tile game-tile-alt'}
              disabled={!g.disponible}
              onClick={() => onPlay(g.id)}
              aria-label={`${g.titre}${g.disponible ? '' : ' (bientôt disponible)'}`}
            >
              <div className="game-art">
                <GameArt game={g.id} />
              </div>
              <div className="game-text">
                <span className="game-title">{g.titre}</span>
                <span className="game-desc">{g.description}</span>
              </div>
              {!g.disponible && <span className="game-badge">Bientôt</span>}
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
