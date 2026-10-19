import { useState } from 'react'
import { NIVEAUX, type PhraseEnfant, PHRASE_MAX } from '../../../shared/data'
import { texteRegle } from '../../../shared/regles'
import { ConfirmDialog } from '../components/Modal'
import { IconTrash } from '../components/Icons'
import { NIVEAU_LABELS } from './niveaux'

// Phrases inventées par les enfants après une médaille. Les phrases refusées
// par le correcteur arrivent ici comme notification : l'ergothérapeute les
// corrige puis les valide pour qu'elles rejoignent les phrases du niveau.
// Avec la relecture (réglage par défaut), les phrases acceptées par le
// correcteur attendent aussi son accord avant d'être proposées aux enfants.
export function PhrasesEnfantsEditor({
  phrases,
  relecture,
  onChange,
  onRelecture
}: {
  phrases: PhraseEnfant[]
  relecture: boolean
  onChange: (p: PhraseEnfant[]) => void
  onRelecture: (relecture: boolean) => void
}) {
  const [aSupprimer, setASupprimer] = useState<PhraseEnfant | null>(null)
  const modifier = (p: PhraseEnfant) => onChange(phrases.map((x) => (x.id === p.id ? p : x)))
  const aVerifier = phrases.filter((p) => p.statut === 'a_verifier')
  const valides = phrases.filter((p) => p.statut === 'valide')

  const ligne = (p: PhraseEnfant) => (
    <li key={p.id} className="card phrase-enfant">
      <div className="phrase-enfant-meta">
        <strong>{p.prenom || 'Enfant'}</strong> · {new Date(p.date).toLocaleDateString('fr-FR')}
      </div>
      <input
        className="input"
        value={p.texte}
        maxLength={PHRASE_MAX}
        aria-label={`Phrase de ${p.prenom || 'l’enfant'}`}
        onChange={(e) => modifier({ ...p, texte: e.target.value })}
        onBlur={(e) => {
          if (e.target.value.trim() === '') setASupprimer(p)
          else modifier({ ...p, texte: e.target.value.trim().replace(/\s+/g, ' ') })
        }}
      />
      <select className="select" value={p.niveau} aria-label="Niveau" onChange={(e) => modifier({ ...p, niveau: Number(e.target.value) })}>
        {NIVEAUX.map((n) => (
          <option key={n} value={n}>
            {NIVEAU_LABELS[n]}
          </option>
        ))}
      </select>
      {p.statut === 'a_verifier' && (
        <>
          {p.motifs.length === 0 ? (
            <p className="phrase-enfant-meta">Phrase correcte : elle attend votre accord pour être proposée aux enfants.</p>
          ) : (
            <ul className="phrase-enfant-motifs">
              {p.motifs.map((m) => (
                <li key={m}>{m}</li>
              ))}
              <li className="small">{texteRegle(p.niveau)}</li>
            </ul>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => modifier({ ...p, statut: 'valide', motifs: [] })}>
            Valider cette phrase
          </button>
        </>
      )}
      <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => setASupprimer(p)}>
        <IconTrash size={18} /> Supprimer
      </button>
    </li>
  )

  return (
    <section>
      <h1 className="ergo-title">Phrases des enfants</h1>
      <p className="ergo-help">
        Après une médaille, l’enfant peut écrire une phrase. Elle est vérifiée (règles du niveau et orthographe, sans connexion) puis ajoutée aux
        phrases du niveau, pour tous les joueurs. Si elle est refusée, elle apparaît ci-dessous : vous pouvez la corriger puis la valider.
      </p>
      <label className="card option-row">
        <input type="checkbox" className="switch" checked={relecture} onChange={(e) => onRelecture(e.target.checked)} />
        <span>
          <strong>Relire chaque phrase avant qu’elle soit proposée aux autres enfants (conseillé)</strong>
          <span className="option-detail">
            Le correcteur vérifie l’orthographe et les règles du niveau, mais pas le sens : une phrase blessante pour un autre
            enfant serait acceptée. Avec la relecture, chaque phrase attend ici votre accord.
          </span>
        </span>
      </label>
      <h2 className="ergo-subtitle">À vérifier ({aVerifier.length})</h2>
      {aVerifier.length === 0 ? <p className="empty">Aucune phrase à vérifier.</p> : <ul className="phrases-enfants-liste">{aVerifier.map(ligne)}</ul>}
      <h2 className="ergo-subtitle">Phrases ajoutées ({valides.length})</h2>
      {valides.length === 0 ? <p className="empty">Aucune phrase ajoutée par un enfant pour l’instant.</p> : <ul className="phrases-enfants-liste">{valides.map(ligne)}</ul>}
      {aSupprimer && (
        <ConfirmDialog
          title="Supprimer cette phrase ?"
          message={<>La phrase « {aSupprimer.texte || '(vide)'} » sera supprimée.</>}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setASupprimer(null)}
          onConfirm={() => {
            onChange(phrases.filter((x) => x.id !== aSupprimer.id))
            setASupprimer(null)
          }}
        />
      )}
    </section>
  )
}
