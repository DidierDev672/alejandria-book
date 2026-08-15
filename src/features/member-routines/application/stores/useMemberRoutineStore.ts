// ============================================================
// APPLICATION STORE - Member Routine Pinia Store
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MemberRoutineService } from '../services/MemberRoutineService'
import { HttpMemberRoutineRepository } from '../../infrastructure/http/HttpMemberRoutineRepository'
import { HttpMemberLookupRepository } from '../../infrastructure/http/HttpMemberLookupRepository'
import { MemberRoutineDomainService } from '../../domain/services/MemberRoutineDomainService'
import type {
  MemberRoutine,
  CreateMemberRoutineDTO,
  UpdateMemberRoutineDTO,
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
} from '../../domain/entities/MemberRoutine.types'
import type { MemberSummary } from '../../domain/entities/MemberSummary.types'
import type { UpdateWorkoutResult } from '../use-cases/UpdateWorkoutUseCase'

export const useMemberRoutineStore = defineStore('memberRoutines', () => {
  // ============================================================
  // STATE
  // ============================================================

  const workouts = ref<MemberRoutine[]>([])
  const memberCache = ref<Record<string, MemberSummary>>({})
  const searchQuery = ref('')
  const lastCreated = ref<MemberRoutine | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================
  // SERVICES / ADAPTERS (composition root)
  // ============================================================

  const memberRoutineService = new MemberRoutineService(
    new HttpMemberRoutineRepository(),
  )
  const memberLookup = new HttpMemberLookupRepository()

  // ============================================================
  // GETTERS
  // ============================================================

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const hasWorkouts = computed(() => workouts.value.length > 0)

  const memberNameById = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const [id, member] of Object.entries(memberCache.value)) {
      if (member.name_full) map[id] = member.name_full
    }
    return map
  })

  const filteredWorkouts = computed(() =>
    workouts.value.filter((workout) =>
      MemberRoutineDomainService.matchesSearch(
        workout,
        searchQuery.value,
        memberNameById.value[workout.member_id],
      ),
    ),
  )

  // ============================================================
  // ACTIONS
  // ============================================================

  async function resolveMembers(ids: string[]): Promise<void> {
    const uniqueIds = [...new Set(ids.filter(Boolean))]
    const missing = uniqueIds.filter((id) => !memberCache.value[id])
    if (missing.length === 0) return

    const results = await Promise.all(
      missing.map(async (id) => {
        const member = await memberLookup.findById(id)
        return { id, member }
      }),
    )

    const next = { ...memberCache.value }
    for (const { id, member } of results) {
      if (member) {
        next[id] = member
      }
    }
    memberCache.value = next
  }

  async function fetchWorkouts(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      workouts.value = await memberRoutineService.listWorkouts()
      // Hidratar nombres de miembros en paralelo (sin bloquear el listado si falla alguno)
      await resolveMembers(workouts.value.map((w) => w.member_id))
    } catch (e: any) {
      error.value = e.message || 'Error al cargar las rutinas asignadas'
      console.error('[MemberRoutineStore] Error fetching workouts:', e)
    } finally {
      loading.value = false
    }
  }

  async function createMemberRoutine(
    data: CreateMemberRoutineDTO,
  ): Promise<MemberRoutine | null> {
    loading.value = true
    error.value = null

    try {
      const created = await memberRoutineService.assignRoutine(data)
      lastCreated.value = created
      workouts.value = [created, ...workouts.value.filter((w) => w.id !== created.id)]
      await resolveMembers([created.member_id])
      return created
    } catch (e: any) {
      error.value = e.message || 'Error al asignar la rutina'
      console.error('[MemberRoutineStore] Error creating member routine:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * PUT /colesio/workouts/{id} con payload ya armado.
   * Mantiene compatibilidad con callers que envían UpdateMemberRoutineDTO.
   */
  async function updateMemberRoutine(
    id: string,
    data: UpdateMemberRoutineDTO,
  ): Promise<MemberRoutine | null> {
    loading.value = true
    error.value = null

    try {
      const updated = await memberRoutineService.updateWorkout(id, data)
      workouts.value = workouts.value.map((w) => (w.id === updated.id ? updated : w))
      await resolveMembers([updated.member_id])
      return updated
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar la rutina'
      console.error('[MemberRoutineStore] Error updating member routine:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * PUT /colesio/workouts/{id} vía UpdateWorkoutUseCase (SOLID).
   * Valida dominio, arma payload y persiste.
   */
  async function updateMemberRoutineFromForm(
    id: string,
    form: MemberRoutineFormState,
    exerciseIds: string[],
  ): Promise<UpdateWorkoutResult | { success: false; errors: MemberRoutineValidationErrors; networkError: string }> {
    loading.value = true
    error.value = null

    try {
      const result = await memberRoutineService.updateWorkoutFromForm(
        id,
        form,
        exerciseIds,
      )

      if (!result.success) {
        return result
      }

      workouts.value = workouts.value.map((w) =>
        w.id === result.workout.id ? result.workout : w,
      )
      await resolveMembers([result.workout.member_id])
      return result
    } catch (e: any) {
      const message = e.message || 'Error al actualizar la rutina'
      error.value = message
      console.error('[MemberRoutineStore] Error updating member routine:', e)
      return { success: false, errors: {}, networkError: message }
    } finally {
      loading.value = false
    }
  }

  /**
   * DELETE /colesio/workouts/{id} vía DeleteWorkoutUseCase.
   * Quita el workout de la lista local si el backend confirma.
   */
  async function deleteMemberRoutine(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await memberRoutineService.deleteWorkout(id)
      workouts.value = workouts.value.filter((w) => w.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Error al eliminar la rutina'
      console.error('[MemberRoutineStore] Error deleting member routine:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  function getMemberName(memberId: string): string {
    return memberNameById.value[memberId] || memberId
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function clearError(): void {
    error.value = null
  }

  function resetState(): void {
    workouts.value = []
    memberCache.value = {}
    searchQuery.value = ''
    lastCreated.value = null
    loading.value = false
    error.value = null
  }

  // ============================================================
  // EXPOSED API
  // ============================================================

  return {
    // State
    workouts,
    memberCache,
    searchQuery,
    lastCreated,
    loading,
    error,

    // Getters
    isLoading,
    hasError,
    hasWorkouts,
    memberNameById,
    filteredWorkouts,

    // Actions
    fetchWorkouts,
    createMemberRoutine,
    updateMemberRoutine,
    updateMemberRoutineFromForm,
    deleteMemberRoutine,
    getMemberName,
    setSearchQuery,
    clearError,
    resetState,
  }
})
