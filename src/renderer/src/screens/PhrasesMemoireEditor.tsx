import { useEffect, useRef, useState } from 'react'
import { nettoyerPhrases } from '../../../shared/data'
import { defaultPhrasesMemoire } from '../../../shared/phrases'
import { ConfirmDialog } from '../components/Modal'
import { motsDePhrase } from '../games/memoire/engine'

// Phrases du palier « phrase » de Mots à retenir (après 7 mots), modifiables
// par l'ergothérapeute dans la section Mots.
export function PhrasesMemoireEditor({ phrases, onChange }: { phrases: string[]; onChange: (p: string[]) => void }) {
  const [texte, setTexte] = useState(phrases.join('\n'))
  const [restaurer, setRestaurer] = useState(false)

  // Enregistré quand on quitte le champ, ou si on change de section sans le quitter.
  const brouillon = useRef({ texte, phrases, onChange })
  brouillon.current = { texte, phrases, onChange }
  const enregistrer = () => {
    const b = brouillon.current
    const p = nettoyerPhrases(b.texte.split('\n'))
    if (p.join('\n') !== b.phrases.join('\n')) b.onChange(p)
  }
  useEffect(() => () => enregistrer(), [])

  const lignes = nettoyerPhrases(texte.split('\n'))
  const tailles = lignes.map((p) => motsDePhrase(p).length)
  const moyenne = tailles.length > 0 ? Math.round(tailles.reduce((a, b) => a + b, 0) / tailles.length) : 0

  return (
    <div className="card phrases-form memoire-phrases-editor">
      <h2 className="card-title">Phrases à retenir (après 7 mots)</h2>
      <p className="ergo-help small">
        Après 3 réussites à 7 mots, l’enfant doit retenir une vraie phrase d’environ 10 mots et la retaper entière, dans
        l’ordre (accents, majuscules et ponctuation ne comptent pas). Une phrase par ligne. Si la liste est vide, les phrases
        d’origine sont utilisées.
      </p>
      <label className="field">
        Phrases ({lignes.length}
        {lignes.length > 0 ? ` · ${moyenne} mots en moyenne` : ''})
        <textarea
          className="input phrases-textarea"
          value={texte}
          spellCheck
          lang="fr"
          onChange={(e) => setTexte(e.target.value)}
          onBlur={enregistrer}
        />
      </label>
      <button className="btn btn-ghost btn-sm" onClick={() => setRestaurer(true)}>
        Restaurer les phrases d’origine
      </button>

      {restaurer && (
        <ConfirmDialog
          title="Restaurer les phrases d’origine ?"
          message="Les phrases à retenir seront remplacées par celles fournies avec le logiciel."
          confirmLabel="Restaurer"
          onCancel={() => setRestaurer(false)}
          onConfirm={() => {
            const origine = defaultPhrasesMemoire()
            setTexte(origine.join('\n'))
            brouillon.current = { ...brouillon.current, texte: origine.join('\n') }
            onChange(origine)
            setRestaurer(false)
          }}
        />
      )}
    </div>
  )
}
