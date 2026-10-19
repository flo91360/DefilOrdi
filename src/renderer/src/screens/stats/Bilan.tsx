import { useState } from 'react'
import type { Profile, Resultat } from '../../../../shared/data'
import { IconBack } from '../../components/Icons'
import { LineChart } from '../../components/LineChart'
import { formatDuree } from '../../games/dactylo/engine'
import { nomJeu } from '../../games/jeux'
import { calculerBilan, jourLocal, type LigneBilan } from './bilan'
import { ecart, points } from './commun'
import { indicateursDu } from './parJeu'

// Bilan d'un enfant sur une période, à imprimer (ou enregistrer en PDF avec
// l'imprimante « Microsoft Print to PDF ») pour un compte rendu.
const PERIODES = [
  { nom: 'Tout', mois: 0 },
  { nom: '12 derniers mois', mois: 12 },
  { nom: '3 derniers mois', mois: 3 },
  { nom: 'Dernier mois', mois: 1 }
]

const dateJour = (jour: string) => {
  const [a, m, j] = jour.split('-').map(Number)
  return new Date(a, m - 1, j).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatValeur = (v: number, unite: string) => `${String(v).replace('.', ',')}${unite === '%' ? ' %' : unite === 's' ? ' s' : ''}`

export function Bilan({ profile, resultats, onRetour }: { profile: Profile; resultats: Resultat[]; onRetour: () => void }) {
  const aujourdhui = jourLocal(new Date())
  const premier = resultats.length > 0 ? jourLocal(resultats[0].date) : aujourdhui
  const [du, setDu] = useState(premier)
  const [au, setAu] = useState(aujourdhui)
  const [observations, setObservations] = useState('')
  const bilan = calculerBilan(resultats, du, au, profile.medailles)

  const choisirPeriode = (mois: number) => {
    if (mois === 0) setDu(premier)
    else {
      const d = new Date()
      d.setMonth(d.getMonth() - mois)
      setDu(jourLocal(d))
    }
    setAu(aujourdhui)
  }

  return (
    <section className="bilan-ecran">
      <div className="bilan-outils no-print">
        <button className="btn btn-ghost btn-sm" onClick={onRetour}>
          <IconBack size={18} /> Statistiques
        </button>
        <div className="bilan-periodes" role="group" aria-label="Période">
          {PERIODES.map((p) => (
            <button key={p.nom} className="btn btn-soft btn-sm" onClick={() => choisirPeriode(p.mois)}>
              {p.nom}
            </button>
          ))}
        </div>
        <label>
          Du <input className="input" type="date" value={du} max={au} onChange={(e) => e.target.value && setDu(e.target.value)} />
        </label>
        <label>
          au <input className="input" type="date" value={au} min={du} onChange={(e) => e.target.value && setAu(e.target.value)} />
        </label>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Imprimer
        </button>
      </div>
      <p className="ergo-help no-print">
        Pour obtenir un fichier PDF, choisissez l’imprimante « Microsoft Print to PDF ». Les observations ne sont pas
        enregistrées dans le logiciel : elles servent seulement à l’impression.
      </p>

      <article className="bilan">
        <header className="bilan-tete">
          <h1>Bilan de {profile.prenom}</h1>
          <p>
            {profile.classe} · niveau {profile.niveau}
            {profile.age !== null && ` · ${profile.age} ans`}
          </p>
          <p>
            Du {dateJour(du)} au {dateJour(au)} · édité le {dateJour(aujourdhui)}
          </p>
        </header>

        {bilan.parties === 0 ? (
          <p>Aucune partie jouée sur cette période.</p>
        ) : (
          <>
            <p className="bilan-resume">
              <strong>{bilan.parties}</strong> partie{bilan.parties > 1 ? 's' : ''} sur <strong>{bilan.jours}</strong> jour
              {bilan.jours > 1 ? 's' : ''} d’utilisation, {formatDuree(bilan.dureeMs)} de jeu au total
              {bilan.medailles > 0 && `, ${bilan.medailles} médaille${bilan.medailles > 1 ? 's' : ''} gagnée${bilan.medailles > 1 ? 's' : ''} en Dactylo`}.
            </p>
            {bilan.jeux.map((j) => {
              const principal = indicateursDu(j.jeu)[0]
              return (
                <section key={j.jeu} className="bilan-jeu">
                  <h2>
                    {nomJeu(j.jeu)}{' '}
                    <span className="bilan-jeu-info">
                      · {j.parties.length} partie{j.parties.length > 1 ? 's' : ''}, du {dateJour(jourLocal(j.parties[0].date))} au{' '}
                      {dateJour(jourLocal(j.parties[j.parties.length - 1].date))}
                    </span>
                  </h2>
                  <table className="bilan-table">
                    <thead>
                      <tr>
                        <th>Mesure</th>
                        <th className="num">Début de période</th>
                        <th className="num">Fin de période</th>
                        <th className="num">Évolution</th>
                        <th className="num">Meilleur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {j.lignes.map((l) => (
                        <LigneTableau key={l.nom} ligne={l} />
                      ))}
                    </tbody>
                  </table>
                  {j.parties.length > 1 && (
                    <div className="bilan-courbe">
                      <LineChart
                        titre={`${principal.nom} (${principal.unite})`}
                        unite={principal.unite === '%' ? ' %' : ''}
                        max={principal.unite === '%' ? 100 : undefined}
                        points={points(j.parties, principal.valeur, () => nomJeu(j.jeu))}
                      />
                    </div>
                  )}
                </section>
              )
            })}
            <p className="bilan-note">
              Début et fin de période : moyenne des 3 premières et des 3 dernières parties de la période (moins s’il y a
              peu de parties).
            </p>
          </>
        )}

        <section className="bilan-observations">
          <h2>Observations</h2>
          <textarea
            className="input"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Vos remarques, à imprimer avec le bilan (non enregistrées)."
            rows={5}
          />
          <p className="bilan-observations-texte">{observations}</p>
        </section>
      </article>
    </section>
  )
}

function LigneTableau({ ligne: l }: { ligne: LigneBilan }) {
  const evolution = Math.round((l.fin - l.debut) * 10) / 10
  return (
    <tr>
      <td>
        {l.nom} <span className="muted">({l.unite})</span>
      </td>
      <td className="num">{formatValeur(l.debut, l.unite)}</td>
      <td className="num">{formatValeur(l.fin, l.unite)}</td>
      <td className={l.progres === null ? 'num' : l.progres ? 'num bilan-mieux' : 'num bilan-moins'}>
        {l.progres === null ? '—' : ecart(evolution, l.unite === '%' ? ' pt' : '').replace('.', ',')}
      </td>
      <td className="num">{formatValeur(l.meilleur, l.unite)}</td>
    </tr>
  )
}
