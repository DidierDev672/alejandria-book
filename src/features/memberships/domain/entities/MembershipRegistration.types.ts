export type MembershipRegistrationStatus = 'ACTIVA' | 'INACTIVA' | 'CANCELADA' | 'VENCIDA' | (string & {})

export interface MembershipRegistration {
  id: string
  member_id: string
  plan_id: string
  date_start: string
  date_end: string
  status: MembershipRegistrationStatus
  automatic_renewal: boolean
  created_at: string
  updated_at: string
}

export function isMembershipActive(status: MembershipRegistrationStatus): boolean {
  return status.toUpperCase() === 'ACTIVA'
}