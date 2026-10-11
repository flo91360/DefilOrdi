import { mix, textOn } from '../color'
import { type Doigt, RANGEES } from './azerty'

// Teintes douces par doigt (méthode classique de dactylographie).
export const COULEURS_DOIGTS: Record<Doigt, string> = {
  'auriculaire-g': '#fde2e4',
  'annulaire-g': '#fff1c9',
  'majeur-g': '#dff3e0',
  'index-g': '#dcebfb',
  pouce: '#eeeeee',
  'index-d': '#dcebfb',
  'majeur-d': '#dff3e0',
  'annulaire-d': '#fff1c9',
  'auriculaire-d': '#fde2e4'
}

export const LEGENDE_DOIGTS: [string, string][] = [
  ['Auriculaire', '#fde2e4'],
  ['Annulaire', '#fff1c9'],
  ['Majeur', '#dff3e0'],
  ['Index', '#dcebfb'],
  ['Pouce', '#eeeeee']
]

// Échelle des erreurs : une seule teinte, du clair au foncé.
const CHAUD_MIN = '#fde7d9'
const CHAUD_MAX = '#b4400f'

export function couleurChaleur(n: number, max: number): string {
  if (n <= 0 || max <= 0) return '#ffffff'
  return mix(CHAUD_MIN, CHAUD_MAX, Math.min(1, n / max))
}

interface Props {
  cibles?: string[] // touches à presser maintenant
  suivantes?: string[] // touches de l'étape suivante (ex. « e » après « ^ »)
  doigts?: boolean
  chaleur?: Record<string, number>
}

export function Keyboard({ cibles = [], suivantes = [], doigts = false, chaleur }: Props) {
  const max = chaleur ? Math.max(0, ...Object.values(chaleur)) : 0
  return (
    <div className="kb" aria-hidden="true">
      {RANGEES.map((rangee, i) => (
        <div className="kb-row" key={i}>
          {rangee.map((k) => {
            const n = chaleur?.[k.id] ?? 0
            let fond = '#ffffff'
            if (chaleur) fond = couleurChaleur(n, max)
            else if (doigts) fond = COULEURS_DOIGTS[k.doigt]
            const classes = ['kb-key']
            if (k.speciale) classes.push('kb-key-special')
            if (k.id === 'vide') classes.push('kb-key-blank')
            if (cibles.includes(k.id)) classes.push('kb-key-target')
            else if (suivantes.includes(k.id)) classes.push('kb-key-next')
            const lettre = /^[a-z]$/.test(k.label) ? k.label.toUpperCase() : k.label
            return (
              <div
                key={k.id}
                className={classes.join(' ')}
                style={{ flexGrow: k.largeur ?? 1, background: fond, color: chaleur ? textOn(fond) : undefined }}
                title={chaleur && n > 0 ? `${lettre} : ${n} erreur${n > 1 ? 's' : ''}` : undefined}
              >
                {k.haut && !/^[a-z]$/.test(k.label) && <span className="kb-up">{k.haut}</span>}
                <span className="kb-main">{lettre}</span>
                {chaleur && n > 0 && <span className="kb-count">{n}</span>}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
