import type {
  MemberUserAssignment,
  MemberUserAssignmentPayload,
} from '../entities/MemberUserAssignment.types'

export interface MemberUserAssignmentRepository {
  create(payload: MemberUserAssignmentPayload): Promise<void>
  findAll(): Promise<MemberUserAssignment[]>
  delete(id: string): Promise<void>
}
