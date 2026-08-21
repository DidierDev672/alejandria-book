import axiosInstance from '@/infrastructure/http/axiosInstance'
import axios from 'axios'
import type {
  ExerciseAssignment,
  ExerciseAssignmentPayload,
} from '../../domain/entities/ExerciseAssignment.types'
import type { ExerciseAssignmentRepository } from '../../domain/repositories/ExerciseAssignmentRepository'
import { unwrapAssignmentCollection } from '../../domain/services/CollectionUnwrap'
import { ExerciseAssignmentDomainService } from '../../domain/services/ExerciseAssignmentDomainService'

interface RawAssignment {
  id?: string
  id_user?: string
  id_exercise?: unknown
  id_equipment?: unknown
  is_active?: boolean
}

export class HttpExerciseAssignmentRepository implements ExerciseAssignmentRepository {
  async create(payload: ExerciseAssignmentPayload): Promise<ExerciseAssignment> {
    try {
      const response = await axiosInstance.post('/assignment-exercise', payload)
      if (response.status !== 201) {
        throw new Error('No se pudo completar la asignación')
      }

      return this.mapItem(this.unwrapRecord(response.data), payload)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(this.messageFromAxios(error))
      }
      throw error instanceof Error ? error : new Error('No se pudo completar la asignación')
    }
  }

  async findAll(): Promise<ExerciseAssignment[]> {
    try {
      const response = await axiosInstance.get('/assignment-exercise')
      if (response.status !== 200) {
        throw new Error(ExerciseAssignmentDomainService.listErrorMessage(response.status))
      }

      return unwrapAssignmentCollection<RawAssignment>(response.data).map((item, index) =>
        this.mapItem(item, undefined, index),
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(ExerciseAssignmentDomainService.listErrorMessage(error.response?.status))
      }
      throw error instanceof Error
        ? error
        : new Error(ExerciseAssignmentDomainService.listErrorMessage())
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await axiosInstance.delete(`/assignment-exercise/${id}`)
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(ExerciseAssignmentDomainService.deleteErrorMessage(response.status))
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(ExerciseAssignmentDomainService.deleteErrorMessage(error.response?.status))
      }
      throw error instanceof Error
        ? error
        : new Error(ExerciseAssignmentDomainService.deleteErrorMessage())
    }
  }

  private mapItem(
    data: RawAssignment,
    fallback?: ExerciseAssignmentPayload,
    index = 0,
  ): ExerciseAssignment {
    const userId = String(data.id_user ?? fallback?.id_user ?? '')

    return {
      id: String(data.id ?? `${userId}-${index}`),
      id_user: userId,
      id_exercise: this.toIdList(data.id_exercise, fallback?.id_exercise ?? []),
      id_equipment: this.toIdList(data.id_equipment, fallback?.id_equipment ?? []),
      is_active: typeof data.is_active === 'boolean' ? data.is_active : (fallback?.is_active ?? true),
    }
  }

  private unwrapRecord(data: unknown): RawAssignment {
    if (!data || typeof data !== 'object') return {}
    const record = data as Record<string, unknown>
    if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
      return record.data as RawAssignment
    }
    return record as RawAssignment
  }

  private toIdList(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) return fallback
    return value.map(String)
  }

  private messageFromAxios(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return 'No se pudo completar la asignación'
    }

    const payload = error.response?.data
    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>
      if (typeof record.error === 'string' && record.error.trim()) return record.error
      if (typeof record.message === 'string' && record.message.trim()) return record.message
    }

    return 'No se pudo completar la asignación'
  }
}
