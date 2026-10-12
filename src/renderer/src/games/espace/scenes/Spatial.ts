// Décor « Mission spatiale » : des météorites tombent vers une planète ; la
// fusée de l'enfant les pulvérise au laser.

import { darken, lighten, mix } from '../../../color'
import type { Lettre } from '../engine'
import { alea, entre, lettreContour, SceneTheme } from './base'

interface Etoile {
  x: number
  y: number
  r: number
  vitesse: number
  phase: number
}

interface Tir {
  x1: number
  y1: number
  x2: number
  y2: number
  vie: number
}

interface EtoileFilante {
  x: number
  y: number
  vie: number
}

const ROCHES = ['#8a7a68', '#7a7268', '#6f7584', '#8d735f', '#7d6f80']
const LUEURS = ['#ff9b54', '#ffd166', '#7ee8fa', '#c49bff', '#ff7aa8']

export class Spatial extends SceneTheme {
  private etoiles: Etoile[] = []
  private tirs: Tir[] = []
  private filantes: EtoileFilante[] = []
  private prochaineFilante = 3
  private fuseeX = -1
  private cibleX = -1
  private inclinaison = 0

  hauteurSol() {
    return Math.max(96, this.h * 0.17)
  }

  private laser() {
    return mix(lighten(this.couleurs.principale, 0.25), '#ff4fa3', 0.35)
  }

  // ---------- Fond fixe ----------

