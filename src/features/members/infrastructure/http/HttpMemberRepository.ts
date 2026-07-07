// ============================================================
// INFRASTRUCTURE - HTTP Member Repository (Adapter)
// ============================================================

import axiosInstance from '@/infrastructure/http/axiosInstance'
import {
  getCachedMembers,
  upsertCachedMember,
  removeCachedMember,
  setMembersListFallback,
} from '../cache/memberLocalCache'
import type { 
  Member, 
  CreateMemberDTO, 
  UpdateMemberDTO 
} from '../../domain/entities/Member.types'
import type { 
  MemberRepository, 
  MemberFilters 
} from '../../domain/repositories/MemberRepository'

// ============================================================
// API Payload Mappers (formato exacto que espera el backend)
// ============================================================

/** 'MASCULINO' -> 'masculino' */
function toApiGenre(gender: string): string {
  return gender.toLowerCase()
}

/** Nivel numérico (1-10) -> etiqueta que espera la API */
function toApiStressLevel(level: number): string {
  if (level <= 3) return 'bajo'
  if (level <= 6) return 'moderado'
  return 'alto'
}

/** 'NEUTRO' -> 'neutro' */
function toApiMood(mood: string): string {
  return mood.toLowerCase()
}

/** 'PERDIDA_PESO' -> 'pérdida de peso' */
function toApiGoalType(goalType: string): string {
  const map: Record<string, string> = {
    PERDIDA_PESO: 'pérdida de peso',
    GANANCIA_MUSCULAR: 'ganancia muscular',
    RESISTENCIA: 'resistencia',
    MANTENIMIENTO: 'mantenimiento',
    REHABILITACION: 'rehabilitación'
  }
  return map[goalType] ?? goalType.toLowerCase()
}

/** '65kg' | '65' -> 65 (numérico si es posible, si no el string original) */
function toApiTargetValue(targetValue: string): number | string {
  const parsed = parseFloat(targetValue.replace(',', '.'))
  return Number.isNaN(parsed) ? targetValue : parsed
}

/** Normaliza respuesta del API al tipo Member del dominio */
function normalizeMember(raw: Record<string, unknown>): Member {
  const genreRaw = String(raw.genre ?? raw.gender ?? '').toUpperCase()
  const gender: Member['gender'] =
    genreRaw === 'MASCULINO' || genreRaw === 'FEMENINO' || genreRaw === 'OTRO'
      ? genreRaw
      : 'OTRO'

  const mentalRaw = raw.mental_health as Record<string, unknown> | undefined

  return {
    id: String(raw.id ?? ''),
    name_full: String(raw.name_full ?? ''),
    type_document: (raw.type_document as Member['type_document']) ?? 'CC',
    number_document: String(raw.number_document ?? ''),
    date_of_birth: String(raw.date_of_birth ?? ''),
    gender,
    phone_number: String(raw.phone_number ?? ''),
    address: String(raw.address ?? ''),
    weight_kg: Number(raw.weight_kg ?? 0),
    height_cm: Number(raw.height_cm ?? 0),
    bmi: raw.bmi != null ? Number(raw.bmi) : undefined,
    body_fat_percentage: raw.body_fat_percentage != null ? Number(raw.body_fat_percentage) : undefined,
    muscle_mass_kg: raw.muscle_mass_kg != null ? Number(raw.muscle_mass_kg) : undefined,
    chest_cm: raw.chest_cm != null ? Number(raw.chest_cm) : undefined,
    waist_cm: raw.waist_cm != null ? Number(raw.waist_cm) : undefined,
    hip_cm: raw.hip_cm != null ? Number(raw.hip_cm) : undefined,
    arm_cm: raw.arm_cm != null ? Number(raw.arm_cm) : undefined,
    leg_cm: raw.leg_cm != null ? Number(raw.leg_cm) : undefined,
    health_conditions: Array.isArray(raw.health_conditions) ? raw.health_conditions : [],
    mental_health: mentalRaw
      ? {
          stress_level: Number(mentalRaw.stress_level ?? 5),
          mood: (String(mentalRaw.mood ?? 'NEUTRO').toUpperCase() as Member['mental_health']['mood']),
          sleep_hours: Number(mentalRaw.sleep_hours ?? 0),
          notes: mentalRaw.notes ? String(mentalRaw.notes) : undefined
        }
      : { stress_level: 5, mood: 'NEUTRO', sleep_hours: 0 },
    goals: Array.isArray(raw.goals) ? raw.goals : [],
    created_at: String(raw.created_at ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? new Date().toISOString())
  }
}

function normalizeMemberList(data: unknown): Member[] {
  if (Array.isArray(data)) {
    return data.map(item => normalizeMember(item as Record<string, unknown>))
  }
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown[] }).data)) {
    return (data as { data: Record<string, unknown>[] }).data.map(normalizeMember)
  }
  if (data && typeof data === 'object') {
    return [normalizeMember(data as Record<string, unknown>)]
  }
  return []
}

