import { useEffect, useState } from 'react'
import { Modal } from './Modal'

interface Props {
  expected: string
  showDefaultHint: boolean
  onSuccess: () => void
  onCancel: () => void
}

// Code à 4 chiffres qui protège l'espace ergothérapeute.
export function PinPad({ expected, showDefaultHint, onSuccess, onCancel }: Props) {
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)

  const press = (digit: string) => {
    setWrong(false)
    setCode((c) => (c.length < 4 ? c + digit : c))
  }

  useEffect(() => {
    if (code.length < 4) return
    if (code === expected) {
      onSuccess()
    } else {
      setWrong(true)
      const t = setTimeout(() => setCode(''), 400)
      return () => clearTimeout(t)
    }
  }, [code, expected, onSuccess])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') setCode((c) => c.slice(0, -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Modal title="Espace ergothérapeute" onClose={onCancel} width={360}>
      <p className="modal-body center">Entrez le code à 4 chiffres.</p>
      <div className={wrong ? 'pin-dots shake' : 'pin-dots'} aria-live="polite">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < code.length ? 'pin-dot filled' : 'pin-dot'} />
        ))}
      </div>
      <p className="pin-message">{wrong ? 'Code incorrect' : showDefaultHint ? 'Code par défaut : 0000' : ' '}</p>
      <div className="pin-grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="pin-key" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button className="pin-key pin-key-small" onClick={onCancel}>
          Annuler
        </button>
        <button className="pin-key" onClick={() => press('0')}>
          0
        </button>
        <button className="pin-key pin-key-small" onClick={() => setCode((c) => c.slice(0, -1))} aria-label="Effacer">
          ⌫
        </button>
      </div>
    </Modal>
  )
}
