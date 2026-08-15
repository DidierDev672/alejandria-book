// ============================================================
// DOMAIN SERVICE - Routine Base Mapper
// ============================================================

import type { RoutineBaseSummary } from '../entities/RoutineBase.types'

export class RoutineBaseMapper {
  static toDomain(id: string, raw: Record<string, unknown>): RoutineBaseSummary {
    const payload =
      raw && !Array.isArray(raw) && 'data' in raw && raw.data && typeof raw.data === 'object'
        ? (raw.data as Record<string, unknown>)
        : raw

    return {
      id,
      name: String(payload.name ?? ''),
      section: String(payload.section ?? ''),
      repetitions: String(payload.repetitions ?? ''),
      time_minutes: Number(payload.time_minutes ?? 0),
      time_label: String(payload.time_label ?? ''),
      notes: String(payload.notes ?? ''),
    }
  }
}
