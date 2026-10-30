export type Screen = 'menu' | 'create' | 'game' | 'dead'

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

export interface Section {
  id: number
  text: string
  choices?: Choice[]
  ending?: 'victory' | 'death'
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
}