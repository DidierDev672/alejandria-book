import type { PencilColor } from './DigitalBookPencil.types'

export type NoteStrokeSize = 'small' | 'medium' | 'large'

export type NoteFontId = 'monsieur' | 'roboto' | 'inter' | 'open-sans' | 'henny-penny'

export interface NoteStrokeOption {
  id: NoteStrokeSize
  label: string
  width: number
  fontSize: string
}

export const NOTE_STROKE_OPTIONS: NoteStrokeOption[] = [
  { id: 'small', label: 'Trazos pequeños', width: 2, fontSize: '0.9rem' },
  { id: 'medium', label: 'Trazos medianos', width: 4.5, fontSize: '1.15rem' },
  { id: 'large', label: 'Trazos grandes', width: 8, fontSize: '1.5rem' },
]

export interface NoteFontOption {
  id: NoteFontId
  label: string
  family: string
}

export const NOTE_FONT_OPTIONS: NoteFontOption[] = [
  {
    id: 'monsieur',
    label: 'Monsieur La Doulaise',
    family: '"Monsieur La Doulaise", cursive',
  },
  {
    id: 'roboto',
    label: 'Roboto',
    family: 'Roboto, sans-serif',
  },
  {
    id: 'inter',
    label: 'Inter',
    family: 'Inter, sans-serif',
  },
  {
    id: 'open-sans',
    label: 'Open Sans',
    family: '"Open Sans", sans-serif',
  },
  {
    id: 'henny-penny',
    label: 'Henny Penny',
    family: '"Henny Penny", system-ui',
  },
]

export const NOTE_DEFAULT_FONT: NoteFontId = 'open-sans'
export const NOTE_DEFAULT_STROKE: NoteStrokeSize = 'medium'
export const NOTE_DEFAULT_COLOR: PencilColor = '#382E27'
export const NOTE_MIN_ZOOM = 0.75
export const NOTE_MAX_ZOOM = 1.75
export const NOTE_ZOOM_STEP = 0.15

export interface NoteCard {
  id: string
  color: PencilColor
  content: string
}

export interface HighlightNote {
  highlightId: string
  quotedText: string
  font: NoteFontId
  stroke: NoteStrokeSize
  zoom: number
  cards: NoteCard[]
  activeCardId: string | null
}

export function noteStrokeOption(size: NoteStrokeSize): NoteStrokeOption {
  return NOTE_STROKE_OPTIONS.find((item) => item.id === size) ?? NOTE_STROKE_OPTIONS[1]
}

export function noteFontOption(id: NoteFontId): NoteFontOption {
  return NOTE_FONT_OPTIONS.find((item) => item.id === id) ?? NOTE_FONT_OPTIONS[3]
}

export function createEmptyHighlightNote(
  highlightId: string,
  quotedText: string,
): HighlightNote {
  return {
    highlightId,
    quotedText,
    font: NOTE_DEFAULT_FONT,
    stroke: NOTE_DEFAULT_STROKE,
    zoom: 1,
    cards: [],
    activeCardId: null,
  }
}

export function createNoteCard(color: PencilColor): NoteCard {
  return {
    id: `note-${crypto.randomUUID()}`,
    color,
    content: '',
  }
}
