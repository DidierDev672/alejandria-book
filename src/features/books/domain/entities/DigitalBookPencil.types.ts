export type PencilSize = 'small' | 'medium' | 'large' | 'xlarge'

export const PENCIL_PALETTE = [
  '#F4F4F4',
  '#CECECE',
  '#494949',
  '#38566E',
  '#2D4049',
  '#7E8D30',
  '#394112',
  '#FDFEFA',
  '#C1AD99',
  '#B6987C',
  '#5A4737',
  '#382E27',
  '#143355',
  '#BB7542',
  '#D45307',
  '#BB3300',
  '#A75537',
  '#733020',
  '#4A0B03',
  '#422206',
  '#6B3907',
  '#D08F45',
  '#E3CFAE',
  '#F1E9D8',
  '#E2D9C7',
  '#EA6113',
  '#F88F22',
  '#FBB931',
  '#FFE3B3',
] as const

export type PencilColor = (typeof PENCIL_PALETTE)[number]

export interface PencilSizeOption {
  id: PencilSize
  label: string
  shortLabel: string
  stroke: number
}

export const PENCIL_SIZE_OPTIONS: PencilSizeOption[] = [
  { id: 'small', label: 'Pequeño', shortLabel: 'Peq', stroke: 2 },
  { id: 'medium', label: 'Mediano', shortLabel: 'Med', stroke: 4 },
  { id: 'large', label: 'Grande', shortLabel: 'Gde', stroke: 8 },
  { id: 'xlarge', label: 'Demasiado grande', shortLabel: 'XL', stroke: 14 },
]

export const PENCIL_COLOR_NAMES: Record<PencilColor, string> = {
  '#F4F4F4': 'Papel',
  '#CECECE': 'Niebla',
  '#494949': 'Grafito',
  '#38566E': 'Tinta',
  '#2D4049': 'Pizarra',
  '#7E8D30': 'Oliva',
  '#394112': 'Musgo',
  '#FDFEFA': 'Marfil',
  '#C1AD99': 'Arena',
  '#B6987C': 'Cuero',
  '#5A4737': 'Nogal',
  '#382E27': 'Ébano',
  '#143355': 'Marino',
  '#BB7542': 'Terracota',
  '#D45307': 'Ámbar',
  '#BB3300': 'Lacre',
  '#A75537': 'Caoba',
  '#733020': 'Óxido',
  '#4A0B03': 'Sombra',
  '#422206': 'Cacao',
  '#6B3907': 'Roble',
  '#D08F45': 'Miel',
  '#E3CFAE': 'Beige',
  '#F1E9D8': 'Crema',
  '#E2D9C7': 'Lino',
  '#EA6113': 'Mandarina',
  '#F88F22': 'Calabaza',
  '#FBB931': 'Oro',
  '#FFE3B3': 'Durazno',
}

export type PencilKit = Record<PencilSize, PencilColor>

export const PENCIL_DEFAULT_KIT: PencilKit = {
  small: '#494949',
  medium: '#38566E',
  large: '#BB7542',
  xlarge: '#D45307',
}

const LIGHT_PENCIL_COLORS: ReadonlySet<PencilColor> = new Set([
  '#F4F4F4',
  '#CECECE',
  '#FDFEFA',
  '#C1AD99',
  '#E3CFAE',
  '#F1E9D8',
  '#E2D9C7',
  '#FFE3B3',
])

export function isLightPencilColor(color: PencilColor): boolean {
  return LIGHT_PENCIL_COLORS.has(color)
}

export function pencilOption(size: PencilSize): PencilSizeOption {
  const option = PENCIL_SIZE_OPTIONS.find((item) => item.id === size)
  return option ?? PENCIL_SIZE_OPTIONS[1]
}

export function pencilCursorDiameter(size: PencilSize): number {
  const diameters: Record<PencilSize, number> = {
    small: 16,
    medium: 22,
    large: 32,
    xlarge: 44,
  }
  return diameters[size]
}
