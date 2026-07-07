// ============================================================
// APPLICATION STORE - Member State Management (Pinia)
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MemberService } from '../services/MemberService'
import { HttpMemberRepository } from '../../infrastructure/http/HttpMemberRepository'
import type { 
  Member, 
  CreateMemberDTO, 
  UpdateMemberDTO,
  MemberFormState,
  DocumentType,
  Gender,
  GoalType,
  MoodType,
  HealthConditionSeverity
} from '../../domain/entities/Member.types'
import type { MemberFilters } from '../../domain/repositories/MemberRepository'
import { MemberDomainService } from '../../domain/services/MemberDomainService'
import { isMembersListFallbackActive } from '../../infrastructure/cache/memberLocalCache'

export const useMemberStore = defineStore('members', () => {
  // ============================================================
  // STATE
  // ============================================================
  
  const members = ref<Member[]>([])
  const selectedMember = ref<Member | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const listFallbackActive = ref(false)
  const loadingStates = ref<Record<string, boolean>>({})
  
  // Service instance (DI)
  const memberService = new MemberService(new HttpMemberRepository())
  
  // ============================================================
  // GETTERS
  // ============================================================
  
  const totalMembers = computed(() => members.value.length)
  const hasMembers = computed(() => members.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  
  const activeMembers = computed(() => 
    members.value.filter(member => 
      (member.goals ?? []).some(goal => !goal.is_achieved)
    )
  )
  
  const membersByGender = computed(() => {
    const distribution: Record<string, number> = {}
    members.value.forEach(member => {
      const gender = MemberDomainService.getGenderLabel(member.gender)
      distribution[gender] = (distribution[gender] || 0) + 1
    })
    return distribution
  })
  
  const averageBMI = computed(() => {
    const membersWithBMI = members.value.filter(member => member.bmi)
    if (membersWithBMI.length === 0) return 0
    
    const total = membersWithBMI.reduce((sum, member) => sum + member.bmi!, 0)
    return Math.round((total / membersWithBMI.length) * 10) / 10
  })
  
  // ============================================================
  // ACTIONS
  // ============================================================
  
  async function fetchMembers(filters?: MemberFilters): Promise<void> {
    setLoadingState('fetchMembers', true)
    loading.value = true
    error.value = null
    
    try {
      const fetchedMembers = await memberService.getMembers(filters)
      members.value = fetchedMembers
      listFallbackActive.value = isMembersListFallbackActive()
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los miembros'
      console.error('[MemberStore] fetchMembers error:', err)
    } finally {
      setLoadingState('fetchMembers', false)
      loading.value = false
    }
  }
  
  async function fetchMemberById(id: string): Promise<Member | null> {
    setLoadingState(`fetchMember-${id}`, true)
    error.value = null
    
    try {
      const member = await memberService.getMemberById(id)
      selectedMember.value = member
      
      // Update in list if exists
      const index = members.value.findIndex(m => m.id === id)
      if (index !== -1) {
        members.value[index] = member
      }
      
      return member
    } catch (err: any) {
      error.value = err.message || `Error al cargar el miembro ${id}`
      console.error('[MemberStore] fetchMemberById error:', err)
      return null
    } finally {
      setLoadingState(`fetchMember-${id}`, false)
    }
  }
  
  async function createMember(memberData: CreateMemberDTO): Promise<Member | null> {
    setLoadingState('createMember', true)
    loading.value = true
    error.value = null
    
    try {
      const newMember = await memberService.createMember(memberData)
      members.value.unshift(newMember)
      return newMember
    } catch (err: any) {
      error.value = err.message || 'Error al crear el miembro'
      console.error('[MemberStore] createMember error:', err)
      throw err
    } finally {
      setLoadingState('createMember', false)
      loading.value = false
    }
  }
  
  async function updateMember(id: string, memberData: UpdateMemberDTO): Promise<Member | null> {
    setLoadingState(`updateMember-${id}`, true)
    error.value = null
    
    try {
      const updatedMember = await memberService.updateMember(id, memberData)
      
      // Update in list
      const index = members.value.findIndex(m => m.id === id)
      if (index !== -1) {
        members.value[index] = updatedMember
      }
      
      // Update selected member if it's the same
      if (selectedMember.value?.id === id) {
        selectedMember.value = updatedMember
      }
      
      return updatedMember
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el miembro'
      console.error('[MemberStore] updateMember error:', err)
      throw err
    } finally {
      setLoadingState(`updateMember-${id}`, false)
    }
  }
  
  async function deleteMember(id: string): Promise<void> {
    setLoadingState(`deleteMember-${id}`, true)
    error.value = null
    
    try {
      await memberService.deleteMember(id)
      
      // Remove from list
      members.value = members.value.filter(m => m.id !== id)
      
      // Clear selected member if it's the same
      if (selectedMember.value?.id === id) {
        selectedMember.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar el miembro'
      console.error('[MemberStore] deleteMember error:', err)
      throw err
    } finally {
      setLoadingState(`deleteMember-${id}`, false)
    }
  }
  
  async function searchMembers(query: string): Promise<void> {
    setLoadingState('searchMembers', true)
    error.value = null
    
    try {
      const searchResults = await memberService.searchMembers(query)
      members.value = searchResults
      listFallbackActive.value = isMembersListFallbackActive()
    } catch (err: any) {
      error.value = err.message || 'Error en la búsqueda'
      console.error('[MemberStore] searchMembers error:', err)
    } finally {
      setLoadingState('searchMembers', false)
    }
  }
  
  function selectMember(member: Member | null): void {
    selectedMember.value = member
  }
  
  function clearError(): void {
    error.value = null
  }
  
  function resetStore(): void {
    members.value = []
    selectedMember.value = null
    loading.value = false
    error.value = null
    listFallbackActive.value = false
    loadingStates.value = {}
  }
  
  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  
  function setLoadingState(operation: string, isLoading: boolean): void {
    loadingStates.value[operation] = isLoading
  }
  
  function isOperationLoading(operation: string): boolean {
    return loadingStates.value[operation] || false
  }
  
  // ============================================================
  // FORM HELPERS
  // ============================================================
  
  function createEmptyFormState(): MemberFormState {
    return {
      basicInfo: {
        name_full: '',
        type_document: '',
        number_document: '',
        date_of_birth: '',
        gender: '',
        phone_number: '',
        address: ''
      },
      bodyMetrics: {
        weight_kg: '',
        height_cm: '',
        body_fat_percentage: '',
        muscle_mass_kg: '',
        chest_cm: '',
        waist_cm: '',
        hip_cm: '',
        arm_cm: '',
        leg_cm: ''
      },
      healthConditions: [],
      mentalHealth: {
        stress_level: 5,
        mood: '',
        sleep_hours: '',
        notes: ''
      },
      goals: []
    }
  }
  
  function memberToFormState(member: Member): MemberFormState {
    return {
      basicInfo: {
        name_full: member.name_full,
        type_document: member.type_document,
        number_document: member.number_document,
        date_of_birth: member.date_of_birth,
        gender: member.gender,
        phone_number: member.phone_number,
        address: member.address
      },
      bodyMetrics: {
        weight_kg: member.weight_kg,
        height_cm: member.height_cm,
        body_fat_percentage: member.body_fat_percentage || '',
        muscle_mass_kg: member.muscle_mass_kg || '',
        chest_cm: member.chest_cm || '',
        waist_cm: member.waist_cm || '',
        hip_cm: member.hip_cm || '',
        arm_cm: member.arm_cm || '',
        leg_cm: member.leg_cm || ''
      },
      healthConditions: (member.health_conditions ?? []).map(condition => ({
        condition_name: condition.condition_name,
        severity: condition.severity,
        notes: condition.notes || '',
        is_active: condition.is_active
      })),
      mentalHealth: {
        stress_level: member.mental_health?.stress_level ?? 5,
        mood: member.mental_health?.mood ?? '',
        sleep_hours: member.mental_health?.sleep_hours ?? '',
        notes: member.mental_health?.notes || ''
      },
      goals: (member.goals ?? []).map(goal => ({
        goal_type: goal.goal_type,
        target_value: goal.target_value,
        is_achieved: goal.is_achieved
      }))
    }
  }
  
  // ============================================================
  // EXPOSED API
  // ============================================================
  
  return {
    // State
    members: members,
    selectedMember,
    loading,
    error,
    listFallbackActive,
    loadingStates,
    
    // Getters
    totalMembers,
    hasMembers,
    isLoading,
    hasError,
    activeMembers,
    membersByGender,
    averageBMI,
    
    // Actions
    fetchMembers,
    fetchMemberById,
    createMember,
    updateMember,
    deleteMember,
    searchMembers,
    selectMember,
    clearError,
    resetStore,
    
    // Helpers
    isOperationLoading,
    createEmptyFormState,
    memberToFormState
  }
})

// ============================================================
// OPTION CONSTANTS
// ============================================================

export const DOCUMENT_TYPE_OPTIONS: Array<{value: DocumentType, label: string}> = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'TARJETA_EXTRANJERO', label: 'Tarjeta de Extranjero' }
]

export const GENDER_OPTIONS: Array<{value: Gender, label: string}> = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' }
]

export const GOAL_TYPE_OPTIONS: Array<{value: GoalType, label: string}> = [
  { value: 'PERDIDA_PESO', label: 'Pérdida de peso' },
  { value: 'GANANCIA_MUSCULAR', label: 'Ganancia muscular' },
  { value: 'RESISTENCIA', label: 'Resistencia' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'REHABILITACION', label: 'Rehabilitación' }
]

export const MOOD_OPTIONS: Array<{value: MoodType, label: string}> = [
  { value: 'POSITIVO', label: 'Positivo' },
  { value: 'NEUTRO', label: 'Neutro' },
  { value: 'NEGATIVO', label: 'Negativo' }
]

export const SEVERITY_OPTIONS: Array<{value: HealthConditionSeverity, label: string}> = [
  { value: 'LEVE', label: 'Leve' },
  { value: 'MODERADO', label: 'Moderado' },
  { value: 'GRAVE', label: 'Grave' }
]