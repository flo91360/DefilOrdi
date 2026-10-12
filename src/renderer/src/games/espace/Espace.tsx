import { useEffect, useRef, useState } from 'react'
import type { Profile, Resultat, ResultatEspace } from '../../../../shared/data'
import { IconBack } from '../../components/Icons'
import { geste } from '../../keyboard/azerty'
import { Keyboard } from '../../keyboard/Keyboard'
import { playSound } from '../../sounds'
import { uid } from '../../uid'
import { pourcentage } from '../commun'
import { Chips, FinHero, GameTopbar, StatTile } from '../ui'
import { avancer, cadence, DUREES, estTerminee, type Etat, type Lettre, nouvelEtat, type Reglages, type Serie, SERIES, tirer } from './engine'
import { Scene } from './Scene'

interface Props {
  profile: Profile
  resultats: Resultat[]
  onResult: (r: ResultatEspace) => void
  onQuit: () => void
}

type Phase =
  | { nom: 'choix' }
  | { nom: 'jeu'; reglages: Reglages }
  | { nom: 'fin'; reglages: Reglages; resultat: ResultatEspace; record: boolean }

const formatMinutes = (s: number) => `${s / 60} min`

export function Espace({ profile, resultats, onResult, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>({ nom: 'choix' })
  const [duree, setDuree] = useState<(typeof DUREES)[number]>(60)

  const lancer = (serie: Serie) => setPhase({ nom: 'jeu', reglages: { serie, dureeS: duree, niveau: profile.niveau } })

  const terminer = (reglages: Reglages, e: Etat, complete: boolean) => {
    if (e.detruites + e.manquees + e.erreurs === 0) return complete ? setPhase({ nom: 'choix' }) : onQuit()
    const anciens = resultats.filter(
      (r): r is ResultatEspace => r.jeu === 'espace' && r.profileId === profile.id && r.serieNom === reglages.serie.nom
    )
    const r: ResultatEspace = {
      id: uid(),
      profileId: profile.id,
      jeu: 'espace',
      date: new Date().toISOString(),
      serieNom: reglages.serie.nom,
      dureeMs: Math.round(e.temps * 1000),
      detruites: e.detruites,
      manquees: e.manquees,
      erreurs: e.erreurs,
      lettresRatees: e.lettresRatees
    }
    onResult(r)
    if (!complete) return onQuit()
    const meilleur = Math.max(0, ...anciens.map((a) => cadence(a.detruites, a.dureeMs)))
    setPhase({ nom: 'fin', reglages, resultat: r, record: anciens.length > 0 && cadence(r.detruites, r.dureeMs) > meilleur })
  }

  if (phase.nom === 'jeu') {
    return (
      <Partie
        profile={profile}
        reglages={phase.reglages}
        onFin={(e) => terminer(phase.reglages, e, true)}
        onQuitter={(e) => terminer(phase.reglages, e, false)}
      />
    )
  }

  if (phase.nom === 'fin') {
    const r = phase.resultat
    const tirs = r.detruites + r.erreurs
    const aTravailler = Object.entries(r.lettresRatees)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([c]) => c)
    const message = r.manquees === 0 ? 'Aucune lettre n’a touché le sol !' : r.detruites >= r.manquees * 3 ? 'Très bonne défense !' : 'Bien joué, continue à t’entraîner !'
    return (
      <div className="screen dactylo">
        <GameTopbar titre="Lettres de l’espace" />
        <main className="fin-main">
          <FinHero profile={profile} message={message} record={phase.record ? 'Nouveau record !' : undefined} />
          <div className="fin-stats">
            <StatTile value={String(r.detruites)} label="lettres détruites" detail={`${cadence(r.detruites, r.dureeMs)} par minute`} />
            <StatTile value={`${pourcentage(r.detruites, tirs)} %`} label="de tirs réussis" detail={`${r.erreurs} tir${r.erreurs > 1 ? 's' : ''} dans le vide`} />
            <StatTile value={String(r.manquees)} label={r.manquees > 1 ? 'lettres tombées' : 'lettre tombée'} detail={phase.reglages.serie.nom} />
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
            <button className="btn btn-soft btn-lg" onClick={() => setPhase({ nom: 'choix' })}>
              Autres lettres
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => lancer(phase.reglages.serie)} autoFocus>
              Rejouer
            </button>
          </div>
        </main>
      </div>
    )
  }

  const triees = [...SERIES].sort(
    (a, b) => Number(b.niveau === profile.niveau) - Number(a.niveau === profile.niveau) || a.niveau - b.niveau
  )
  return (
    <div className="screen dactylo">
      <GameTopbar titre="Lettres de l’espace" onBack={onQuit} />
      <main className="choix-main">
        <h2 className="choix-title">Quelles lettres vont tomber ?</h2>
        <Chips label="Durée de la mission" values={DUREES} value={duree} onChange={setDuree} format={formatMinutes} />
        <div className="liste-grid">
          {triees.map((s) => (
            <button key={s.id} className="liste-card" onClick={() => lancer(s)}>
              {s.niveau === profile.niveau && <span className="liste-badge">Pour toi</span>}
              <span className="liste-nom">{s.nom}</span>
              <span className="serie-lettres">{[...s.lettres].slice(0, 12).join(' ')}{s.lettres.length > 12 ? ' …' : ''}</span>
              <span className="liste-info">Niveau {s.niveau}</span>
            </button>
          ))}
        </div>
        <p className="choix-note">Tape la lettre qui tombe pour tirer dessus avec le laser. Échap met le jeu en pause.</p>
      </main>
    </div>
  )
}

