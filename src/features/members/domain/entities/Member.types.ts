// ============================================================
// DOMAIN ENTITIES - Member Types
// ============================================================

export type DocumentType = 'CC' | 'TI' | 'TARJETA_EXTRANJERO'
export type Gender = 'MASCULINO' | 'FEMENINO' | 'OTRO'
export type HealthConditionSeverity = 'LEVE' | 'MODERADO' | 'GRAVE'
export type GoalType = 'PERDIDA_PESO' | 'GANANCIA_MUSCULAR' | 'RESISTENCIA' | 'MANTENIMIENTO' | 'REHABILITACION'
export type MoodType = 'POSITIVO' | 'NEUTRO' | 'NEGATIVO'

// ============================================================
// Core Member Entity
// ============================================================

export interface Member {
  id: string
  
  // Datos básicos
  name_full: string
  type_document: DocumentType
  number_document: string
  date_of_birth: string
  gender: Gender
  phone_number: string
  address: string
  
  // Métricas corporales
  weight_kg: number
  height_cm: number
  bmi?: number // Calculado automáticamente
  body_fat_percentage?: number
  muscle_mass_kg?: number
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
  arm_cm?: number
  leg_cm?: number
  
  // Condiciones de salud física
  health_conditions: HealthCondition[]
  
  // Salud mental
  mental_health: MentalHealth
  
  // Objetivos
  goals: MemberGoal[]
  
  created_at: string
  updated_at: string
}

// ============================================================
// Related Entities
// ============================================================

export interface HealthCondition {
  id?: string
  condition_name: string
  severity: HealthConditionSeverity
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface MentalHealth {
  id?: string
  stress_level: number // 1-10 scale
  mood: MoodType
  sleep_hours: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface MemberGoal {
  id?: string
  goal_type: GoalType
  target_value: string
  is_achieved: boolean
  created_at?: string
  updated_at?: string
}

// ============================================================
// DTOs for API Communication
// ============================================================

export interface CreateMemberDTO {
  // Datos básicos (requeridos)
  name_full: string
  type_document: DocumentType
  number_document: string
  date_of_birth: string
  gender: Gender
  phone_number: string
  address: string
  
  // Métricas corporales (requeridas básicas)
  weight_kg: number
  height_cm: number
  
  // Métricas corporales (opcionales)
  body_fat_percentage?: number
  muscle_mass_kg?: number
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
  arm_cm?: number
  leg_cm?: number
  
  // Condiciones de salud física
  health_conditions?: Omit<HealthCondition, 'id' | 'created_at' | 'updated_at'>[]
  
  // Salud mental
  mental_health: Omit<MentalHealth, 'id' | 'created_at' | 'updated_at'>
  
  // Objetivos
  goals?: Omit<MemberGoal, 'id' | 'created_at' | 'updated_at'>[]
}

export interface UpdateMemberDTO extends Partial<CreateMemberDTO> {
  id: string
}

// ============================================================
// Form State Types
// ============================================================

export interface MemberFormState {
  basicInfo: {
    name_full: string
    type_document: DocumentType | ''
    number_document: string
    date_of_birth: string
    gender: Gender | ''
    phone_number: string
    address: string
  }
  
  bodyMetrics: {
    weight_kg: number | ''
    height_cm: number | ''
    body_fat_percentage: number | ''
    muscle_mass_kg: number | ''
    chest_cm: number | ''
    waist_cm: number | ''
    hip_cm: number | ''
    arm_cm: number | ''
    leg_cm: number | ''
  }
  
  healthConditions: Omit<HealthCondition, 'id' | 'created_at' | 'updated_at'>[]
  
  mentalHealth: {
    stress_level: number
    mood: MoodType | ''
    sleep_hours: number | ''
    notes: string
  }
  
  goals: Omit<MemberGoal, 'id' | 'created_at' | 'updated_at'>[]
}

// ============================================================
// Validation Types
// ============================================================

export interface MemberValidationErrors {
  basicInfo?: Record<string, string[]>
  bodyMetrics?: Record<string, string[]>
  healthConditions?: Record<number, Record<string, string[]>>
  mentalHealth?: Record<string, string[]>
  goals?: Record<number, Record<string, string[]>>
}