import { api } from '../api'
import { IconFullscreen } from './Icons'

export function FullscreenButton() {
  return (
    <button className="btn btn-icon btn-ghost" onClick={() => void api.toggleFullscreen()} title="Plein écran (F11)" aria-label="Plein écran">
      <IconFullscreen />
    </button>
  )
}
