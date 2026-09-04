// ============================================================
// DOMAIN · Pay
// Capa 1 — Núcleo de la cebolla.
// Entidades puras + contratos (puertos) que las capas externas
// deben implementar. Aquí NO existe Vue, axios, Pinia ni router.
// ============================================================

export type PaymentMethod = 'cash' | 'wire_transfer' | 'card'

export type PayContext = 'MONTHLYFEE' | 'RENEWAL' | 'SINGLE_CLASS'

export type PaySubmitOutcome = 'success' | 'error'

export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'wire_transfer', 'card']

export const PAY_CONTEXTS: PayContext[] = ['MONTHLYFEE', 'RENEWAL', 'SINGLE_CLASS']

// ── Entidad pura ─────────────────────────────────────────────
export interface Payment {
  id: string
  member_id: string
  membership_id: string
  amount: number
  date_pay: string
  method_pay: PaymentMethod
  context: PayContext
  created_at: string
  updated_at: string
}

// ── DTO de entrada que la infraestructura debe enviar ────────
export interface RegisterPaymentPayload {
  member_id: string
  membership_id: string
  amount: number
  date_pay: string
  method_pay: PaymentMethod
  context: PayContext
}

// ── Estado del formulario (draft) ────────────────────────────
export interface PaymentDraft {
  amount: string
  datePay: string
  methodPat: PaymentMethod | ''
  context: PayContext | ''
}

export interface PaymentValidationErrors {
  amount?: string
  datePay?: string
  method?: string
  context?: string
  selection?: string
}

// Contexto de la operación: qué se paga y a nombre de quién.
export interface PaySelectionContext {
  member: { id: string; name: string } | null
  membership: { id: string; name: string } | null
}

// ── Membresía prescindible que el pago sostiene ──────────────
export interface PayMembership {
  id: string
  member_id: string
  plan_id: string
  date_start: string
  date_end: string
  status: string
  automatic_renewal: boolean
  created_at: string
  updated_at: string
}

// ── Miembro (detalle que el modal muestra en cascada) ───────
export interface PayMemberBrief {
  id: string
  name_full: string
  type_document: string
  number_document: string
  phone_number: string
}

// ── Plan de membresía (detalle que el modal muestra en cascada) ─
export interface PayPlanBrief {
  id: string
  name: string
  type: string
  duration_days: number | null
  price: number
  price_per_class: number
  classes_included: number
  is_active: boolean
}

// ── Puerto: contrato que las capas externas deben implementar ─
export interface PaymentRepository {
  register(payload: RegisterPaymentPayload): Promise<Payment>
  list(): Promise<Payment[]>
  listMembershipsByMember(memberId: string): Promise<PayMembership[]>
  findMemberById(id: string): Promise<PayMemberBrief>
  findMembershipById(id: string): Promise<PayMembership>
  findPlanById(id: string): Promise<PayPlanBrief>
}

// ─────────────────────────────────────────────────────────────
// Servicio de dominio: reglas puras de negocio, sin efectos.
// ─────────────────────────────────────────────────────────────
export class PaymentDomainService {
  static createDraft(): PaymentDraft {
    return {
      amount: '',
      datePay: this.today(),
      methodPat: '',
      context: '',
    }
  }

  static today(): string {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
  }

  static methodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      cash: 'Efectivo',
      wire_transfer: 'Transferencia',
      card: 'Tarjeta',
    }
    return labels[method]
  }

  static methodDescription(method: PaymentMethod): string {
    const descriptions: Record<PaymentMethod, string> = {
      cash: 'El pago se recibe en mano, sin intermediarios.',
      wire_transfer: 'Depósito o transferencia; la operación sirve de respaldo.',
      card: 'Cobro con POS o pasarela; la entidad avala el movimiento.',
    }
    return descriptions[method]
  }

  static contextLabel(context: PayContext): string {
    const labels: Record<PayContext, string> = {
      MONTHLYFEE: 'Cuota mensual',
      RENEWAL: 'Renovación',
      SINGLE_CLASS: 'Clase individual',
    }
    return labels[context]
  }

  static contextDescription(context: PayContext): string {
    const descriptions: Record<PayContext, string> = {
      MONTHLYFEE: 'Pago recurrente que sostiene la membresía mes a mes.',
      RENEWAL: 'Reactivación de una membresía que estaba por vencer o vencida.',
      SINGLE_CLASS: 'Pago por una sola clase, sin compromiso de permanencia.',
    }
    return descriptions[context]
  }

  static validate(draft: PaymentDraft): PaymentValidationErrors {
    const errors: PaymentValidationErrors = {}

    const amount = this.parseAmount(draft.amount)
    if (String(draft.amount).trim() === '' || amount === null) {
      errors.amount = 'Escribe el monto que se paga. Un número claro evita malentendidos.'
    } else if (amount <= 0) {
      errors.amount = 'El monto debe ser mayor a cero: esta membresía vale algo.'
    }

    if (draft.methodPat !== '' && !PAYMENT_METHODS.includes(draft.methodPat as PaymentMethod)) {
      errors.method = 'Elige cómo se hace el pago: en mano, con tarjeta o por transferencia.'
    }

    if (draft.context !== '' && !PAY_CONTEXTS.includes(draft.context as PayContext)) {
      errors.context = 'Elige el motivo del pago: cuota mensual, renovación o clase individual.'
    }

    if (!draft.datePay.trim()) {
      errors.datePay = 'Indica la fecha del pago para que el tiempo quede ordenado.'
    } else if (this.isFutureDate(draft.datePay)) {
      errors.datePay = 'La fecha no puede estar en el futuro. El pago se registra cuando se hace.'
    }

    return errors
  }

  static validateSelection(selection: PaySelectionContext): PaymentValidationErrors {
    const errors: PaymentValidationErrors = {}
    if (!selection.member) {
      errors.selection = 'Un pago necesita dueño: elige quién está pagando.'
    } else if (!selection.membership) {
      errors.selection = 'Todo pago responde a una membresía: elige el plan que lo sostiene.'
    }
    return errors
  }

  static hasErrors(errors: PaymentValidationErrors | null | undefined): boolean {
    return errors !== null && errors !== undefined && Object.keys(errors).length > 0
  }

  static toApiPayload(draft: PaymentDraft, selection: PaySelectionContext): RegisterPaymentPayload {
    return {
      member_id: selection.member?.id ?? '',
      membership_id: selection.membership?.id ?? '',
      amount: this.parseAmount(draft.amount) ?? 0,
      date_pay: draft.datePay,
      method_pay: draft.methodPat as PaymentMethod,
      context: draft.context as PayContext,
    }
  }

  static formatAmount(amount: number): string {
    return amount.toFixed(2)
  }

  static successMessage(): string {
    return 'Este pago ya tiene su registro. Quien lo hizo siente que el esfuerzo quedó en un lugar que lo sostiene.'
  }

  static errorMessage(): string {
    return 'Se presentó un error al registrar el pago. Respira: nada se perdió, lo que escribiste sigue aquí, y podemos intentarlo otra vez.'
  }

  private static parseAmount(value: string): number | null {
    const normalized = value.trim().replace(',', '.')
    if (!normalized) return null
    const amount = Number(normalized)
    return Number.isFinite(amount) ? amount : null
  }

  private static isFutureDate(date: string): boolean {
    const candidate = new Date(`${date}T00:00:00`)
    if (Number.isNaN(candidate.getTime())) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return candidate.getTime() > today.getTime()
  }
}