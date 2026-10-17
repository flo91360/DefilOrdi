// Décor « Plongée sous-marine » : le sous-marin est en haut de l'écran ;
// poissons, coquillages et trésors remontent depuis le fond et il les aspire
// avec son rayon tracteur (dirigé vers le bas) avant qu'ils ne l'atteignent.
// Dans le moteur, `y` est la progression de l'objet : 0 au fond, 1 au sous-marin.

import { darken, lighten } from '../../../color'
import { playSound } from '../../../sounds'
import type { Lettre } from '../engine'
import { alea, entre, type Fantome, policeLettres, roundRect, SceneTheme } from './base'

type Objet = 'clown' | 'bleu' | 'jaune' | 'coquillage' | 'etoile' | 'huitre' | 'piece' | 'coffre'
const OBJETS: Objet[] = ['clown', 'coquillage', 'bleu', 'etoile', 'piece', 'jaune', 'huitre', 'coffre']

interface Algue {
  x: number
  hauteur: number
  phase: number
  couleur: string
}

interface PetitPoisson {
  x: number
  y: number
  vitesse: number
  taille: number
}

// Les poissons remontent plus vite que les autres objets.
export const VITESSE_POISSON = 1.6
export function vitesseObjetOcean(id: number): number {
  const o = OBJETS[id % OBJETS.length]
  return o === 'clown' || o === 'bleu' || o === 'jaune' ? VITESSE_POISSON : 1
}

export class Ocean extends SceneTheme {
  private sousMarinX = -1
  private cibleX = -1
  private direction = 1
  private algues: Algue[] = []
  private banc: PetitPoisson[] = []
  private rayons: { x: number; y: number; vie: number }[] = []

  hauteurSol() {
    return Math.max(100, this.h * 0.18)
  }

  private objet(l: Lettre): Objet {
    return OBJETS[l.id % OBJETS.length]
  }

  private estPoisson(o: Objet) {
    return o === 'clown' || o === 'bleu' || o === 'jaune'
  }

  position(l: Lettre) {
    const R = this.rayon()
    const m0 = this.marge()
    const depart = this.h - this.hauteurSol() + R * 0.2
    const arrivee = this.sousMarinY() + this.dimensions().L * 0.42 * 0.5 + R * 0.9
    const base = { x: m0 + l.x * (this.w - 2 * m0), y: depart + Math.min(1, l.y) * (arrivee - depart) }
    // Les poissons nagent de gauche à droite ; les autres objets ondulent un peu.
    const amplitude = this.estPoisson(this.objet(l)) ? R * 0.9 : R * 0.25
    const dx = Math.sin(this.t * 1.1 + l.id * 2.3) * amplitude
    const m = this.marge()
    return { x: Math.max(m, Math.min(this.w - m, base.x + dx)), y: base.y }
  }

  // ---------- Fond fixe ----------

  protected dessinerFond(ctx: CanvasRenderingContext2D) {
    const { w, h } = this
    const sol = this.hauteurSol()
    const ySable = h - sol
    const eau = ctx.createLinearGradient(0, 0, 0, h)
    eau.addColorStop(0, '#36c2d6')
    eau.addColorStop(0.25, '#1690b4')
    eau.addColorStop(0.65, '#0b4f78')
    eau.addColorStop(1, '#072d4a')
    ctx.fillStyle = eau
    ctx.fillRect(0, 0, w, h)

    // Surface ondulée tout en haut
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, 10 + Math.sin(x / 40) * 5)
    ctx.lineTo(w, 0)
    ctx.closePath()
    ctx.fill()

