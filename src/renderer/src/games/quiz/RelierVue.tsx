import { useState } from 'react'
import { LOGICIELS, type Liaisons, type LogicielId, nomLogiciel, type QuestionRelier, toutesReliees, verifierRelier } from './relier'

// Jeu « Points reliés » : clic sur une action, puis sur un logiciel.
// Le contrôle se fait une seule fois, quand les 10 actions sont reliées.
export function RelierVue({
  question: q,
  fini,
  onFin
}: {
  question: QuestionRelier
  fini: boolean
  onFin: (juste: boolean, detail: string) => void
}) {
  const [liaisons, setLiaisons] = useState<Liaisons>({})
  const [choisie, setChoisie] = useState<string | null>(null)
  const complet = toutesReliees(q, liaisons)
  const verdict = fini ? verifierRelier(q, liaisons) : null
  const fausses = new Set(verdict?.fausses.map((a) => a.id))

  const cliquerAction = (id: string) => {
    if (!fini) setChoisie(choisie === id ? null : id)
  }

  const cliquerLogiciel = (logiciel: LogicielId) => {
    if (fini || choisie === null) return
    const suivantes = { ...liaisons, [choisie]: logiciel }
    setLiaisons(suivantes)
    // passe à la prochaine action pas encore reliée
    const prochaine = q.actions.find((a) => suivantes[a.id] === undefined && a.id !== choisie)
    setChoisie(prochaine ? prochaine.id : null)
  }

  const verifier = () => {
    const v = verifierRelier(q, liaisons)
    const detail = v.juste
      ? 'Les 10 liaisons sont justes, bravo !'
      : `${v.fausses.length} liaison${v.fausses.length > 1 ? 's' : ''} à revoir : ` +
        v.fausses.map((a) => `« ${a.texte} » se fait avec ${nomLogiciel(a.logiciel)}`).join(' ; ') +
        '.'
    onFin(v.juste, detail)
  }

  const nbReliees = q.actions.filter((a) => liaisons[a.id] !== undefined).length

  return (
    <div className="relier">
      <p className="relier-consigne">
        {fini
          ? 'Voici la correction.'
          : choisie
            ? 'Maintenant, clique sur le logiciel qui convient.'
            : complet
              ? 'Tout est relié ! Clique sur « Vérifier ».'
              : 'Clique sur une action, puis sur un logiciel.'}{' '}
        <span className="relier-compte">
          {nbReliees} / {q.actions.length} reliées
        </span>
      </p>
      <div className="relier-colonnes">
        <div className="relier-colonne" aria-label="Actions">
          <h3>Actions</h3>
          {q.actions.map((a) => {
            const l = liaisons[a.id]
            const classes = ['relier-action']
            if (choisie === a.id) classes.push('choisie')
            if (l !== undefined) classes.push('reliee')
            if (fini) classes.push(fausses.has(a.id) ? 'fausse' : 'juste')
            return (
              <button key={a.id} className={classes.join(' ')} disabled={fini} onClick={() => cliquerAction(a.id)}>
                <span className="relier-action-texte">{a.texte}</span>
                {l !== undefined && <span className="relier-lien">→ {nomLogiciel(l)}</span>}
                {fini && fausses.has(a.id) && <span className="relier-bonne">Bonne réponse : {nomLogiciel(a.logiciel)}</span>}
              </button>
            )
          })}
        </div>
        <div className="relier-colonne" aria-label="Logiciels">
          <h3>Logiciels</h3>
          {LOGICIELS.map((l) => {
            const n = q.actions.filter((a) => liaisons[a.id] === l.id).length
            return (
              <button key={l.id} className="relier-logiciel" disabled={fini || choisie === null} onClick={() => cliquerLogiciel(l.id)}>
                <span>
                  {l.nom}
                  {l.precision && <small> ({l.precision})</small>}
                </span>
                {n > 0 && <span className="relier-nb">{n}</span>}
              </button>
            )
          })}
        </div>
      </div>
      {!fini && (
        <div className="relier-verifier">
          <button className="btn btn-primary btn-lg" disabled={!complet} onClick={verifier}>
            Vérifier
          </button>
        </div>
      )}
    </div>
  )
}
