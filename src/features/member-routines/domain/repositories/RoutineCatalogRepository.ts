// ============================================================
// DOMAIN REPOSITORY - Routine Catalog Interface (Port)
// ============================================================

import type { RoutineOption } from '../entities/MemberRoutine.types'

export interface RoutineCatalogRepository {
  findAll(): Promise<RoutineOption[]>
}
