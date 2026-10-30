import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { GameCard } from '../components/GameCard'
import type { GameState, Section } from '../types'

interface Props {
  state: GameState
  section: Section | undefined
  onChoose: (next: number) => void
  onReset: () => void
}

export function Game({ state, section, onChoose, onReset }: Props) {
  const [showStatus, setShowStatus] = useState(false)

  return (
    <div className="min-h-full max-w-2xl mx-auto px-4 py-6 space-y-5">
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-base font-medium text-white">{state.captain.name}</div>
          <button
            onClick={() => setShowStatus(true)}
            className="text-xs text-teal-300 hover:text-teal-200 transition-colors"
          >
            Статус →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-white/40 mb-0.5">Мастерство</div>
            <div className="text-white font-semibold text-sm">{state.captain.mastery}</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 mb-0.5">Выносливость</div>
            <div className="text-white font-semibold text-sm">
              {state.captain.stamina}/{state.captain.maxStamina}
            </div>
            <div className="h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-rose-400 transition-all"
                style={{ width: `${(state.captain.stamina / state.captain.maxStamina) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/40 mb-0.5">Удача</div>
            <div className="text-white font-semibold text-sm">{state.luck}</div>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-white/40 mb-0.5">Вооружение</div>
            <div className="text-white font-semibold text-sm">{state.ship.weapon}</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 mb-0.5">Защита</div>
            <div className="text-white font-semibold text-sm">{state.ship.defense}</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 mb-0.5">Воля</div>
            <div className="text-teal-300 font-semibold text-sm">{state.will}</div>
          </div>
        </div>
      </header>

      {!section ? (
        <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-red-300 text-sm">
          Страница потеряна в пространстве.
          <button onClick={onReset} className="ml-2 underline">Начать заново</button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentSection}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            <p className="text-[17px] leading-relaxed text-white/85 whitespace-pre-line">
              {section.text}
            </p>

            {section.ending ? (
              <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 text-teal-300 px-4 py-3 hover:bg-teal-400/20 transition-colors"
              >
                <RotateCcw size={16} /> Начать заново
              </button>
            ) : (
              <div className="space-y-2">
                {section.choices?.map((c, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onChoose(c.next)}
                    className="group w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-teal-400/40 px-4 py-3 transition-all flex items-center justify-between gap-3"
                  >
                    <span className="text-[15px] text-white/90">{c.label}</span>
                    <ArrowRight size={16} className="text-white/40 group-hover:text-teal-300 transition-colors shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <GameCard state={state} open={showStatus} onClose={() => setShowStatus(false)} />
    </div>
  )
}