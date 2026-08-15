// ============================================================
// INFRASTRUCTURE - HTTP Routine Repository (Adapter)
// ============================================================

import axios from 'axios'
import type { Routine, CreateRoutineDTO, UpdateRoutineDTO } from '../../domain/entities/Routine.types'
import type { RoutineRepository } from '../../domain/repositories/RoutingRepository'
import { RoutineDomainService } from '../../domain/services/RoutingDomainService'
import {
  getCachedRoutines,
  upsertCachedRoutine,
  removeCachedRoutine
} from '../cache/routineLocalCache'

// Axios instance dedicado para rutinas: sin baseURL para que Vite proxy enrute a :8081
const routineHttpClient = axios.create({
  headers: { 'Content-Type': 'application/json' }
})

interface ApiResponse<T> {
  data: T
  message?: string
}

// Normaliza texto para búsquedas: minúsculas y sin tildes/diacríticos
function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export class HttpRoutineRepository implements RoutineRepository {
  private readonly baseUrl = '/api/routines'

  async findAll(): Promise<Routine[]> {
    try {
      const response = await routineHttpClient.get<Record<string, unknown>[] | ApiResponse<Record<string, unknown>[]>>(this.baseUrl)
      const payload = response.data
      // Soporta array directo [...] o envuelto { data: [...] }
      const raw = Array.isArray(payload) ? payload : (payload.data ?? [])
      const routines = raw.map(RoutineDomainService.normalizeRoutine)

      routines.forEach(upsertCachedRoutine)
      return routines
    } catch (error: any) {
      console.warn('[HttpRoutineRepository] API not available, using cache')
      return getCachedRoutines()
    }
  }

  async findById(id: string): Promise<Routine | null> {
    try {
      const response = await routineHttpClient.get<Record<string, unknown> | ApiResponse<Record<string, unknown>>>(`${this.baseUrl}/${id}`)
      const payload = response.data
      const raw = (payload && !Array.isArray(payload) && 'data' in payload) ? payload.data : payload
      return RoutineDomainService.normalizeRoutine(raw as Record<string, unknown>)
    } catch (error: any) {
      if (error.response?.status === 404) return null
      console.error('[HttpRoutineRepository] Error fetching routine:', error)
      throw new Error('Error al cargar la rutina')
    }
  }

  async create(data: CreateRoutineDTO): Promise<Routine> {
    try {
      const response = await routineHttpClient.post<Record<string, unknown> | ApiResponse<Record<string, unknown>>>(this.baseUrl, data)
      const payload = response.data
      const raw = (payload && !Array.isArray(payload) && 'data' in payload) ? payload.data : payload
      const routine = RoutineDomainService.normalizeRoutine(raw as Record<string, unknown>)
      upsertCachedRoutine(routine)
      return routine
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('Ya existe una rutina con ese nombre')
      }
      if (error.response?.status === 422) {
        throw new Error('Los datos proporcionados no son válidos')
      }
      console.error('[HttpRoutineRepository] Error creating routine:', error)
      throw new Error('Error al crear la rutina')
    }
  }

  async update(id: string, data: UpdateRoutineDTO): Promise<Routine> {
    try {
      const response = await routineHttpClient.put<Record<string, unknown> | ApiResponse<Record<string, unknown>>>(`${this.baseUrl}/${id}`, data)
      const payload = response.data
      const raw = (payload && !Array.isArray(payload) && 'data' in payload) ? payload.data : payload
      const routine = RoutineDomainService.normalizeRoutine(raw as Record<string, unknown>)
      upsertCachedRoutine(routine)
      return routine
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('La rutina no fue encontrada')
      }
      console.error('[HttpRoutineRepository] Error updating routine:', error)
      throw new Error('Error al actualizar la rutina')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await routineHttpClient.delete(`${this.baseUrl}/${id}`)
      removeCachedRoutine(id)
    } catch (error: any) {
      console.error('[HttpRoutineRepository] Error deleting routine:', error)
      throw new Error('Error al eliminar la rutina')
    }
  }

  async search(query: string): Promise<Routine[]> {
    try {
      const response = await routineHttpClient.get<Record<string, unknown>[] | ApiResponse<Record<string, unknown>[]>>(`${this.baseUrl}/search`, {
        params: { q: query }
      })
      const payload = response.data
      const raw = Array.isArray(payload) ? payload : (payload.data ?? [])
      return raw.map(RoutineDomainService.normalizeRoutine)
    } catch (error: any) {
      // Si el backend no expone /search (404), filtrar localmente sobre el listado completo
      if (error.response?.status === 404) {
        console.warn('[HttpRoutineRepository] /search no disponible, filtrando localmente')
        const all = await this.findAll()
        const normalizedQuery = normalizeSearchText(query)
        return all.filter(routine =>
          normalizeSearchText(routine.name).includes(normalizedQuery) ||
          normalizeSearchText(routine.notes ?? '').includes(normalizedQuery)
        )
      }
      console.error('[HttpRoutineRepository] Error searching routines:', error)
      throw new Error('Error al buscar rutinas')
    }
  }
}
