// ============================================================
// INFRASTRUCTURE - HTTP Members Context Provider (Adapter)
// Consume GET /members y mapea al perfil completo del Coach AI.
// ============================================================

import axiosInstance from '@/infrastructure/http/axiosInstance'
import type { MembersContextProvider } from '../../domain/repositories/MembersContextProvider'
import type {
  MemberCoachProfile,
  MemberGoal,
  MemberHealthCondition,
  MemberMentalHealth,
} from '../../domain/entities/MemberCoachProfile.types'

interface RawGoal {
  goal_type?: string
  target_value?: string | number
  is_achieved?: boolean
}

interface RawHealthCondition {
  condition_name?: string
  severity?: string
  notes?: string
  is_active?: boolean
}

interface RawMentalHealth {
  stress_level?: number | string
  mood?: string
  sleep_hours?: number
  notes?: string
}

interface RawMember {
  id?: string
  name_full?: string
  type_document?: string
  number_document?: string
  date_of_birth?: string
  genre?: string
  gender?: string
  phone_number?: string
  address?: string
  weight_kg?: number
  height_cm?: number
  bmi?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
  arm_cm?: number
  leg_cm?: number
  health_conditions?: RawHealthCondition[]
  mental_health?: RawMentalHealth
  goals?: RawGoal[]
  created_at?: string
  updated_at?: string
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mapHealthConditions(raw: RawHealthCondition[] | undefined): MemberHealthCondition[] {
  return (raw ?? []).map((c) => ({
    condition_name: String(c.condition_name ?? ''),
    severity: String(c.severity ?? ''),
    notes: String(c.notes ?? ''),
    is_active: c.is_active !== false,
  }))
}

function mapMentalHealth(raw: RawMentalHealth | undefined): MemberMentalHealth {
  return {
    stress_level: toNumber(raw?.stress_level, 5),
    mood: String(raw?.mood ?? 'NEUTRO').toUpperCase(),
    sleep_hours: toNumber(raw?.sleep_hours, 0),
    notes: String(raw?.notes ?? ''),
  }
}

function mapGoals(raw: RawGoal[] | undefined): MemberGoal[] {
  return (raw ?? []).map((g) => ({
    goal_type: String(g.goal_type ?? ''),
    target_value: String(g.target_value ?? ''),
    is_achieved: Boolean(g.is_achieved),
  }))
}

function toCoachProfile(raw: RawMember): MemberCoachProfile {
  return {
    id: String(raw.id ?? ''),
    name_full: String(raw.name_full ?? ''),
    type_document: String(raw.type_document ?? ''),
    number_document: String(raw.number_document ?? ''),
    date_of_birth: String(raw.date_of_birth ?? ''),
    genre: String(raw.genre ?? raw.gender ?? '').toLowerCase(),
    phone_number: String(raw.phone_number ?? ''),
    address: String(raw.address ?? ''),
    weight_kg: toNumber(raw.weight_kg),
    height_cm: toNumber(raw.height_cm),
    bmi: toNumber(raw.bmi),
    body_fat_percentage: toNumber(raw.body_fat_percentage),
    muscle_mass_kg: toNumber(raw.muscle_mass_kg),
    chest_cm: toNumber(raw.chest_cm),
    waist_cm: toNumber(raw.waist_cm),
    hip_cm: toNumber(raw.hip_cm),
    arm_cm: toNumber(raw.arm_cm),
    leg_cm: toNumber(raw.leg_cm),
    health_conditions: mapHealthConditions(raw.health_conditions),
    mental_health: mapMentalHealth(raw.mental_health),
    goals: mapGoals(raw.goals),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  }
}

export class HttpMembersContextProvider implements MembersContextProvider {
  async getMembers(): Promise<MemberCoachProfile[]> {
    try {
      const { data } = await axiosInstance.get<RawMember[] | { data: RawMember[] }>('/members')
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      return list.map(toCoachProfile)
    } catch (error) {
      console.warn('[HttpMembersContextProvider] No se pudieron cargar miembros:', error)
      return []
    }
  }
}
