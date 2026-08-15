// ============================================================
// DOMAIN ENTITIES - Member Routine / Workout Types
// ============================================================

export const MEMBER_ROUTINE_STATUSES = ['active', 'completed', 'archived'] as const
export type MemberRoutineStatus = (typeof MEMBER_ROUTINE_STATUSES)[number]

export const DEFAULT_ASSIGNMENT_TYPE = 'manual'

export interface MemberRoutine {
  id: string
  member_id: string
  routine_id: string
  exercise_ids: string[]
  name: string
  description: string
  start_date: string
  end_date: string
  status: MemberRoutineStatus
  assignment_type: string
  created_at: string
  updated_at: string
}

/** Payload exacto de POST /colesio/workouts */
export interface CreateMemberRoutineDTO {
  member_id: string
  routine_id: string
  exercise_ids: string[]
  name: string
  description?: string
  start_date: string
  end_date: string
  status: MemberRoutineStatus
  assignment_type: string
}

/**
 * Payload exacto de PUT /colesio/workouts/{id}
 * Todos los campos se envían en el body (description siempre string).
 */
export interface UpdateMemberRoutineDTO {
  member_id: string
  routine_id: string
  exercise_ids: string[]
  name: string
  description: string
  start_date: string
  end_date: string
  status: MemberRoutineStatus
  assignment_type: string
}

// ============================================================
// Form State Types
// ============================================================

export interface MemberRoutineFormState {
  member_id: string
  routine_id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: MemberRoutineStatus
  assignment_type: string
}

// ============================================================
// Validation Types
// ============================================================

export interface MemberRoutineValidationErrors {
  member_id?: string
  routine_id?: string
  exercise_ids?: string
  name?: string
  description?: string
  start_date?: string
  end_date?: string
  status?: string
}

// ============================================================
// Routine Catalog (rutinas genéricas disponibles como base)
// ============================================================

export interface RoutineOption {
  id: string
  name: string
  section: string | null
  repetitions: string | null
}

// ============================================================
// UI Metadata (labels / colors per status)
// ============================================================

export interface StatusOption {
  value: MemberRoutineStatus
  label: string
  color: 'green' | 'blue' | 'gray'
}

export const STATUS_OPTIONS: StatusOption[] = [
  { value: 'active', label: 'Activa', color: 'green' },
  { value: 'completed', label: 'Completada', color: 'blue' },
  { value: 'archived', label: 'Archivada', color: 'gray' },
]