    const r = alea(5)
    // Épave lointaine
    ctx.save()
    ctx.translate(w * 0.2, ySable - sol * 0.05)
    ctx.rotate(-0.12)
    ctx.fillStyle = 'rgba(8, 48, 72, 0.75)'
    const lp = Math.min(w * 0.3, 360)
    ctx.beginPath()
    ctx.moveTo(-lp * 0.5, -lp * 0.12)
    ctx.lineTo(lp * 0.5, -lp * 0.12)
    ctx.lineTo(lp * 0.38, lp * 0.08)
    ctx.lineTo(-lp * 0.4, lp * 0.08)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(-lp * 0.05, -lp * 0.55, lp * 0.025, lp * 0.45)
    ctx.fillRect(lp * 0.22, -lp * 0.42, lp * 0.02, lp * 0.32)
    ctx.beginPath()
    ctx.moveTo(-lp * 0.04, -lp * 0.52)
    ctx.lineTo(lp * 0.16, -lp * 0.3)
    ctx.lineTo(-lp * 0.04, -lp * 0.2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Rochers lointains
    for (const [couleur, haut] of [
      ['rgba(9, 60, 90, 0.9)', 0.9],
      ['rgba(7, 45, 70, 0.95)', 0.55]
    ] as [string, number][]) {
      ctx.fillStyle = couleur
      ctx.beginPath()
      ctx.moveTo(0, ySable + 4)
      let x = 0
      while (x < w) {
        const larg = entre(r, 60, 180)
        ctx.quadraticCurveTo(x + larg / 2, ySable - sol * haut * entre(r, 0.3, 1), x + larg, ySable + 4)
        x += larg
      }
      ctx.lineTo(w, ySable + 4)
      ctx.closePath()
      ctx.fill()
    }

    // Sable avec ondulations
    const sable = ctx.createLinearGradient(0, ySable, 0, h)
    sable.addColorStop(0, '#e8d199')
    sable.addColorStop(1, '#b8945a')
    ctx.fillStyle = sable
    ctx.beginPath()
    ctx.moveTo(0, h)
    ctx.lineTo(0, ySable + 8)
    for (let x = 0; x <= w; x += 30) ctx.lineTo(x, ySable + Math.sin(x / 90) * 6)
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(140, 100, 50, 0.3)'
    ctx.lineWidth = 2
    for (let i = 0; i < 18; i++) {
      const x = r() * w
      const y = ySable + entre(r, 0.25, 0.9) * sol
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + 20, y - 6, x + 40, y)
      ctx.stroke()
    }
    // Cailloux et petits coquillages
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = r() < 0.5 ? '#9c8a6a' : r() < 0.5 ? '#f3c1a8' : '#d9cfc0'
      ctx.beginPath()
      ctx.ellipse(r() * w, ySable + entre(r, 0.15, 0.95) * sol, entre(r, 2, 6), entre(r, 1.5, 4), 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // Coraux
    for (const [cx, couleur, taille] of [
      [0.05, '#f472b6', 1],
      [0.93, '#fb923c', 1.1],
      [0.58, '#c084fc', 0.75],
      [0.32, '#f87171', 0.65]
    ] as [number, string, number][]) {
      this.corail(ctx, cx * w, ySable + 6, sol * 0.9 * taille, couleur, alea(Math.round(cx * 100)))
    }
  }

  private corail(ctx: CanvasRenderingContext2D, x: number, y: number, H: number, couleur: string, r: () => number) {
    ctx.strokeStyle = couleur
    ctx.lineCap = 'round'
    const branche = (x0: number, y0: number, long: number, angle: number, epaisseur: number, n: number) => {
      const x1 = x0 + Math.cos(angle) * long
      const y1 = y0 + Math.sin(angle) * long
      ctx.lineWidth = epaisseur
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
      if (n > 0) {
        branche(x1, y1, long * 0.72, angle - entre(r, 0.25, 0.6), epaisseur * 0.7, n - 1)
        branche(x1, y1, long * 0.72, angle + entre(r, 0.25, 0.6), epaisseur * 0.7, n - 1)
      }
    }
    branche(x, y, H * 0.35, -Math.PI / 2, H * 0.09, 3)
  }

  // ---------- Animation ----------

