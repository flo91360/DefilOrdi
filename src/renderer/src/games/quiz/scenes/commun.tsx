import { createContext, type CSSProperties, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { MENU_FOND, MENU_FOND_NOUVEAU, NOUVEAUX_TYPES } from '../nouveau'

// Les écrans du quiz sont dessinés en HTML à une taille fixe (960 × 540),
// puis mis à l'échelle de la place disponible. Chaque élément cliquable est
// une « zone » identifiée par un nom.

export const LARGEUR = 960
export const HAUTEUR = 540

interface ContexteZones {
  onZone?: (id: string) => void // un clic droit est signalé par « id@droit »
  surligne?: string | null // zone entourée (questions avec visuel)
  indice?: string | null // zone qui clignote (aide après deux erreurs)
  interactive: boolean
}

const Ctx = createContext<ContexteZones>({ interactive: false })

export function Zone({
  id,
  className = '',
  style,
  titre,
  children
}: {
  id: string
  className?: string
  style?: CSSProperties
  titre?: string
  children?: ReactNode
}) {
  const { onZone, surligne, indice, interactive } = useContext(Ctx)
  const classes = ['zone', className]
  if (surligne === id) classes.push('zone-surligne')
  if (indice === id) classes.push('zone-indice')
  return (
    <button
      type="button"
      className={classes.join(' ')}
      data-zone={id}
      style={style}
      tabIndex={interactive ? 0 : -1}
      aria-label={titre}
      title={interactive ? undefined : titre}
      onClick={(e) => {
        e.stopPropagation()
        if (interactive) onZone?.(id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (interactive) onZone?.(`${id}@droit`)
      }}
    >
      {children}
    </button>
  )
}

export function SceneCadre({ children, ...ctx }: ContexteZones & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [echelle, setEchelle] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setEchelle(Math.min(1.4, e.contentRect.width / LARGEUR)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <Ctx.Provider value={ctx}>
      <div className={ctx.interactive ? 'scene-cadre interactive' : 'scene-cadre'} ref={ref} style={{ height: HAUTEUR * echelle }}>
        <div className="scene" style={{ width: LARGEUR, height: HAUTEUR, transform: `scale(${echelle})` }}>
          {children}
        </div>
      </div>
    </Ctx.Provider>
  )
}

// Petites icônes au trait pour les écrans (taille 18 par défaut).
export function Ico({ d, size = 18, fill = 'none', stroke = 'currentColor' }: { d: string; size?: number; fill?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

export const PATHS = {
  disquette: 'M5 3h11l3 3v15H5z M8 3v6h8V3 M8 21v-7h8v7',
  annuler: 'M9 14L4 9l5-5 M4 9h10a6 6 0 0 1 0 12h-3',
  retablir: 'M15 14l5-5-5-5 M20 9H10a6 6 0 0 0 0 12h3',
  retour: 'M15 6l-6 6 6 6',
  avancer: 'M9 6l6 6-6 6',
  actualiser: 'M20 12a8 8 0 1 1-3-6.2 M20 4v5h-5',
  maison: 'M3 11l9-7 9 7 M5 10v10h14V10',
  etoile: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z',
  points: 'M12 5h.01 M12 12h.01 M12 19h.01',
  cadenas: 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4',
  plus: 'M12 5v14 M5 12h14',
  croix: 'M6 6l12 12 M18 6L6 18',
  loupe: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
  dossier: 'M3 6h6l2 2h10v11H3z',
  corbeille: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  ciseaux: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.5 7.5L20 19 M8.5 16.5L20 5',
  copier: 'M8 8h12v12H8z M4 16V4h12',
  coller: 'M8 4h8v3H8z M6 6H4v15h16V6h-2',
  crayon: 'M4 20h4L19 9l-4-4L4 16z',
  alimentation: 'M12 3v9 M6.3 6.3a8 8 0 1 0 11.4 0',
  engrenage: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12l2-1-1-3-2 .3-1.4-1.4.3-2-3-1-1 2h-2l-1-2-3 1 .3 2L6.3 7.3 4.3 7l-1 3 2 1v2l-2 1 1 3 2-.3 1.4 1.4-.3 2 3 1 1-2h2l1 2 3-1-.3-2 1.4-1.4 2 .3 1-3-2-1z',
  wifi: 'M2 9a15 15 0 0 1 20 0 M5 12.5a10 10 0 0 1 14 0 M8.5 16a5 5 0 0 1 7 0 M12 19.5h.01',
  son: 'M4 10v4h4l5 4V6L8 10z M16.5 8.5a5 5 0 0 1 0 7',
  usb: 'M10 2h4v5h-4z M8 7h8v10a4 4 0 0 1-8 0z',
  image: 'M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6 M15.5 9.5h.01',
  tableau: 'M3 5h18v14H3z M3 10h18 M3 15h18 M9 5v14 M15 5v14',
  imprimante: 'M7 9V3h10v6 M5 9h14v8H5z M8 14h8v7H8z',
  telechargement: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  horloge: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  liste: 'M9 6h12 M9 12h12 M9 18h12 M4 6h.01 M4 12h.01 M4 18h.01',
  gauche: 'M4 6h16 M4 10h10 M4 14h16 M4 18h10',
  centre: 'M4 6h16 M7 10h10 M4 14h16 M7 18h10',
  droite: 'M4 6h16 M10 10h10 M4 14h16 M10 18h10'
}

// Clic droit sur un emplacement vide : voir ../nouveau.ts.
// Fond cliquable (placé sous les éléments de la fenêtre ou du bureau).
export function Fond() {
  return <Zone id="fond" className="sc-fond" titre="Emplacement vide" />
}

export function MenuFond({ menu, haut, gauche }: { menu: string | null; haut: number; gauche: number }) {
  if (menu !== MENU_FOND && menu !== MENU_FOND_NOUVEAU) return null
  return (
    <>
      <div className="sc-popup sc-popup-fond" style={{ top: haut, left: gauche }}>
        <span className="sc-popup-item sc-popup-inactif">Affichage</span>
        <span className="sc-popup-item sc-popup-inactif">Trier par</span>
        <Zone id="ctx-actualiser" className="sc-popup-item" titre="Actualiser">
          <Ico d={PATHS.actualiser} size={16} /> Actualiser
        </Zone>
        <Zone id="ctx-nouveau" className={menu === MENU_FOND_NOUVEAU ? 'sc-popup-item sc-popup-ouvert' : 'sc-popup-item'} titre="Nouveau">
          <Ico d={PATHS.plus} size={16} /> Nouveau <span className="sc-popup-fleche">›</span>
        </Zone>
        <Zone id="ctx-proprietes" className="sc-popup-item" titre="Propriétés">
          Propriétés
        </Zone>
      </div>
      {menu === MENU_FOND_NOUVEAU && (
        <div className="sc-popup sc-popup-fond-nouveau" style={{ top: haut + 111, left: gauche + 192 }}>
          {NOUVEAUX_TYPES.map((t) => (
            <Zone key={t.id} id={t.id} className="sc-popup-item" titre={t.nom}>
              <span className={`sc-type-icone sc-type-${t.id.replace('ctx-nouveau-', '')}`}>
                {t.dossier ? <Ico d={PATHS.dossier} size={16} stroke="#a77b00" fill="#ffd45a" /> : t.icone}
              </span>
              {t.nom}
            </Zone>
          ))}
        </div>
      )}
    </>
  )
}
