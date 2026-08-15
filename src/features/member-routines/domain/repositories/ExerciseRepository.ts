// ============================================================
// DOMAIN REPOSITORY - Exercise Catalog Interface (Port)
// ============================================================

import type { Exercise, ExerciseCatalogResult } from '../entities/Exercise.types'

export interface ExerciseRepository {
  findAll(): Promise<ExerciseCatalogResult>
  findById(id: string): Promise<Exercise | null>
}
