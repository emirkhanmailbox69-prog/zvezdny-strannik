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
      {/* ПАНЕЛЬ СТАТУСА (СВЕРХУ) */}
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3">
        
        {/* Имя и кнопка Статус */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white/90 uppercase tracking-wider">
            {state.captain.name}
          </div>
          <button
            onClick={() => setShowStatus(true)}
            className="text-xs text-teal-300 hover:text-teal-200 transition-colors"
          >
            Статус →
          </button>
        </div>

        {/* Характеристики Капитана */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Мастерство</div>
            <div className="text-white font-semibold text-sm">{state.captain.mastery}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Выносливость</div>
            <div className="text-white font-semibold text-sm">
              {state.captain.stamina} <span className="text-white/30 text-xs">/ {state.captain.maxStamina}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Удача</div>
            <div className="text-white font-semibold text-sm">{state.luck}</div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="h-px bg-white/5" />

        {/* Характеристики Корабля */}
        <div>
          <div className="text-[10px] text-center text-teal-300/70 uppercase tracking-widest mb-2">
            Характеристики корабля
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Вооружение</div>
              <div className="text-white font-semibold text-sm">{state.ship.weapon}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Защита</div>
              <div className="text-white font-semibold text-sm">{state.ship.defense}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Воля</div>
              <div className="text-teal-300 font-semibold text-sm">{state.will}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ТЕКСТ СЕКЦИИ И ВЫБОР */}
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