  protected dessinerFond(ctx: CanvasRenderingContext2D) {
    const { w, h } = this
    const r = alea(7)
    const ciel = ctx.createLinearGradient(0, 0, 0, h)
    ciel.addColorStop(0, '#03040f')
    ciel.addColorStop(0.55, '#0b1033')
    ciel.addColorStop(1, '#1c1452')
    ctx.fillStyle = ciel
    ctx.fillRect(0, 0, w, h)

    // Nébuleuses
    const nebuleuses: [number, number, number, string][] = [
      [0.18, 0.28, 0.45, 'rgba(124, 58, 237, 0.28)'],
      [0.78, 0.18, 0.4, 'rgba(14, 165, 233, 0.22)'],
      [0.55, 0.55, 0.5, 'rgba(219, 39, 119, 0.16)'],
      [0.1, 0.7, 0.35, 'rgba(45, 212, 191, 0.12)']
    ]
    for (const [nx, ny, nr, c] of nebuleuses) {
      const g = ctx.createRadialGradient(nx * w, ny * h, 0, nx * w, ny * h, nr * Math.max(w, h))
      g.addColorStop(0, c)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    // Étoiles lointaines (fixes)
    for (let i = 0; i < 220; i++) {
      ctx.globalAlpha = entre(r, 0.2, 0.7)
      ctx.fillStyle = r() < 0.15 ? '#ffd9a8' : r() < 0.3 ? '#bcd7ff' : '#ffffff'
      ctx.beginPath()
      ctx.arc(r() * w, r() * h * 0.85, entre(r, 0.3, 1.1), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Planète à anneaux (couleur secondaire de l'enfant)
    const px = w * 0.86
    const py = h * 0.2
    const pr = Math.min(w, h) * 0.075
    this.anneau(ctx, px, py, pr, 'arriere')
    const gp = ctx.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr)
    gp.addColorStop(0, lighten(this.couleurs.secondaire, 0.35))
    gp.addColorStop(0.7, this.couleurs.secondaire)
    gp.addColorStop(1, darken(this.couleurs.secondaire, 0.55))
    ctx.fillStyle = gp
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.fill()
    ctx.save()
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.clip()
    ctx.globalAlpha = 0.18
    ctx.fillStyle = darken(this.couleurs.secondaire, 0.4)
    for (let i = -2; i <= 2; i++) ctx.fillRect(px - pr, py + i * pr * 0.32, pr * 2, pr * 0.1)
    ctx.restore()
    ctx.globalAlpha = 1
    this.anneau(ctx, px, py, pr, 'avant')

    // Petite lune
    const lx = w * 0.12
    const ly = h * 0.12
    const lr = Math.min(w, h) * 0.03
    const gl = ctx.createRadialGradient(lx - lr * 0.3, ly - lr * 0.3, 1, lx, ly, lr)
    gl.addColorStop(0, '#e8e6f0')
    gl.addColorStop(1, '#7c7a8c')
    ctx.fillStyle = gl
    ctx.beginPath()
    ctx.arc(lx, ly, lr, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(80, 78, 96, 0.5)'
    for (const [dx, dy, rr] of [
      [-0.3, -0.1, 0.22],
      [0.25, 0.3, 0.16],
      [0.2, -0.35, 0.12]
    ]) {
      ctx.beginPath()
      ctx.arc(lx + dx * lr, ly + dy * lr, rr * lr, 0, Math.PI * 2)
      ctx.fill()
    }

    // Planète à protéger, en bas (horizon courbe et atmosphère)
    const sol = this.hauteurSol()
    const rayonP = w * 1.6
    const cx = w / 2
    const cy = h - sol * 0.62 + rayonP
    const atmo = ctx.createRadialGradient(cx, cy, rayonP * 0.98, cx, cy, rayonP * 1.05)
    atmo.addColorStop(0, 'rgba(94, 234, 212, 0.55)')
    atmo.addColorStop(0.4, 'rgba(56, 189, 248, 0.25)')
    atmo.addColorStop(1, 'rgba(56, 189, 248, 0)')
    ctx.fillStyle = atmo
    ctx.fillRect(0, h - sol * 1.4, w, sol * 1.4)
    const sur = ctx.createLinearGradient(0, h - sol * 0.62, 0, h)
    sur.addColorStop(0, '#2563eb')
    sur.addColorStop(0.25, '#1e3a8a')
    sur.addColorStop(1, '#0f1b4d')
    ctx.fillStyle = sur
    ctx.beginPath()
    ctx.arc(cx, cy, rayonP, 0, Math.PI * 2)
    ctx.fill()
    // Continents et lumières des villes
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, rayonP, 0, Math.PI * 2)
    ctx.clip()
    const rc = alea(21)
    ctx.fillStyle = 'rgba(52, 211, 153, 0.35)'
    for (let i = 0; i < 7; i++) {
      ctx.beginPath()
      ctx.ellipse(rc() * w, h - sol * entre(rc, 0.1, 0.45), entre(rc, 40, 120), entre(rc, 8, 20), 0, 0, Math.PI * 2)
      ctx.fill()
    }
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = rc() < 0.5 ? 'rgba(255, 214, 120, 0.9)' : 'rgba(255, 245, 200, 0.7)'
      ctx.beginPath()
      ctx.arc(rc() * w, h - sol * entre(rc, 0.05, 0.5), entre(rc, 0.6, 1.6), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    // Liseré lumineux de l'atmosphère
    ctx.strokeStyle = 'rgba(125, 249, 255, 0.7)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, rayonP, Math.PI * 1.25, Math.PI * 1.75)
    ctx.stroke()
  }

  private anneau(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, cote: 'avant' | 'arriere') {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-0.35)
    ctx.beginPath()
    if (cote === 'arriere') ctx.ellipse(0, 0, r * 1.9, r * 0.45, 0, Math.PI, Math.PI * 2)
    else ctx.ellipse(0, 0, r * 1.9, r * 0.45, 0, 0, Math.PI)
    ctx.strokeStyle = lighten(this.couleurs.secondaire, 0.45)
    ctx.globalAlpha = 0.8
    ctx.lineWidth = r * 0.16
    ctx.stroke()
    ctx.globalAlpha = 0.4
    ctx.lineWidth = r * 0.06
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = 1
  }

  // ---------- Animation ----------

  protected mettreAJour(dt: number, lettres: Lettre[]) {
    if (this.etoiles.length === 0) {
      const r = alea(3)
      for (let i = 0; i < 70; i++) {
        const plan = i % 3
        this.etoiles.push({ x: r(), y: r(), r: 0.6 + plan * 0.6, vitesse: 0.015 + plan * 0.025, phase: r() * 6 })
      }
    }
    for (const e of this.etoiles) {
      e.y += e.vitesse * dt
      if (e.y > 1) {
        e.y -= 1
        e.x = Math.random()
      }
    }
    for (const t of this.tirs) t.vie -= dt
    this.tirs = this.tirs.filter((t) => t.vie > 0)

    // Étoiles filantes de temps en temps
    this.prochaineFilante -= dt
    if (this.prochaineFilante <= 0) {
      this.prochaineFilante = 5 + Math.random() * 6
      this.filantes.push({ x: Math.random() * 0.6 + 0.3, y: Math.random() * 0.3, vie: 1 })
    }
    for (const f of this.filantes) {
      f.vie -= dt * 1.4
      f.x -= dt * 0.5
      f.y += dt * 0.25
    }
    this.filantes = this.filantes.filter((f) => f.vie > 0)

    // Fusée : glisse vers sa cible, s'incline, puis revient droite.
    if (this.fuseeX < 0 && this.w > 0) this.fuseeX = this.cibleX = this.w / 2
    const avant = this.fuseeX
    this.fuseeX += (this.cibleX - this.fuseeX) * Math.min(1, dt * 5)
    const vitesse = (this.fuseeX - avant) / Math.max(dt, 0.001)
    this.inclinaison += (Math.max(-0.35, Math.min(0.35, vitesse / 900)) - this.inclinaison) * Math.min(1, dt * 8)

    // Braises qui s'échappent des météorites
    for (const l of lettres) {
      if (Math.random() < dt * 10) {
        const p = this.position(l)
        const R = this.rayon()
        this.ajouter({
          forme: 'rond',
          x: p.x + (Math.random() - 0.5) * R,
          y: p.y - R * 0.7,
          vx: (Math.random() - 0.5) * 20,
          vy: -30 - Math.random() * 30,
          vie: 0.5 + Math.random() * 0.3,
          taille: 1.5 + Math.random() * 2,
          couleur: Math.random() < 0.5 ? '#ffb347' : '#ffe08a'
        })
      }
    }
    // Flamme de la fusée
    if (Math.random() < dt * 40) {
      const base = this.nezEtBase().base
      this.ajouter({
        forme: 'fumee',
        x: base.x + (Math.random() - 0.5) * 6,
        y: base.y + 6,
        vx: (Math.random() - 0.5) * 30,
        vy: 60 + Math.random() * 40,
        vie: 0.35,
        taille: 6 + Math.random() * 5,
        croissance: 18,
        couleur: 'rgba(255, 170, 80, 0.9)'
      })
    }
  }

  protected dessinerDecor(ctx: CanvasRenderingContext2D) {
    const { w, h } = this
    for (const e of this.etoiles) {
      ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(this.t * 1.3 + e.phase))
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(e.x * w, e.y * h, e.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    for (const f of this.filantes) {
      const x = f.x * w
      const y = f.y * h
      const g = ctx.createLinearGradient(x, y, x + 140, y - 70)
      g.addColorStop(0, `rgba(255,255,255,${f.vie})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 140, y - 70)
      ctx.stroke()
    }
  }

  // ---------- Météorites ----------

  protected dessinerLettre(ctx: CanvasRenderingContext2D, l: Lettre, x: number, y: number, visee: boolean) {
    const R = this.rayon()
    const lueur = LUEURS[l.id % LUEURS.length]

    // Traînée de feu au-dessus (la météorite tombe)
    const tr = ctx.createLinearGradient(x, y - R * 3.4, x, y)
    tr.addColorStop(0, 'rgba(255, 140, 50, 0)')
    tr.addColorStop(0.7, 'rgba(255, 150, 60, 0.35)')
    tr.addColorStop(1, 'rgba(255, 220, 140, 0.75)')
    ctx.fillStyle = tr
    ctx.beginPath()
    ctx.moveTo(x - R * 0.85, y - R * 0.1)
    ctx.quadraticCurveTo(x - R * 0.35, y - R * 2, x, y - R * 3.4)
    ctx.quadraticCurveTo(x + R * 0.35, y - R * 2, x + R * 0.85, y - R * 0.1)
    ctx.closePath()
    ctx.fill()

    // Halo coloré
    const halo = ctx.createRadialGradient(x, y, R * 0.6, x, y, R * 1.6)
    halo.addColorStop(0, `${lueur}66`)
    halo.addColorStop(1, `${lueur}00`)
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(x, y, R * 1.6, 0, Math.PI * 2)
    ctx.fill()

    // Roche : polygone irrégulier qui tourne doucement
    const r = alea(l.id * 97 + 13)
    const n = 11
    const angle = this.t * entre(r, -0.6, 0.6)
    const roche = ROCHES[l.id % ROCHES.length]
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const rr = R * entre(r, 0.86, 1.08)
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
      else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
    }
    ctx.closePath()
    const gr = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R * 1.1)
    gr.addColorStop(0, lighten(roche, 0.35))
    gr.addColorStop(0.6, roche)
    gr.addColorStop(1, darken(roche, 0.45))
    ctx.fillStyle = gr
    ctx.fill()
    ctx.strokeStyle = lueur
    ctx.globalAlpha = 0.85
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.globalAlpha = 1
    // Cratères
    for (let i = 0; i < 4; i++) {
      const ca = r() * Math.PI * 2
      const cd = R * entre(r, 0.25, 0.62)
      const cr = R * entre(r, 0.1, 0.2)
      ctx.fillStyle = darken(roche, 0.3)
      ctx.beginPath()
      ctx.ellipse(Math.cos(ca) * cd, Math.sin(ca) * cd, cr, cr * 0.8, ca, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = lighten(roche, 0.2)
      ctx.beginPath()
      ctx.ellipse(Math.cos(ca) * cd + cr * 0.25, Math.sin(ca) * cd + cr * 0.25, cr * 0.5, cr * 0.35, ca, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    lettreContour(ctx, l.char, x, y, R * 1.15, '#ffffff', 'rgba(16, 12, 40, 0.92)')

    if (visee) this.mire(ctx, x, y, R)
  }

  private mire(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
    const rr = R * 1.45
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(this.t * 1.5)
    ctx.strokeStyle = '#7df9ff'
    ctx.lineWidth = 2.5
    ctx.setLineDash([R * 0.35, R * 0.25])
    ctx.beginPath()
    ctx.arc(0, 0, rr, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#7df9ff'
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2)
      ctx.beginPath()
      ctx.moveTo(rr + 4, 0)
      ctx.lineTo(rr + 14, -6)
      ctx.lineTo(rr + 14, 6)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  // ---------- Fusée ----------

  private dimensions() {
    const sol = this.hauteurSol()
    const S = sol * 0.95
    return { S, x: this.fuseeX < 0 ? this.w / 2 : this.fuseeX, y: this.h - sol * 0.48 + Math.sin(this.t * 2.2) * 3 }
  }

  private nezEtBase() {
    const { S, x, y } = this.dimensions()
    const a = this.inclinaison
    const rot = (px: number, py: number) => ({ x: x + px * Math.cos(a) - py * Math.sin(a), y: y + px * Math.sin(a) + py * Math.cos(a) })
    return { nez: rot(0, -S * 0.5), base: rot(0, S * 0.42) }
  }

  protected dessinerEffets(ctx: CanvasRenderingContext2D) {
    const c = this.laser()
    for (const t of this.tirs) {
      const a = Math.min(1, t.vie / 0.18)
      ctx.lineCap = 'round'
      for (const [larg, alpha, coul] of [
        [this.rayon() * 0.7, 0.18, c],
        [this.rayon() * 0.32, 0.55, c],
        [4, 1, '#ffffff']
      ] as [number, number, string][]) {
        ctx.globalAlpha = alpha * a
        ctx.strokeStyle = coul
        ctx.lineWidth = larg
        ctx.beginPath()
        ctx.moveTo(t.x1, t.y1)
        ctx.lineTo(t.x2, t.y2)
        ctx.stroke()
      }
      ctx.globalAlpha = a
      const flash = ctx.createRadialGradient(t.x1, t.y1, 0, t.x1, t.y1, 22)
      flash.addColorStop(0, '#ffffff')
      flash.addColorStop(1, `${c}00`)
      ctx.fillStyle = flash
      ctx.beginPath()
      ctx.arc(t.x1, t.y1, 22, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  protected dessinerJoueur(ctx: CanvasRenderingContext2D) {
    const { S, x, y } = this.dimensions()
    const p = this.couleurs.principale
    const s2 = this.couleurs.secondaire
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(this.inclinaison)

    // Flamme
    const f = 0.85 + 0.15 * Math.sin(this.t * 40) + 0.1 * Math.sin(this.t * 23)
    for (const [larg, long, coul] of [
      [0.16, 0.5, 'rgba(255, 120, 50, 0.85)'],
      [0.11, 0.38, 'rgba(255, 200, 80, 0.95)'],
      [0.06, 0.24, 'rgba(255, 255, 230, 1)']
    ] as [number, number, string][]) {
      ctx.fillStyle = coul
      ctx.beginPath()
      ctx.moveTo(-S * larg, S * 0.4)
      ctx.quadraticCurveTo(-S * larg * 0.6, S * (0.4 + long * f * 0.6), 0, S * (0.4 + long * f))
      ctx.quadraticCurveTo(S * larg * 0.6, S * (0.4 + long * f * 0.6), S * larg, S * 0.4)
      ctx.closePath()
      ctx.fill()
    }

    // Ailerons latéraux
    ctx.fillStyle = s2
    ctx.strokeStyle = darken(s2, 0.35)
    ctx.lineWidth = 2
    for (const sens of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(sens * S * 0.15, S * 0.02)
      ctx.quadraticCurveTo(sens * S * 0.38, S * 0.18, sens * S * 0.36, S * 0.42)
      ctx.lineTo(sens * S * 0.13, S * 0.32)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    // Tuyère
    ctx.fillStyle = '#4b5563'
    ctx.beginPath()
    ctx.moveTo(-S * 0.1, S * 0.33)
    ctx.lineTo(S * 0.1, S * 0.33)
    ctx.lineTo(S * 0.14, S * 0.42)
    ctx.lineTo(-S * 0.14, S * 0.42)
    ctx.closePath()
    ctx.fill()

    // Corps métallique
    const corps = new Path2D()
    corps.moveTo(0, -S * 0.5)
    corps.quadraticCurveTo(S * 0.21, -S * 0.32, S * 0.17, 0)
    corps.lineTo(S * 0.13, S * 0.34)
    corps.lineTo(-S * 0.13, S * 0.34)
    corps.lineTo(-S * 0.17, 0)
    corps.quadraticCurveTo(-S * 0.21, -S * 0.32, 0, -S * 0.5)
    const metal = ctx.createLinearGradient(-S * 0.2, 0, S * 0.2, 0)
    metal.addColorStop(0, '#9aa5bb')
    metal.addColorStop(0.45, '#ffffff')
    metal.addColorStop(1, '#8792a8')
    ctx.fillStyle = metal
    ctx.fill(corps)
    ctx.save()
    ctx.clip(corps)
    // Coiffe et bande aux couleurs de l'enfant
    ctx.fillStyle = p
    ctx.fillRect(-S * 0.3, -S * 0.55, S * 0.6, S * 0.24)
    ctx.fillRect(-S * 0.3, S * 0.12, S * 0.6, S * 0.07)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fillRect(-S * 0.08, -S * 0.55, S * 0.05, S * 0.9)
    ctx.restore()
    ctx.strokeStyle = '#5b6478'
    ctx.lineWidth = 2
    ctx.stroke(corps)

    // Aileron central
    ctx.fillStyle = darken(s2, 0.15)
    ctx.fillRect(-S * 0.025, S * 0.18, S * 0.05, S * 0.24)

    // Hublot
    ctx.fillStyle = '#5b6478'
    ctx.beginPath()
    ctx.arc(0, -S * 0.12, S * 0.085, 0, Math.PI * 2)
    ctx.fill()
    const verre = ctx.createRadialGradient(-S * 0.02, -S * 0.14, 1, 0, -S * 0.12, S * 0.065)
    verre.addColorStop(0, '#e0f7ff')
    verre.addColorStop(1, '#2bb3e6')
    ctx.fillStyle = verre
    ctx.beginPath()
    ctx.arc(0, -S * 0.12, S * 0.065, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // ---------- Événements ----------

  toucher(l: Lettre) {
    const p = this.position(l)
    const R = this.rayon()
    this.cibleX = Math.max(60, Math.min(this.w - 60, p.x))
    const nez = this.nezEtBase().nez
    this.tirs.push({ x1: nez.x, y1: nez.y, x2: p.x, y2: p.y, vie: 0.18 })
    // Explosion : éclair, onde de choc, débris, étincelles, fumée
    this.ajouter({ forme: 'fumee', x: p.x, y: p.y, vx: 0, vy: 0, vie: 0.25, taille: R * 2.4, couleur: 'rgba(255, 244, 214, 1)' })
    this.ajouter({ forme: 'anneau', x: p.x, y: p.y, vx: 0, vy: 0, vie: 0.45, taille: R * 0.6, croissance: R * 6, couleur: '#ffd6a5' })
    const roche = ROCHES[l.id % ROCHES.length]
    this.eclats(p.x, p.y, 12, [roche, lighten(roche, 0.2), darken(roche, 0.3)], R * 0.5, 320, 380)
    this.gerbe(p.x, p.y, 22, {
      forme: 'etincelle',
      couleurs: ['#fff3b0', '#ffb347', LUEURS[l.id % LUEURS.length]],
      vitesse: [180, 560],
      vie: [0.25, 0.6],
      taille: [2, 3.5],
      frein: 2.5
    })
    for (let i = 0; i < 6; i++) {
      this.ajouter({
        forme: 'fumee',
        x: p.x + (Math.random() - 0.5) * R,
        y: p.y + (Math.random() - 0.5) * R,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        vie: 0.8 + Math.random() * 0.5,
        taille: R * 0.6,
        croissance: R * 1.2,
        couleur: 'rgba(140, 120, 170, 0.9)'
      })
    }
    this.secousse = 7
  }

  rater() {
    const nez = this.nezEtBase().nez
    this.gerbe(nez.x, nez.y, 8, { forme: 'fumee', couleurs: ['rgba(180,180,200,0.9)'], vitesse: [20, 60], vie: [0.4, 0.7], taille: [5, 9] })
    this.gerbe(nez.x, nez.y, 6, { forme: 'etincelle', couleurs: ['#ff8a8a'], vitesse: [80, 160], vie: [0.15, 0.3], taille: [1.5, 2.5], angle: [-Math.PI * 0.9, -Math.PI * 0.1] })
    this.secousse = 2
  }

  auSol(l: Lettre) {
    const p = this.position(l)
    const R = this.rayon()
    const yS = this.h - this.hauteurSol()
    this.ajouter({ forme: 'fumee', x: p.x, y: yS, vx: 0, vy: 0, vie: 0.5, taille: R * 3, couleur: 'rgba(255, 150, 80, 0.9)' })
    this.gerbe(p.x, yS, 16, {
      forme: 'etincelle',
      couleurs: ['#ffb347', '#ff7a59', '#ffe08a'],
      vitesse: [120, 320],
      vie: [0.3, 0.6],
      taille: [2, 3],
      angle: [-Math.PI * 0.95, -Math.PI * 0.05],
      gravite: 500
    })
    this.secousse = 5
  }
}
