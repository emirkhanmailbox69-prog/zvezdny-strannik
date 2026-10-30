import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sword, Crosshair, Rocket, ArrowRight, Skull } from 'lucide-react'
import {
  initCombat,
  meleeRound,
  blasterShot,
  spaceRound,
  type CombatLogLine,
} from '../lib/engine'
import type { GameState, Section } from '../types'

interface Props {
  state: GameState
  section: Section
  onWin: (next: number) => void
  onLose: () => void
}

export function CombatScreen({ state, section, onWin, onLose }: Props) {
  const spec = section.combat!
  const [combat, setCombat] = useState(() => initCombat(spec))
  const [localCaptainStamina, setLocalCaptainStamina] = useState(state.captain.stamina)
  const [shipDefense, setShipDefense] = useState(state.ship.defense)
  const [busy, setBusy] = useState(false)

  const Icon = spec.kind === 'space' ? Rocket : spec.kind === 'blaster' ? Crosshair : Sword

  const aliveEnemies = combat.enemies.filter(e => e.currentStamina > 0)

  const doMeleeRound = () => {
    if (busy || aliveEnemies.length === 0) return
    setBusy(true)

    const enemy = aliveEnemies[0]
    const result = meleeRound(state, enemy)

    const newLog: CombatLogLine[] = [
      {
        text: `Раунд ${combat.round}: ты ${result.playerRoll} vs ${enemy.name} ${result.enemyRoll}`,
        tone: 'info',
      },
    ]
    if (result.playerHit) {
      newLog.push({
        text: `Ты попадаешь! ${enemy.name} теряет 2 В.`,
        tone: 'player',
      })
    }
    if (result.enemyHit) {
      newLog.push({
        text: `${enemy.name} попадает! Ты теряешь 2 В.`,
        tone: 'enemy',
      })
    }
    if (!result.playerHit && !result.enemyHit) {
      newLog.push({ text: 'Удары отбиты!', tone: 'neutral' })
    }

    const enemies = combat.enemies.map(e =>
      e === enemy ? { ...e, currentStamina: result.newEnemyStamina } : e
    )
    const died = enemies.every(e => e.currentStamina <= 0)
    const captainDied = result.newCaptainStamina <= 0

    if (died) {
      newLog.push({ text: 'Все враги повержены!', tone: 'info' })
    } else if (captainDied) {
      newLog.push({ text: 'Ты погибаешь...', tone: 'enemy' })
    }

    setCombat(c => ({
      enemies,
      round: c.round + 1,
      log: [...c.log, ...newLog].slice(-8),
      outcome: died ? 'victory' : captainDied ? 'defeat' : 'ongoing',
    }))
    setLocalCaptainStamina(result.newCaptainStamina)
    setBusy(false)
  }

  const doBlasterShot = () => {
    if (busy || aliveEnemies.length === 0) return
    setBusy(true)

    const enemy = aliveEnemies[0]
    const result = blasterShot(state, enemy)

    const newLog: CombatLogLine[] = [
      {
        text: `Выстрел в ${enemy.name}: бросок ${result.roll} (мастерство ${result.target})`,
        tone: 'info',
      },
    ]

    let enemies = combat.enemies
    let captainStamina = localCaptainStamina

    if (result.hit) {
      newLog.push({
        text: `Попадание! ${enemy.name} обезврежен.`,
        tone: 'player',
      })
      enemies = combat.enemies.map(e =>
        e === enemy ? { ...e, currentStamina: 0 } : e
      )
    } else {
      newLog.push({ text: `Промах! ${enemy.name} стреляет в ответ.`, tone: 'enemy' })
      const counterRoll = rollDiceSafe(2)
      if (counterRoll < enemy.mastery) {
        captainStamina = Math.max(0, captainStamina - 2)
        newLog.push({ text: `${enemy.name} попадает! Ты теряешь 2 В.`, tone: 'enemy' })
      } else {
        newLog.push({ text: `${enemy.name} промахивается.`, tone: 'neutral' })
      }
    }

    const died = enemies.every(e => e.currentStamina <= 0)
    const captainDied = captainStamina <= 0

    if (died) newLog.push({ text: 'Все враги обезврежены!', tone: 'info' })

    setCombat(c => ({
      enemies,
      round: c.round + 1,
      log: [...c.log, ...newLog].slice(-8),
      outcome: died ? 'victory' : captainDied ? 'defeat' : 'ongoing',
    }))
    setLocalCaptainStamina(captainStamina)
    setBusy(false)
  }

  const doSpaceRound = () => {
    if (busy) return
    setBusy(true)

    const enemy = aliveEnemies[0]
    const enemyDefense = enemy.defense ?? 2
    const enemyWeapon = enemy.weapon ?? 2

    const result = spaceRound(state, enemyWeapon, enemyDefense)

    const newLog: CombatLogLine[] = []
    if (result.playerHit) {
      newLog.push({ text: `Ты попадаешь! Враг теряет ${result.playerDamage} ЗАЩ.`, tone: 'player' })
    } else {
      newLog.push({ text: 'Ты промахиваешься.', tone: 'neutral' })
    }
    if (result.enemyHit) {
      newLog.push({ text: `Враг попадает! Ты теряешь ${result.enemyDamage} ЗАЩ.`, tone: 'enemy' })
    } else {
      newLog.push({ text: 'Враг промахивается.', tone: 'neutral' })
    }

    const enemies = combat.enemies.map(e =>
      e === enemy ? { ...e, currentStamina: result.newEnemyDefense, defense: result.newEnemyDefense } : e
    )
    const died = enemies.every(e => (e.defense ?? 0) <= 0)
    const shipDied = result.newShipDefense <= 0

    if (died) newLog.push({ text: 'Вражеский корабль уничтожен!', tone: 'info' })
    if (shipDied) newLog.push({ text: 'Твой корабль уничтожен...', tone: 'enemy' })

    setCombat(c => ({
      enemies,
      round: c.round + 1,
      log: [...c.log, ...newLog].slice(-8),
      outcome: died ? 'victory' : shipDied ? 'defeat' : 'ongoing',
    }))
    setShipDefense(result.newShipDefense)
    setBusy(false)
  }

  const handleAction =
    spec.kind === 'melee'
      ? doMeleeRound
      : spec.kind === 'blaster'
      ? doBlasterShot
      : doSpaceRound

  const canSurrender = spec.canSurrender && spec.surrender

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <Icon size={24} className="text-rose-400" />
        <div>
          <div className="text-xs text-white/40 uppercase tracking-widest">
            {spec.kind === 'melee' ? 'Схватка' : spec.kind === 'blaster' ? 'Перестрелка' : 'Космический бой'}
          </div>
          <div className="text-sm text-white/70">Раунд {combat.round}</div>
        </div>
      </div>

      <p className="text-[17px] leading-relaxed text-white/85 whitespace-pre-line">
        {section.text}
      </p>

      {/* Статус: капитан + корабль */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{state.captain.name}</span>
          <span className="text-white font-semibold">
            {spec.kind === 'space' ? `ЗАЩ: ${shipDefense}` : `В: ${localCaptainStamina} / ${state.captain.maxStamina}`}
          </span>
        </div>

        {aliveEnemies.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            {combat.enemies.map((e, i) => {
              const alive = spec.kind === 'space' ? (e.defense ?? 0) > 0 : e.currentStamina > 0
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className={alive ? 'text-rose-300' : 'text-white/30 line-through'}>
                    {e.name}
                  </span>
                  <span className={alive ? 'text-white/80' : 'text-white/30'}>
                    {spec.kind === 'space' ? `ЗАЩ: ${e.defense ?? 0}` : `В: ${Math.max(0, e.currentStamina)}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Лог */}
      {combat.log.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-black/30 p-3 space-y-1 text-sm max-h-48 overflow-y-auto">
          {combat.log.map((line, i) => (
            <div
              key={i}
              className={
                line.tone === 'player'
                  ? 'text-teal-300'
                  : line.tone === 'enemy'
                  ? 'text-rose-400'
                  : line.tone === 'info'
                  ? 'text-white/50'
                  : 'text-white/70'
              }
            >
              {line.text}
            </div>
          ))}
        </div>
      )}

      {/* Действия */}
      {combat.outcome === 'ongoing' && (
        <div className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-400/15 border border-teal-400/40 text-teal-200 px-5 py-4 hover:bg-teal-400/25 transition-colors font-medium disabled:opacity-40"
          >
            {busy ? '...' : 'Атаковать'}
          </motion.button>

          {canSurrender && (
            <button
              onClick={() => onWin(spec.surrender!)}
              className="w-full rounded-xl border border-white/10 bg-white/5 text-white/70 px-5 py-3 hover:bg-white/10 transition-colors"
            >
              Сдаться
            </button>
          )}
        </div>
      )}

      {combat.outcome === 'victory' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => onWin(spec.victory)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-400/15 border border-teal-400/40 text-teal-200 px-5 py-4 hover:bg-teal-400/25 transition-colors font-medium"
        >
          Продолжить <ArrowRight size={16} />
        </motion.button>
      )}

      {combat.outcome === 'defeat' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onLose}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 px-5 py-4 hover:bg-rose-500/25 transition-colors font-medium"
        >
          <Skull size={16} /> Твоё путешествие окончено
        </motion.button>
      )}
    </motion.div>
  )
}

function rollDiceSafe(n: number): number {
  let total = 0
  for (let i = 0; i < n; i++) total += Math.floor(Math.random() * 6) + 1
  return total
}