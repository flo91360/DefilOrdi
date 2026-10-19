import { useEffect, useRef, useState } from 'react'

// Pause automatique, commune aux jeux : quand la fenêtre perd le focus (autre
// programme, Alt+Tab, fenêtre réduite), le jeu s'arrête et le temps ne compte
// plus jusqu'à ce que l'enfant clique sur « Reprendre ».
// onReprise reçoit la durée de la pause, pour décaler les mesures de temps.
export function usePauseAuto(actif: boolean, onReprise?: (dureeMs: number) => void) {
  const [debutPause, setDebutPause] = useState<number | null>(null)
  const reprise = useRef(onReprise)
  reprise.current = onReprise

  useEffect(() => {
    if (!actif) return
    const pause = () => setDebutPause((d) => d ?? Date.now())
    const visibilite = () => {
      if (document.hidden) pause()
    }
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', visibilite)
    return () => {
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', visibilite)
    }
  }, [actif])

  const reprendre = () => {
    if (debutPause !== null) reprise.current?.(Date.now() - debutPause)
    setDebutPause(null)
  }
  return { enPause: actif && debutPause !== null, reprendre }
}

// Temps écoulé (ms) pendant que le chronomètre est en marche : il s'arrête
// pendant les pauses et reprend là où il en était.
export function useChrono(enMarche: boolean, pasMs = 200): { ecoule: number; lire: () => number } {
  const [ecoule, setEcoule] = useState(0)
  const cumul = useRef(0)
  const depuis = useRef<number | null>(null)
  const lire = () => cumul.current + (depuis.current === null ? 0 : Date.now() - depuis.current)

  useEffect(() => {
    if (!enMarche) return
    depuis.current = Date.now()
    const t = setInterval(() => setEcoule(lire()), pasMs)
    return () => {
      clearInterval(t)
      cumul.current = lire()
      depuis.current = null
      setEcoule(cumul.current)
    }
  }, [enMarche, pasMs])

  return { ecoule, lire }
}

// Écran de pause, par-dessus le jeu (cache la partie en cours). Les touches
// ne vont plus au jeu (raccourcis, réponses), sauf au bouton « Reprendre ».
export function EcranPause({ onReprendre }: { onReprendre: () => void }) {
  const carte = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const bloquer = (e: KeyboardEvent) => {
      if (e.key !== 'F11' && !(e.target instanceof Node && carte.current?.contains(e.target))) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('keydown', bloquer, true)
    return () => window.removeEventListener('keydown', bloquer, true)
  }, [])
  return (
    <div className="pause-ecran" role="dialog" aria-modal="true" aria-label="Pause" onMouseDown={(e) => e.stopPropagation()}>
      <div className="pause-carte" ref={carte}>
        <h2 className="pause-titre">Pause</h2>
        <p>Le jeu s’est mis en pause. Le temps ne compte pas pendant la pause.</p>
        <button className="btn btn-primary btn-lg" onClick={onReprendre} autoFocus>
          Reprendre
        </button>
      </div>
    </div>
  )
}
