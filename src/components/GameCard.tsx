import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { GameState } from '../types'

interface Props {
  state: GameState
  open: boolean
  onClose: () => void
}

export function GameCard({ state, open, onClose }: Props) {
  const { captain, luck, will, ship } = state

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11121c] p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-white">Статус</h2>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-teal-300/70 mb-3">
                Капитан
              </div>
              <div className="text-white font-medium mb-4">{captain.name}</div>
              <div className="space-y-3 text-sm">
                <Row label="Мастерство" value={captain.mastery} />
                <Row label="Выносливость" value={`${captain.stamina} / ${captain.maxStamina}`} />
                <Row label="Удача" value={luck} />
                <Row label="Воля" value={will} accent />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="text-[10px] uppercase tracking-widest text-teal-300/70 mb-3">
                Корабль
              </div>
              <div className="space-y-3 text-sm">
                <Row label="Вооружение" value={ship.weapon} />
                <Row label="Защита" value={ship.defense} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-xs text-white/40 leading-relaxed">
              Мастерство влияет на бой и проверки. Выносливость — твоё здоровье. Удача — на броски с риском. Воля — на второй шанс.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Row({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className={accent ? 'text-teal-300 font-semibold' : 'text-white'}>{value}</span>
    </div>
  )
}