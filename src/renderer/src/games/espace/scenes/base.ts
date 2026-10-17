// Socle commun des décors du jeu « Chasse aux lettres » : placement des
// lettres à l'écran, fond mis en cache, particules et tremblement d'écran.
// Chaque décor (Spatial, Western, Ocean) dessine le reste.
//
// Purement visuel : la logique du jeu (chute, tirs, score) est dans engine.ts.

import type { Lettre } from '../engine'

export interface Couleurs {
  principale: string
  secondaire: string
}

// Générateur pseudo-aléatoire déterministe (mulberry32) : une même lettre
// garde la même forme d'une image à l'autre.
export function alea(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const entre = (r: () => number, min: number, max: number) => min + r() * (max - min)

export type FormeParticule = 'rond' | 'eclat' | 'etincelle' | 'fumee' | 'bulle' | 'texte' | 'anneau'

export interface Particule {
  forme: FormeParticule
  x: number
  y: number
  vx: number
  vy: number
  vie: number
  vieMax: number
  taille: number
  couleur: string
  gravite?: number
  frein?: number // ralentissement (0 à 1 par seconde)
  rotation?: number
  vrot?: number
  points?: [number, number][] // forme d'un éclat (relative)
  texte?: string
  croissance?: number // taille gagnée par seconde (fumée, anneau)
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export const POLICE = 'Nunito, system-ui, sans-serif'

// Lettre bien lisible : texte épais avec un contour.
export function lettreContour(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  taille: number,
  remplissage: string,
  contour: string
) {
  ctx.font = `900 ${Math.round(taille)}px ${POLICE}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Math.max(4, taille * 0.16)
  ctx.strokeStyle = contour
  ctx.strokeText(char, x, y + taille * 0.04)
  ctx.fillStyle = remplissage
  ctx.fillText(char, x, y + taille * 0.04)
}

export interface Fantome {
  lettre: Lettre
  x: number
  y: number
  age: number
  duree: number
  type: string
}

export abstract class SceneTheme {
  protected w = 0
  protected h = 0
  protected t = 0
  protected dt = 0
  protected particules: Particule[] = []
  protected fantomes: Fantome[] = []
  protected secousse = 0
  private fond: HTMLCanvasElement | null = null
  private fondCle = ''

  constructor(protected readonly couleurs: Couleurs) {}

  // ---------- Disposition ----------

  hauteurSol(): number {
    return Math.max(80, this.h * 0.15)
  }

  rayon(): number {
    return Math.max(28, Math.min(54, this.h * 0.068))
  }

  // Hauteur (en pixels) où apparaissent les lettres, et où elles touchent le sol.
  protected yHaut(): number {
    return this.rayon() + 6
  }

  protected yBas(): number {
    return this.h - this.hauteurSol() - this.rayon() * 0.7
  }

  protected marge(): number {
    return this.rayon() + 14
  }

  // Position d'une lettre à l'écran. Les décors peuvent y ajouter un
  // balancement (bouteilles, poissons).
  position(l: Lettre): { x: number; y: number } {
    const m = this.marge()
    return {
      x: m + l.x * (this.w - 2 * m),
      y: this.yHaut() + Math.min(1, l.y) * (this.yBas() - this.yHaut())
    }
  }

  // ---------- À fournir par chaque décor ----------

  protected abstract dessinerFond(ctx: CanvasRenderingContext2D): void
  protected abstract dessinerLettre(ctx: CanvasRenderingContext2D, l: Lettre, x: number, y: number, visee: boolean): void
  protected abstract dessinerJoueur(ctx: CanvasRenderingContext2D): void
  abstract toucher(l: Lettre): void
  abstract rater(lettres: Lettre[]): void
  abstract auSol(l: Lettre): void

  // Décor animé derrière les lettres (étoiles, algues…).
  protected dessinerDecor(_ctx: CanvasRenderingContext2D): void {}
  // Effets entre les lettres et le joueur (lasers, rayons…).
  protected dessinerEffets(_ctx: CanvasRenderingContext2D): void {}
  // Objets en cours d'animation après avoir été touchés ou tombés.
  protected dessinerFantome(_ctx: CanvasRenderingContext2D, _f: Fantome): void {}
  protected mettreAJour(_dt: number, _lettres: Lettre[]): void {}

  // Pièges (à ne pas taper) et cadeaux (vies à récupérer) du mode « Pièges et
  // cadeaux » : dessinés de la même façon dans tous les décors, pour qu'on les
  // reconnaisse partout. Piège = bulle sombre barrée de rouge ; cadeau = bulle
  // dorée avec un cœur.
  private dessinerSpecial(ctx: CanvasRenderingContext2D, l: Lettre, x: number, y: number) {
    const R = this.rayon() * 0.95
    const piege = l.type === 'piege'
    const pulse = 1 + Math.sin(this.t * 5 + l.id) * 0.05
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(pulse, pulse)
    const halo = ctx.createRadialGradient(0, 0, R * 0.6, 0, 0, R * 1.5)
    halo.addColorStop(0, piege ? 'rgba(239,68,68,0.45)' : 'rgba(250,204,21,0.55)')
    halo.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(0, 0, R * 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = piege ? '#2b1020' : '#fff4c2'
    ctx.strokeStyle = piege ? '#ef4444' : '#f59e0b'
    ctx.lineWidth = Math.max(3, R * 0.12)
    ctx.beginPath()
    if (piege) {
      // étoile à pointes : pas de contact à faire
      const n = 10
      for (let i = 0; i < n * 2; i++) {
        const a = (i * Math.PI) / n - Math.PI / 2
        const r = i % 2 === 0 ? R : R * 0.78
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      ctx.closePath()
    } else ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    lettreContour(ctx, l.char, 0, R * 0.05, R * 1.05, piege ? '#fecaca' : '#7c2d12', piege ? '#2b1020' : '#fff4c2')
    // marque : croix rouge pour le piège, cœur pour le cadeau
    if (piege) {
      ctx.globalAlpha = 0.55
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = Math.max(4, R * 0.14)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-R * 0.55, -R * 0.55)
      ctx.lineTo(R * 0.55, R * 0.55)
      ctx.moveTo(R * 0.55, -R * 0.55)
      ctx.lineTo(-R * 0.55, R * 0.55)
      ctx.stroke()
    } else {
      ctx.font = `900 ${Math.round(R * 0.8)}px ${POLICE}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ef4444'
      ctx.fillText('♥', R * 0.78, -R * 0.78)
    }
    ctx.restore()
  }

  // ---------- Boucle ----------

  avancer(dt: number, lettres: Lettre[]) {
    this.dt = dt
    this.t += dt
    this.secousse = Math.max(0, this.secousse - dt * 30)
    for (const p of this.particules) {
      p.vie -= dt
      p.vy += (p.gravite ?? 0) * dt
      if (p.frein) {
        const f = Math.max(0, 1 - p.frein * dt)
        p.vx *= f
        p.vy *= f
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.vrot) p.rotation = (p.rotation ?? 0) + p.vrot * dt
      if (p.croissance) p.taille += p.croissance * dt
    }
    this.particules = this.particules.filter((p) => p.vie > 0)
    for (const f of this.fantomes) f.age += dt
    this.fantomes = this.fantomes.filter((f) => f.age < f.duree)
    this.mettreAJour(dt, lettres)
  }

  dessiner(ctx: CanvasRenderingContext2D, w: number, h: number, lettres: Lettre[], visee: number | null) {
    this.w = w
    this.h = h
    if (w <= 0 || h <= 0) return
    ctx.save()
    if (this.secousse > 0) {
      const s = this.secousse
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s)
    }
    this.dessinerFondCache(ctx)
    this.dessinerDecor(ctx)
    for (const l of lettres) {
      const p = this.position(l)
      if (l.type) this.dessinerSpecial(ctx, l, p.x, p.y)
      else this.dessinerLettre(ctx, l, p.x, p.y, l.id === visee)
    }
    for (const f of this.fantomes) this.dessinerFantome(ctx, f)
    this.dessinerEffets(ctx)
    this.dessinerJoueur(ctx)
    this.dessinerParticules(ctx)
    ctx.restore()
  }

  // Le fond fixe est dessiné une fois dans une image hors écran, à la
  // résolution de l'écran, puis recopié à chaque image.
  private dessinerFondCache(ctx: CanvasRenderingContext2D) {
    const dpr = ctx.getTransform().a || 1
    const cle = `${this.w}x${this.h}@${dpr}`
    if (!this.fond || this.fondCle !== cle) {
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(this.w * dpr))
      c.height = Math.max(1, Math.round(this.h * dpr))
      const fctx = c.getContext('2d')
      if (fctx) {
        fctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        this.dessinerFond(fctx)
      }
      this.fond = c
      this.fondCle = cle
    }
    ctx.drawImage(this.fond, -8, -8, this.w + 16, this.h + 16)
  }

  // ---------- Particules ----------

  protected ajouter(p: Omit<Particule, 'vieMax'> & { vieMax?: number }) {
    this.particules.push({ ...p, vieMax: p.vieMax ?? p.vie })
  }

  protected gerbe(
    x: number,
    y: number,
    n: number,
    o: { couleurs: string[]; vitesse: [number, number]; vie: [number, number]; taille: [number, number]; forme?: FormeParticule; gravite?: number; frein?: number; angle?: [number, number] }
  ) {
    for (let i = 0; i < n; i++) {
      const a = o.angle ? o.angle[0] + Math.random() * (o.angle[1] - o.angle[0]) : Math.random() * Math.PI * 2
      const v = o.vitesse[0] + Math.random() * (o.vitesse[1] - o.vitesse[0])
      const vie = o.vie[0] + Math.random() * (o.vie[1] - o.vie[0])
      this.ajouter({
        forme: o.forme ?? 'rond',
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        vie,
        taille: o.taille[0] + Math.random() * (o.taille[1] - o.taille[0]),
        couleur: o.couleurs[i % o.couleurs.length],
        gravite: o.gravite,
        frein: o.frein,
        rotation: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 12
      })
    }
  }

  protected eclats(x: number, y: number, n: number, couleurs: string[], taille: number, vitesse: number, gravite: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = vitesse * (0.4 + Math.random() * 0.8)
      const s = taille * (0.5 + Math.random() * 0.8)
      this.ajouter({
        forme: 'eclat',
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - vitesse * 0.3,
        vie: 0.7 + Math.random() * 0.6,
        taille: s,
        couleur: couleurs[i % couleurs.length],
        gravite,
        rotation: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 16,
        points: [
          [-0.5 + Math.random() * 0.2, -0.6],
          [0.6, -0.2 + Math.random() * 0.3],
          [-0.1 + Math.random() * 0.3, 0.7]
        ]
      })
    }
  }

  protected texteFlottant(x: number, y: number, texte: string, couleur: string) {
    this.ajouter({ forme: 'texte', x, y, vx: 0, vy: -60, vie: 0.9, taille: this.rayon() * 0.9, couleur, texte, frein: 1.5 })
  }

  private dessinerParticules(ctx: CanvasRenderingContext2D) {
    for (const p of this.particules) {
      const a = Math.max(0, Math.min(1, p.vie / p.vieMax))
      ctx.globalAlpha = p.forme === 'fumee' ? a * 0.5 : p.forme === 'etincelle' ? Math.min(1, a * 2) : Math.min(1, a * 1.6)
      switch (p.forme) {
        case 'rond':
          ctx.fillStyle = p.couleur
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'fumee': {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.taille)
          g.addColorStop(0, p.couleur)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2)
          ctx.fill()
          break
        }
        case 'etincelle': {
          ctx.strokeStyle = p.couleur
          ctx.lineWidth = p.taille
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04)
          ctx.stroke()
          break
        }
        case 'bulle':
          ctx.strokeStyle = p.couleur
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,255,255,0.5)'
          ctx.beginPath()
          ctx.arc(p.x - p.taille * 0.35, p.y - p.taille * 0.35, p.taille * 0.25, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'anneau':
          ctx.strokeStyle = p.couleur
          ctx.lineWidth = Math.max(1, 6 * a)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2)
          ctx.stroke()
          break
        case 'eclat': {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation ?? 0)
          ctx.scale(p.taille, p.taille)
          ctx.fillStyle = p.couleur
          ctx.strokeStyle = 'rgba(255,255,255,0.75)'
          ctx.lineWidth = 1.5 / p.taille
          ctx.beginPath()
          const pts = p.points ?? []
          pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)))
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.restore()
          break
        }
        case 'texte':
          ctx.font = `900 ${Math.round(p.taille)}px ${POLICE}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.lineWidth = 5
          ctx.strokeStyle = 'rgba(0,0,0,0.45)'
          ctx.strokeText(p.texte ?? '', p.x, p.y)
          ctx.fillStyle = p.couleur
          ctx.fillText(p.texte ?? '', p.x, p.y)
          break
      }
    }
    ctx.globalAlpha = 1
  }
}
