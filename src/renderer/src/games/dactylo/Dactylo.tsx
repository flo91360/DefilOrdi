import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ListePhrases, Profile, Resultat, ResultatDactylo } from '../../../../shared/data'
import { Avatar } from '../../avatar/Avatar'
import { FullscreenButton } from '../../components/FullscreenButton'
import { IconBack, IconCheck } from '../../components/Icons'
import { geste } from '../../keyboard/azerty'
import { Keyboard } from '../../keyboard/Keyboard'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { StatTile } from '../ui'
import {
  choisirPhrases,
  cumuler,
  effacer,
  type EtatPhrase,
  formatDuree,
  motsParMinute,
  nouvellePhrase,
  precision,
  taper,
  vitesse
} from './engine'

const NOMBRES = [3, 5, 10]

interface Props {
  profile: Profile
  listes: ListePhrases[]
  resultats: Resultat[]
  onResult: (r: ResultatDactylo) => void
  onQuit: () => void
}

type Phase =
  | { nom: 'choix' }
  | { nom: 'jeu'; liste: ListePhrases; phrases: string[] }
  | { nom: 'fin'; liste: ListePhrases; resultat: ResultatDactylo; record: boolean }

export function Dactylo({ profile, listes, resultats, onResult, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const [nombre, setNombre] = useState(5)

  const meilleure = useMemo(
    () => Math.max(0, ...resultats.filter((r): r is ResultatDactylo => r.jeu === 'dactylo' && r.profileId === profile.id).map((r) => vitesse(r))),
    [resultats, profile.id]
  )

  const lancer = (liste: ListePhrases) => setPhase({ nom: 'jeu', liste, phrases: choisirPhrases(liste.phrases, nombre) })

  const terminer = (liste: ListePhrases, etats: EtatPhrase[], complete: boolean) => {
    const faites = etats.filter((e) => e.fin !== null)
    if (faites.length === 0) {
      if (complete) setPhase({ nom: 'choix' })
      else onQuit()
      return
    }
    const s = cumuler(faites, Date.now())
    const resultat: ResultatDactylo = {
      id: uid(),
      profileId: profile.id,
      jeu: 'dactylo',
      date: new Date().toISOString(),
      listeNom: liste.nom,
      phrases: faites.length,
      ...s
    }
    onResult(resultat)
    if (complete) setPhase({ nom: 'fin', liste, resultat, record: meilleure > 0 && vitesse(resultat) > meilleure })
    else onQuit()
  }

  if (phase.nom === 'jeu') {
    return (
      <Partie
        key={phase.phrases.join('|')}
        profile={profile}
        phrases={phase.phrases}
        onFin={(etats) => terminer(phase.liste, etats, true)}
        onQuitter={(etats) => terminer(phase.liste, etats, false)}
      />
    )
  }
  if (phase.nom === 'fin') {
    return (
      <Fin
        profile={profile}
        resultat={phase.resultat}
        record={phase.record}
        onRejouer={() => lancer(phase.liste)}
        onAutre={() => setPhase({ nom: 'choix' })}
        onQuit={onQuit}
      />
    )
  }
  return <Choix profile={profile} listes={listes} nombre={nombre} setNombre={setNombre} onChoisir={lancer} onQuit={onQuit} />
}

function Choix({
  profile,
  listes,
  nombre,
  setNombre,
  onChoisir,
  onQuit
}: {
  profile: Profile
  listes: ListePhrases[]
  nombre: number
  setNombre: (n: number) => void
  onChoisir: (l: ListePhrases) => void
  onQuit: () => void
}) {
  const jouables = listes.filter((l) => l.phrases.length > 0)
  // Les listes du niveau de l'enfant d'abord, puis les autres par niveau.
  const triees = [...jouables].sort(
    (a, b) => Number(b.niveau === profile.niveau) - Number(a.niveau === profile.niveau) || a.niveau - b.niveau
  )
  return (
    <div className="screen dactylo">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={onQuit}>
          <IconBack /> Menu
        </button>
        <h1 className="game-heading">Dactylo</h1>
        <div className="topbar-actions">
          <FullscreenButton />
        </div>
      </header>
      <main className="choix-main">
        <h2 className="choix-title">Choisis tes phrases</h2>
        <div className="choix-nombre" role="radiogroup" aria-label="Nombre de phrases">
          <span>Nombre de phrases :</span>
          {NOMBRES.map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={n === nombre}
              className={n === nombre ? 'chip selected' : 'chip'}
              onClick={() => setNombre(n)}
            >
              {n}
            </button>
          ))}
        </div>
        {triees.length === 0 ? (
          <p className="empty">Aucune liste de phrases. Demande à ton ergothérapeute d’en ajouter.</p>
        ) : (
          <div className="liste-grid">
            {triees.map((l) => (
              <button key={l.id} className="liste-card" onClick={() => onChoisir(l)}>
                {l.niveau === profile.niveau && <span className="liste-badge">Pour toi</span>}
                <span className="liste-nom">{l.nom}</span>
                <span className="liste-exemple">« {l.phrases[0]} »</span>
                <span className="liste-info">
                  Niveau {l.niveau} · {l.phrases.length} phrase{l.phrases.length > 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const BRAVOS = ['Bravo !', 'Super !', 'Génial !', 'Bien joué !', 'Excellent !', 'Parfait !']

function Partie({
  profile,
  phrases,
  onFin,
  onQuitter
}: {
  profile: Profile
  phrases: string[]
  onFin: (etats: EtatPhrase[]) => void
  onQuitter: (etats: EtatPhrase[]) => void
}) {
  const regles = profile.dactylo
  const [etats, setEtats] = useState<EtatPhrase[]>(() => [nouvellePhrase(phrases[0])])
  const [now, setNow] = useState(() => Date.now())
  const [secousse, setSecousse] = useState(0)
  const [bulle, setBulle] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dernierSonErreur = useRef(0)
  const etatsRef = useRef(etats)
  etatsRef.current = etats
  const onFinRef = useRef(onFin)
  onFinRef.current = onFin

  const index = etats.length - 1
  const courant = etats[index]
  const reussie = courant.fin !== null

  // Chronomètre affiché
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(t)
  }, [])

  // Phrase réussie : petite pause, puis phrase suivante ou fin.
  useEffect(() => {
    if (!reussie) return
    playSound(profile.sonReussite)
    setBulle(BRAVOS[Math.floor(Math.random() * BRAVOS.length)])
    const t = setTimeout(() => {
      setBulle(null)
      if (index + 1 >= phrases.length) onFinRef.current(etatsRef.current)
      else setEtats((e) => [...e, nouvellePhrase(phrases[index + 1])])
    }, 1100)
    return () => clearTimeout(t)
  }, [reussie, index, phrases, profile.sonReussite])

  const garderFocus = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  useEffect(garderFocus, [garderFocus])

  const saisir = (texte: string) => {
    if (!texte) return
    let e = etatsRef.current[etatsRef.current.length - 1]
    let erreur = false
    for (const c of texte) {
      const r = taper(e, c, Date.now(), regles)
      e = r.etat
      if (r.resultat === 'erreur') erreur = true
    }
    if (erreur) {
      setSecousse((n) => n + 1)
      const t = Date.now()
      if (regles.sonErreur && t - dernierSonErreur.current > 700) {
        dernierSonErreur.current = t
        playSound(profile.sonEchec)
      }
    }
    setEtats((all) => [...all.slice(0, -1), e])
  }

  const onInput = (ev: React.FormEvent<HTMLInputElement>) => {
    if ((ev.nativeEvent as InputEvent).isComposing) return
    const v = ev.currentTarget.value
    ev.currentTarget.value = ''
    saisir(v)
  }

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Backspace') {
      ev.preventDefault()
      setEtats((all) => [...all.slice(0, -1), effacer(all[all.length - 1])])
    } else if (ev.key === 'Enter' || ev.key === 'Tab') {
      ev.preventDefault()
    }
  }

  const stats = cumuler(etats, now)
  const prochaine = reussie ? null : [...courant.cible][courant.tape.length]
  const ilYaErreur = courant.tape.some((l) => !l.ok)
  const g = prochaine && !ilYaErreur ? geste(prochaine) : null

  return (
    <div className="screen dactylo" onMouseDown={garderFocus}>
      <header className="topbar">
        <button className="btn btn-ghost" onMouseDown={(e) => e.stopPropagation()} onClick={() => onQuitter(etatsRef.current)}>
          <IconBack /> Arrêter
        </button>
        <div className="progress" aria-label={`Phrase ${index + 1} sur ${phrases.length}`}>
          {phrases.map((_, i) => (
            <span
              key={i}
              className={i < index || (i === index && reussie) ? 'progress-dot done' : i === index ? 'progress-dot current' : 'progress-dot'}
            />
          ))}
        </div>
        <div className="live-stats">
          <LiveStat label="Temps" value={formatDuree(stats.dureeMs)} />
          <LiveStat label="Frappes/min" value={String(vitesse(stats))} />
          <LiveStat label="Précision" value={`${precision(stats)} %`} />
        </div>
      </header>

      <main className="partie-main">
        <div className="partie-top">
          <div className="partie-avatar">
            <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={110} />
            {bulle && <span className="bulle">{bulle}</span>}
          </div>
          <div className={reussie ? 'phrase-card reussie' : 'phrase-card'}>
            <p className="phrase" key={secousse} data-shake={secousse > 0 ? 'oui' : undefined}>
              {[...courant.cible].map((c, i) => {
                const l = courant.tape[i]
                let cls = 'ch'
                if (l) cls += l.ok ? ' ch-ok' : ' ch-faux'
                else if (i === courant.tape.length && !reussie) cls += ' ch-courant'
                if (c === ' ') cls += ' ch-espace'
                return (
                  <span key={i} className={cls}>
                    {l && !l.ok ? (l.char === ' ' ? '\u2423' : l.char) : c}
                  </span>
                )
              })}
            </p>
            {reussie ? (
              <p className="phrase-aide reussie-texte">
                <IconCheck /> Phrase réussie !
              </p>
            ) : ilYaErreur ? (
              <p className="phrase-aide erreur-texte">Efface l’erreur avec la touche ⌫</p>
            ) : (
              <p className="phrase-aide">{g && (g.etapes.length > 1 || g.etapes[0].length > 1) ? g.aide : '\u00a0'}</p>
            )}
          </div>
        </div>

        {regles.clavier && (
          <div className="partie-clavier">
            <Keyboard
              doigts
              cibles={ilYaErreur ? ['retour'] : g ? g.etapes[0] : []}
              suivantes={g && g.etapes.length > 1 ? g.etapes[1] : []}
            />
          </div>
        )}
      </main>

      <input
        ref={inputRef}
        className="capture"
        aria-label="Zone de frappe"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onInput={onInput}
        onCompositionEnd={(ev) => {
          const v = ev.currentTarget.value
          ev.currentTarget.value = ''
          saisir(v)
        }}
        onKeyDown={onKeyDown}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onBlur={garderFocus}
      />
    </div>
  )
}

function LiveStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="live-stat">
      <span className="live-stat-value">{value}</span>
      <span className="live-stat-label">{label}</span>
    </div>
  )
}

function Fin({
  profile,
  resultat,
  record,
  onRejouer,
  onAutre,
  onQuit
}: {
  profile: Profile
  resultat: ResultatDactylo
  record: boolean
  onRejouer: () => void
  onAutre: () => void
  onQuit: () => void
}) {
  const p = precision(resultat)
  const aTravailler = Object.entries(resultat.erreursParTouche)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => (c === ' ' ? 'Espace' : c))
  const message = p >= 95 ? 'Quelle précision, bravo !' : p >= 85 ? 'Très bon travail !' : 'Bien joué, continue comme ça !'

  useEffect(() => {
    if (record) playSound(profile.sonReussite)
  }, [record, profile.sonReussite])

  return (
    <div className="screen dactylo">
      <header className="topbar">
        <h1 className="game-heading">Dactylo</h1>
        <div className="topbar-actions">
          <FullscreenButton />
        </div>
      </header>
      <main className="fin-main">
        <div className="fin-hero">
          <div className="hub-avatar">
            <Avatar config={profile.avatar} fond={profile.couleurPrincipale} size={130} />
          </div>
          <div>
            <h2 className="fin-title">Bravo {profile.prenom} !</h2>
            <p className="fin-message">{message}</p>
            {record && <span className="record">★ Nouveau record de vitesse !</span>}
          </div>
        </div>
        <div className="fin-stats">
          <StatTile value={String(vitesse(resultat))} label="frappes par minute" detail={`${motsParMinute(resultat)} mots/min`} />
          <StatTile value={`${p} %`} label="de précision" detail={`${resultat.erreurs} erreur${resultat.erreurs > 1 ? 's' : ''}`} />
          <StatTile value={formatDuree(resultat.dureeMs)} label="de frappe" detail={`${resultat.phrases} phrase${resultat.phrases > 1 ? 's' : ''}`} />
        </div>
        {aTravailler.length > 0 && (
          <p className="fin-travail">
            Touches à travailler :{' '}
            {aTravailler.map((c) => (
              <kbd key={c}>{c}</kbd>
            ))}
          </p>
        )}
        <div className="fin-actions">
          <button className="btn btn-ghost btn-lg" onClick={onQuit}>
            <IconBack /> Menu
          </button>
          <button className="btn btn-soft btn-lg" onClick={onAutre}>
            Autres phrases
          </button>
          <button className="btn btn-primary btn-lg" onClick={onRejouer} autoFocus>
            Rejouer
          </button>
        </div>
      </main>
    </div>
  )
}
