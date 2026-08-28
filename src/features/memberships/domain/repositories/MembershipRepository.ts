import type { MembershipPlanPayload } from '../entities/Membership.types'

export interface MembershipRepository {
  create(payload: MembershipPlanPayload): Promise<void>
  list(): Promise<MembershipPlanPayload[]>
}
