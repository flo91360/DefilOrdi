import { useCallback, useEffect, useRef, useState } from 'react'
import { type AppData, type Profile, type ResultatDactylo } from '../../shared/data'
import { api } from './api'
import { themeStyle } from './theme'
import { setVolume } from './sounds'
import { ProfilePicker } from './screens/ProfilePicker'
import { Hub } from './screens/Hub'
import { ProfileEditor } from './screens/ProfileEditor'
import { ErgoSpace } from './screens/ErgoSpace'
import { PinPad } from './components/PinPad'
import { Dactylo } from './games/dactylo/Dactylo'

type Screen =
  | { name: 'accueil' }
  | { name: 'hub'; profileId: string }
  | { name: 'editeur'; profileId: string | null; retour: Screen }
  | { name: 'ergo' }
  | { name: 'dactylo'; profileId: string }

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
  const active = screen.name === 'hub' || screen.name === 'dactylo' ? profileOf(screen.profileId) : undefined

  const addResultat = (r: ResultatDactylo) => {
    const d = dataRef.current
    if (d) update({ ...d, resultats: [...d.resultats, r] })
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
          onPlay={(jeu) => jeu === 'dactylo' && setScreen({ name: 'dactylo', profileId: active.id })}
        />
      ) : null
      break
    case 'dactylo':
      content = active ? (
        <Dactylo
          profile={active}
          listes={data.listes}
          resultats={data.resultats}
          onResult={addResultat}
          onQuit={() => setScreen({ name: 'hub', profileId: active.id })}
        />
      ) : null
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
