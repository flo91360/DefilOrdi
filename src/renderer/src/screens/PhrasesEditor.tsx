import { useEffect, useRef, useState } from 'react'
import { type ListePhrases, NIVEAUX, NOM_LISTE_MAX, PHRASE_MAX } from '../../../shared/data'
import { ConfirmDialog } from '../components/Modal'
import { IconPlus, IconTrash } from '../components/Icons'
import { uid } from '../uid'
import { NIVEAU_LABELS } from './niveaux'

// Textes propres à chaque éditeur (phrases de Dactylo, mots de Mots à retenir).
export interface TextesEditeur {
  titre: string
  aide: string
  element: string // « phrase » ou « mot »
  origine: () => ListePhrases[]
  image?: (ligne: string) => string // image attribuée automatiquement à chaque ligne (Mots à retenir)
}

interface Props {
  textes: TextesEditeur
  listes: ListePhrases[]
  onChange: (listes: ListePhrases[]) => void
}

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

export function PhrasesEditor({ textes, listes, onChange }: Props) {
  const [selection, setSelection] = useState<string | null>(listes[0]?.id ?? null)
  const [aSupprimer, setASupprimer] = useState<ListePhrases | null>(null)
  const [restaurer, setRestaurer] = useState(false)
  const courante = listes.find((l) => l.id === selection) ?? listes[0]

  // Toujours partir des listes les plus récentes : une liste peut enregistrer
  // son brouillon au moment où elle disparaît de l'écran.
  const listesRef = useRef(listes)
  listesRef.current = listes
  const modifier = (l: ListePhrases) => {
    const actuelles = listesRef.current
    if (actuelles.some((x) => x.id === l.id)) onChange(actuelles.map((x) => (x.id === l.id ? l : x)))
  }

  const ajouter = () => {
    const l: ListePhrases = { id: uid(), nom: 'Nouvelle liste', niveau: 1, phrases: [] }
    onChange([...listes, l])
    setSelection(l.id)
  }

  return (
    <section>
      <h1 className="ergo-title">{textes.titre}</h1>
      <p className="ergo-help">{textes.aide}</p>

      <div className="phrases-layout">
        <div className="phrases-side">
          {listes.map((l) => (
            <button
              key={l.id}
              className={l.id === courante?.id ? 'phrases-item active' : 'phrases-item'}
              onClick={() => setSelection(l.id)}
            >
              <span className="phrases-item-nom">{l.nom}</span>
              <span className="phrases-item-info">
                Niveau {l.niveau} · {pluriel(l.phrases.length, textes.element)}
              </span>
            </button>
          ))}
          <button className="btn btn-soft" onClick={ajouter}>
            <IconPlus /> Nouvelle liste
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setRestaurer(true)}>
            Restaurer les listes d’origine
          </button>
        </div>

        {courante ? (
          <ListeForm key={courante.id} element={textes.element} image={textes.image} liste={courante} onChange={modifier} onSupprimer={() => setASupprimer(courante)} />
        ) : (
          <p className="empty">Aucune liste. Créez-en une avec « Nouvelle liste ».</p>
        )}
      </div>

      {aSupprimer && (
        <ConfirmDialog
          title="Supprimer cette liste ?"
          message={
            <>
              La liste <strong>{aSupprimer.nom}</strong> ({pluriel(aSupprimer.phrases.length, textes.element)}) sera supprimée.
            </>
          }
          confirmLabel="Supprimer"
          danger
          onCancel={() => setASupprimer(null)}
          onConfirm={() => {
            const reste = listes.filter((l) => l.id !== aSupprimer.id)
            onChange(reste)
            setSelection(reste[0]?.id ?? null)
            setASupprimer(null)
          }}
        />
      )}

      {restaurer && (
        <ConfirmDialog
          title="Restaurer les listes d’origine ?"
          message="Les listes fournies avec le logiciel seront remises dans leur état d’origine. Vos autres listes sont conservées."
          confirmLabel="Restaurer"
          onCancel={() => setRestaurer(false)}
          onConfirm={() => {
            const origine = textes.origine()
            const ids = new Set(origine.map((l) => l.id))
            onChange([...origine, ...listes.filter((l) => !ids.has(l.id))])
            setSelection(origine[0].id)
            setRestaurer(false)
          }}
        />
      )}
    </section>
  )
}

function ListeForm({
  element,
  image,
  liste,
  onChange,
  onSupprimer
}: {
  element: string
  image?: (ligne: string) => string
  liste: ListePhrases
  onChange: (l: ListePhrases) => void
  onSupprimer: () => void
}) {
  const [nom, setNom] = useState(liste.nom)
  const [texte, setTexte] = useState(liste.phrases.join('\n'))

  // Les modifications du texte sont enregistrées quand on quitte le champ,
  // et aussi si on change de liste ou de section sans le quitter.
  const brouillon = useRef({ nom, texte, liste, onChange })
  brouillon.current = { nom, texte, liste, onChange }

  const lireBrouillon = (): ListePhrases => {
    const b = brouillon.current
    const phrases = b.texte
      .split('\n')
      .map((p) => p.trim().slice(0, PHRASE_MAX))
      .filter((p) => p !== '')
    return { ...b.liste, nom: b.nom.trim().slice(0, NOM_LISTE_MAX) || 'Sans nom', phrases }
  }

  const enregistrer = () => {
    const b = brouillon.current
    const l = lireBrouillon()
    if (l.nom !== b.liste.nom || l.phrases.join('\n') !== b.liste.phrases.join('\n')) b.onChange(l)
  }

  useEffect(() => () => enregistrer(), [])

  const nbPhrases = texte.split('\n').filter((p) => p.trim() !== '').length

  return (
    <div className="card phrases-form">
      <div className="phrases-form-row">
        <label className="field">
          Nom de la liste
          <input className="input" value={nom} maxLength={NOM_LISTE_MAX} onChange={(e) => setNom(e.target.value)} onBlur={enregistrer} />
        </label>
        <label className="field">
          Niveau conseillé
          <select
            className="select"
            value={liste.niveau}
            onChange={(e) => onChange({ ...lireBrouillon(), niveau: Number(e.target.value) })}
          >
            {NIVEAUX.map((n) => (
              <option key={n} value={n}>
                {NIVEAU_LABELS[n]}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-ghost btn-sm btn-danger-text phrases-delete" onClick={onSupprimer}>
          <IconTrash size={18} /> Supprimer la liste
        </button>
      </div>
      <label className="field">
        {element === 'mot' ? 'Mots' : 'Phrases'} ({nbPhrases}) — un{element === 'mot' ? '' : 'e'} par ligne
        <textarea
          className="input phrases-textarea"
          value={texte}
          spellCheck
          lang="fr"
          onChange={(e) => setTexte(e.target.value)}
          onBlur={enregistrer}
        />
      </label>
      {image && nbPhrases > 0 && (
        <div className="mots-apercu">
          <span className="mots-apercu-titre">Image attribuée automatiquement à chaque mot (si l’option « Avec images » est choisie avant la partie) :</span>
          <div className="mots-apercu-liste">
            {texte
              .split('\n')
              .map((p) => p.trim())
              .filter((p) => p !== '')
              .map((p, i) => (
                <span key={`${i}-${p}`} className="mots-apercu-mot">
                  <span aria-hidden="true">{image(p)}</span> {p}
                </span>
              ))}
          </div>
        </div>
      )}
      <p className="ergo-help small">
        Les caractères absents du clavier (œ, « », apostrophe typographique…) sont remplacés automatiquement dans le jeu.
      </p>
    </div>
  )
}
