import { useMemo, useState } from 'react'
import { type PhraseEnfant, type Profile, PHRASE_MAX } from '../../../../shared/data'
import { Dictionnaire, messageOrthographe } from '../../../../shared/orthographe'
import { reglesDuNiveau, texteRegle, verifierRegles } from '../../../../shared/regles'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { preparePhrase } from './engine'

// Contrôle d'une phrase d'enfant : règles du niveau puis orthographe (hors
// ligne). Renvoie la liste des remarques ; vide = phrase acceptée.
export function controlerPhrase(texte: string, niveau: number, dico: Dictionnaire): string[] {
  const problemes = verifierRegles(texte, niveau)
  const inconnus = dico.inconnus(texte, reglesDuNiveau(niveau).accents)
  if (inconnus.length > 0) problemes.push(messageOrthographe(inconnus))
  return problemes
}

// Proposé juste après l'affichage de la médaille : une médaille, une phrase.
export function PhrasePerso({
  profile,
  niveau,
  motsConnus,
  onPhrase
}: {
  profile: Profile
  niveau: number
  motsConnus: string[]
  onPhrase: (p: PhraseEnfant) => void
}) {
  const [texte, setTexte] = useState('')
  const [problemes, setProblemes] = useState<string[]>([])
  const [etat, setEtat] = useState<'saisie' | 'ajoutee' | 'passee'>('saisie')
  const [dejaSignalees, setDejaSignalees] = useState<string[]>([])
  const dico = useMemo(() => new Dictionnaire(motsConnus), [motsConnus])
  const max = reglesDuNiveau(niveau).maxMots

  const valider = () => {
    const t = preparePhrase(texte)
    const p = controlerPhrase(t, niveau, dico)
    const base = { id: uid(), texte: t, niveau, profileId: profile.id, prenom: profile.prenom, date: new Date().toISOString() }
    if (p.length === 0) {
      onPhrase({ ...base, statut: 'valide', motifs: [] })
      setProblemes([])
      setEtat('ajoutee')
      return
    }
    // Refus doux : l'enfant peut corriger, l'ergothérapeute est prévenue.
    setProblemes(p)
    if (profile.dactylo.sonErreur) playSound(profile.sonEchec)
    if (!dejaSignalees.includes(t)) {
      setDejaSignalees([...dejaSignalees, t])
      onPhrase({ ...base, statut: 'a_verifier', motifs: p })
    }
  }

  if (etat === 'ajoutee') {
    return (
      <div className="phrase-perso" role="status">
        <strong>Merci ! Ta phrase est ajoutée au niveau {niveau}.</strong>
        <p>Elle pourra être tirée dans les parties de tous les joueurs.</p>
      </div>
    )
  }
  if (etat === 'passee') return null

  return (
    <form
      className="phrase-perso"
      onSubmit={(e) => {
        e.preventDefault()
        valider()
      }}
    >
      <strong>Tu as gagné le droit d’inventer une phrase !</strong>
      <p className="phrase-perso-regle">{texteRegle(niveau)}</p>
      <label className="field">
        Ta phrase{max !== null ? ` (${max} mots au maximum)` : ''}
        <input
          className="input"
          value={texte}
          maxLength={PHRASE_MAX}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setTexte(e.target.value)
            setProblemes([])
          }}
        />
      </label>
      {problemes.length > 0 && (
        <div className="phrase-perso-alerte" role="alert">
          <p>Oups, ta phrase n’est pas encore prête :</p>
          <ul>
            {problemes.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p>{texteRegle(niveau)}</p>
          <p>Tu peux la corriger. Ton ergothérapeute a été prévenue et la regardera aussi.</p>
        </div>
      )}
      <div className="phrase-perso-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setEtat('passee')}>
          Plus tard, non merci
        </button>
        <button type="submit" className="btn btn-primary" disabled={texte.trim() === ''}>
          Valider ma phrase
        </button>
      </div>
    </form>
  )
}
