import { useEffect, useRef, useState } from 'react'
import type { Profile, Resultat, ResultatEspace, ThemeChasse } from '../../../../shared/data'
import { IconBack } from '../../components/Icons'
import { geste } from '../../keyboard/azerty'
import { Keyboard } from '../../keyboard/Keyboard'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { pourcentage } from '../commun'
import { Chips, FinHero, GameTopbar, StatTile } from '../ui'
import {
  aDesVies,
  avancer,
  cadence,
  DUREES,
  estTerminee,
  type Etat,
  type Lettre,
  mesureRecord,
  MODES,
  type ModeChasse,
  NOMS_MODES,
  nouvelEtat,
  type Reglages,
  type Serie,
  SERIES,
  simultanees,
  tirer,
  VIES_MAX
} from './engine'
import { THEMES_JEU, type ThemeJeu } from './themes'

interface Props {
  profile: Profile
  resultats: Resultat[]
  onResult: (r: ResultatEspace) => void
  onQuit: () => void
}

type Phase =
  | { nom: 'aventure' }
  | { nom: 'lettres'; theme: ThemeJeu }
  | { nom: 'jeu'; theme: ThemeJeu; reglages: Reglages }
  | { nom: 'fin'; theme: ThemeJeu; reglages: Reglages; resultat: ResultatEspace; record: boolean }

const VIES_DEPART_AFFICHEE = Math.min(VIES_MAX, 3)
const formatMinutes = (s: number) => `${s / 60} min`

