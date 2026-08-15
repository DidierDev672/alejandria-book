// ============================================================
// DOMAIN ENTITIES - Exercise Catalog Types
// ============================================================

export type ExerciseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  difficulty: ExerciseDifficulty
  videoUrl: string
  equipmentId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface ExercisesMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ExerciseCatalogResult {
  items: Exercise[]
  meta: ExercisesMeta
}

export interface DifficultyOption {
  value: ExerciseDifficulty
  label: string
  color: 'green' | 'amber' | 'red'
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 'BEGINNER', label: 'Principiante', color: 'green' },
  { value: 'INTERMEDIATE', label: 'Intermedio', color: 'amber' },
  { value: 'ADVANCED', label: 'Avanzado', color: 'red' },
]
