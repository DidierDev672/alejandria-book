export type MembershipType = 'BY_CLASS' | 'BY_PERIOD'

export type MembershipDurationDays = 30 | 90 | 180 | 365

export interface MembershipPlanPayload {
  id?: string
  name: string
  type: MembershipType
  duration_days: MembershipDurationDays | null
  price: number
  price_per_class: number
  classes_included: number
  is_active: boolean
}

export type MembershipSubmitOutcome = 'success' | 'error'

export interface MembershipRegisterPayload {
  member_id: string
  plan_id: string
  date_start: string
  date_end: string
  automatic_renewal: boolean
}

export interface MembershipDraft {
  name: string
  type: MembershipType | ''
  durationDays: MembershipDurationDays | null
  price: string
  priceClass: string
  classesIncluded: string
  isActivo: boolean
}

export interface MembershipValidationErrors {
  name?: string
  type?: string
  durationDays?: string
  price?: string
  priceClass?: string
  classesIncluded?: string
}
