import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { CatalogExercise } from '../../domain/entities/ExerciseAssignment.types'
import type { ExerciseCatalogRepository } from '../../domain/repositories/ExerciseCatalogRepository'
import { unwrapCollection } from '../../domain/services/CollectionUnwrap'

interface RawExercise {
  id?: string
  name?: string
  muscle_group?: string
  difficulty?: string
  equipment_id?: string
  video_url?: string
}

export class HttpExerciseCatalogRepository implements ExerciseCatalogRepository {
  async findAll(): Promise<CatalogExercise[]> {
    const response = await axiosInstance.get('/exercises', { params: { limit: 200 } })
    if (response.status !== 200) {
      throw new Error('No se pudo obtener la lista de ejercicios')
    }

    return unwrapCollection<RawExercise>(response.data).map((exercise) => ({
      id: String(exercise.id ?? ''),
      name: String(exercise.name ?? ''),
      muscle_group: String(exercise.muscle_group ?? ''),
      difficulty: String(exercise.difficulty ?? ''),
      equipment_id: exercise.equipment_id ? String(exercise.equipment_id) : undefined,
      video_url: exercise.video_url ? String(exercise.video_url) : undefined,
    }))
  }
}
