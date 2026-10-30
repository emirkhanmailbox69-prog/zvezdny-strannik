import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { runCheck, type CheckResult } from '../lib/engine'
import type { GameState, Section } from '../types'

interface Props {
  state: GameState
  section: Section
  onChoose: (next: number) => void
}

export function CheckScreen({ state, section, onChoose }: Props) {
  const [result, setResult] = useState<CheckResult | null>(null)
  const [rolling, setRolling] = useState(true)
  const [displayed, setDisplayed] = useState<number[]>([1, 1])

  useEffect(() => {
    if (!section.check) return

    let ticks = 0
    const interval = setInterval(() => {
      setDisplayed([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1])
      ticks++
      if (ticks >= 8) {
        clearInterval(interval)
        const finalResult = runCheck(state, section.check!)
        setResult(finalResult)
        setRolling(false)
      }
    }, 80)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id])

  if (!section.check) {
    return <div className="text-white/60">Ошибка: нет проверки</div>
  }

  const isDice = section.check.kind === 'dice'

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <p className="text-[17px] leading-relaxed text-white/85 whitespace-pre-line">
        {section.text}
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
        <div className="text-center text-xs uppercase tracking-widest text-teal-300/70">
          {section.check.kind === 'luck' && 'Проверка удачи'}
          {section.check.kind === 'mastery' && 'Проверка мастерства'}
          {section.check.kind === 'dice' && 'Бросок кубика'}
        </div>

        <div className="flex justify-center gap-3">
          <Die value={displayed[0]} rolling={rolling} />
          {!isDice && <Die value={displayed[1]} rolling={rolling} />}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 text-center"
          >
            {!isDice && (
              <>
                <div className="text-white/60 text-sm">
                  Сумма: <span className="text-white font-semibold">{result.total}</span>
                </div>
                <div className="text-white/60 text-sm">
                  {result.targetLabel}: <span className="text-white font-semibold">{result.target}</span>
                </div>
              </>
            )}
            {isDice && (
              <div className="text-white/60 text-sm">
                Выпало: <span className="text-white font-semibold">{result.total}</span>
              </div>
            )}

            <div
              className={`text-lg font-semibold pt-2 ${
                result.success ? 'text-teal-300' : 'text-rose-400'
              }`}
            >
              {result.success ? '✓ Успех' : '✗ Провал'}
            </div>
          </motion.div>
        )}
      </div>

      {result && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChoose(result.next)}
          className="group w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-teal-400/40 px-4 py-3 transition-all flex items-center justify-between gap-3"
        >
          <span className="text-[15px] text-white/90">Продолжить</span>
          <ArrowRight size={16} className="text-white/40 group-hover:text-teal-300 transition-colors" />
        </motion.button>
      )}
    </motion.div>
  )
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <motion.div
      animate={rolling ? { rotate: [0, 90, 180, 270, 360] } : { rotate: 0 }}
      transition={rolling ? { duration: 0.4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
      className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"
    >
      <span className="text-3xl font-serif text-white">{value}</span>
    </motion.div>
  )
}