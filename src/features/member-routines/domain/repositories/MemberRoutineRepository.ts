// ============================================================
// DOMAIN REPOSITORY - Member Routine Repository Interface (Port)
// ============================================================

import type {
  MemberRoutine,
  CreateMemberRoutineDTO,
  UpdateMemberRoutineDTO,
} from '../entities/MemberRoutine.types'

export interface MemberRoutineRepository {
  findAll(): Promise<MemberRoutine[]>
  create(data: CreateMemberRoutineDTO): Promise<MemberRoutine>
  update(id: string, data: UpdateMemberRoutineDTO): Promise<MemberRoutine>
  delete(id: string): Promise<void>
}
