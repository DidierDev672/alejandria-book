// ============================================================
// INFRASTRUCTURE - HTTP Routine Catalog Repository (Adapter)
// ============================================================

import axios from 'axios'
import type { RoutineCatalogRepository } from '../../domain/repositories/RoutineCatalogRepository'
import type { RoutineOption } from '../../domain/entities/MemberRoutine.types'

// Cliente propio, sin baseURL: el proxy de Vite enruta /api/* al backend
const httpClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface ApiResponse<T> {
  data: T
  message?: string
}

export class HttpRoutineCatalogRepository implements RoutineCatalogRepository {
  private readonly baseUrl = '/api/routines'

  async findAll(): Promise<RoutineOption[]> {
    try {
      const response = await httpClient.get<
        Record<string, unknown>[] | ApiResponse<Record<string, unknown>[]>
      >(this.baseUrl)

      const payload = response.data
      // Soporta array directo [...] o envuelto { data: [...] }
      const raw = Array.isArray(payload) ? payload : (payload.data ?? [])

      return raw.map(
        (routine): RoutineOption => ({
          id: String(routine.id ?? ''),
          name: String(routine.name ?? ''),
          section: routine.section != null ? String(routine.section) : null,
          repetitions:
            routine.repetitions != null ? String(routine.repetitions) : null,
        }),
      )
    } catch (error) {
      console.error('[HttpRoutineCatalogRepository] Error fetching routines:', error)
      throw new Error('Error al cargar las rutinas disponibles')
    }
  }
}
