import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Skull, Trophy } from 'lucide-react'
import { Starfield } from './components/Starfield'
import { MainMenu } from './screens/MainMenu'
import { CharacterCreation } from './screens/CharacterCreation'
import { Game } from './screens/Game'
import { SECTIONS } from './data/sections'
import type { GameState, Screen } from './types'

const SAVE_KEY = 'zvezdny_strannik_save_v2'

const PRIMARY_BTN =
  'w-full flex items-center justify-center gap-2 rounded-xl bg-teal-400/20 border border-teal-400/50 text-teal-100 px-5 py-4 hover:bg-teal-400/30 active:bg-teal-400/35 transition-colors font-medium'

const SECONDARY_BTN =
  'w-full rounded-xl border border-white/10 bg-white/5 text-white/80 px-6 py-3 hover:bg-white/10 transition-colors'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [state, setState] = useState<GameState | null>(null)
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) {
        setHasSave(false)
        return
      }
      const parsed = JSON.parse(raw)
      const s = parsed.state as GameState | undefined
      setHasSave(!!(s && (s.status === 'playing' || !s.status)))
    } catch {
      setHasSave(false)
    }
  }, [])

  useEffect(() => {
    if (state && screen === 'game' && state.status === 'playing') {
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
    setScreen('intro')
  }

  const enterGame = () => {
    setScreen('game')
  }

  const continueGame = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.state && parsed.screen) {
        const s = parsed.state as GameState
        if (!s.status) s.status = 'playing'
        setState(s)
        setScreen('game')
      }
    } catch {}
  }

  const choose = (next: number) => {
    if (!state) return
    const target = SECTIONS[next]
    const newState: GameState = {
      ...state,
      history: [...state.history, state.currentSection],
      currentSection: next,
    }

    if (target?.ending === 'death') {
      setState({ ...newState, status: 'dead' })
      return
    }
    if (target?.ending === 'victory') {
      setState({ ...newState, status: 'victory' })
      return
    }
    setState(newState)
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

        {screen === 'intro' && (
          <div className="min-h-full max-w-2xl mx-auto px-4 py-8 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="font-serif text-3xl text-white text-center">
                Приключение начинается!
              </h1>
              <p className="text-[17px] leading-relaxed text-white/85 whitespace-pre-line">
{`Теперь, когда ты определил, в чем сильные и слабые стороны твоего корабля и твоего экипажа, можешь смело отправляться в путь!

Итак, ты Капитан космического корабля «Звездный Странник», затерянного в чужой вселенной. Лишь от тебя будет зависеть, сможет ли твой экипаж найти дорогу обратно на Землю. Вот-вот «Звездный Странник» будет затянут в Селтсианскую Бездну и выброшен в самые темные уголки неисследованного космоса. Единственный способ вернуться в собственную вселенную - отыскать разрыв в пространственно-временном континууме - черную дыру - и провести сквозь него свой корабль.

Удачи, космический странник!`}
              </p>
              <button onClick={enterGame} className={PRIMARY_BTN}>
                В путь
              </button>
            </motion.div>
          </div>
        )}

        {screen === 'game' && state && state.status === 'playing' && (
          <Game state={state} section={currentSection} onChoose={choose} onReset={reset} />
        )}

        {screen === 'game' && state && state.status === 'dead' && (
          <FullScreen>
            <div className="text-center space-y-6 max-w-md">
              <Skull size={56} className="mx-auto text-rose-400" />
              <h1 className="font-serif text-4xl text-white">Твоё путешествие окончено</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                «Звёздный Странник» больше не отзовётся на зов. Но звёзды ждут снова.
              </p>
              <div className="space-y-2 pt-4">
                <button onClick={startNew} className={PRIMARY_BTN}>
                  <RotateCcw size={16} /> Начать заново
                </button>
                <button onClick={reset} className={SECONDARY_BTN}>
                  В главное меню
                </button>
              </div>
            </div>
          </FullScreen>
        )}

        {screen === 'game' && state && state.status === 'victory' && (
          <FullScreen>
            <div className="text-center space-y-6 max-w-md">
              <Trophy size={56} className="mx-auto text-amber-400" />
              <h1 className="font-serif text-4xl text-white">Ты вернулся домой</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                «Звёздный Странник» снова на Земле. Твоё путешествие завершено.
              </p>
              <div className="space-y-2 pt-4">
                <button onClick={startNew} className={PRIMARY_BTN}>
                  <RotateCcw size={16} /> Новое путешествие
                </button>
                <button onClick={reset} className={SECONDARY_BTN}>
                  В главное меню
                </button>
              </div>
            </div>
          </FullScreen>
        )}
      </div>
    </>
  )
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full flex items-center justify-center px-6">{children}</div>
}