// ============================================================
// INFRASTRUCTURE - HTTP Routine Base Lookup
// GET /api/routines/{id}
// ============================================================

import axios from 'axios'
import type { RoutineBaseLookupRepository } from '../../domain/repositories/RoutineBaseLookupRepository'
import type { RoutineBaseSummary } from '../../domain/entities/RoutineBase.types'
import { RoutineBaseMapper } from '../../domain/services/RoutineBaseMapper'

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

export class HttpRoutineBaseLookupRepository implements RoutineBaseLookupRepository {
  private readonly baseUrl = '/api/routines'

  async findById(id: string): Promise<RoutineBaseSummary | null> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/${id}`)
      return RoutineBaseMapper.toDomain(id, response.data as Record<string, unknown>)
    } catch (error: any) {
      if (error.response?.status === 404) return null
      console.warn(`[HttpRoutineBaseLookupRepository] Error fetching routine ${id}:`, error)
      return null
    }
  }
}
