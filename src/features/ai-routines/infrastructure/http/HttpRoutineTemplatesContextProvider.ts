// ============================================================
// INFRASTRUCTURE - HTTP Routine Templates Context Provider
// Consume GET /api/routines (referencia opcional del Coach AI).
// ============================================================

import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { RoutineTemplatesContextProvider } from '../../domain/repositories/RoutineTemplatesContextProvider'
import type { RoutineTemplateCoachItem } from '../../domain/entities/RoutineTemplateCoach.types'

interface RawRoutineTemplate {
  id?: string
  name?: string
  section?: string | number | null
  repetitions?: string | number | null
  time_minutes?: number | string
  time_label?: string
  notes?: string
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mapItem(raw: RawRoutineTemplate): RoutineTemplateCoachItem {
  const item: RoutineTemplateCoachItem = {
    name: String(raw.name ?? ''),
    section: raw.section ?? null,
    repetitions: raw.repetitions ?? null,
    time_minutes: toNumber(raw.time_minutes, 0),
    time_label: String(raw.time_label ?? ''),
    notes: String(raw.notes ?? ''),
  }
  if (raw.id != null && String(raw.id)) {
    item.id = String(raw.id)
  }
  return item
}

export class HttpRoutineTemplatesContextProvider implements RoutineTemplatesContextProvider {
  private readonly baseUrl = '/api/routines'

  async getRoutineTemplates(): Promise<RoutineTemplateCoachItem[]> {
    try {
      const { data } = await axiosInstance.get<
        RawRoutineTemplate[] | { data: RawRoutineTemplate[] }
      >(this.baseUrl)

      const list = Array.isArray(data) ? data : (data?.data ?? [])
      return list.map(mapItem).filter((r) => r.name.trim().length > 0)
    } catch (error) {
      console.warn(
        '[HttpRoutineTemplatesContextProvider] No se pudieron cargar plantillas /api/routines:',
        error,
      )
      return []
    }
  }
}
