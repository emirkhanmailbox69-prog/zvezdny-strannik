import { useEffect, useState } from 'react'
import { Starfield } from './components/Starfield'
import { MainMenu } from './screens/MainMenu'
import { CharacterCreation } from './screens/CharacterCreation'
import { Game } from './screens/Game'
import { SECTIONS } from './data/demo-sections'
import type { GameState, Screen } from './types'

const SAVE_KEY = 'zvezdny_strannik_save_v1'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [state, setState] = useState<GameState | null>(null)
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      setHasSave(raw !== null)
    } catch {
      setHasSave(false)
    }
  }, [])

  useEffect(() => {
    if (state && state.currentSection && screen === 'game') {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ state, screen }))
      } catch {}
    }
  }, [state, screen])

  const startNew = () => {
    setState(null)
    setScreen('create')
  }

  const startGame = (newState: GameState) => {
    setState(newState)
    setScreen('game')
  }

  const continueGame = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.state && parsed.screen) {
        setState(parsed.state)
        setScreen(parsed.screen)
      }
    } catch {}
  }

  const choose = (next: number) => {
    if (!state) return
    const target = SECTIONS[next]
    if (target?.ending === 'death') {
      setState({ ...state, history: [...state.history, state.currentSection], currentSection: next })
      setScreen('dead')
      return
    }
    setState({
      ...state,
      history: [...state.history, state.currentSection],
      currentSection: next,
    })
  }

  const reset = () => {
    try { localStorage.removeItem(SAVE_KEY) } catch {}
    setState(null)
    setScreen('menu')
    setHasSave(false)
  }

  const currentSection = state ? SECTIONS[state.currentSection] : undefined

  return (
    <>
      <Starfield />
      <div className="min-h-full">
        {screen === 'menu' && (
          <MainMenu hasSave={hasSave} onNewGame={startNew} onContinue={continueGame} />
        )}
        {screen === 'create' && (
          <CharacterCreation onStart={startGame} onBack={() => setScreen('menu')} />
        )}
        {screen === 'game' && state && (
          <Game state={state} section={currentSection} onChoose={choose} onReset={reset} />
        )}
        {screen === 'dead' && (
          <div className="min-h-full flex flex-col items-center justify-center px-6 text-center">
            <h1 className="font-serif text-4xl text-red-400 mb-4">Твоё путешествие окончено</h1>
            <p className="text-white/60 mb-8 max-w-sm">
              «Звёздный Странник» больше не отзовётся на зов. Но звёзды ждут снова.
            </p>
            <button
              onClick={reset}
              className="rounded-xl bg-teal-400/15 border border-teal-400/40 text-teal-200 px-6 py-3 hover:bg-teal-400/25 transition-colors"
            >
              Начать заново
            </button>
          </div>
        )}
      </div>
    </>
  )
}