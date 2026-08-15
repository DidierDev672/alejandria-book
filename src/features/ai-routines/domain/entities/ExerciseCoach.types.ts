// ============================================================
// DOMAIN ENTITY - Exercise catalog for Coach AI
// Espejo del contrato GET /exercises: el modelo usa esta estructura
// como catálogo oficial al diseñar rutinas.
// ============================================================

export type ExerciseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string

/** Ítem alineado con data[] de GET /exercises */
export interface ExerciseCoachItem {
  id: string
  name: string
  muscle_group: string
  difficulty: ExerciseDifficulty
  video_url: string
  equipment_id: string
  created_at: string
  updated_at: string
}

export interface ExercisesCoachMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Respuesta paginada alineada con GET /exercises */
export interface ExercisesCoachCatalog {
  data: ExerciseCoachItem[]
  meta: ExercisesCoachMeta
}