export function Espace({ profile, resultats, onResult, onQuit }: Props) {
  const siens = resultats.filter((r): r is ResultatEspace => r.jeu === 'espace' && r.profileId === profile.id)
  const dernier: ThemeChasse | null = siens.length > 0 ? siens.reduce((a, b) => (a.date > b.date ? a : b)).theme : null
  const [phase, setPhase] = useState<Phase>({ nom: 'aventure' })
  const [duree, setDuree] = useState<(typeof DUREES)[number]>(60)

  const [mode, setMode] = useState<ModeChasse>('chrono')

  const lancer = (theme: ThemeJeu, serie: Serie, modeJeu: ModeChasse = mode) =>
    setPhase({ nom: 'jeu', theme, reglages: { serie, dureeS: duree, niveau: profile.niveau, mode: modeJeu, vitesseObjet: theme.vitesseObjet } })

  const terminer = (theme: ThemeJeu, reglages: Reglages, e: Etat, complete: boolean) => {
    if (e.detruites + e.manquees + e.erreurs + e.pieges === 0) return complete ? setPhase({ nom: 'lettres', theme }) : onQuit()
    const modeJeu = reglages.mode ?? 'chrono'
    // Records séparés par série, par aventure et par mode.
    const anciens = siens.filter((r) => r.serieNom === reglages.serie.nom && r.theme === theme.id && r.mode === modeJeu)
    const r: ResultatEspace = {
      id: uid(),
      profileId: profile.id,
      jeu: 'espace',
      date: new Date().toISOString(),
      theme: theme.id,
      serieNom: reglages.serie.nom,
      dureeMs: Math.round(e.temps * 1000),
      detruites: e.detruites,
      manquees: e.manquees,
      erreurs: e.erreurs,
      mode: modeJeu,
      pieges: e.pieges,
      cadeaux: e.cadeaux,
      palier: e.palier,
      lettresRatees: e.lettresRatees
    }
    onResult(r)
    if (!complete) return onQuit()
    const meilleur = Math.max(0, ...anciens.map((a) => mesureRecord(a.mode, a.detruites, a.dureeMs)))
    setPhase({ nom: 'fin', theme, reglages, resultat: r, record: anciens.length > 0 && mesureRecord(modeJeu, r.detruites, r.dureeMs) > meilleur })
  }

  if (phase.nom === 'jeu') {
    return (
      <Partie
        profile={profile}
        theme={phase.theme}
        reglages={phase.reglages}
        onFin={(e) => terminer(phase.theme, phase.reglages, e, true)}
        onQuitter={(e) => terminer(phase.theme, phase.reglages, e, false)}
      />
    )
  }

  if (phase.nom === 'fin') {
    const { theme, resultat: r } = phase
    const tirs = r.detruites + r.erreurs
    const aTravailler = Object.entries(r.lettresRatees)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([c]) => c)
    const viesJeu = r.mode !== 'chrono'
    const message = viesJeu
      ? 'Belle partie, bravo ! Tu peux faire encore mieux.'
      : r.manquees === 0
        ? theme.parfait
        : r.detruites >= r.manquees * 3
          ? 'Super réflexes, bravo !'
          : 'Bien joué, continue à t’entraîner !'
    return (
      <div className="screen dactylo">
        <GameTopbar titre={theme.nom} />
        <main className="fin-main">
          <FinHero profile={profile} message={message} record={phase.record ? 'Nouveau record !' : undefined} />
          <div className="fin-stats">
            <StatTile value={String(r.detruites)} label={theme.reussites(r.detruites)} detail={viesJeu ? `${NOMS_MODES[r.mode]} · palier ${r.palier + 1}` : `${cadence(r.detruites, r.dureeMs)} par minute`} />
            <StatTile value={`${pourcentage(r.detruites, tirs)} %`} label="de lettres justes" detail={`${r.erreurs} touche${r.erreurs > 1 ? 's' : ''} à côté`} />
            <StatTile
              value={String(r.manquees)}
              label={`${theme.tombees.toLowerCase()}`}
              detail={r.mode === 'pieges' ? `${r.pieges} piège${r.pieges > 1 ? 's' : ''} tapé${r.pieges > 1 ? 's' : ''} · ${r.cadeaux} cadeau${r.cadeaux > 1 ? 'x' : ''}` : phase.reglages.serie.nom}
            />
          </div>
          {aTravailler.length > 0 && (
            <p className="fin-travail">
              Lettres à travailler :{' '}
              {aTravailler.map((c) => (
                <kbd key={c}>{c}</kbd>
              ))}
            </p>
          )}
          <div className="fin-actions">
            <button className="btn btn-ghost btn-lg" onClick={onQuit}>
              <IconBack /> Menu
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'aventure' })}>
              Changer d’aventure
            </button>
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'lettres', theme })}>
              Autres lettres
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => lancer(theme, phase.reglages.serie)} autoFocus>
              Rejouer
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (phase.nom === 'lettres') {
    const { theme } = phase
    const triees = [...SERIES].sort(
      (a, b) => Number(b.niveau === profile.niveau) - Number(a.niveau === profile.niveau) || a.niveau - b.niveau
    )
    return (
      <div className="screen dactylo">
        <GameTopbar titre={theme.nom} onBack={() => setPhase({ nom: 'aventure' })} backLabel="Aventures" />
        <main className="choix-main">
          <div className="chasse-entete">
            <div className="chasse-entete-apercu">
              <Apercu theme={theme} profile={profile} />
            </div>
            <div>
              <h2 className="choix-title">Quelles lettres vont tomber ?</h2>
              <Chips label="Mode" values={MODES} value={mode} onChange={setMode} format={(m) => NOMS_MODES[m]} />
              {mode === 'chrono' && <Chips label="Durée" values={DUREES} value={duree} onChange={setDuree} format={formatMinutes} />}
              <p className="choix-note">
                {theme.consigne} Échap met le jeu en pause.
                {mode === 'vies' && ' Tu as 3 vies : une faute ou une lettre qui tombe en retire une. Le jeu s’accélère petit à petit.'}
                {mode === 'pieges' &&
                  ' Comme le mode 3 vies, mais attention aux pièges (étoiles sombres) : ne les tape pas ! Tape les cadeaux dorés pour regagner une vie.'}
              </p>
            </div>
          </div>
          <div className="liste-grid">
            {triees.map((s) => (
              <button key={s.id} className="liste-card" onClick={() => lancer(theme, s)}>
                {s.niveau === profile.niveau && <span className="liste-badge">Pour toi</span>}
                <span className="liste-nom">{s.nom}</span>
                <span className="serie-lettres">
                  {[...s.lettres].slice(0, 12).join(' ')}
                  {s.lettres.length > 12 ? ' …' : ''}
                </span>
                <span className="liste-info">Niveau {s.niveau}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="screen dactylo">
      <GameTopbar titre="Chasse aux lettres" onBack={onQuit} />
      <main className="choix-main">
        <h2 className="choix-title">Choisis ton aventure</h2>
        <div className="aventures">
          {THEMES_JEU.map((t) => (
            <button key={t.id} className="aventure-card" onClick={() => setPhase({ nom: 'lettres', theme: t })}>
              <div className="aventure-apercu">
                <Apercu theme={t} profile={profile} />
                {dernier === t.id && <span className="liste-badge">Ta dernière aventure</span>}
              </div>
              <span className="aventure-nom">{t.nom}</span>
              <span className="aventure-desc">{t.description}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

// Aperçu animé d'un décor, avec quelques lettres d'exemple.
function Apercu({ theme, profile }: { theme: ThemeJeu; profile: Profile }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scene = theme.creer({ principale: profile.couleurPrincipale, secondaire: profile.couleurSecondaire })
    const exemples: Lettre[] = [
      { id: 1, char: 'f', x: 0.18, y: 0.3, vitesse: 0 },
      { id: 2, char: 'j', x: 0.62, y: 0.62, vitesse: 0 },
      { id: 3, char: 'k', x: 0.86, y: 0.12, vitesse: 0 }
    ]
    let w = 0
    let h = 0
    const taille = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    taille()
    const ro = new ResizeObserver(taille)
    ro.observe(canvas)
    let raf = 0
    let avant = performance.now()
    let accu = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - avant) / 1000)
      avant = now
      accu += dt
      // 30 images par seconde suffisent pour un aperçu
      if (accu >= 1 / 30) {
        scene.avancer(accu, exemples)
        scene.dessiner(ctx, w, h, exemples, 2)
        accu = 0
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [theme, profile.couleurPrincipale, profile.couleurSecondaire])
  return <canvas ref={ref} className="apercu-canvas" aria-hidden="true" />
}

function Partie({
  profile,
  theme,
  reglages,
  onFin,
  onQuitter
}: {
  profile: Profile
  theme: ThemeJeu
  reglages: Reglages
  onFin: (e: Etat) => void
  onQuitter: (e: Etat) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)
  const etat = useRef<Etat>(nouvelEtat())
  const scene = useRef(theme.creer({ principale: profile.couleurPrincipale, secondaire: profile.couleurSecondaire }))
  const pause = useRef(false)
  const fini = useRef(false)
  const enCompte = useRef(true)
  const dernierSon = useRef(0)
  const [decompte, setDecompte] = useState<number | null>(3)
  const [clavier, setClavier] = useState(profile.dactylo.clavier) // complète le réglage du profil, le temps de la partie
  const [annonce, setAnnonce] = useState<{ texte: string; cle: number } | null>(null)
  const vies = aDesVies(reglages)
  const [affiche, setAffiche] = useState({ ...etat.current, pause: false })
  const callbacks = useRef({ onFin, onQuitter })
  callbacks.current = { onFin, onQuitter }

  const basculerPause = (p?: boolean) => {
    if (enCompte.current) return
    pause.current = p ?? !pause.current
    setAffiche((a) => ({ ...a, pause: pause.current }))
  }

  // Compte à rebours 3, 2, 1, c'est parti !
  useEffect(() => {
    if (decompte === null) return
    playSound(decompte > 0 ? 'decompte' : 'partez')
    const t = setTimeout(
      () => {
        if (decompte > 0) setDecompte(decompte - 1)
        else {
          enCompte.current = false
          setDecompte(null)
        }
      },
      decompte > 0 ? 750 : 600
    )
    return () => clearTimeout(t)
  }, [decompte])

  // Boucle de jeu
  useEffect(() => {
    const canvas = canvasRef.current
    const zone = zoneRef.current
    if (!canvas || !zone) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = 0
    let h = 0
    const redimensionner = () => {
      const r = zone.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    redimensionner()
    const ro = new ResizeObserver(redimensionner)
    ro.observe(zone)

    let precedent = performance.now()
    let dernierAffichage = 0
    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - precedent) / 1000)
      precedent = now
      if (!pause.current) {
        if (!fini.current && !enCompte.current) {
          const res = avancer(etat.current, dt, reglages)
          etat.current = res.etat
          for (const ev of res.evenements) {
            if (ev.type === 'sol') {
              scene.current.auSol(ev.lettre)
              playSound(theme.sons.sol)
            }
          }
          if (estTerminee(etat.current, reglages)) {
            fini.current = true
            playSound(profile.sonReussite)
            setTimeout(() => callbacks.current.onFin(etat.current), 1100)
          }
        }
        scene.current.avancer(dt, etat.current.lettres)
      }
      const visee = plusBasse(etat.current.lettres)?.id ?? null
      scene.current.dessiner(ctx, w, h, fini.current ? [] : etat.current.lettres, visee)
      if (now - dernierAffichage > 150) {
        dernierAffichage = now
        setAffiche({ ...etat.current, pause: pause.current })
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reglages, theme, profile.sonReussite])

  // Clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (!fini.current) basculerPause()
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || e.key === ' ') return
      e.preventDefault()
      if (pause.current || fini.current || enCompte.current) return
      const avant = etat.current.palier
      const { etat: suivant, evenement } = tirer(etat.current, e.key, reglages)
      etat.current = suivant
      if (suivant.palier > avant) {
        const deux = suivant.palier % 2 === 0
        const texte = deux ? `${['', '', 'Deux', 'Trois'][simultanees(suivant.palier)] ?? 'Plus de'} lettres en même temps !` : 'Ça va plus vite !'
        setAnnonce({ texte, cle: suivant.palier })
      }
      if (evenement?.type === 'cadeau') {
        scene.current.toucher(evenement.lettre)
        playSound(profile.sonReussite)
      } else if (evenement?.type === 'piege') {
        // Doux : le même petit son que pour une faute, sans insister.
        scene.current.rater(etat.current.lettres)
        playSound(theme.sons.rater)
      } else if (evenement?.type === 'detruite') {
        scene.current.toucher(evenement.lettre)
        theme.sons.toucher.forEach((s, i) => (i === 0 ? playSound(s) : setTimeout(() => playSound(s), 60 * i)))
      } else if (evenement?.type === 'erreur') {
        scene.current.rater(etat.current.lettres)
        playSound(theme.sons.rater)
        const t = Date.now()
        if (profile.dactylo.sonErreur && t - dernierSon.current > 700) {
          dernierSon.current = t
          setTimeout(() => playSound(profile.sonEchec), 120)
        }
      }
    }
    // Pause automatique si la fenêtre perd le focus.
    const onBlur = () => !fini.current && basculerPause(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blur', onBlur)
    }
  }, [reglages, theme, profile.dactylo.sonErreur, profile.sonEchec, profile.sonReussite])

  // Le message de palier s'efface tout seul.
  useEffect(() => {
    if (!annonce) return
    const t = setTimeout(() => setAnnonce(null), 1800)
    return () => clearTimeout(t)
  }, [annonce])

  const reste = Math.max(0, Math.ceil(reglages.dureeS - affiche.temps))
  const basse = plusBasse(affiche.lettres)
  const g = basse ? geste(basse.char) : null

  return (
    <div className={`screen espace ${theme.classe}`}>
      <header className="topbar espace-topbar">
        <button className="btn btn-ghost btn-dark" onClick={() => callbacks.current.onQuitter(etat.current)}>
          <IconBack /> Arrêter
        </button>
        <button className="btn btn-ghost btn-dark" onClick={() => basculerPause()} disabled={decompte !== null}>
          {affiche.pause ? 'Reprendre' : 'Pause'}
        </button>
        <span className="espace-titre">{theme.nom}</span>
        <button
          className="btn btn-ghost btn-dark"
          aria-pressed={clavier}
          onClick={(e) => {
            e.currentTarget.blur() // la barre d'espace ne doit pas rebasculer le bouton
            setClavier((c) => !c)
          }}
        >
          Clavier : {clavier ? 'affiché' : 'masqué'}
        </button>
        <div className="live-stats">
          {vies ? (
            <div className="live-stat live-stat-dark">
              <span className="live-stat-value espace-vies" aria-label={`${affiche.vies} vie${affiche.vies > 1 ? 's' : ''}`}>
                {Array.from({ length: Math.max(VIES_DEPART_AFFICHEE, affiche.vies) }, (_, i) => (
                  <span key={i} className={i < affiche.vies ? 'vie' : 'vie vie-perdue'}>
                    ♥
                  </span>
                ))}
              </span>
              <span className="live-stat-label">Vies</span>
            </div>
          ) : (
            <div className="live-stat live-stat-dark">
              <span className="live-stat-value">
                {Math.floor(reste / 60)}:{String(reste % 60).padStart(2, '0')}
              </span>
              <span className="live-stat-label">Temps</span>
            </div>
          )}
          <div className="live-stat live-stat-dark">
            <span className="live-stat-value">{affiche.detruites}</span>
            <span className="live-stat-label">{theme.compteur}</span>
          </div>
          <div className="live-stat live-stat-dark">
            <span className="live-stat-value">{affiche.manquees}</span>
            <span className="live-stat-label">{theme.tombees}</span>
          </div>
        </div>
      </header>
      <div className="espace-zone" ref={zoneRef}>
        <canvas ref={canvasRef} aria-label="Zone de jeu" />
        {decompte !== null && (
          <div className="espace-decompte" key={decompte}>
            {decompte > 0 ? decompte : 'C’est parti !'}
          </div>
        )}
        {annonce && (
          <div className="espace-annonce" key={annonce.cle}>
            {annonce.texte}
          </div>
        )}
        {affiche.pause && (
          <div className="espace-pause">
            <p>Pause</p>
            <button className="btn btn-primary btn-lg" onClick={() => basculerPause(false)} autoFocus>
              Reprendre
            </button>
          </div>
        )}
      </div>
      {clavier && (
        <div className="espace-clavier">
          <Keyboard doigts cibles={g ? g.etapes[0] : []} suivantes={g && g.etapes.length > 1 ? g.etapes[1] : []} />
        </div>
      )}
    </div>
  )
}

// Lettre la plus proche du sol : celle que l'enfant doit viser en priorité.
function plusBasse(lettres: Lettre[]): Lettre | null {
  return lettres.reduce<Lettre | null>((b, l) => (l.type || (b && l.y <= b.y) ? b : l), null)
}

