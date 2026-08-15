// ============================================================
// INFRASTRUCTURE - HTTP Gym Inventory Context Provider
// GET /equipment (active) → GET /exercises?equipment_id= (parallel)
// ============================================================

import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { GymInventoryContextProvider } from '../../domain/repositories/GymInventoryContextProvider'
import type {
  GymInventoryBlock,
  GymInventoryContextResult,
  GymInventoryExercise,
} from '../../domain/entities/GymInventoryContext.types'

interface RawEquipment {
  id?: string
  name?: string
  type?: string
  status?: string
  lastMaintenance?: string
  LastMaintenance?: string
  last_maintenance?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

interface RawExercise {
  id?: string
  equipment_id?: string
  name?: string
  muscle_group?: string
  difficulty?: string
  video_url?: string
  created_at?: string
  updated_at?: string
}

function unwrapList<T>(data: T[] | { data?: T[] } | null | undefined): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data
  return []
}

function mapExercise(raw: RawExercise): GymInventoryExercise {
  return {
    exercise_id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    muscle_group: String(raw.muscle_group ?? ''),
    difficulty: String(raw.difficulty ?? 'BEGINNER').toUpperCase(),
    video_url: String(raw.video_url ?? ''),
  }
}

export class HttpGymInventoryContextProvider implements GymInventoryContextProvider {
  async buildInventoryContext(): Promise<GymInventoryContextResult> {
    let allEquipment: RawEquipment[] = []

    try {
      const { data } = await axiosInstance.get<RawEquipment[] | { data: RawEquipment[] }>(
        '/equipment',
      )
      allEquipment = unwrapList(data)
    } catch (error) {
      console.warn('[HttpGymInventoryContextProvider] GET /equipment falló:', error)
      return {
        blocks: [],
        equipmentFetchFailed: true,
        emptyActiveEquipment: false,
      }
    }

    const activeEquipment = allEquipment.filter(
      (e) => String(e.status ?? '').toLowerCase() === 'active',
    )

    if (!activeEquipment.length) {
      return {
        blocks: [],
        equipmentFetchFailed: false,
        emptyActiveEquipment: true,
      }
    }

    const exerciseResults = await Promise.all(
      activeEquipment.map(async (equipment) => {
        const equipmentId = String(equipment.id ?? '')
        try {
          const { data } = await axiosInstance.get<
            RawExercise[] | { data: RawExercise[] }
          >('/exercises', {
            params: { equipment_id: equipmentId },
          })
          const exercises = unwrapList(data).map(mapExercise)
          return { equipment, exercises }
        } catch (error) {
          console.warn(
            `[HttpGymInventoryContextProvider] GET /exercises?equipment_id=${equipmentId} falló:`,
            error,
          )
          return { equipment, exercises: [] as GymInventoryExercise[] }
        }
      }),
    )

    const blocks: GymInventoryBlock[] = exerciseResults.map(({ equipment, exercises }) => ({
      equipment_id: String(equipment.id ?? ''),
      equipment_name: String(equipment.name ?? ''),
      equipment_type: String(equipment.type ?? ''),
      exercises,
    }))

    return {
      blocks,
      equipmentFetchFailed: false,
      emptyActiveEquipment: false,
    }
  }
}
