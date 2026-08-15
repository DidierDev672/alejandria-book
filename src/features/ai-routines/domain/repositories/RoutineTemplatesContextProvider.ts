// ============================================================
// DOMAIN REPOSITORY - Routine Templates Context Provider (Port)
// Catálogo opcional GET /api/routines para el Coach AI.
// ============================================================

import type { RoutineTemplateCoachItem } from '../entities/RoutineTemplateCoach.types'

export interface RoutineTemplatesContextProvider {
  /** Devuelve plantillas de rutina registradas (uso opcional) */
  getRoutineTemplates(): Promise<RoutineTemplateCoachItem[]>
}
