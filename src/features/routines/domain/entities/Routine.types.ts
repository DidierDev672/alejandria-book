// ============================================================
// DOMAIN ENTITIES - Routine Types
// ============================================================

export interface Routine {
  id: string
  name: string
  section: number | null
  repetitions: number | null
  time_minutes: number
  time_label: string
  notes: string
  created_at: string
  updated_at: string
}

export interface CreateRoutineDTO {
  name: string
  section?: number | null
  repetitions?: number | null
  time_minutes: number
  notes?: string
}

export interface UpdateRoutineDTO extends Partial<CreateRoutineDTO> {
  id: string
}

// ============================================================
// Form State Types
// ============================================================

export interface RoutineFormState {
  name: string
  section: number | ''
  repetitions: number | ''
  time_minutes: number | ''
  notes: string
}

// ============================================================
// Validation Types
// ============================================================

export interface RoutineValidationErrors {
  name?: string[]
  section?: string[]
  repetitions?: string[]
  time_minutes?: string[]
  notes?: string[]
}