  protected mettreAJour(dt: number) {
    const { w, h } = this
    if (this.algues.length === 0 && w > 0) {
      const r = alea(9)
      for (let i = 0; i < 12; i++) {
        this.algues.push({ x: r() * w, hauteur: entre(r, 0.5, 1.2), phase: r() * 6, couleur: r() < 0.5 ? '#2f9e44' : '#37b24d' })
      }
      for (let i = 0; i < 9; i++) {
        this.banc.push({ x: r() * w, y: h * entre(r, 0.2, 0.5), vitesse: entre(r, 18, 30), taille: entre(r, 5, 8) })
      }
    }
    for (const p of this.banc) {
      p.x += p.vitesse * dt
      if (p.x > w + 20) p.x = -20
    }
    if (this.sousMarinX < 0 && w > 0) this.sousMarinX = this.cibleX = w / 2
    const avant = this.sousMarinX
    this.sousMarinX += (this.cibleX - this.sousMarinX) * Math.min(1, dt * 3.5)
    if (Math.abs(this.sousMarinX - avant) > 0.3) this.direction = this.sousMarinX > avant ? 1 : -1
    for (const r of this.rayons) r.vie -= dt
    this.rayons = this.rayons.filter((r) => r.vie > 0)

    // Bulles qui montent du fond
    if (Math.random() < dt * 4) {
      this.ajouter({
        forme: 'bulle',
        x: Math.random() * w,
        y: h - this.hauteurSol() * 0.8,
        vx: 0,
        vy: -40 - Math.random() * 40,
        vie: 3 + Math.random() * 3,
        taille: 2 + Math.random() * 4,
        couleur: 'rgba(255,255,255,0.6)'
      })
    }
  }

