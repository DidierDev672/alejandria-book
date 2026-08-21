export interface ExerciseAssignment {
  id: string
  id_user: string
  id_exercise: string[]
  id_equipment: string[]
  is_active: boolean
}

export interface ExerciseAssignmentDraft {
  id: string
  id_user: string
  id_exercise: string[]
  id_equipment: string[]
  is_active: boolean
}

export interface ExerciseAssignmentPayload {
  id_user: string
  id_exercise: string[]
  id_equipment: string[]
  is_active: boolean
}

export interface ExerciseAssignmentListItem {
  key: string
  id: string
  userName: string
  userId: string
  exerciseIds: string[]
  exerciseNames: string[]
  equipmentNames: string[]
  isActive: boolean
}

export type ExerciseAssignmentSubmitOutcome = 'success' | 'error'

export interface ExerciseAssignmentValidationErrors {
  id_user?: string
}

export interface CatalogUser {
  id: string
  name_full: string
  phone: string
  id_number: string
  email?: string
  roles?: string[]
}

export interface CatalogExercise {
  id: string
  name: string
  muscle_group: string
  difficulty: string
  equipment_id?: string
  video_url?: string
}

export interface CatalogEquipment {
  id: string
  name: string
  type: string
  status?: string
}
