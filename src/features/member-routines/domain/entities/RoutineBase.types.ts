// ============================================================
// DOMAIN ENTITIES - Base routine summary (GET /api/routines/{id})
// ============================================================

export interface RoutineBaseSummary {
  id: string
  name: string
  section: string
  repetitions: string
  time_minutes: number
  time_label: string
  notes: string
}
