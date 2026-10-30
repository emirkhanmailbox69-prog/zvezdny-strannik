import raw from './sections.json'
import type { Section } from '../types'

export const SECTIONS: Record<number, Section> =
  Object.fromEntries(
    (raw.sections as Section[]).map(s => [s.id, s])
  )