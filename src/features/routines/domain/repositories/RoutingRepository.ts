// ============================================================
// DOMAIN REPOSITORY - Routine Repository Interface (Port)
// ============================================================

import type { Routine, CreateRoutineDTO, UpdateRoutineDTO } from '../entities/Routine.types'

export interface RoutineRepository {
  findAll(): Promise<Routine[]>
  findById(id: string): Promise<Routine | null>
  create(data: CreateRoutineDTO): Promise<Routine>
  update(id: string, data: UpdateRoutineDTO): Promise<Routine>
  delete(id: string): Promise<void>
  search(query: string): Promise<Routine[]>
}