  protected dessinerDecor(ctx: CanvasRenderingContext2D) {
    const { w, h } = this
    // Rayons de lumière depuis la surface
    for (let i = 0; i < 5; i++) {
      const x = w * (0.12 + i * 0.2) + Math.sin(this.t * 0.4 + i) * 40
      const g = ctx.createLinearGradient(0, 0, 0, h * 0.8)
      g.addColorStop(0, 'rgba(255, 255, 255, 0.16)')
      g.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(x - 25, 0)
      ctx.lineTo(x + 25, 0)
      ctx.lineTo(x + 140, h * 0.8)
      ctx.lineTo(x + 40, h * 0.8)
      ctx.closePath()
      ctx.fill()
    }

    // Banc de petits poissons au loin
    ctx.fillStyle = 'rgba(10, 40, 70, 0.45)'
    for (const p of this.banc) {
      const y = p.y + Math.sin(this.t * 2 + p.x / 50) * 4
      ctx.beginPath()
      ctx.ellipse(p.x, y, p.taille, p.taille * 0.45, 0, 0, Math.PI * 2)
      ctx.moveTo(p.x - p.taille * 0.8, y)
      ctx.lineTo(p.x - p.taille * 1.6, y - p.taille * 0.5)
      ctx.lineTo(p.x - p.taille * 1.6, y + p.taille * 0.5)
      ctx.fill()
    }

    // Algues qui ondulent : tige qui s'affine et feuilles alternées
    const ySable = h - this.hauteurSol()
    for (const a of this.algues) {
      const H = this.hauteurSol() * 1.5 * a.hauteur
      const n = 14
      const pts: [number, number][] = []
      for (let i = 0; i <= n; i++) {
        const u = i / n
        const ondule = Math.sin(this.t * 1.3 + a.phase + u * 3) * 16 * u
        pts.push([a.x + ondule, ySable + 10 - u * H])
      }
      ctx.lineCap = 'round'
      for (let i = 0; i < n; i++) {
        ctx.strokeStyle = a.couleur
        ctx.lineWidth = 9 * (1 - i / n) + 2
        ctx.beginPath()
        ctx.moveTo(pts[i][0], pts[i][1])
        ctx.lineTo(pts[i + 1][0], pts[i + 1][1])
        ctx.stroke()
        if (i % 3 === 1) {
          const cote = i % 2 === 0 ? 1 : -1
          ctx.fillStyle = darken(a.couleur, 0.1)
          ctx.beginPath()
          ctx.ellipse(pts[i][0] + cote * 9, pts[i][1] - 4, 11 * (1 - i / n) + 4, 4, cote * -0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  // ---------- Objets ----------

  private dessinerObjet(ctx: CanvasRenderingContext2D, o: Objet, R: number, sens: number, t: number) {
    switch (o) {
      case 'clown':
      case 'bleu':
      case 'jaune': {
        const corps = o === 'clown' ? '#ff8c2b' : o === 'bleu' ? '#2f6fde' : '#ffd43b'
        const nageoire = o === 'clown' ? '#ff6b00' : o === 'bleu' ? '#ffd43b' : '#f59f00'
        ctx.save()
        ctx.scale(sens, 1)
        const queue = Math.sin(t * 8) * 0.25
        ctx.fillStyle = nageoire
        ctx.beginPath()
        ctx.moveTo(-R * 0.9, 0)
        ctx.lineTo(-R * 1.55, -R * (0.6 + queue))
        ctx.lineTo(-R * 1.45, 0)
        ctx.lineTo(-R * 1.55, R * (0.6 - queue))
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(-R * 0.3, -R * 0.62)
        ctx.quadraticCurveTo(R * 0.1, -R * 1.05, R * 0.45, -R * 0.55)
        ctx.closePath()
        ctx.fill()
        const g = ctx.createLinearGradient(0, -R * 0.75, 0, R * 0.75)
        g.addColorStop(0, lighten(corps, 0.25))
        g.addColorStop(1, darken(corps, 0.2))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(0, 0, R * 1.15, R * 0.75, 0, 0, Math.PI * 2)
        ctx.fill()
        if (o === 'clown') {
          ctx.save()
          ctx.beginPath()
          ctx.ellipse(0, 0, R * 1.15, R * 0.75, 0, 0, Math.PI * 2)
          ctx.clip()
          ctx.fillStyle = '#ffffff'
          for (const bx of [-0.55, 0.55]) {
            ctx.fillRect(R * bx - R * 0.12, -R, R * 0.24, R * 2)
          }
          ctx.restore()
        }
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(R * 0.82, -R * 0.15, R * 0.17, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#111827'
        ctx.beginPath()
        ctx.arc(R * 0.86, -R * 0.15, R * 0.09, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        break
      }
      case 'coquillage': {
        const c = '#ffb4a2'
        ctx.fillStyle = darken(c, 0.15)
        ctx.beginPath()
        ctx.moveTo(-R * 0.35, R * 0.75)
        ctx.lineTo(R * 0.35, R * 0.75)
        ctx.lineTo(R * 0.2, R * 0.95)
        ctx.lineTo(-R * 0.2, R * 0.95)
        ctx.closePath()
        ctx.fill()
        const g = ctx.createRadialGradient(0, R * 0.7, R * 0.1, 0, R * 0.7, R * 1.8)
        g.addColorStop(0, '#fff0e6')
        g.addColorStop(1, c)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(0, R * 0.8)
        ctx.arc(0, R * 0.8, R * 1.55, Math.PI * 1.15, Math.PI * 1.85)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = darken(c, 0.25)
        ctx.lineWidth = 2
        for (let i = 0; i <= 6; i++) {
          const a = Math.PI * (1.15 + (0.7 * i) / 6)
          ctx.beginPath()
          ctx.moveTo(0, R * 0.8)
          ctx.lineTo(Math.cos(a) * R * 1.55, R * 0.8 + Math.sin(a) * R * 1.55)
          ctx.stroke()
        }
        break
      }
      case 'etoile': {
        ctx.fillStyle = '#ff7849'
        ctx.beginPath()
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5
          const rr = i % 2 === 0 ? R * 1.25 : R * 0.55
          ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
        }
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#ffd8a8'
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          ctx.beginPath()
          ctx.arc(Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85, R * 0.07, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      }
      case 'huitre': {
        ctx.fillStyle = '#6d5a73'
        ctx.beginPath()
        ctx.ellipse(0, R * 0.35, R * 1.25, R * 0.55, 0, 0, Math.PI)
        ctx.fill()
        ctx.fillStyle = '#8b7591'
        ctx.beginPath()
        ctx.ellipse(0, -R * 0.1, R * 1.25, R * 0.6, -0.15, Math.PI, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#f3e8ff'
        ctx.beginPath()
        ctx.ellipse(0, R * 0.35, R * 1.05, R * 0.2, 0, 0, Math.PI * 2)
        ctx.fill()
        const perle = ctx.createRadialGradient(R * 0.55, R * 0.12, 1, R * 0.6, R * 0.2, R * 0.3)
        perle.addColorStop(0, '#ffffff')
        perle.addColorStop(1, '#d6c8e6')
        ctx.fillStyle = perle
        ctx.beginPath()
        ctx.arc(R * 0.75, R * 0.2, R * 0.28, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'piece': {
        const g = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R * 1.15)
        g.addColorStop(0, '#fff3bf')
        g.addColorStop(0.6, '#fcc419')
        g.addColorStop(1, '#e67700')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(0, 0, R * 1.1, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#d9480f'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, R * 0.92, 0, Math.PI * 2)
        ctx.stroke()
        // éclat qui brille
        const b = Math.max(0, Math.sin(t * 3))
        ctx.fillStyle = `rgba(255,255,255,${b * 0.9})`
        ctx.beginPath()
        ctx.moveTo(-R * 0.75, -R * 0.75)
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4
          const rr = i % 2 === 0 ? R * 0.3 : R * 0.08
          ctx.lineTo(-R * 0.7 + Math.cos(a) * rr, -R * 0.7 + Math.sin(a) * rr)
        }
        ctx.fill()
        break
      }
      case 'coffre': {
        const W = R * 2.1
        const H = R * 1.5
        ctx.fillStyle = '#8b5a2b'
        roundRect(ctx, -W / 2, -H * 0.2, W, H * 0.75, 4)
        ctx.fill()
        ctx.fillStyle = '#a0703c'
        ctx.beginPath()
        ctx.moveTo(-W / 2, -H * 0.2)
        ctx.quadraticCurveTo(0, -H * 0.75, W / 2, -H * 0.2)
        ctx.closePath()
        ctx.fill()
        // trésor qui dépasse
        ctx.fillStyle = '#fcc419'
        for (const cx of [-0.3, -0.1, 0.15, 0.32]) {
          ctx.beginPath()
          ctx.arc(cx * W, -H * 0.22, R * 0.14, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = '#e8b923'
        for (const bx of [-0.42, 0.42]) ctx.fillRect(bx * W - 3, -H * 0.55, 6, H * 1.1)
        ctx.fillRect(-W / 2, -H * 0.24, W, 5)
        break
      }
    }
  }

  private badge(ctx: CanvasRenderingContext2D, char: string, x: number, y: number, R: number, bord: string) {
    const rb = R * 0.6
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.beginPath()
    ctx.arc(x, y, rb, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = bord
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.font = `900 ${Math.round(R * 0.88)}px ${policeLettres(this.couleurs)}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#0b2545'
    ctx.fillText(char, x, y + R * 0.04)
  }

  private bordObjet(o: Objet) {
    return { clown: '#ff6b00', bleu: '#2f6fde', jaune: '#f59f00', coquillage: '#e8775f', etoile: '#e8590c', huitre: '#6d5a73', piece: '#e67700', coffre: '#8b5a2b' }[o]
  }

  private sens(l: Lettre) {
    return Math.cos(this.t * 1.1 + l.id * 2.3) >= 0 ? 1 : -1
  }

  protected dessinerLettre(ctx: CanvasRenderingContext2D, l: Lettre, x: number, y: number, visee: boolean) {
    const R = this.rayon()
    const o = this.objet(l)
    ctx.save()
    ctx.translate(x, y)
    if (!this.estPoisson(o)) ctx.rotate(Math.sin(this.t * 1.5 + l.id) * 0.15)
    this.dessinerObjet(ctx, o, R, this.sens(l), this.t + l.id)
    ctx.restore()
    this.badge(ctx, l.char, x, y, R, this.bordObjet(o))
    if (visee) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(this.t * 1.2)
      ctx.strokeStyle = '#a5f3fc'
      ctx.lineWidth = 3
      ctx.setLineDash([R * 0.3, R * 0.2])
      ctx.beginPath()
      ctx.arc(0, 0, R * 1.55, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      ctx.setLineDash([])
    }
  }

  protected dessinerFantome(ctx: CanvasRenderingContext2D, f: Fantome) {
    const R = this.rayon()
    const o = this.objet(f.lettre)
    const k = f.age / f.duree
    if (f.type === 'aspire') {
      // L'objet est aspiré vers le sous-marin en rétrécissant
      const e = this.emetteur()
      const ease = k * k
      const x = f.x + (e.x - f.x) * ease
      const y = f.y + (e.y - f.y) * ease
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(k * 4)
      ctx.scale(1 - k * 0.75, 1 - k * 0.75)
      this.dessinerObjet(ctx, o, R, 1, this.t)
      ctx.restore()
    } else if (f.type === 'enfoui') {
      // L'objet, arrivé en haut sans avoir été attrapé, s'estompe
      ctx.save()
      ctx.globalAlpha = 1 - k
      ctx.translate(f.x, f.y - k * R * 0.6)
      this.dessinerObjet(ctx, o, R, 1, this.t)
      ctx.restore()
      ctx.globalAlpha = 1
    }
  }

  // ---------- Sous-marin ----------

  private dimensions() {
    const sol = this.hauteurSol()
    const L = Math.max(140, sol * 1.75)
    const x = this.sousMarinX < 0 ? this.w / 2 : this.sousMarinX
    const y = this.sousMarinY() + Math.sin(this.t * 1.6) * 4
    return { L, x, y }
  }

  // Le sous-marin est en haut, assez bas pour que son périscope reste visible.
  private sousMarinY() {
    const L = Math.max(140, this.hauteurSol() * 1.75)
    return L * 0.42 * 1.3 + 10
  }

  private emetteur() {
    const { L, x, y } = this.dimensions()
    return { x: x + this.direction * L * 0.12, y: y + L * 0.42 * 0.55 }
  }

  protected dessinerEffets(ctx: CanvasRenderingContext2D) {
    // Rayon tracteur vers les objets aspirés
    const e = this.emetteur()
    for (const f of this.fantomes) {
      if (f.type !== 'aspire') continue
      const k = f.age / f.duree
      const a = k < 0.8 ? 1 : (1 - k) / 0.2
      const R = this.rayon() * (1.3 - k * 0.8)
      const g = ctx.createLinearGradient(e.x, e.y, f.x, f.y)
      g.addColorStop(0, `rgba(255, 240, 150, ${0.7 * a})`)
      g.addColorStop(1, `rgba(165, 243, 252, ${0.25 * a})`)
      ctx.fillStyle = g
      const ang = Math.atan2(f.y - e.y, f.x - e.x) + Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(e.x - Math.cos(ang) * 8, e.y - Math.sin(ang) * 8)
      ctx.lineTo(e.x + Math.cos(ang) * 8, e.y + Math.sin(ang) * 8)
      ctx.lineTo(f.x + Math.cos(ang) * R, f.y + Math.sin(ang) * R)
      ctx.lineTo(f.x - Math.cos(ang) * R, f.y - Math.sin(ang) * R)
      ctx.closePath()
      ctx.fill()
      // Anneaux qui remontent le long du rayon
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * a})`
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        const u = (this.t * 2.5 + i / 3) % 1
        const x = f.x + (e.x - f.x) * u
        const y = f.y + (e.y - f.y) * u
        ctx.beginPath()
        ctx.ellipse(x, y, R * (1 - u * 0.8), R * 0.3 * (1 - u * 0.8), ang - Math.PI / 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    for (const r of this.rayons) {
      ctx.globalAlpha = r.vie / 0.4
      const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 40)
      g.addColorStop(0, 'rgba(255, 245, 180, 0.9)')
      g.addColorStop(1, 'rgba(255, 245, 180, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(r.x, r.y, 40, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  protected dessinerJoueur(ctx: CanvasRenderingContext2D) {
    const { L, x, y } = this.dimensions()
    const H = L * 0.42
    const p = this.couleurs.principale
    const s2 = this.couleurs.secondaire
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(this.direction, 1)

    // Hélice (à l'arrière, à gauche quand il va vers la droite)
    ctx.fillStyle = '#495057'
    ctx.fillRect(-L * 0.56, -H * 0.06, L * 0.08, H * 0.12)
    const tour = Math.cos(this.t * 18)
    ctx.fillStyle = '#adb5bd'
    ctx.beginPath()
    ctx.ellipse(-L * 0.58, -H * 0.22 * tour, L * 0.025, H * 0.22 * Math.abs(tour) + 2, 0, 0, Math.PI * 2)
    ctx.ellipse(-L * 0.58, H * 0.22 * tour, L * 0.025, H * 0.22 * Math.abs(tour) + 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Gouvernail
    ctx.fillStyle = s2
    ctx.beginPath()
    ctx.moveTo(-L * 0.42, -H * 0.1)
    ctx.lineTo(-L * 0.55, -H * 0.42)
    ctx.lineTo(-L * 0.5, H * 0.42)
    ctx.lineTo(-L * 0.42, H * 0.1)
    ctx.closePath()
    ctx.fill()

    // Kiosque et périscope
    ctx.strokeStyle = '#495057'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(L * 0.02, -H * 0.9)
    ctx.lineTo(L * 0.02, -H * 1.25)
    ctx.lineTo(L * 0.1, -H * 1.25)
    ctx.stroke()
    const kiosque = ctx.createLinearGradient(0, -H, 0, -H * 0.3)
    kiosque.addColorStop(0, lighten(p, 0.2))
    kiosque.addColorStop(1, darken(p, 0.2))
    ctx.fillStyle = kiosque
    roundRect(ctx, -L * 0.16, -H * 0.95, L * 0.3, H * 0.7, H * 0.16)
    ctx.fill()
    ctx.strokeStyle = darken(p, 0.4)
    ctx.lineWidth = 2
    roundRect(ctx, -L * 0.16, -H * 0.95, L * 0.3, H * 0.7, H * 0.16)
    ctx.stroke()
    ctx.fillStyle = '#22b8cf'
    roundRect(ctx, -L * 0.1, -H * 0.8, L * 0.07, H * 0.16, 3)
    ctx.fill()
    roundRect(ctx, L * 0.0, -H * 0.8, L * 0.07, H * 0.16, 3)
    ctx.fill()
    // Émetteur du rayon tracteur
    ctx.fillStyle = '#ffe066'
    ctx.beginPath()
    ctx.ellipse(L * 0.12, H * 0.5, L * 0.06, H * 0.1, 0, 0, Math.PI)
    ctx.fill()
    ctx.strokeStyle = '#f59f00'
    ctx.stroke()

    // Coque
    const g = ctx.createLinearGradient(0, -H / 2, 0, H / 2)
    g.addColorStop(0, lighten(p, 0.3))
    g.addColorStop(0.5, p)
    g.addColorStop(1, darken(p, 0.35))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, L * 0.5, H * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = darken(p, 0.4)
    ctx.lineWidth = 2
    ctx.stroke()
    // Rivets
    ctx.fillStyle = darken(p, 0.3)
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(i * L * 0.09, H * 0.3, 2, 0, Math.PI * 2)
      ctx.fill()
    }
    // Hublots
    for (const hx of [-0.22, 0, 0.22]) {
      ctx.fillStyle = '#495057'
      ctx.beginPath()
      ctx.arc(hx * L, -H * 0.02, H * 0.17, 0, Math.PI * 2)
      ctx.fill()
      const verre = ctx.createRadialGradient(hx * L - H * 0.05, -H * 0.07, 1, hx * L, -H * 0.02, H * 0.13)
      verre.addColorStop(0, '#e0fbff')
      verre.addColorStop(1, '#22b8cf')
      ctx.fillStyle = verre
      ctx.beginPath()
      ctx.arc(hx * L, -H * 0.02, H * 0.13, 0, Math.PI * 2)
      ctx.fill()
    }
    // Phare à l'avant
    const phare = ctx.createRadialGradient(L * 0.5, 0, 0, L * 0.5, 0, L * 0.25)
    phare.addColorStop(0, 'rgba(255, 250, 200, 0.8)')
    phare.addColorStop(1, 'rgba(255, 250, 200, 0)')
    ctx.fillStyle = phare
    ctx.beginPath()
    ctx.moveTo(L * 0.48, 0)
    ctx.lineTo(L * 0.85, -H * 0.4)
    ctx.lineTo(L * 0.85, H * 0.4)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#fff9db'
    ctx.beginPath()
    ctx.arc(L * 0.47, 0, H * 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Petites bulles derrière l'hélice
    if (Math.random() < 0.3) {
      this.ajouter({
        forme: 'bulle',
        x: x - this.direction * L * 0.6,
        y: y + (Math.random() - 0.5) * 10,
        vx: -this.direction * 30,
        vy: -30,
        vie: 1.2,
        taille: 2 + Math.random() * 3,
        couleur: 'rgba(255,255,255,0.6)'
      })
    }
  }

  // ---------- Événements ----------

  toucher(l: Lettre) {
    const p = this.position(l)
    const R = this.rayon()
    this.cibleX = Math.max(80, Math.min(this.w - 80, p.x))
    this.fantomes.push({ lettre: l, x: p.x, y: p.y, age: 0, duree: 0.5, type: 'aspire' })
    this.gerbe(p.x, p.y, 10, { forme: 'bulle', couleurs: ['rgba(255,255,255,0.7)'], vitesse: [30, 90], vie: [0.6, 1.2], taille: [2, 5] })
    setTimeout(() => {
      const e = this.emetteur()
      this.rayons.push({ x: e.x, y: e.y, vie: 0.4 })
      this.gerbe(e.x, e.y, 14, { forme: 'etincelle', couleurs: ['#fff3bf', '#ffd43b', '#a5f3fc'], vitesse: [100, 260], vie: [0.3, 0.6], taille: [2, 3], frein: 2 })
      this.texteFlottant(e.x, e.y - R, '+1', '#ffe066')
      playSound('tresor')
    }, 480)
  }

  rater() {
    const { L, x, y } = this.dimensions()
    this.gerbe(x + this.direction * L * 0.1, y + L * 0.25, 12, {
      forme: 'bulle',
      couleurs: ['rgba(255,255,255,0.7)'],
      vitesse: [40, 120],
      vie: [0.6, 1.1],
      taille: [3, 7],
      angle: [Math.PI * 0.15, Math.PI * 0.85]
    })
    this.secousse = 2
  }

  auSol(l: Lettre) {
    const p = this.position(l)
    this.fantomes.push({ lettre: l, x: p.x, y: p.y, age: 0, duree: 0.8, type: 'enfoui' })
    this.gerbe(p.x, p.y, 10, {
      forme: 'bulle',
      couleurs: ['rgba(255,255,255,0.7)'],
      vitesse: [30, 90],
      vie: [0.6, 1.1],
      taille: [3, 6]
    })
  }
}
