// Sons de réussite et d'échec, synthétisés avec la Web Audio API : aucun fichier
// audio à fournir et aucune question de droits d'auteur.
// Les sons d'échec restent volontairement doux : ils signalent, ils ne punissent pas.

export const SOUND_LABELS: Record<string, string> = {
  carillon: 'Carillon',
  piece: 'Pièce',
  fanfare: 'Fanfare',
  bulles: 'Bulles',
  etoile: 'Étoile filante',
  oups: 'Oups',
  boing: 'Boing',
  tambour: 'Tambour',
  plouf: 'Plouf',
  aucun: 'Pas de son'
}

let ctx: AudioContext | null = null
let masterVolume = 0.7

export function setVolume(v: number): void {
  masterVolume = Math.max(0, Math.min(1, v))
}

function audio(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface Note {
  freq: number
  start: number
  dur: number
  type?: OscillatorType
  gain?: number
  slideTo?: number
}

function playNotes(notes: Note[]): void {
  const ac = audio()
  const out = ac.createGain()
  out.gain.value = masterVolume
  out.connect(ac.destination)
  const t0 = ac.currentTime + 0.02
  for (const n of notes) {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = n.type ?? 'sine'
    osc.frequency.setValueAtTime(n.freq, t0 + n.start)
    if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(n.slideTo, t0 + n.start + n.dur)
    const peak = n.gain ?? 0.3
    g.gain.setValueAtTime(0.0001, t0 + n.start)
    g.gain.exponentialRampToValueAtTime(peak, t0 + n.start + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.start + n.dur)
    osc.connect(g).connect(out)
    osc.start(t0 + n.start)
    osc.stop(t0 + n.start + n.dur + 0.05)
  }
}

function playNoise(start: number, dur: number, fromHz: number, toHz: number, gain: number): void {
  const ac = audio()
  const len = Math.floor(ac.sampleRate * dur)
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const ch = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 2
  const g = ac.createGain()
  const t0 = ac.currentTime + 0.02 + start
  filter.frequency.setValueAtTime(fromHz, t0)
  filter.frequency.exponentialRampToValueAtTime(toHz, t0 + dur)
  g.gain.setValueAtTime(gain * masterVolume, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter).connect(g).connect(ac.destination)
  src.start(t0)
}

const SOUNDS: Record<string, () => void> = {
  carillon: () =>
    playNotes([
      { freq: 784, start: 0, dur: 0.5, gain: 0.25 },
      { freq: 988, start: 0.1, dur: 0.5, gain: 0.25 },
      { freq: 1175, start: 0.2, dur: 0.5, gain: 0.25 },
      { freq: 1568, start: 0.3, dur: 0.8, gain: 0.22 }
    ]),
  piece: () =>
    playNotes([
      { freq: 988, start: 0, dur: 0.09, type: 'square', gain: 0.12 },
      { freq: 1319, start: 0.08, dur: 0.4, type: 'square', gain: 0.12 }
    ]),
  fanfare: () =>
    playNotes([
      { freq: 523, start: 0, dur: 0.14, type: 'sawtooth', gain: 0.1 },
      { freq: 659, start: 0.14, dur: 0.14, type: 'sawtooth', gain: 0.1 },
      { freq: 784, start: 0.28, dur: 0.14, type: 'sawtooth', gain: 0.1 },
      { freq: 1047, start: 0.42, dur: 0.6, type: 'sawtooth', gain: 0.1 },
      { freq: 784, start: 0.42, dur: 0.6, type: 'triangle', gain: 0.15 }
    ]),
  bulles: () =>
    playNotes([0, 0.09, 0.18, 0.27].map((start, i) => ({
      freq: 400 + i * 150,
      slideTo: 900 + i * 250,
      start,
      dur: 0.1,
      gain: 0.3
    }))),
  etoile: () =>
    playNotes([
      { freq: 1760, slideTo: 2637, start: 0, dur: 0.25, type: 'triangle', gain: 0.18 },
      { freq: 2093, start: 0.2, dur: 0.6, gain: 0.12 },
      { freq: 2637, start: 0.3, dur: 0.6, gain: 0.1 },
      { freq: 3136, start: 0.4, dur: 0.7, gain: 0.08 }
    ]),
  oups: () =>
    playNotes([
      { freq: 494, start: 0, dur: 0.18, type: 'triangle', gain: 0.25 },
      { freq: 392, start: 0.16, dur: 0.35, type: 'triangle', gain: 0.25 }
    ]),
  boing: () => playNotes([{ freq: 180, slideTo: 520, start: 0, dur: 0.35, gain: 0.35 }]),
  tambour: () =>
    playNotes([
      { freq: 160, slideTo: 60, start: 0, dur: 0.25, gain: 0.5 },
      { freq: 140, slideTo: 55, start: 0.18, dur: 0.35, gain: 0.45 }
    ]),
  plouf: () => {
    playNotes([{ freq: 900, slideTo: 200, start: 0, dur: 0.18, gain: 0.25 }])
    playNoise(0.1, 0.35, 1800, 300, 0.25)
  },
  aucun: () => {},
  // Effets du jeu « Chasse aux lettres » (pas proposés au choix de l'enfant)
  laser: () =>
    playNotes([
      { freq: 1800, slideTo: 420, start: 0, dur: 0.18, type: 'square', gain: 0.06 },
      { freq: 2400, slideTo: 600, start: 0.01, dur: 0.14, type: 'sawtooth', gain: 0.03 }
    ]),
  explosion: () => {
    playNoise(0, 0.45, 1200, 90, 0.4)
    playNotes([{ freq: 150, slideTo: 40, start: 0, dur: 0.35, gain: 0.3 }])
  },
  impact: () => {
    playNoise(0, 0.35, 500, 80, 0.3)
    playNotes([{ freq: 110, slideTo: 45, start: 0, dur: 0.3, type: 'triangle', gain: 0.25 }])
  },
  pfft: () => playNoise(0, 0.14, 700, 300, 0.12),
  tir: () => {
    playNoise(0, 0.16, 2200, 300, 0.55)
    playNotes([{ freq: 130, slideTo: 45, start: 0, dur: 0.18, gain: 0.35 }])
  },
  verre: () => {
    playNoise(0.03, 0.3, 6000, 2500, 0.18)
    playNotes(
      [3100, 4200, 2600, 5200, 3700].map((freq, i) => ({ freq, start: 0.03 + i * 0.025, dur: 0.12 + (i % 2) * 0.08, gain: 0.05 }))
    )
  },
  ricochet: () => playNotes([{ freq: 2600, slideTo: 900, start: 0.02, dur: 0.32, type: 'triangle', gain: 0.08 }]),
  clonk: () => playNotes([{ freq: 420, slideTo: 300, start: 0, dur: 0.18, type: 'triangle', gain: 0.18 }]),
  aspire: () =>
    playNotes([
      { freq: 220, slideTo: 760, start: 0, dur: 0.32, type: 'triangle', gain: 0.12 },
      { freq: 330, slideTo: 990, start: 0.04, dur: 0.28, gain: 0.08 }
    ]),
  tresor: () =>
    playNotes([
      { freq: 1319, start: 0, dur: 0.18, type: 'triangle', gain: 0.12 },
      { freq: 1568, start: 0.07, dur: 0.18, type: 'triangle', gain: 0.12 },
      { freq: 2093, start: 0.14, dur: 0.35, type: 'triangle', gain: 0.1 }
    ]),
  bloup: () =>
    playNotes([
      { freq: 260, slideTo: 620, start: 0, dur: 0.1, gain: 0.2 },
      { freq: 340, slideTo: 800, start: 0.09, dur: 0.09, gain: 0.15 }
    ]),
  sable: () => playNoise(0, 0.3, 400, 150, 0.2),
  decompte: () => playNotes([{ freq: 660, start: 0, dur: 0.14, type: 'triangle', gain: 0.18 }]),
  partez: () => playNotes([{ freq: 990, start: 0, dur: 0.4, type: 'triangle', gain: 0.2 }])
}

export function playSound(id: string): void {
  try {
    ;(SOUNDS[id] ?? SOUNDS.aucun)()
  } catch {
    // Pas de carte son : le jeu continue sans bruit.
  }
}
