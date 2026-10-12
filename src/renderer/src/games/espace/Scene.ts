// Dessin de la scène sur un canvas : ciel étoilé, lettres-météorites,
// vaisseau aux couleurs de l'enfant, tirs de laser et explosions.
// Purement visuel : la logique du jeu est dans engine.ts.

import { darken, lighten } from '../../color'
import type { Lettre } from './engine'

interface Etoile {
  x: number
  y: number
  r: number
  vitesse: number
}

interface Particule {
  x: number
  y: number
  vx: number
  vy: number
  vie: number // secondes restantes
  couleur: string
}

interface Tir {
  x: number
  y: number
  vie: number
}

interface Flash {
  x: number
  vie: number
}

// Couleurs des météorites, attribuées selon l'identifiant de la lettre.
const TEINTES = ['#ff8a5b', '#ffd43b', '#7ee081', '#5ec8ff', '#b28dff', '#ff7ac6']

export class Scene {
  private etoiles: Etoile[] = []
  private particules: Particule[] = []
  private tirs: Tir[] = []
  private flashs: Flash[] = []
  private vaisseauX = 0.5
  private cibleX = 0.5
  private t = 0

  constructor(
    private readonly couleur: string,
    private readonly couleur2: string
  ) {
    for (let i = 0; i < 90; i++) {
      this.etoiles.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.3, vitesse: Math.random() * 0.02 + 0.005 })
    }
  }

  // Rayon d'une lettre-météorite en pixels.
  static rayon(h: number): number {
    return Math.max(24, Math.min(44, h * 0.048))
  }

  static hauteurSol(h: number): number {
    return Math.max(70, h * 0.13)
  }

  tirSur(l: Lettre) {
    this.cibleX = l.x
    this.tirs.push({ x: l.x, y: l.y, vie: 0.18 })
    const couleur = TEINTES[l.id % TEINTES.length]
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2
      const v = 0.15 + Math.random() * 0.35
      this.particules.push({
        x: l.x,
        y: l.y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        vie: 0.5 + Math.random() * 0.4,
        couleur: i % 3 === 0 ? '#ffffff' : couleur
      })
    }
  }

  auSol(l: Lettre) {
    this.flashs.push({ x: l.x, vie: 0.6 })
  }

  avancer(dt: number) {
    this.t += dt
    for (const e of this.etoiles) {
      e.y += e.vitesse * dt
      if (e.y > 1) e.y -= 1
    }
    for (const p of this.particules) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.4 * dt
      p.vie -= dt
    }
    this.particules = this.particules.filter((p) => p.vie > 0)
    for (const t of this.tirs) t.vie -= dt
    this.tirs = this.tirs.filter((t) => t.vie > 0)
    for (const f of this.flashs) f.vie -= dt
    this.flashs = this.flashs.filter((f) => f.vie > 0)
    // Le vaisseau glisse vers sa dernière cible.
    this.vaisseauX += (this.cibleX - this.vaisseauX) * Math.min(1, dt * 6)
  }

  dessiner(ctx: CanvasRenderingContext2D, w: number, h: number, lettres: Lettre[], visee: number | null) {
    const sol = Scene.hauteurSol(h)
    const zone = h - sol // hauteur où tombent les lettres
    const R = Scene.rayon(h)
    const px = (x: number) => R + x * (w - 2 * R)
    const py = (y: number) => R + y * (zone - 2 * R)

    // Ciel
    const ciel = ctx.createLinearGradient(0, 0, 0, h)
    ciel.addColorStop(0, '#0b1026')
    ciel.addColorStop(1, '#1b1f4a')
    ctx.fillStyle = ciel
    ctx.fillRect(0, 0, w, h)
    for (const e of this.etoiles) {
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(this.t * 0.8 + e.x * 20))
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(e.x * w, e.y * h, e.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Planète décorative
    ctx.fillStyle = darken(this.couleur2, 0.2)
    ctx.beginPath()
    ctx.arc(w * 0.86, h * 0.16, Math.min(w, h) * 0.07, 0, Math.PI * 2)
    ctx.fill()

    // Sol
    const yS = h - sol
    const g = ctx.createLinearGradient(0, yS, 0, h)
    g.addColorStop(0, '#2c3170')
    g.addColorStop(1, '#151838')
    ctx.fillStyle = g
    ctx.fillRect(0, yS, w, sol)
    ctx.strokeStyle = '#6c74ff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, yS)
    ctx.lineTo(w, yS)
    ctx.stroke()
    for (const f of this.flashs) {
      const r = ctx.createRadialGradient(px(f.x), yS, 0, px(f.x), yS, R * 3)
      r.addColorStop(0, `rgba(255, 120, 120, ${f.vie})`)
      r.addColorStop(1, 'rgba(255, 120, 120, 0)')
      ctx.fillStyle = r
      ctx.fillRect(px(f.x) - R * 3, yS - R * 3, R * 6, R * 6)
    }

    // Vaisseau
    const vx = px(this.vaisseauX)
    const vy = yS + sol * 0.5

    // Tirs de laser (du canon vers la lettre)
    for (const t of this.tirs) {
      ctx.strokeStyle = `rgba(255, 90, 140, ${Math.min(1, t.vie * 8)})`
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(vx, vy - sol * 0.55)
      ctx.lineTo(px(t.x), py(t.y))
      ctx.stroke()
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, t.vie * 8)})`
      ctx.lineWidth = 2
      ctx.stroke()
    }

    this.dessinerVaisseau(ctx, vx, vy - sol * 0.05, sol * 0.55)

    // Lettres
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `900 ${Math.round(R * 1.15)}px Nunito, system-ui, sans-serif`
    for (const l of lettres) {
      const x = px(l.x)
      const y = py(l.y)
      const teinte = TEINTES[l.id % TEINTES.length]
      // traînée
      const tr = ctx.createLinearGradient(x, y - R * 2.4, x, y)
      tr.addColorStop(0, 'rgba(255,255,255,0)')
      tr.addColorStop(1, `${teinte}66`)
      ctx.fillStyle = tr
      ctx.beginPath()
      ctx.moveTo(x - R * 0.6, y)
      ctx.lineTo(x, y - R * 2.4)
      ctx.lineTo(x + R * 0.6, y)
      ctx.fill()
      // météorite
      const m = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.2, x, y, R)
      m.addColorStop(0, lighten(teinte, 0.35))
      m.addColorStop(1, darken(teinte, 0.25))
      ctx.fillStyle = m
      ctx.beginPath()
      ctx.arc(x, y, R, 0, Math.PI * 2)
      ctx.fill()
      if (l.id === visee) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.arc(x, y, R + 7, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
      ctx.fillStyle = '#1b1f3a'
      ctx.fillText(l.char, x, y + R * 0.06)
    }

    // Particules
    for (const p of this.particules) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.vie * 2))
      ctx.fillStyle = p.couleur
      ctx.beginPath()
      ctx.arc(px(p.x), py(p.y), 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private dessinerVaisseau(ctx: CanvasRenderingContext2D, x: number, y: number, taille: number) {
    const s = taille
    // flamme
    const f = 0.8 + 0.2 * Math.sin(this.t * 30)
    ctx.fillStyle = '#ffb347'
    ctx.beginPath()
    ctx.moveTo(x - s * 0.22, y + s * 0.55)
    ctx.lineTo(x, y + s * (0.55 + 0.45 * f))
    ctx.lineTo(x + s * 0.22, y + s * 0.55)
    ctx.fill()
    // ailes
    ctx.fillStyle = this.couleur2
    ctx.beginPath()
    ctx.moveTo(x - s * 0.25, y)
    ctx.lineTo(x - s * 0.85, y + s * 0.6)
    ctx.lineTo(x - s * 0.2, y + s * 0.5)
    ctx.moveTo(x + s * 0.25, y)
    ctx.lineTo(x + s * 0.85, y + s * 0.6)
    ctx.lineTo(x + s * 0.2, y + s * 0.5)
    ctx.fill()
    // corps
    ctx.fillStyle = this.couleur
    ctx.beginPath()
    ctx.moveTo(x, y - s * 0.95)
    ctx.quadraticCurveTo(x + s * 0.42, y - s * 0.3, x + s * 0.3, y + s * 0.6)
    ctx.lineTo(x - s * 0.3, y + s * 0.6)
    ctx.quadraticCurveTo(x - s * 0.42, y - s * 0.3, x, y - s * 0.95)
    ctx.fill()
    ctx.strokeStyle = darken(this.couleur, 0.3)
    ctx.lineWidth = 2
    ctx.stroke()
    // hublot
    ctx.fillStyle = '#dff4ff'
    ctx.beginPath()
    ctx.arc(x, y - s * 0.2, s * 0.17, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = darken(this.couleur, 0.35)
    ctx.stroke()
  }
}
