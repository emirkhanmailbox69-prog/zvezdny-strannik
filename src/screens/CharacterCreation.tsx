import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dice5, ArrowRight } from 'lucide-react'
import type { GameState } from '../types'

interface Props {
  onStart: (state: GameState) => void
  onBack: () => void
}

function rollDie(n: number): number {
  let total = 0
  for (let i = 0; i < n; i++) total += Math.floor(Math.random() * 6) + 1
  return total
}

export function CharacterCreation({ onStart, onBack }: Props) {
  const [name, setName] = useState('Капитан')
  const [mastery, setMastery] = useState<number | null>(null)
  const [stamina, setStamina] = useState<number | null>(null)
  const [luck, setLuck] = useState<number | null>(null)
  const [shipWeapon, setShipWeapon] = useState<number | null>(null)
  const [shipDefense, setShipDefense] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)

  const allRolled =
    mastery !== null && stamina !== null && luck !== null &&
    shipWeapon !== null && shipDefense !== null

  const rollAll = () => {
    if (allRolled || rolling) return
    setRolling(true)

    let ticks = 0
    const interval = setInterval(() => {
      setMastery(rollDie(1) + 6)
      setStamina(rollDie(2) + 12)
      setLuck(rollDie(1) + 6)
      setShipWeapon(rollDie(1) + 6)
      setShipDefense(rollDie(1) + 12)
      ticks++
      if (ticks >= 8) {
        clearInterval(interval)
        setRolling(false)
      }
    }, 70)
  }

  const start = () => {
    if (!allRolled) return
    const finalName = name.trim() || 'Капитан'
    onStart({
      currentSection: 1,
      captain: {
        name: finalName,
        mastery: mastery!,
        stamina: stamina!,
        maxStamina: stamina!,
      },
      luck: luck!,
      will: 3,
      ship: { weapon: shipWeapon!, defense: shipDefense! },
      history: [],
      status: 'playing',
    })
  }

  return (
    <div className="min-h-full max-w-lg mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="text-xs text-white/40 hover:text-white/70 mb-6 transition-colors"
      >
        ← Назад
      </button>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-3xl text-white mb-2"
      >
        Подготовка к путешествию
      </motion.h2>
      <p className="text-sm text-white/50 mb-8">
        Брось кубики, чтобы определить характеристики капитана и корабля.
        Перебросить нельзя — с тем, что выпало, и пойдёшь.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
            Имя капитана
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-teal-400/50 transition-colors"
          />
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-teal-300/70 mb-2">
            Капитан
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatBox label="Мастерство" value={mastery} />
            <StatBox label="Выносливость" value={stamina} />
            <StatBox label="Удача" value={luck} />
          </div>

          <div className="text-xs uppercase tracking-widest text-teal-300/70 mb-2">
            Корабль
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="Вооружение" value={shipWeapon} />
            <StatBox label="Защита" value={shipDefense} />
          </div>
        </div>

        <button
          onClick={rollAll}
          disabled={rolling || allRolled}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Dice5 size={16} />
          {allRolled ? 'Судьба решена' : rolling ? 'Бросаем...' : 'Бросить кубики'}
        </button>
      </div>

      <button
        onClick={start}
        disabled={!allRolled}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-400/15 border border-teal-400/40 text-teal-200 px-5 py-4 hover:bg-teal-400/25 transition-colors font-medium disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Начать приключение
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
        {label}
      </div>
      <div className="text-2xl font-serif text-white">
        {value === null ? '—' : value}
      </div>
    </div>
  )
}