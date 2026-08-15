// ============================================================
// INFRASTRUCTURE - HTTP Workout Repository (Adapter)
// GET/POST /colesio/workouts · PUT/DELETE /colesio/workouts/{id}
// ============================================================

import axios, { type AxiosError } from 'axios'
import type { MemberRoutineRepository } from '../../domain/repositories/MemberRoutineRepository'
import type {
  MemberRoutine,
  CreateMemberRoutineDTO,
  UpdateMemberRoutineDTO,
} from '../../domain/entities/MemberRoutine.types'
import { MemberRoutineDomainService } from '../../domain/services/MemberRoutineDomainService'

// Cliente axios propio (sin baseURL): Vite proxy enruta /colesio/* al backend
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

export class HttpMemberRoutineRepository implements MemberRoutineRepository {
  private readonly baseUrl = '/colesio/workouts'

  async findAll(): Promise<MemberRoutine[]> {
    try {
      const response = await httpClient.get(this.baseUrl)
      return MemberRoutineDomainService.normalizeList(response.data)
    } catch (error) {
      console.error('[HttpMemberRoutineRepository] Error fetching workouts:', error)
      throw new Error('Error al cargar las rutinas asignadas')
    }
  }

  async create(data: CreateMemberRoutineDTO): Promise<MemberRoutine> {
    try {
      const response = await httpClient.post<
        Record<string, unknown> | ApiResponse<Record<string, unknown>>
      >(this.baseUrl, data)

      return this.normalizeResponse(response.data)
    } catch (error) {
      throw this.mapWriteError(error, 'create')
    }
  }

  /**
   * PUT /colesio/workouts/{id}
   * Body: UpdateMemberRoutineDTO (contrato del backend)
   */
  async update(id: string, data: UpdateMemberRoutineDTO): Promise<MemberRoutine> {
    try {
      const response = await httpClient.put<
        Record<string, unknown> | ApiResponse<Record<string, unknown>>
      >(`${this.baseUrl}/${id}`, data)

      return this.normalizeResponse(response.data)
    } catch (error) {
      throw this.mapWriteError(error, 'update')
    }
  }

  /**
   * DELETE /colesio/workouts/{id}
   */
  async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      throw this.mapWriteError(error, 'delete')
    }
  }

  // --- helpers privados (SRP dentro del adaptador) ---

  private normalizeResponse(
    payload: Record<string, unknown> | ApiResponse<Record<string, unknown>>,
  ): MemberRoutine {
    const raw =
      payload && !Array.isArray(payload) && 'data' in payload
        ? payload.data
        : payload

    return MemberRoutineDomainService.normalize(raw as Record<string, unknown>)
  }

  private mapWriteError(
    error: unknown,
    operation: 'create' | 'update' | 'delete',
  ): Error {
    const axiosError = error as AxiosError<Record<string, unknown>>
    const status = axiosError.response?.status
    const body = axiosError.response?.data
    const apiMessage = body?.message || body?.error || body?.errors

    if (status === 404) {
      if (operation === 'create') {
        return new Error(
          'El miembro, la rutina o algún ejercicio no fueron encontrados',
        )
      }
      return new Error('El entrenamiento no fue encontrado')
    }
    if (status === 409) {
      return new Error(
        operation === 'delete'
          ? 'No se puede eliminar este entrenamiento en su estado actual'
          : 'Ya existe un entrenamiento con esos datos',
      )
    }
    if (status === 422 || status === 400) {
      const detail =
        typeof apiMessage === 'string'
          ? apiMessage
          : 'Los datos proporcionados no son válidos'
      return new Error(detail)
    }

    console.error(`[HttpMemberRoutineRepository] Error on ${operation}:`, error)

    if (operation === 'create') {
      return new Error('Error al registrar el entrenamiento del miembro')
    }
    if (operation === 'delete') {
      return new Error('Error al eliminar el entrenamiento del miembro')
    }
    return new Error('Error al actualizar el entrenamiento del miembro')
  }
}
