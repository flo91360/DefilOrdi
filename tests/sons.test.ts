import { beforeEach, describe, expect, it, vi } from 'vitest'

// Faux AudioContext : il note ce que les sons programment et relève les
// valeurs que la vraie Web Audio API refuserait (rampe exponentielle vers 0,
// fréquence hors limites, instant négatif ou non fini).
const erreurs: string[] = []
const journal = { sources: 0, oscillateurs: 0, filtres: [] as string[] }

const SAMPLE_RATE = 48000

function parametre(nom: string) {
  const verifierTemps = (t: number) => {
    if (!Number.isFinite(t) || t < 0) erreurs.push(`${nom} : instant invalide ${t}`)
  }
  const verifierValeur = (v: number) => {
    if (!Number.isFinite(v)) erreurs.push(`${nom} : valeur non finie ${v}`)
    if (nom === 'frequency' && (v <= 0 || v > SAMPLE_RATE / 2)) erreurs.push(`${nom} : fréquence hors limites ${v}`)
  }
  return {
    value: 0,
    setValueAtTime(v: number, t: number) {
      verifierValeur(v)
      verifierTemps(t)
    },
    exponentialRampToValueAtTime(v: number, t: number) {
      verifierValeur(v)
      verifierTemps(t)
      if (v <= 0) erreurs.push(`${nom} : rampe exponentielle vers ${v}`)
    }
  }
}

function noeud<T extends object>(extra: T) {
  const n = { connect: (cible: unknown) => cible, ...extra }
  return n
}

class FauxAudioContext {
  state = 'running'
  currentTime = 1
  sampleRate = SAMPLE_RATE
  destination = noeud({})
  resume() {
    return Promise.resolve()
  }
  createGain() {
    return noeud({ gain: parametre('gain') })
  }
  createOscillator() {
    journal.oscillateurs++
    return noeud({
      type: 'sine',
      frequency: parametre('frequency'),
      start: (t: number) => t < 0 && erreurs.push('oscillateur : départ négatif'),
      stop: () => {}
    })
  }
  createBuffer(_canaux: number, longueur: number) {
    if (longueur < 1) erreurs.push(`tampon vide (${longueur})`)
    const data = new Float32Array(Math.max(1, longueur))
    return { getChannelData: () => data }
  }
  createBufferSource() {
    journal.sources++
    return noeud({ buffer: null as unknown, start: (t: number) => t < 0 && erreurs.push('source : départ négatif') })
  }
  createBiquadFilter() {
    const f = noeud({ type: 'lowpass', Q: parametre('Q'), frequency: parametre('frequency') })
    return new Proxy(f, {
      set(cible, cle, valeur) {
        if (cle === 'type') journal.filtres.push(valeur as string)
        return Reflect.set(cible, cle, valeur)
      }
    })
  }
}

vi.stubGlobal('AudioContext', FauxAudioContext)
const { playSound } = await import('../src/renderer/src/sounds')

beforeEach(() => {
  erreurs.length = 0
  journal.sources = 0
  journal.oscillateurs = 0
  journal.filtres = []
})

describe('Sons du stand de tir (cow-boy)', () => {
  it('le coup de revolver mêle claquement, souffle grave et écho', () => {
    playSound('tir')
    expect(erreurs).toEqual([])
    expect(journal.sources).toBeGreaterThanOrEqual(3)
    expect(journal.oscillateurs).toBeGreaterThanOrEqual(1)
    expect(journal.filtres).toContain('highpass')
    expect(journal.filtres).toContain('lowpass')
  })

  it('la bouteille qui casse a un fracas et de nombreux éclats de verre', () => {
    for (let i = 0; i < 30; i++) playSound('verre')
    expect(erreurs).toEqual([])
    expect(journal.oscillateurs / 30).toBeGreaterThanOrEqual(20)
    expect(journal.sources / 30).toBeGreaterThanOrEqual(4)
    expect(journal.filtres).toContain('highpass')
  })

  it('les autres sons restent valides', () => {
    for (const id of ['carillon', 'plouf', 'explosion', 'impact', 'ricochet', 'clonk', 'sable', 'tic', 'inconnu']) playSound(id)
    expect(erreurs).toEqual([])
  })
})
