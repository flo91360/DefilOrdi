// Décor « Stand de tir » : des bouteilles en verre descendent au bout de
// cordes ; le cow-boy les fait éclater avec son revolver.

import { darken, lighten } from '../../../color'
import { playSound } from '../../../sounds'
import type { Lettre } from '../engine'
import { alea, entre, type Fantome, POLICE, roundRect, SceneTheme } from './base'

const VERRES = [
  { corps: '#2f9e44', alpha: 0.88 },
  { corps: '#9c5a1f', alpha: 0.9 },
  { corps: '#1c7ed6', alpha: 0.85 },
  { corps: '#8fd3c9', alpha: 0.7 }
]

interface Trace {
  x1: number
  y1: number
  x2: number
  y2: number
  vie: number
}

interface Trou {
  x: number
  y: number
  vie: number
}

interface Virevoltant {
  x: number
  vitesse: number
  rot: number
}

export class Western extends SceneTheme {
  private cowboyX = -1
  private cibleX = -1
  private visee: { x: number; y: number } | null = null
  private recul = 0
  private traces: Trace[] = []
  private trous: Trou[] = []
  private virevoltant: Virevoltant | null = null
  private prochainVirevoltant = 4

  hauteurSol() {
    return Math.max(110, this.h * 0.2)
  }

  private hauteurAuvent() {
    return Math.max(52, this.h * 0.11)
  }

  private yPoutre() {
    return this.hauteurAuvent() + 14
  }

  private yComptoir() {
    return this.h - this.hauteurSol()
  }

  private tailleBouteille() {
    const R = this.rayon()
    return { H: R * 3.1, W: R * 1.55 }
  }

  private poteau() {
    return Math.max(18, this.w * 0.03)
  }

  protected marge() {
    return this.poteau() + this.rayon() + 16
  }

  // Corde de la bouteille : son point d'accroche, sa longueur et son angle.
  private suspension(l: Lettre) {
    const m = this.marge()
    const { H } = this.tailleBouteille()
    const ax = m + l.x * (this.w - 2 * m)
    const ay = this.yPoutre()
    const min = this.rayon() * 0.5
    const max = this.yComptoir() - H - ay
    const L = min + Math.min(1, l.y) * Math.max(0, max - min)
    const angle = Math.sin(this.t * 1.7 + l.id * 1.9) * 0.07
    return { ax, ay, L, angle }
  }

  position(l: Lettre) {
    const { ax, ay, L, angle } = this.suspension(l)
    const { H } = this.tailleBouteille()
    const d = L + H * 0.62 // centre de l'étiquette
    return { x: ax - Math.sin(angle) * d, y: ay + Math.cos(angle) * d }
  }

  // ---------- Fond fixe ----------