function Partie({
  profile,
  reglages,
  onFin,
  onQuitter
}: {
  profile: Profile
  reglages: Reglages
  onFin: (e: Etat) => void
  onQuitter: (e: Etat) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)
  const etat = useRef<Etat>(nouvelEtat())
  const scene = useRef(new Scene(profile.couleurPrincipale, profile.couleurSecondaire))
  const pause = useRef(false)
  const fini = useRef(false)
  const dernierSon = useRef(0)
  const [affiche, setAffiche] = useState({ ...etat.current, pause: false })
  const callbacks = useRef({ onFin, onQuitter })
  callbacks.current = { onFin, onQuitter }

  const basculerPause = (p?: boolean) => {
    pause.current = p ?? !pause.current
    setAffiche((a) => ({ ...a, pause: pause.current }))
  }

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
      if (!pause.current && !fini.current) {
        const res = avancer(etat.current, dt, reglages)
        etat.current = res.etat
        for (const ev of res.evenements) {
          if (ev.type === 'sol') {
            scene.current.auSol(ev.lettre)
            playSound('sol')
          }
        }
        scene.current.avancer(dt)
        if (estTerminee(etat.current, reglages)) {
          fini.current = true
          playSound(profile.sonReussite)
          setTimeout(() => callbacks.current.onFin(etat.current), 900)
        }
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
  }, [reglages, profile.sonReussite])

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
      if (pause.current || fini.current) return
      const { etat: suivant, evenement } = tirer(etat.current, e.key, reglages)
      etat.current = suivant
      if (evenement?.type === 'detruite') {
        scene.current.tirSur(evenement.lettre)
        playSound('laser')
        setTimeout(() => playSound('explosion'), 60)
      } else if (evenement?.type === 'erreur') {
        const t = Date.now()
        if (profile.dactylo.sonErreur && t - dernierSon.current > 700) {
          dernierSon.current = t
          playSound(profile.sonEchec)
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
  }, [reglages, profile.dactylo.sonErreur, profile.sonEchec])

  const reste = Math.max(0, Math.ceil(reglages.dureeS - affiche.temps))
  const basse = plusBasse(affiche.lettres)
  const g = basse ? geste(basse.char) : null

  return (
    <div className="screen espace">
      <header className="topbar espace-topbar">
        <button className="btn btn-ghost btn-dark" onClick={() => callbacks.current.onQuitter(etat.current)}>
          <IconBack /> Arrêter
        </button>
        <button className="btn btn-ghost btn-dark" onClick={() => basculerPause()}>
          {affiche.pause ? 'Reprendre' : 'Pause'}
        </button>
        <div className="live-stats">
          <div className="live-stat live-stat-dark">
            <span className="live-stat-value">
              {Math.floor(reste / 60)}:{String(reste % 60).padStart(2, '0')}
            </span>
            <span className="live-stat-label">Temps</span>
          </div>
          <div className="live-stat live-stat-dark">
            <span className="live-stat-value">{affiche.detruites}</span>
            <span className="live-stat-label">Détruites</span>
          </div>
          <div className="live-stat live-stat-dark">
            <span className="live-stat-value">{affiche.manquees}</span>
            <span className="live-stat-label">Tombées</span>
          </div>
        </div>
      </header>
      <div className="espace-zone" ref={zoneRef}>
        <canvas ref={canvasRef} aria-label="Zone de jeu" />
        {affiche.pause && (
          <div className="espace-pause">
            <p>Pause</p>
            <button className="btn btn-primary btn-lg" onClick={() => basculerPause(false)} autoFocus>
              Reprendre
            </button>
          </div>
        )}
      </div>
      {profile.dactylo.clavier && (
        <div className="espace-clavier">
          <Keyboard doigts cibles={g ? g.etapes[0] : []} suivantes={g && g.etapes.length > 1 ? g.etapes[1] : []} />
        </div>
      )}
    </div>
  )
}

// Lettre la plus proche du sol : celle que l'enfant doit viser en priorité.
function plusBasse(lettres: Lettre[]): Lettre | null {
  return lettres.reduce<Lettre | null>((b, l) => (!b || l.y > b.y ? l : b), null)
}
