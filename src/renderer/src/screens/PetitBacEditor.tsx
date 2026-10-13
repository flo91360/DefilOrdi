import { useEffect, useRef, useState } from 'react'
import {
  CATEGORIES_MAX,
  defaultPetitBac,
  LETTRES_ALPHABET,
  LETTRES_DIFFICILES,
  nettoyerCategories,
  type ReglagesPetitBac
} from '../../../shared/data'
import { ConfirmDialog } from '../components/Modal'

interface Props {
  reglages: ReglagesPetitBac
  onChange: (r: ReglagesPetitBac) => void
}

const lignes = (texte: string) => texte.split('\n')

export function PetitBacEditor({ reglages, onChange }: Props) {
  const [texte, setTexte] = useState(reglages.categories.join('\n'))
  const [restaurer, setRestaurer] = useState(false)

  // Les catégories sont enregistrées quand on quitte le champ, et aussi si on
  // change de section sans le quitter.
  const brouillon = useRef({ texte, reglages, onChange })
  brouillon.current = { texte, reglages, onChange }

  const enregistrer = () => {
    const b = brouillon.current
    const categories = nettoyerCategories(lignes(b.texte))
    if (categories.join('\n') !== b.reglages.categories.join('\n')) b.onChange({ ...b.reglages, categories })
  }

  useEffect(() => () => enregistrer(), [])

  // Changer les lettres enregistre aussi le texte des catégories en cours.
  const choisirLettres = (lettres: string[]) =>
    onChange({ categories: nettoyerCategories(lignes(texte)), lettres: LETTRES_ALPHABET.filter((l) => lettres.includes(l)) })

  const cochees = new Set(reglages.lettres)
  const basculer = (l: string) => choisirLettres(cochees.has(l) ? reglages.lettres.filter((x) => x !== l) : [...reglages.lettres, l])

  const nbCategories = nettoyerCategories(lignes(texte)).length
  const nbLignes = lignes(texte).filter((l) => l.trim() !== '').length

  return (
    <section>
      <h1 className="ergo-title">Petit bac</h1>
      <p className="ergo-help">
        À chaque partie, une lettre est tirée au sort parmi les lettres choisies ci-dessous, et quelques catégories sont prises
        au hasard dans votre liste (l’enfant choisit combien). Le jeu vérifie seulement la première lettre de chaque mot : à
        la fin, regardez les réponses avec l’enfant et refusez celles qui ne vont pas dans leur catégorie.
      </p>

      <div className="card">
        <h2 className="card-title">
          Lettres tirées au sort <span className="card-title-sub">({reglages.lettres.length} sur {LETTRES_ALPHABET.length})</span>
        </h2>
        <div className="bac-ed-lettres" role="group" aria-label="Lettres tirées au sort">
          {LETTRES_ALPHABET.map((l) => (
            <button
              key={l}
              className={cochees.has(l) ? 'bac-ed-lettre active' : 'bac-ed-lettre'}
              aria-pressed={cochees.has(l)}
              onClick={() => basculer(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="bac-ed-raccourcis">
          <button className="btn btn-ghost btn-sm" onClick={() => choisirLettres(LETTRES_ALPHABET)}>
            Toutes
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => choisirLettres(LETTRES_ALPHABET.filter((l) => !LETTRES_DIFFICILES.includes(l)))}>
            Toutes sauf {LETTRES_DIFFICILES.join(', ')}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => choisirLettres([])}>
            Aucune
          </button>
        </div>
        {reglages.lettres.length === 0 && (
          <p className="warning bac-ed-alerte">Choisissez au moins une lettre : sans lettre, l’enfant ne peut pas jouer.</p>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Catégories</h2>
        <label className="field">
          Catégories ({nbCategories}) — une par ligne
          <textarea
            className="input phrases-textarea bac-ed-categories"
            value={texte}
            spellCheck
            lang="fr"
            onChange={(e) => setTexte(e.target.value)}
            onBlur={enregistrer}
          />
        </label>
        {nbLignes > CATEGORIES_MAX && (
          <p className="warning bac-ed-alerte">Seules les {CATEGORIES_MAX} premières catégories sont gardées.</p>
        )}
        {nbCategories === 0 && (
          <p className="warning bac-ed-alerte">Ajoutez au moins une catégorie : sans catégorie, l’enfant ne peut pas jouer.</p>
        )}
        <div className="bac-ed-raccourcis">
          <button className="btn btn-ghost btn-sm" onClick={() => setRestaurer(true)}>
            Restaurer les catégories d’origine
          </button>
        </div>
      </div>

      {restaurer && (
        <ConfirmDialog
          title="Restaurer les catégories d’origine ?"
          message="Votre liste de catégories sera remplacée par celle fournie avec le logiciel. Les lettres choisies ne changent pas."
          confirmLabel="Restaurer"
          onCancel={() => setRestaurer(false)}
          onConfirm={() => {
            const categories = defaultPetitBac().categories
            setTexte(categories.join('\n'))
            onChange({ ...reglages, categories })
            setRestaurer(false)
          }}
        />
      )}
    </section>
  )
}
