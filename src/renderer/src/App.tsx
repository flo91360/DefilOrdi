import { useCallback, useEffect, useRef, useState } from 'react'
import { type AppData, type JeuId, type PhraseEnfant, type Profile, type ProgressionMemoire, type Resultat } from '../../shared/data'
import { listesAvecPhrasesEnfants } from '../../shared/phrases'
import { api } from './api'
import { themeStyle } from './theme'
import { setVolume } from './sounds'
import { ProfilePicker } from './screens/ProfilePicker'
import { Hub } from './screens/Hub'
import { ProfileEditor } from './screens/ProfileEditor'
import { ErgoSpace } from './screens/ErgoSpace'
import { PinPad } from './components/PinPad'
import { Couleurs } from './games/couleurs/Couleurs'
import { Dactylo } from './games/dactylo/Dactylo'
import { Espace } from './games/espace/Espace'
import { Memoire } from './games/memoire/Memoire'
import { PetitBac } from './games/petitbac/PetitBac'
import { construireBanque } from './games/quiz/engine'
import { Quiz } from './games/quiz/Quiz'

type Screen =
  | { name: 'accueil' }
  | { name: 'hub'; profileId: string }
  | { name: 'editeur'; profileId: string | null; retour: Screen }
  | { name: 'ergo' }
  | { name: 'jeu'; jeu: JeuId; profileId: string }

export function App() {
  const [data, setData] = useState<AppData | null>(null)
  const [screen, setScreen] = useState<Screen>({ name: 'accueil' })
  const [askCode, setAskCode] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const dataRef = useRef<AppData | null>(null)
  dataRef.current = data

  useEffect(() => {
    api.load().then((d) => {
      setVolume(d.settings.volume)
      setData(d)
    })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault()
        void api.toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const update = useCallback((next: AppData) => {
    dataRef.current = next
    setData(next)
    setVolume(next.settings.volume)
    api.save(next).then(
      () => setSaveError(false),
      () => setSaveError(true)
    )
  }, [])

  if (!data) return <div className="loading">Chargement…</div>

  const profileOf = (id: string): Profile | undefined => data.profiles.find((p) => p.id === id)
  const active = screen.name === 'hub' || screen.name === 'jeu' ? profileOf(screen.profileId) : undefined

  const addResultat = (r: Resultat) => {
    const d = dataRef.current
    if (d) update({ ...d, resultats: [...d.resultats, r] })
  }

  // Progression de « Mots à retenir », mémorisée dans le profil de l'enfant.
  const saveProgressionMemoire = (profileId: string, memoire: ProgressionMemoire) => {
    const d = dataRef.current
    if (d) update({ ...d, profiles: d.profiles.map((p) => (p.id === profileId ? { ...p, memoire } : p)) })
  }

  // Médaille de Dactylo : ajoutée au coffre de l'enfant, doublons compris.
  const addMedaille = (profileId: string, niveau: number) => {
    const d = dataRef.current
    if (!d) return
    const medailles = (p: Profile) => [...p.medailles, { niveau, date: new Date().toISOString() }]
    update({ ...d, profiles: d.profiles.map((p) => (p.id === profileId ? { ...p, medailles: medailles(p) } : p)) })
  }

  // Phrase d'un enfant (validée ou refusée, donc à vérifier par l'ergothérapeute).
  const addPhraseEnfant = (phrase: PhraseEnfant) => {
    const d = dataRef.current
    if (d) update({ ...d, phrasesEnfants: [...d.phrasesEnfants, phrase] })
  }

  const saveProfile = (p: Profile) => {
    const exists = data.profiles.some((x) => x.id === p.id)
    update({ ...data, profiles: exists ? data.profiles.map((x) => (x.id === p.id ? p : x)) : [...data.profiles, p] })
  }

  let content
  switch (screen.name) {
    case 'accueil':
      content = (
        <ProfilePicker
          profiles={data.profiles}
          onPick={(p) => setScreen({ name: 'hub', profileId: p.id })}
          onCreate={() => setScreen({ name: 'editeur', profileId: null, retour: { name: 'accueil' } })}
          onErgo={() => setAskCode(true)}
        />
      )
      break
    case 'hub':
      content = active ? (
        <Hub
          profile={active}
          onEdit={() => setScreen({ name: 'editeur', profileId: active.id, retour: screen })}
          onSwitch={() => setScreen({ name: 'accueil' })}
          onPlay={(jeu) => setScreen({ name: 'jeu', jeu, profileId: active.id })}
        />
      ) : null
      break
    case 'jeu': {
      if (!active) break
      const commun = {
        profile: active,
        resultats: data.resultats,
        onResult: addResultat,
        onQuit: () => setScreen({ name: 'hub', profileId: active.id })
      }
      if (screen.jeu === 'dactylo') content = (
        <Dactylo
          {...commun}
          listes={listesAvecPhrasesEnfants(data.listes, data.phrasesEnfants)}
          onMedaille={(n) => addMedaille(active.id, n)}
          onPhrase={addPhraseEnfant}
        />
      )
      else if (screen.jeu === 'memoire') content = (
          <Memoire
            {...commun}
            listes={data.mots}
            phrases={data.phrasesMemoire}
            onProgression={(m) => saveProgressionMemoire(active.id, m)}
          />
        )
      else if (screen.jeu === 'espace') content = <Espace {...commun} />
      else if (screen.jeu === 'quiz') content = <Quiz {...commun} banque={construireBanque(data.questionsPerso, data.questionsMasquees)} />
      else if (screen.jeu === 'petitbac') content = <PetitBac {...commun} reglages={data.petitBac} />
      else content = <Couleurs {...commun} reglages={data.couleurs} />
      break
    }
      break
    case 'editeur': {
      const retour = screen.retour
      const existing = screen.profileId ? profileOf(screen.profileId) : undefined
      content = (
        <ProfileEditor
          key={screen.profileId ?? 'nouveau'}
          initial={existing}
          onCancel={() => setScreen(retour)}
          onDone={(p) => {
            saveProfile(p)
            setScreen(retour.name === 'accueil' ? { name: 'hub', profileId: p.id } : retour)
          }}
        />
      )
      break
    }
    case 'ergo':
      content = (
        <ErgoSpace
          data={data}
          onChange={update}
          onEditProfile={(p) => setScreen({ name: 'editeur', profileId: p.id, retour: { name: 'ergo' } })}
          onExit={() => setScreen({ name: 'accueil' })}
        />
      )
      break
  }

  // Le hub se colore avec les couleurs préférées de l'enfant (l'éditeur le fait
  // lui-même, en direct, pendant que l'enfant les choisit).
  return (
    <div className="app" style={active ? themeStyle(active) : undefined}>
      {content ?? <div className="loading">Profil introuvable</div>}
      {askCode && (
        <PinPad
          expected={data.settings.codeErgo}
          showDefaultHint={data.settings.codeErgo === '0000'}
          onSuccess={() => {
            setAskCode(false)
            setScreen({ name: 'ergo' })
          }}
          onCancel={() => setAskCode(false)}
        />
      )}
      {saveError && (
        <div className="toast toast-error" role="alert">
          Impossible d’enregistrer les données sur ce PC. Les dernières modifications risquent d’être perdues.
        </div>
      )}
    </div>
  )
}
