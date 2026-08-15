// ============================================================
// DOMAIN ENTITY - Base routine templates for Coach AI
// Espejo del contrato GET /api/routines (referencia OPCIONAL).
// ============================================================

/** Plantilla de rutina alineada con GET /api/routines */
export interface RoutineTemplateCoachItem {
  id?: string
  name: string
  section: string | number | null
  repetitions: string | number | null
  time_minutes: number
  time_label: string
  notes: string
}
