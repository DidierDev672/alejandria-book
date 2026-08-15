// ============================================================
// DOMAIN REPOSITORY - Routine Base Lookup Interface (Port)
// ============================================================

import type { RoutineBaseSummary } from '../entities/RoutineBase.types'

export interface RoutineBaseLookupRepository {
  findById(id: string): Promise<RoutineBaseSummary | null>
}
