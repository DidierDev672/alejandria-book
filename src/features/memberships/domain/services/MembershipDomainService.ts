import type {
  MembershipDraft,
  MembershipDurationDays,
  MembershipPlanPayload,
  MembershipType,
  MembershipValidationErrors,
} from '../entities/Membership.types'

export const MEMBERSHIP_DURATION_OPTIONS: MembershipDurationDays[] = [30, 90, 180, 365]

export class MembershipDomainService {
  static createDraft(): MembershipDraft {
    return {
      name: '',
      type: '',
      durationDays: null,
      price: '',
      priceClass: '',
      classesIncluded: '',
      isActivo: true,
    }
  }

  static durationLabel(days: MembershipDurationDays): string {
    const labels: Record<MembershipDurationDays, string> = {
      30: '30 días · un mes para empezar',
      90: '90 días · un trimestre con calma',
      180: '180 días · medio año de constancia',
      365: '365 días · un año de lugar propio',
    }
    return labels[days]
  }

  static typeLabel(type: MembershipType): string {
    return type === 'BY_CLASS' ? 'Por clase' : 'Por periodo'
  }

  static validate(draft: MembershipDraft): MembershipValidationErrors {
    const errors: MembershipValidationErrors = {}

    if (!draft.name.trim()) {
      errors.name = 'Ponle un nombre que alguien reconozca al instante. Este campo no puede quedar vacío.'
    }

    if (draft.type !== 'BY_CLASS' && draft.type !== 'BY_PERIOD') {
      errors.type = 'Elige si este plan es por clases o por un periodo. Sin eso, no sabemos cómo acompaña.'
    }

    if (draft.type === 'BY_PERIOD' && draft.durationDays === null) {
      errors.durationDays = 'Un plan por periodo necesita sus días. Elige 30, 90, 180 o 365.'
    }

    const price = this.parseAmount(draft.price)
    if (draft.price.trim() === '' || price === null) {
      errors.price = 'Indica el precio del plan completo. Un número claro evita sorpresas después.'
    } else if (price < 0) {
      errors.price = 'El precio no puede ser negativo. Ajusta el valor y lo intentamos de nuevo.'
    }

    if (draft.type === 'BY_CLASS') {
      const priceClass = this.parseAmount(draft.priceClass)
      if (draft.priceClass.trim() === '' || priceClass === null) {
        errors.priceClass = 'Si el plan es por clase, necesitamos el precio de cada visita.'
      } else if (priceClass < 0) {
        errors.priceClass = 'El precio por clase no puede ser negativo.'
      }
    }

    if (draft.classesIncluded.trim() !== '') {
      const included = this.parseInteger(draft.classesIncluded)
      if (included === null || included <= 0) {
        errors.classesIncluded = 'Si limitas clases, usa un número entero mayor que cero. Si no hay tope, déjalo vacío.'
      }
    }

    return errors
  }

  static hasErrors(errors: MembershipValidationErrors): boolean {
    return Object.keys(errors).length > 0
  }

  static toApiPayload(draft: MembershipDraft): MembershipPlanPayload {
    const type = draft.type as MembershipType
    const isByClass = type === 'BY_CLASS'

    return {
      name: draft.name.trim(),
      type,
      duration_days: isByClass ? null : draft.durationDays,
      price: this.parseAmount(draft.price) ?? 0,
      price_per_class: isByClass ? (this.parseAmount(draft.priceClass) ?? 0) : 0,
      classes_included: this.parseInteger(draft.classesIncluded) ?? 0,
      is_active: draft.isActivo,
    }
  }

  static submitSuccessMessage(): string {
    return 'Este plan ya tiene un lugar. Quien lo elija va a sentir que alguien pensó en cómo se queda, no solo en cuánto paga.'
  }

  static submitErrorMessage(): string {
    return 'Se presentó un error al intentar crear la membresía. No es tu culpa: el plan no se guardó, pero lo que escribiste sigue aquí. Cuando quieras, lo intentamos otra vez.'
  }

  private static parseAmount(value: string): number | null {
    const normalized = value.trim().replace(',', '.')
    if (!normalized) return null
    const amount = Number(normalized)
    return Number.isFinite(amount) ? amount : null
  }

  private static parseInteger(value: string): number | null {
    const normalized = value.trim()
    if (!normalized) return null
    const amount = Number(normalized)
    if (!Number.isFinite(amount) || !Number.isInteger(amount)) return null
    return amount
  }
}
