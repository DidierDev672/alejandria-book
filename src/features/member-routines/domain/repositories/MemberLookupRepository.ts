// ============================================================
// DOMAIN REPOSITORY - Member Lookup Interface (Port)
// ============================================================

import type { MemberSummary } from '../entities/MemberSummary.types'

export interface MemberLookupRepository {
  findById(id: string): Promise<MemberSummary | null>
}
