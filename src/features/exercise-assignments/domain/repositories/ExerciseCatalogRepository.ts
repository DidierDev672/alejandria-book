import type { CatalogExercise } from '../entities/ExerciseAssignment.types'

export interface ExerciseCatalogRepository {
  findAll(): Promise<CatalogExercise[]>
}
