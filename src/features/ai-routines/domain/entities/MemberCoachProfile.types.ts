// ============================================================
// DOMAIN ENTITY - Member profile for Coach AI
// Espejo del contrato GET /members: el modelo usa esta estructura
// como referencia al asignar rutinas a miembros/usuarios.
// ============================================================

export type MemberDocumentType = 'CC' | 'TI' | 'TARJETA_EXTRANJERO' | string
export type MemberGenre = 'masculino' | 'femenino' | 'otro' | string
export type HealthSeverity = 'LEVE' | 'MODERADO' | 'GRAVE' | string
export type MentalMood = 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | string
export type GoalType =
  | 'PERDIDA_PESO'
  | 'GANANCIA_MUSCULAR'
  | 'RESISTENCIA'
  | 'MANTENIMIENTO'
  | 'REHABILITACION'
  | string

export interface MemberHealthCondition {
  condition_name: string
  severity: HealthSeverity
  notes: string
  is_active: boolean
}

export interface MemberMentalHealth {
  stress_level: number
  mood: MentalMood
  sleep_hours: number
  notes: string
}

export interface MemberGoal {
  goal_type: GoalType
  target_value: string
  is_achieved: boolean
}

/** Perfil completo alineado con la respuesta de GET /members */
export interface MemberCoachProfile {
  id: string
  name_full: string
  type_document: MemberDocumentType
  number_document: string
  date_of_birth: string
  genre: MemberGenre
  phone_number: string
  address: string
  weight_kg: number
  height_cm: number
  bmi: number
  body_fat_percentage: number
  muscle_mass_kg: number
  chest_cm: number
  waist_cm: number
  hip_cm: number
  arm_cm: number
  leg_cm: number
  health_conditions: MemberHealthCondition[]
  mental_health: MemberMentalHealth
  goals: MemberGoal[]
  created_at: string
  updated_at: string
}
