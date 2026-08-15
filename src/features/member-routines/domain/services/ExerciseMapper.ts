// ============================================================
// DOMAIN SERVICE - Exercise Mapper
// Traduce la respuesta cruda del endpoint /exercises al modelo de dominio
// ============================================================

import type {
  Exercise,
  ExerciseCatalogResult,
  ExerciseDifficulty,
  ExercisesMeta,
} from '../entities/Exercise.types'

const VALID_DIFFICULTIES: readonly ExerciseDifficulty[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
]

export class ExerciseMapper {
  /** Mapea un único registro `data[i]` de la respuesta a la entidad de dominio */
  static toDomain(raw: Record<string, unknown>): Exercise {
    return {
      id: String(raw.id ?? ''),
      name: String(raw.name ?? ''),
      muscleGroup: String(raw.muscle_group ?? ''),
      difficulty: this.normalizeDifficulty(raw.difficulty),
      videoUrl: String(raw.video_url ?? ''),
      equipmentId: String(raw.equipment_id ?? ''),
      status: String(raw.status ?? 'active'),
      createdAt: String(raw.created_at ?? new Date().toISOString()),
      updatedAt: String(raw.updated_at ?? new Date().toISOString()),
    }
  }

  /** Mapea la respuesta completa { data: [...], meta: {...} } */
  static toDomainList(payload: unknown): ExerciseCatalogResult {
    const isEnvelope = !!payload && !Array.isArray(payload) && typeof payload === 'object'
    const envelope = isEnvelope ? (payload as Record<string, unknown>) : null

    const rawList: Record<string, unknown>[] = Array.isArray(payload)
      ? (payload as Record<string, unknown>[])
      : Array.isArray(envelope?.data)
        ? (envelope!.data as Record<string, unknown>[])
        : []

    const rawMeta = (envelope?.meta as Record<string, unknown>) ?? {}

    const meta: ExercisesMeta = {
      total: Number(rawMeta.total ?? rawList.length),
      page: Number(rawMeta.page ?? 1),
      limit: Number(rawMeta.limit ?? rawList.length),
      totalPages: Number(rawMeta.totalPages ?? 1),
    }

    return {
      items: rawList.map((item) => this.toDomain(item)),
      meta,
    }
  }

  private static normalizeDifficulty(value: unknown): ExerciseDifficulty {
    const normalized = String(value ?? '').toUpperCase()
    return (VALID_DIFFICULTIES as string[]).includes(normalized)
      ? (normalized as ExerciseDifficulty)
      : 'BEGINNER'
  }
}
