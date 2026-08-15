// ============================================================
// INFRASTRUCTURE - HTTP Exercise Repository (Adapter)
// ============================================================

import axios from 'axios'
import type { ExerciseRepository } from '../../domain/repositories/ExerciseRepository'
import type { Exercise, ExerciseCatalogResult } from '../../domain/entities/Exercise.types'
import { ExerciseMapper } from '../../domain/services/ExerciseMapper'

// Cliente propio, sin baseURL: el proxy de Vite enruta /exercises al backend
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

export class HttpExerciseRepository implements ExerciseRepository {
  private readonly baseUrl = '/exercises'

  async findAll(): Promise<ExerciseCatalogResult> {
    try {
      // limit alto: intenta traer el catálogo completo en una sola página
      const response = await httpClient.get(this.baseUrl, {
        params: { limit: 100 },
      })
      return ExerciseMapper.toDomainList(response.data)
    } catch (error) {
      console.error('[HttpExerciseRepository] Error fetching exercises:', error)
      throw new Error('Error al cargar el catálogo de ejercicios')
    }
  }

  async findById(id: string): Promise<Exercise | null> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/${id}`)
      const payload = response.data as Record<string, unknown>
      const raw =
        payload && !Array.isArray(payload) && 'data' in payload && payload.data
          ? (payload.data as Record<string, unknown>)
          : payload
      const exercise = ExerciseMapper.toDomain(raw)
      // Asegura el id aunque el endpoint no lo devuelva en el cuerpo
      return { ...exercise, id: exercise.id || id }
    } catch (error: any) {
      if (error.response?.status === 404) return null
      console.warn(`[HttpExerciseRepository] Error fetching exercise ${id}:`, error)
      return null
    }
  }
}
