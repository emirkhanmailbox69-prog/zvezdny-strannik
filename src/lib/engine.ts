import type { CheckSpec, CombatSpec, Enemy, GameState } from '../types'

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
      target = Math.max(1, state.captain.mastery - 3)
      targetLabel = 'Мастерство (−3)'
    }
  }

  const success = spec.kind === 'luck' ? total >= target : total <= target

  return {
    dice,
    total,
    target,
    targetLabel,
    success,
    next: success ? spec.success : spec.fail,
  }
}

// ============ БОЙ ============

export type CombatLogLine = {
  text: string
  tone: 'neutral' | 'player' | 'enemy' | 'info'
}

export type CombatOutcome = 'ongoing' | 'victory' | 'defeat'

export interface CombatState {
  enemies: (Enemy & { currentStamina: number })[]
  round: number
  log: CombatLogLine[]
  outcome: CombatOutcome
}

export function initCombat(spec: CombatSpec): CombatState {
  return {
    enemies: spec.enemies.map(e => ({
      ...e,
      currentStamina: e.stamina ?? 2,
    })),
    round: 1,
    log: [
      {
        text: `Начало боя. Врагов: ${spec.enemies.length}.`,
        tone: 'info',
      },
    ],
    outcome: 'ongoing',
  }
}

export interface MeleeRound {
  playerRoll: number
  enemyRoll: number
  playerHit: boolean
  enemyHit: boolean
  enemyName: string
  newEnemyStamina: number
  newCaptainStamina: number
}

export function meleeRound(
  state: GameState,
  enemy: Enemy & { currentStamina: number }
): MeleeRound {
  const playerRoll = rollDice(2) + state.captain.mastery
  const enemyRoll = rollDice(2) + enemy.mastery

  const playerHit = playerRoll > enemyRoll
  const enemyHit = enemyRoll > playerRoll

  const newEnemyStamina = enemyHit
    ? enemy.currentStamina
    : enemy.currentStamina - (playerHit ? 2 : 0)

  const newCaptainStamina = Math.max(
    0,
    state.captain.stamina - (enemyHit ? 2 : 0)
  )

  return {
    playerRoll,
    enemyRoll,
    playerHit,
    enemyHit,
    enemyName: enemy.name,
    newEnemyStamina,
    newCaptainStamina,
  }
}

export interface BlasterShot {
  roll: number
  target: number
  hit: boolean
  enemyName: string
}

export function blasterShot(
  state: GameState,
  enemy: Enemy
): BlasterShot {
  const roll = rollDice(2)
  const target = state.captain.mastery
  const hit = roll < target
  return { roll, target, hit, enemyName: enemy.name }
}

export interface SpaceRound {
  playerAttackRoll: number
  playerHit: boolean
  playerDamage: number
  enemyAttackRoll: number
  enemyHit: boolean
  enemyDamage: number
  newEnemyDefense: number
  newShipDefense: number
}

export function spaceRound(
  state: GameState,
  enemyWeapon: number,
  enemyDefense: number
): SpaceRound {
  const playerAttackRoll = rollDice(2)
  const playerHit = playerAttackRoll < state.ship.weapon

  let playerDamage = 0
  if (playerHit) {
    const dmg = rollDice(2)
    if (dmg === 12) playerDamage = 6
    else if (dmg <= enemyDefense) playerDamage = 2
    else playerDamage = 4
  }

  const enemyAttackRoll = rollDice(2)
  const enemyHit = enemyAttackRoll < enemyWeapon

  let enemyDamage = 0
  if (enemyHit) {
    const dmg = rollDice(2)
    if (dmg === 12) enemyDamage = 6
    else if (dmg <= state.ship.defense) enemyDamage = 2
    else enemyDamage = 4
  }

  return {
    playerAttackRoll,
    playerHit,
    playerDamage,
    enemyAttackRoll,
    enemyHit,
    enemyDamage,
    newEnemyDefense: Math.max(0, enemyDefense - playerDamage),
    newShipDefense: Math.max(0, state.ship.defense - enemyDamage),
  }
}