import type { MemberProgress, CreateMemberProgressDTO, UpdateMemberProgressDTO } from '../entities/MemberProgress.types'

export interface MemberProgressRepository {
  findAll(filters?: MemberProgressFilters): Promise<MemberProgress[]>
  findById(id: string): Promise<MemberProgress | null>
  findByUserId(userId: string): Promise<MemberProgress[]>
  create(data: CreateMemberProgressDTO): Promise<MemberProgress>
  update(id: string, data: UpdateMemberProgressDTO): Promise<MemberProgress>
  delete(id: string): Promise<void>
}

export interface MemberProgressFilters {
  userId?: string
  monthYear?: string
  search?: string
}