  protected dessinerFond(ctx: CanvasRenderingContext2D) {
    const { w, h } = this
    const yC = this.yComptoir()
    const horizon = this.yPoutre() + (yC - this.yPoutre()) * 0.62

    const ciel = ctx.createLinearGradient(0, 0, 0, horizon)
    ciel.addColorStop(0, '#5b4b9a')
    ciel.addColorStop(0.35, '#e0708a')
    ciel.addColorStop(0.7, '#ffae6b')
    ciel.addColorStop(1, '#ffdca0')
    ctx.fillStyle = ciel
    ctx.fillRect(0, 0, w, horizon + 2)

    // Soleil couchant
    const sx = w * 0.62
    const sy = horizon - h * 0.02
    const sr = Math.min(w, h) * 0.11
    const halo = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 3)
    halo.addColorStop(0, 'rgba(255, 236, 170, 0.7)')
    halo.addColorStop(1, 'rgba(255, 200, 120, 0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, w, horizon)
    ctx.fillStyle = '#fff1c1'
    ctx.beginPath()
    ctx.arc(sx, sy, sr, Math.PI, Math.PI * 2)
    ctx.fill()

    // Mesas lointaines puis plus proches
    const r = alea(11)
    for (const [couleur, haut, n] of [
      ['#c8735a', 0.22, 4],
      ['#a4553f', 0.13, 5]
    ] as [string, number, number][]) {
      ctx.fillStyle = couleur
      ctx.beginPath()
      ctx.moveTo(0, horizon)
      let x = 0
      while (x < w) {
        const larg = entre(r, w * 0.08, w * 0.22)
        const hh = (horizon - this.yPoutre()) * haut * entre(r, 0.5, 1.2)
        if (r() < 0.6 && n > 0) {
          ctx.lineTo(x + larg * 0.15, horizon - hh)
          ctx.lineTo(x + larg * 0.85, horizon - hh)
        }
        ctx.lineTo(x + larg, horizon)
        x += larg
      }
      ctx.lineTo(w, horizon)
      ctx.closePath()
      ctx.fill()
    }

    // Sol du désert
    const sol = ctx.createLinearGradient(0, horizon, 0, yC)
    sol.addColorStop(0, '#e9b97a')
    sol.addColorStop(1, '#c98c4f')
    ctx.fillStyle = sol
    ctx.fillRect(0, horizon, w, yC - horizon)
    ctx.strokeStyle = 'rgba(150, 90, 40, 0.25)'
    ctx.lineWidth = 2
    for (let i = 0; i < 14; i++) {
      const y = horizon + entre(r, 0.1, 0.95) * (yC - horizon)
      const x = r() * w
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + entre(r, 30, 90), y)
      ctx.stroke()
    }

    // Cactus
    for (const [cx, taille] of [
      [0.16, 1],
      [0.82, 0.8],
      [0.4, 0.55]
    ]) {
      this.cactus(ctx, cx * w, horizon + (yC - horizon) * 0.35, (yC - horizon) * 0.55 * taille)
    }

    // Poteaux du stand
    const pw = this.poteau()
    for (const x of [0, w - pw]) {
      const bois = ctx.createLinearGradient(x, 0, x + pw, 0)
      bois.addColorStop(0, '#6b3f1f')
      bois.addColorStop(0.5, '#8b5a2b')
      bois.addColorStop(1, '#5a3418')
      ctx.fillStyle = bois
      ctx.fillRect(x, 0, pw, yC)
    }

    // Poutre
    const yP = this.yPoutre()
    const poutre = ctx.createLinearGradient(0, yP - 18, 0, yP)
    poutre.addColorStop(0, '#8b5a2b')
    poutre.addColorStop(1, '#5a3418')
    ctx.fillStyle = poutre
    ctx.fillRect(0, yP - 18, w, 18)

    // Auvent rayé avec bord festonné
    const Ha = this.hauteurAuvent()
    const bande = Math.max(40, w / 18)
    for (let x = 0, i = 0; x < w; x += bande, i++) {
      ctx.fillStyle = i % 2 === 0 ? '#c0392b' : '#f6e7c8'
      ctx.fillRect(x, 0, bande, Ha)
      ctx.beginPath()
      ctx.arc(x + bande / 2, Ha, bande / 2, 0, Math.PI)
      ctx.fill()
    }
    const ombre = ctx.createLinearGradient(0, 0, 0, Ha)
    ombre.addColorStop(0, 'rgba(0,0,0,0.25)')
    ombre.addColorStop(0.4, 'rgba(0,0,0,0)')
    ctx.fillStyle = ombre
    ctx.fillRect(0, 0, w, Ha)

