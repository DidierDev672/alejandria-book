// ============================================================
// INFRASTRUCTURE - HTTP Exercises Context Provider (Adapter)
// Consume GET /exercises (paginado) para el contexto del Coach AI.
// ============================================================

import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { ExercisesContextProvider } from '../../domain/repositories/ExercisesContextProvider'
import type {
  ExerciseCoachItem,
  ExercisesCoachCatalog,
  ExercisesCoachMeta,
} from '../../domain/entities/ExerciseCoach.types'

interface RawExercise {
  id?: string
  name?: string
  muscle_group?: string
  difficulty?: string
  video_url?: string
  equipment_id?: string
  created_at?: string
  updated_at?: string
}

interface RawMeta {
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

interface RawExercisesResponse {
  data?: RawExercise[]
  meta?: RawMeta
}

const PAGE_LIMIT = 100

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mapItem(raw: RawExercise): ExerciseCoachItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    muscle_group: String(raw.muscle_group ?? ''),
    difficulty: String(raw.difficulty ?? 'BEGINNER').toUpperCase(),
    video_url: String(raw.video_url ?? ''),
    equipment_id: String(raw.equipment_id ?? ''),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  }
}

function mapMeta(raw: RawMeta | undefined, page: number, itemCount: number): ExercisesCoachMeta {
  return {
    total: toNumber(raw?.total, itemCount),
    page: toNumber(raw?.page, page),
    limit: toNumber(raw?.limit, PAGE_LIMIT),
    totalPages: Math.max(1, toNumber(raw?.totalPages, 1)),
  }
}

function emptyCatalog(): ExercisesCoachCatalog {
  return {
    data: [],
    meta: { total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 },
  }
}

export class HttpExercisesContextProvider implements ExercisesContextProvider {
  private readonly baseUrl = '/exercises'

  async getExercisesCatalog(): Promise<ExercisesCoachCatalog> {
    try {
      const allItems: ExerciseCoachItem[] = []
      let page = 1
      let totalPages = 1
      let lastMeta: ExercisesCoachMeta = {
        total: 0,
        page: 1,
        limit: PAGE_LIMIT,
        totalPages: 1,
      }

      do {
        const { data } = await axiosInstance.get<RawExercisesResponse | RawExercise[]>(
          this.baseUrl,
          { params: { page, limit: PAGE_LIMIT } },
        )

        const payload: RawExercisesResponse = Array.isArray(data)
          ? { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } }
          : (data ?? {})

        const pageItems = (payload.data ?? []).map(mapItem)
        allItems.push(...pageItems)
        lastMeta = mapMeta(payload.meta, page, allItems.length)
        totalPages = lastMeta.totalPages
        page += 1
      } while (page <= totalPages)

      return {
        data: allItems,
        meta: {
          ...lastMeta,
          total: lastMeta.total || allItems.length,
          page: 1,
          limit: PAGE_LIMIT,
          totalPages: 1,
        },
      }
    } catch (error) {
      console.warn('[HttpExercisesContextProvider] No se pudieron cargar ejercicios:', error)
      return emptyCatalog()
    }
  }
}
