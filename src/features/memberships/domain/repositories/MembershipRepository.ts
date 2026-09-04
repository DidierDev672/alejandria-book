import type { MembershipPlanPayload, MembershipRegisterPayload } from '../entities/Membership.types'

export interface MembershipRepository {
  create(payload: MembershipPlanPayload): Promise<void>
  list(): Promise<MembershipPlanPayload[]>
  register(payload: MembershipRegisterPayload): Promise<void>
}
