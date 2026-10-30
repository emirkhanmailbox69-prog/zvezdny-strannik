import type { CheckSpec, Enemy, GameState } from '../types'

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function rollDice(n: number): number {
  let total = 0
  for (let i = 0; i < n; i++) total += rollDie()
  return total
}

export interface CheckResult {
  dice: number[]
  total: number
  target: number
  targetLabel: string
  success: boolean
  next: number
}

export function runCheck(state: GameState, spec: CheckSpec): CheckResult {
  if (spec.kind === 'dice') {
    const die = rollDie()
    return {
      dice: [die],
      total: die,
      target: 0,
      targetLabel: 'кубик',
      success: die !== 1,
      next: die === 1 ? spec.fail : spec.success,
    }
  }

  const dice = [rollDie(), rollDie()]
  const total = dice[0] + dice[1]

  let target: number
  let targetLabel: string

  if (spec.kind === 'luck') {
    target = state.luck
    targetLabel = 'Удача'
  } else {
    const who = spec.who ?? 'captain'
    if (who === 'captain') {
      target = state.captain.mastery
      targetLabel = 'Мастерство капитана'
    } else {
      target = state.captain.mastery - 3
      targetLabel = `Мастерство (штраф −3)`
    }
  }

  const success = spec.kind === 'luck' ? total <= target : total <= target

  return {
    dice,
    total,
    target,
    targetLabel,
    success,
    next: success ? spec.success : spec.fail,
  }
}

export interface CombatRoundResult {
  playerRoll: number
  enemyRoll: number
  playerWon: boolean
  enemyWon: boolean
  enemy: Enemy
}

export function simulateCombatRound(
  state: GameState,
  enemy: Enemy
): CombatRoundResult {
  const playerRoll = rollDice(2) + state.captain.mastery
  const enemyRoll = rollDice(2) + enemy.mastery
  return {
    playerRoll,
    enemyRoll,
    playerWon: playerRoll > enemyRoll,
    enemyWon: enemyRoll > playerRoll,
    enemy,
  }
}