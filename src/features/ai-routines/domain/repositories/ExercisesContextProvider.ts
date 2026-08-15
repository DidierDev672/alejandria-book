// ============================================================
// DOMAIN REPOSITORY - Exercises Context Provider (Port)
// Proporciona el catálogo GET /exercises para el Coach AI.
// DIP: la aplicación depende de esta abstracción, no del HTTP.
// ============================================================

import type { ExercisesCoachCatalog } from '../entities/ExerciseCoach.types'

export interface ExercisesContextProvider {
  /** Devuelve el catálogo de ejercicios (todas las páginas disponibles) */
  getExercisesCatalog(): Promise<ExercisesCoachCatalog>
}
