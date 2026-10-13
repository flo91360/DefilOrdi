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
  // Durée de la montée en secondes (0,015 par défaut ; plus court = plus sec).
  attack?: number
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
    g.gain.exponentialRampToValueAtTime(peak, t0 + n.start + (n.attack ?? 0.015))
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.start + n.dur)
    osc.connect(g).connect(out)
    osc.start(t0 + n.start)
    osc.stop(t0 + n.start + n.dur + 0.05)
  }
}

interface Bruit {
  start: number
  dur: number
  fromHz: number
  toHz?: number
  gain: number
  filtre?: BiquadFilterType
  q?: number
  // Montée en secondes ; sans montée, le bruit démarre directement au maximum.
  attack?: number
}

// Bruit blanc filtré dont le volume décroît jusqu'au silence.
function bruit(b: Bruit): void {
  const ac = audio()
  const len = Math.max(1, Math.floor(ac.sampleRate * b.dur))
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const ch = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = b.filtre ?? 'bandpass'
  filter.Q.value = b.q ?? 2
  const g = ac.createGain()
  const t0 = ac.currentTime + 0.02 + b.start
  filter.frequency.setValueAtTime(b.fromHz, t0)
  filter.frequency.exponentialRampToValueAtTime(b.toHz ?? b.fromHz, t0 + b.dur)
  const peak = Math.max(0.0001, b.gain * masterVolume)
  if (b.attack) {
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(peak, t0 + b.attack)
  } else {
    g.gain.setValueAtTime(peak, t0)
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + b.dur)
  src.connect(filter).connect(g).connect(ac.destination)
  src.start(t0)
}

function playNoise(start: number, dur: number, fromHz: number, toHz: number, gain: number): void {
  bruit({ start, dur, fromHz, toHz, gain })
}

const hasard = (min: number, max: number) => min + Math.random() * (max - min)

// Coup de revolver : claquement sec, souffle grave, puis écho dans le canyon.
function coupDeRevolver(): void {
  bruit({ start: 0, dur: 0.07, fromHz: 1800, gain: 0.45, filtre: 'highpass', q: 0.7 })
  bruit({ start: 0, dur: 0.32, fromHz: 4000, toHz: 220, gain: 0.5, filtre: 'lowpass', q: 0.8 })
  playNotes([{ freq: 140, slideTo: 42, start: 0, dur: 0.22, gain: 0.4, attack: 0.003 }])
  // Écho qui revient des falaises, de plus en plus étouffé
  bruit({ start: 0.24, dur: 0.38, fromHz: 1400, toHz: 260, gain: 0.1, filtre: 'lowpass', q: 0.7, attack: 0.01 })
  bruit({ start: 0.52, dur: 0.45, fromHz: 900, toHz: 200, gain: 0.04, filtre: 'lowpass', q: 0.7, attack: 0.02 })
}

// Bouteille qui vole en éclats : fracas aigu, scintillement, puis tintement
// des morceaux de verre qui retombent. Le hasard rend chaque bouteille unique.
function bouteilleCassee(): void {
  bruit({ start: 0, dur: 0.1, fromHz: 2600, gain: 0.32, filtre: 'highpass', q: 0.7 })
  bruit({ start: 0, dur: 0.18, fromHz: 1700, toHz: 900, gain: 0.14, filtre: 'bandpass', q: 1.2 })
  bruit({ start: 0.01, dur: 0.5, fromHz: 7500, toHz: 3800, gain: 0.12, filtre: 'bandpass', q: 1.5 })

  const eclats: Note[] = []
  const n = 16
  for (let i = 0; i < n; i++) {
    // Plus d'éclats au début, quelques-uns plus tard
    const start = 0.005 + 0.6 * Math.pow(Math.random(), 1.7)
    const freq = hasard(2200, 6400)
    const gain = 0.075 * (1 - start * 0.9)
    const dur = hasard(0.05, 0.16)
    eclats.push({ freq, start, dur, gain, attack: 0.002 })
    // Harmonique non entière : c'est elle qui donne le timbre « verre »
    eclats.push({ freq: Math.min(12000, freq * 2.76), start, dur: dur * 0.6, gain: gain * 0.4, attack: 0.002 })
  }
  playNotes(eclats)

  // Petits morceaux qui rebondissent sur le comptoir
  for (let i = 0; i < 6; i++) {
    bruit({ start: hasard(0.22, 0.7), dur: hasard(0.015, 0.03), fromHz: hasard(4000, 8000), gain: 0.08, filtre: 'bandpass', q: 3 })
  }
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
  tir: coupDeRevolver,
  verre: bouteilleCassee,
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
  partez: () => playNotes([{ freq: 990, start: 0, dur: 0.4, type: 'triangle', gain: 0.2 }]),
  // Petit bac : la roue des lettres qui tourne
  tic: () => playNotes([{ freq: 1250, start: 0, dur: 0.05, type: 'triangle', gain: 0.07, attack: 0.004 }])
}

export function playSound(id: string): void {
  try {
    ;(SOUNDS[id] ?? SOUNDS.aucun)()
  } catch {
    // Pas de carte son : le jeu continue sans bruit.
  }
}
