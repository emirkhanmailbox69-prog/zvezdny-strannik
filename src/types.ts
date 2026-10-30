export type Screen = 'menu' | 'create' | 'game'

export interface Character {
  name: string
  mastery: number
  stamina: number
  maxStamina: number
}

export interface Choice {
  label: string
  next: number
}

export interface CheckSpec {
  kind: 'luck' | 'mastery' | 'dice'
  success: number
  fail: number
  who?: 'captain' | 'science' | 'doctor' | 'engineer' | 'security'
}

export interface Enemy {
  name: string
  mastery: number
  stamina?: number
  defense?: number
  weapon?: number
}

export interface CombatSpec {
  kind: 'melee' | 'blaster' | 'space'
  enemies: Enemy[]
  victory: number
  defeat: 'death' | number
  canSurrender?: boolean
  surrender?: number
}

export interface Section {
  id: number
  title?: string
  text: string
  type: 'narrative' | 'check' | 'combat'
  ending?: 'death' | 'victory'
  choices?: Choice[]
  check?: CheckSpec
  combat?: CombatSpec
  _needs_review?: boolean
}

export interface GameState {
  currentSection: number
  captain: Character
  luck: number
  will: number
  ship: {
    weapon: number
    defense: number
  }
  history: number[]
  status: 'playing' | 'dead' | 'victory'
}