function applyMemberFilters(members: Member[], filters?: MemberFilters): Member[] {
  if (!filters) return members

  let result = [...members]

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase()
    result = result.filter(member =>
      member.name_full.toLowerCase().includes(query) ||
      member.number_document.toLowerCase().includes(query)
    )
  }

  if (filters.gender) {
    result = result.filter(member => member.gender === filters.gender)
  }

  if (filters.hasActiveGoals) {
    result = result.filter(member =>
      (member.goals ?? []).some(goal => !goal.is_achieved)
    )
  }

  if (filters.hasHealthConditions) {
    result = result.filter(member => (member.health_conditions ?? []).length > 0)
  }

  return result
}

function syncMembersCache(members: Member[]): Member[] {
  members.forEach(upsertCachedMember)
  return members
}

export class HttpMemberRepository implements MemberRepository {
  private readonly baseUrl = '/members'
  
  async findAll(filters?: MemberFilters): Promise<Member[]> {
    try {
      const response = await axiosInstance.get(this.baseUrl, {
        params: filters
      })

      setMembersListFallback(false)
      const members = syncMembersCache(normalizeMemberList(response.data))
      return applyMemberFilters(members, filters)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(
          '[HttpMemberRepository] GET /members no disponible en el backend; usando caché local.'
        )
        setMembersListFallback(true)
        return applyMemberFilters(getCachedMembers(), filters)
      }

      console.error('[HttpMemberRepository] Error fetching members:', error)
      throw new Error('Error al cargar la lista de miembros')
    }
  }
  
  async findById(id: string): Promise<Member | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`)
      return normalizeMember(response.data as Record<string, unknown>)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      
      console.error('[HttpMemberRepository] Error fetching member by ID:', error)
      throw new Error(`Error al cargar el miembro ${id}`)
    }
  }
  
  /**
   * Crea el miembro en varios pasos, siguiendo el contrato del backend:
   *  1. POST /members                        -> datos básicos (devuelve id)
   *  2. POST /members/{id}/body-metrics      -> métricas corporales
   *  3. POST /members/{id}/health-conditions -> una por cada condición
   *  4. POST /members/{id}/mental-health     -> salud mental
   *  5. POST /members/{id}/goals             -> uno por cada objetivo
   */
  async create(memberData: CreateMemberDTO): Promise<Member> {
    // ── Paso 1: datos básicos ──
    let createdMember: Member
    try {
      const basicPayload = {
        name_full: memberData.name_full,
        type_document: memberData.type_document,
        number_document: memberData.number_document,
        date_of_birth: memberData.date_of_birth,
        genre: toApiGenre(memberData.gender),
        phone_number: memberData.phone_number,
        address: memberData.address
      }
      
      const response = await axiosInstance.post<Member>(this.baseUrl, basicPayload)
      createdMember = response.data
    } catch (error: any) {
      console.error('[HttpMemberRepository] Error creating member:', error)

      if (error.response?.status === 404) {
        console.warn(
          '[HttpMemberRepository] POST /members no disponible; guardando en caché local.'
        )

        const localMember: Member = {
          id: crypto.randomUUID(),
          name_full: memberData.name_full,
          type_document: memberData.type_document,
          number_document: memberData.number_document,
          date_of_birth: memberData.date_of_birth,
          gender: memberData.gender,
          phone_number: memberData.phone_number,
          address: memberData.address,
          weight_kg: memberData.weight_kg,
          height_cm: memberData.height_cm,
          bmi: this.calculateBMI(memberData.weight_kg, memberData.height_cm),
          body_fat_percentage: memberData.body_fat_percentage,
          muscle_mass_kg: memberData.muscle_mass_kg,
          chest_cm: memberData.chest_cm,
          waist_cm: memberData.waist_cm,
          hip_cm: memberData.hip_cm,
          arm_cm: memberData.arm_cm,
          leg_cm: memberData.leg_cm,
          health_conditions: (memberData.health_conditions ?? []).map(c => ({ ...c, is_active: c.is_active })),
          mental_health: { ...memberData.mental_health },
          goals: (memberData.goals ?? []).map(g => ({ ...g, is_achieved: false })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        upsertCachedMember(localMember)
        return localMember
      }

      if (error.response?.status === 409) {
        throw new Error('Ya existe un miembro registrado con este documento')
      }

      if (error.response?.status === 422) {
        throw new Error('Los datos básicos proporcionados no son válidos')
      }

      throw new Error('Error al crear el miembro')
    }
    
    const memberId = createdMember.id
    if (!memberId) {
      throw new Error('El servidor no devolvió el ID del miembro creado')
    }
    
    // ── Paso 2: métricas corporales ──
    try {
      const metricsPayload: Record<string, number> = {
        weight_kg: memberData.weight_kg,
        height_cm: memberData.height_cm
      }
      
      if (memberData.body_fat_percentage != null) metricsPayload.body_fat_percentage = memberData.body_fat_percentage
      if (memberData.muscle_mass_kg != null) metricsPayload.muscle_mass_kg = memberData.muscle_mass_kg
      if (memberData.chest_cm != null) metricsPayload.chest_cm = memberData.chest_cm
      if (memberData.waist_cm != null) metricsPayload.waist_cm = memberData.waist_cm
      if (memberData.hip_cm != null) metricsPayload.hip_cm = memberData.hip_cm
      if (memberData.arm_cm != null) metricsPayload.arm_cm = memberData.arm_cm
      if (memberData.leg_cm != null) metricsPayload.leg_cm = memberData.leg_cm
      
      await axiosInstance.post(`${this.baseUrl}/${memberId}/body-metrics`, metricsPayload)
    } catch (error) {
      console.error('[HttpMemberRepository] Error creating body metrics:', error)
      throw new Error(`El miembro fue creado (ID: ${memberId}), pero falló el registro de métricas corporales`)
    }
    
    // ── Paso 3: condiciones de salud física ──
    for (const condition of memberData.health_conditions ?? []) {
      try {
        await axiosInstance.post(`${this.baseUrl}/${memberId}/health-conditions`, {
          condition_name: condition.condition_name,
          severity: condition.severity,
          notes: condition.notes ?? '',
          is_active: condition.is_active
        })
      } catch (error) {
        console.error('[HttpMemberRepository] Error creating health condition:', error)
        throw new Error(`El miembro fue creado (ID: ${memberId}), pero falló el registro de la condición "${condition.condition_name}"`)
      }
    }
    
    // ── Paso 4: salud mental ──
    try {
      await axiosInstance.post(`${this.baseUrl}/${memberId}/mental-health`, {
        stress_level: toApiStressLevel(memberData.mental_health.stress_level),
        mood: toApiMood(memberData.mental_health.mood),
        sleep_hours: memberData.mental_health.sleep_hours,
        notes: memberData.mental_health.notes ?? ''
      })
    } catch (error) {
      console.error('[HttpMemberRepository] Error creating mental health:', error)
      throw new Error(`El miembro fue creado (ID: ${memberId}), pero falló el registro de salud mental`)
    }
    
    // ── Paso 5: objetivos (is_achieved no se envía; el backend usa false por defecto) ──
    for (const goal of memberData.goals ?? []) {
      try {
        await axiosInstance.post(`${this.baseUrl}/${memberId}/goals`, {
          goal_type: toApiGoalType(goal.goal_type),
          target_value: toApiTargetValue(goal.target_value)
        })
      } catch (error) {
        console.error('[HttpMemberRepository] Error creating goal:', error)
        throw new Error(`El miembro fue creado (ID: ${memberId}), pero falló el registro del objetivo "${goal.goal_type}"`)
      }
    }
    
    // Devolver el miembro completo con los datos locales como respaldo
    const fullMember: Member = {
      ...normalizeMember(createdMember as unknown as Record<string, unknown>),
      weight_kg: memberData.weight_kg,
      height_cm: memberData.height_cm,
      bmi: this.calculateBMI(memberData.weight_kg, memberData.height_cm),
      body_fat_percentage: memberData.body_fat_percentage,
      muscle_mass_kg: memberData.muscle_mass_kg,
      chest_cm: memberData.chest_cm,
      waist_cm: memberData.waist_cm,
      hip_cm: memberData.hip_cm,
      arm_cm: memberData.arm_cm,
      leg_cm: memberData.leg_cm,
      health_conditions: (memberData.health_conditions ?? []).map(c => ({ ...c })),
      mental_health: { ...memberData.mental_health },
      goals: (memberData.goals ?? []).map(g => ({ ...g }))
    }

    upsertCachedMember(fullMember)
    return fullMember
  }
  
  async update(id: string, memberData: UpdateMemberDTO): Promise<Member> {
    try {
      // Calculate BMI if weight or height changed
      let dataWithBMI = { ...memberData }
      if (memberData.weight_kg && memberData.height_cm) {
        dataWithBMI.bmi = this.calculateBMI(memberData.weight_kg, memberData.height_cm)
      }
      
      const response = await axiosInstance.put<Member>(`${this.baseUrl}/${id}`, dataWithBMI)
      return response.data
    } catch (error: any) {
      console.error('[HttpMemberRepository] Error updating member:', error)
      
      if (error.response?.status === 404) {
        throw new Error('El miembro no fue encontrado')
      }
      
      if (error.response?.status === 409) {
        throw new Error('Ya existe otro miembro con este documento')
      }
      
      throw new Error('Error al actualizar el miembro')
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${id}`)
      removeCachedMember(id)
    } catch (error: any) {
      console.error('[HttpMemberRepository] Error deleting member:', error)
      
      if (error.response?.status === 404) {
        throw new Error('El miembro no fue encontrado')
      }
      
      throw new Error('Error al eliminar el miembro')
    }
  }
  
  async existsByDocument(typeDocument: string, numberDocument: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get<{ exists: boolean }>(
        `${this.baseUrl}/check-document`,
        {
          params: {
            type_document: typeDocument,
            number_document: numberDocument
          }
        }
      )
      
      return response.data.exists
    } catch (error: any) {
      // 404 = el backend no implementa este endpoint; la unicidad
      // la valida el propio POST /members (responde 409 si está duplicado)
      if (error.response?.status !== 404) {
        console.error('[HttpMemberRepository] Error checking document:', error)
      }
      return false
    }
  }
  
  private calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    return Math.round(bmi * 10) / 10
  }
}