    // Comptoir en planches
    const haut = ctx.createLinearGradient(0, yC, 0, yC + 18)
    haut.addColorStop(0, '#c48a4f')
    haut.addColorStop(1, '#8b5a2b')
    ctx.fillStyle = haut
    ctx.fillRect(0, yC, w, 18)
    ctx.fillStyle = '#6b3f1f'
    ctx.fillRect(0, yC + 18, w, h - yC - 18)
    ctx.strokeStyle = 'rgba(40, 20, 8, 0.45)'
    ctx.lineWidth = 2
    for (let x = 0; x < w; x += 70) {
      ctx.beginPath()
      ctx.moveTo(x, yC + 18)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(255, 220, 170, 0.12)'
    for (let x = 35; x < w; x += 70) {
      ctx.beginPath()
      ctx.moveTo(x - 20, yC + 40)
      ctx.quadraticCurveTo(x, yC + 60, x + 20, yC + 45)
      ctx.stroke()
    }
    // Cibles peintes sur le comptoir
    for (let x = w * 0.12; x < w; x += w * 0.25) {
      const cy = yC + 18 + (h - yC - 18) * 0.5
      const cr = Math.min(26, (h - yC) * 0.2)
      for (const [rr, c] of [
        [1, '#f6e7c8'],
        [0.68, '#c0392b'],
        [0.36, '#f6e7c8']
      ] as [number, string][]) {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(x, cy, cr * rr, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private cactus(ctx: CanvasRenderingContext2D, x: number, yBas: number, H: number) {
    const L = H * 0.22
    ctx.fillStyle = '#4f7f3a'
    roundRect(ctx, x - L / 2, yBas - H, L, H, L / 2)
    ctx.fill()
    roundRect(ctx, x - L * 1.6, yBas - H * 0.62, L * 0.8, H * 0.32, L * 0.4)
    ctx.fill()
    roundRect(ctx, x - L * 1.6, yBas - H * 0.45, L * 1.4, L * 0.8, L * 0.4)
    ctx.fill()
    roundRect(ctx, x + L * 0.8, yBas - H * 0.78, L * 0.8, H * 0.36, L * 0.4)
    ctx.fill()
    roundRect(ctx, x + L * 0.2, yBas - H * 0.5, L * 1.4, L * 0.8, L * 0.4)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, x - L * 0.25, yBas - H * 0.95, L * 0.18, H * 0.85, L * 0.1)
    ctx.fill()
  }

  // ---------- Animation ----------

  protected mettreAJour(dt: number) {
    if (this.cowboyX < 0 && this.w > 0) this.cowboyX = this.cibleX = this.w / 2
    this.cowboyX += (this.cibleX - this.cowboyX) * Math.min(1, dt * 4)
    this.recul = Math.max(0, this.recul - dt * 6)
    for (const t of this.traces) t.vie -= dt
    this.traces = this.traces.filter((t) => t.vie > 0)
    for (const t of this.trous) t.vie -= dt
    this.trous = this.trous.filter((t) => t.vie > 0)

    this.prochainVirevoltant -= dt
    if (!this.virevoltant && this.prochainVirevoltant <= 0) {
      this.virevoltant = { x: -40, vitesse: 70 + Math.random() * 50, rot: 0 }
    }
    if (this.virevoltant) {
      this.virevoltant.x += this.virevoltant.vitesse * dt
      this.virevoltant.rot += this.virevoltant.vitesse * dt / 18
      if (this.virevoltant.x > this.w + 60) {
        this.virevoltant = null
        this.prochainVirevoltant = 8 + Math.random() * 8
      }
    }
  }

  protected dessinerDecor(ctx: CanvasRenderingContext2D) {
    const yC = this.yComptoir()
    const horizon = this.yPoutre() + (yC - this.yPoutre()) * 0.62

    // Virevoltant qui roule dans le désert
    if (this.virevoltant) {
      const v = this.virevoltant
      const r = 16
      const y = horizon + (yC - horizon) * 0.55 - Math.abs(Math.sin(v.rot * 1.2)) * 12
      ctx.save()
      ctx.translate(v.x, y)
      ctx.rotate(v.rot)
      ctx.strokeStyle = '#8b6b3e'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 7; i++) {
        ctx.beginPath()
        ctx.ellipse(0, 0, r, r * 0.55, (i * Math.PI) / 7, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    // Impacts de balles dans le bois
    for (const t of this.trous) {
      ctx.globalAlpha = Math.min(1, t.vie)
      ctx.fillStyle = '#2a1608'
      ctx.beginPath()
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 220, 170, 0.5)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(t.x, t.y, 6, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Ampoules de fête foraine sous l'auvent
    const Ha = this.hauteurAuvent()
    const bande = Math.max(40, this.w / 18)
    for (let x = bande / 2, i = 0; x < this.w; x += bande, i++) {
      const allume = Math.floor(this.t * 2.5 + i) % 3 !== 0
      const y = Ha + bande / 2 + 4
      if (allume) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 14)
        g.addColorStop(0, 'rgba(255, 230, 140, 0.9)')
        g.addColorStop(1, 'rgba(255, 200, 80, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, 14, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = allume ? '#fff3b0' : '#b08a4a'
      ctx.beginPath()
      ctx.arc(x, y, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ---------- Bouteilles ----------

  private bouteille(ctx: CanvasRenderingContext2D, l: Lettre, avecCorde: boolean, L: number) {
    const { H, W } = this.tailleBouteille()
    const v = VERRES[l.id % VERRES.length]
    const y0 = L

    if (avecCorde) {
      ctx.strokeStyle = '#6b4f2a'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, y0 + H * 0.02)
      ctx.stroke()
      ctx.fillStyle = '#6b4f2a'
      ctx.beginPath()
      ctx.arc(0, y0 + H * 0.1, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // Bouchon
    ctx.fillStyle = '#b07a42'
    roundRect(ctx, -W * 0.13, y0, W * 0.26, H * 0.09, 3)
    ctx.fill()

    // Verre
    const forme = new Path2D()
    forme.moveTo(-W * 0.16, y0 + H * 0.08)
    forme.lineTo(W * 0.16, y0 + H * 0.08)
    forme.lineTo(W * 0.16, y0 + H * 0.12)
    forme.lineTo(W * 0.13, y0 + H * 0.13)
    forme.lineTo(W * 0.13, y0 + H * 0.28)
    forme.bezierCurveTo(W * 0.13, y0 + H * 0.37, W * 0.5, y0 + H * 0.36, W * 0.5, y0 + H * 0.47)
    forme.lineTo(W * 0.5, y0 + H * 0.94)
    forme.quadraticCurveTo(W * 0.5, y0 + H, W * 0.42, y0 + H)
    forme.lineTo(-W * 0.42, y0 + H)
    forme.quadraticCurveTo(-W * 0.5, y0 + H, -W * 0.5, y0 + H * 0.94)
    forme.lineTo(-W * 0.5, y0 + H * 0.47)
    forme.bezierCurveTo(-W * 0.5, y0 + H * 0.36, -W * 0.13, y0 + H * 0.37, -W * 0.13, y0 + H * 0.28)
    forme.lineTo(-W * 0.13, y0 + H * 0.13)
    forme.lineTo(-W * 0.16, y0 + H * 0.12)
    forme.closePath()
    const g = ctx.createLinearGradient(-W * 0.5, 0, W * 0.5, 0)
    g.addColorStop(0, darken(v.corps, 0.35))
    g.addColorStop(0.35, lighten(v.corps, 0.15))
    g.addColorStop(0.65, v.corps)
    g.addColorStop(1, darken(v.corps, 0.45))
    ctx.globalAlpha = v.alpha
    ctx.fillStyle = g
    ctx.fill(forme)
    ctx.globalAlpha = 1
    ctx.strokeStyle = darken(v.corps, 0.5)
    ctx.lineWidth = 1.5
    ctx.stroke(forme)

    // Reflets
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    roundRect(ctx, -W * 0.36, y0 + H * 0.5, W * 0.08, H * 0.4, W * 0.04)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    roundRect(ctx, -W * 0.08, y0 + H * 0.15, W * 0.05, H * 0.12, W * 0.025)
    ctx.fill()

    // Étiquette
    const ex = -W * 0.42
    const ey = y0 + H * 0.5
    const ew = W * 0.84
    const eh = H * 0.34
    ctx.fillStyle = '#f7ecd2'
    roundRect(ctx, ex, ey, ew, eh, 4)
    ctx.fill()
    ctx.strokeStyle = '#a0703c'
    ctx.lineWidth = 1.5
    roundRect(ctx, ex + 3, ey + 3, ew - 6, eh - 6, 3)
    ctx.stroke()
    ctx.font = `900 ${Math.round(Math.min(ew * 0.82, eh * 0.95))}px ${POLICE}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#3b2412'
    ctx.fillText(l.char, 0, ey + eh * 0.54)
  }

  protected dessinerLettre(ctx: CanvasRenderingContext2D, l: Lettre, x: number, y: number, visee: boolean) {
    const { ax, ay, L, angle } = this.suspension(l)
    ctx.save()
    ctx.translate(ax, ay)
    ctx.rotate(angle)
    this.bouteille(ctx, l, true, L)
    ctx.restore()
    if (visee) {
      this.visee = { x, y }
      this.mire(ctx, x, y)
    }
  }

  private mire(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const R = this.rayon() * (1.05 + Math.sin(this.t * 6) * 0.05)
    ctx.strokeStyle = '#e03131'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      ctx.moveTo(x + dx * R * 0.55, y + dy * R * 0.55)
      ctx.lineTo(x + dx * R * 1.35, y + dy * R * 1.35)
    }
    ctx.stroke()
  }

  protected dessinerFantome(ctx: CanvasRenderingContext2D, f: Fantome) {
    const a = 1 - f.age / f.duree
    if (f.type === 'corde') {
      // Bout de corde qui remonte après le tir
      const { ax, ay, L } = this.suspension(f.lettre)
      const long = L * a * a
      ctx.strokeStyle = '#6b4f2a'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.quadraticCurveTo(ax + Math.sin(f.age * 20) * 10 * a, ay + long / 2, ax, ay + long)
      ctx.stroke()
    } else if (f.type === 'posee') {
      // Bouteille arrivée sur le comptoir : elle s'efface
      const { H } = this.tailleBouteille()
      ctx.save()
      ctx.globalAlpha = a
      ctx.translate(f.x, this.yComptoir() - H)
      this.bouteille(ctx, f.lettre, false, 0)
      ctx.restore()
      ctx.globalAlpha = 1
    }
  }

  // ---------- Cow-boy ----------

  private epaule() {
    const sol = this.hauteurSol()
    const S = sol * 1.3
    const x = this.cowboyX < 0 ? this.w / 2 : this.cowboyX
    return { S, x, y: this.h - S * 0.42, ex: x + S * 0.24, ey: this.h - S * 0.45 }
  }

  private angleBras() {
    const { ex, ey } = this.epaule()
    const cible = this.visee ?? { x: this.w / 2, y: this.h * 0.3 }
    return Math.atan2(cible.y - ey, cible.x - ex) - this.recul * 0.5
  }

  private boutCanon() {
    const { S, ex, ey } = this.epaule()
    const a = this.angleBras()
    const d = S * 0.62
    return { x: ex + Math.cos(a) * d, y: ey + Math.sin(a) * d }
  }

  protected dessinerEffets(ctx: CanvasRenderingContext2D) {
    for (const t of this.traces) {
      const a = Math.min(1, t.vie / 0.08)
      ctx.globalAlpha = a
      ctx.strokeStyle = '#fff4c2'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(t.x1, t.y1)
      ctx.lineTo(t.x2, t.y2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  protected dessinerJoueur(ctx: CanvasRenderingContext2D) {
    const { S, x, y, ex, ey } = this.epaule()
    const p = this.couleurs.principale
    const s2 = this.couleurs.secondaire
    const peau = '#e2a47a'
    const a = this.angleBras()

    // Bras tendu avec le revolver (derrière le corps quand il vise à gauche)
    const bras = () => {
      ctx.save()
      ctx.translate(ex, ey)
      ctx.rotate(a)
      ctx.fillStyle = '#efe0c2'
      roundRect(ctx, 0, -S * 0.06, S * 0.36, S * 0.12, S * 0.06)
      ctx.fill()
      ctx.fillStyle = darken(p, 0.1)
      roundRect(ctx, 0, -S * 0.07, S * 0.12, S * 0.14, S * 0.05)
      ctx.fill()
      ctx.fillStyle = peau
      ctx.beginPath()
      ctx.arc(S * 0.39, 0, S * 0.065, 0, Math.PI * 2)
      ctx.fill()
      // Revolver
      ctx.fillStyle = '#3a3a3a'
      roundRect(ctx, S * 0.38, -S * 0.045, S * 0.26, S * 0.05, 2)
      ctx.fill()
      ctx.fillStyle = '#555'
      roundRect(ctx, S * 0.4, -S * 0.06, S * 0.09, S * 0.08, 3)
      ctx.fill()
      ctx.fillStyle = '#7a4b26'
      roundRect(ctx, S * 0.36, -S * 0.01, S * 0.06, S * 0.1, 2)
      ctx.fill()
      ctx.restore()
    }
    const versGauche = Math.cos(a) < 0
    if (versGauche) bras()

    // Torse avec gilet
    ctx.fillStyle = '#efe0c2'
    ctx.beginPath()
    ctx.moveTo(x - S * 0.34, this.h + 4)
    ctx.lineTo(x - S * 0.3, y)
    ctx.quadraticCurveTo(x, y - S * 0.12, x + S * 0.3, y)
    ctx.lineTo(x + S * 0.34, this.h + 4)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = p
    ctx.beginPath()
    ctx.moveTo(x - S * 0.32, this.h + 4)
    ctx.lineTo(x - S * 0.26, y + S * 0.02)
    ctx.quadraticCurveTo(x, y - S * 0.08, x + S * 0.26, y + S * 0.02)
    ctx.lineTo(x + S * 0.32, this.h + 4)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = darken(p, 0.3)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y + S * 0.02)
    ctx.lineTo(x, this.h)
    ctx.stroke()

    // Foulard
    ctx.fillStyle = s2
    ctx.beginPath()
    ctx.moveTo(x - S * 0.12, y - S * 0.06)
    ctx.lineTo(x + S * 0.12, y - S * 0.06)
    ctx.lineTo(x, y + S * 0.08)
    ctx.closePath()
    ctx.fill()

    // Tête (de dos) et cheveux
    ctx.fillStyle = peau
    ctx.beginPath()
    ctx.arc(x, y - S * 0.17, S * 0.13, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#5a3825'
    ctx.beginPath()
    ctx.arc(x, y - S * 0.19, S * 0.13, Math.PI * 0.95, Math.PI * 2.05)
    ctx.fill()

    // Chapeau
    ctx.fillStyle = '#6b3f1f'
    ctx.beginPath()
    ctx.ellipse(x, y - S * 0.27, S * 0.33, S * 0.075, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#8b5a2b'
    ctx.beginPath()
    ctx.moveTo(x - S * 0.17, y - S * 0.28)
    ctx.quadraticCurveTo(x - S * 0.19, y - S * 0.52, x - S * 0.05, y - S * 0.48)
    ctx.quadraticCurveTo(x, y - S * 0.44, x + S * 0.05, y - S * 0.48)
    ctx.quadraticCurveTo(x + S * 0.19, y - S * 0.52, x + S * 0.17, y - S * 0.28)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = s2
    ctx.fillRect(x - S * 0.17, y - S * 0.34, S * 0.34, S * 0.05)

    if (!versGauche) bras()
  }

  // ---------- Événements ----------

  toucher(l: Lettre) {
    const p = this.position(l)
    const R = this.rayon()
    const v = VERRES[l.id % VERRES.length]
    this.visee = p
    this.cibleX = Math.max(this.w * 0.15, Math.min(this.w * 0.85, p.x - this.hauteurSol() * 0.3))
    this.recul = 1
    const bout = this.boutCanon()
    this.traces.push({ x1: bout.x, y1: bout.y, x2: p.x, y2: p.y, vie: 0.08 })
    this.flammeCanon(bout)
    // La bouteille éclate
    this.eclats(p.x, p.y, 20, [v.corps, lighten(v.corps, 0.3), 'rgba(220, 240, 255, 0.8)'], R * 0.4, 360, 1100)
    this.eclats(p.x, p.y, 4, ['#f7ecd2'], R * 0.35, 200, 600)
    this.gerbe(p.x, p.y, 12, { couleurs: [lighten(v.corps, 0.4)], vitesse: [80, 260], vie: [0.4, 0.8], taille: [2, 4], gravite: 900 })
    this.ajouter({ forme: 'rond', x: p.x, y: p.y - R, vx: (Math.random() - 0.5) * 160, vy: -380, vie: 1.1, taille: R * 0.16, couleur: '#b07a42', gravite: 1000 })
    this.fantomes.push({ lettre: l, x: p.x, y: p.y, age: 0, duree: 0.45, type: 'corde' })
    this.secousse = 4
    setTimeout(() => playSound('verre'), 40)
  }

  private flammeCanon(b: { x: number; y: number }) {
    this.ajouter({ forme: 'fumee', x: b.x, y: b.y, vx: 0, vy: 0, vie: 0.12, taille: this.rayon() * 1.1, couleur: 'rgba(255, 230, 140, 1)' })
    this.gerbe(b.x, b.y, 5, { forme: 'fumee', couleurs: ['rgba(220, 210, 200, 0.9)'], vitesse: [20, 60], vie: [0.5, 0.9], taille: [6, 12], frein: 1 })
  }

  rater() {
    this.recul = 1
    const bout = this.boutCanon()
    this.flammeCanon(bout)
    // La balle finit dans un poteau ou la poutre
    const pw = this.poteau()
    const yC = this.yComptoir()
    const choix = Math.random()
    const cible =
      choix < 0.4
        ? { x: pw * (0.3 + Math.random() * 0.4), y: this.yPoutre() + Math.random() * (yC - this.yPoutre()) * 0.8 }
        : choix < 0.8
          ? { x: this.w - pw * (0.3 + Math.random() * 0.4), y: this.yPoutre() + Math.random() * (yC - this.yPoutre()) * 0.8 }
          : { x: this.w * (0.15 + Math.random() * 0.7), y: this.yPoutre() - 9 }
    this.traces.push({ x1: bout.x, y1: bout.y, x2: cible.x, y2: cible.y, vie: 0.08 })
    this.trous.push({ x: cible.x, y: cible.y, vie: 5 })
    this.gerbe(cible.x, cible.y, 8, { couleurs: ['#c48a4f', '#8b5a2b'], vitesse: [60, 180], vie: [0.3, 0.6], taille: [1.5, 3], gravite: 600 })
    this.secousse = 2
  }

  auSol(l: Lettre) {
    const p = this.position(l)
    const yC = this.yComptoir()
    this.fantomes.push({ lettre: l, x: p.x, y: p.y, age: 0, duree: 0.9, type: 'posee' })
    this.gerbe(p.x, yC, 8, { forme: 'fumee', couleurs: ['rgba(230, 200, 150, 0.9)'], vitesse: [20, 70], vie: [0.4, 0.8], taille: [6, 12], angle: [-Math.PI, 0] })
  }
}
