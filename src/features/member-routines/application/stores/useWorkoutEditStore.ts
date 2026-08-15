// ============================================================
// APPLICATION STORE - Workout Edit Modal state & hydration
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMemberRoutineStore } from './useMemberRoutineStore'
import { HttpExerciseRepository } from '../../infrastructure/http/HttpExerciseRepository'
import { HttpRoutineBaseLookupRepository } from '../../infrastructure/http/HttpRoutineBaseLookupRepository'
import { HttpMemberRoutineRepository } from '../../infrastructure/http/HttpMemberRoutineRepository'
import { MemberRoutineDomainService } from '../../domain/services/MemberRoutineDomainService'
import { UpdateWorkoutUseCase } from '../use-cases/UpdateWorkoutUseCase'
import type {
  MemberRoutine,
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
  RoutineOption,
} from '../../domain/entities/MemberRoutine.types'
import type { Exercise } from '../../domain/entities/Exercise.types'

// Id nuevo: evita instancia Pinia/HMR stale que llamaba updateMemberRoutine inexistente
export const useWorkoutEditStore = defineStore('workoutEditModal', () => {
  const isOpen = ref(false)
  const workoutId = ref<string | null>(null)
  const formState = ref<MemberRoutineFormState>(
    MemberRoutineDomainService.createEmptyFormState(),
  )
  const validationErrors = ref<MemberRoutineValidationErrors>({})
  const assignedExercises = ref<Exercise[]>([])
  const selectedMemberName = ref<string | null>(null)
  const selectedRoutineName = ref<string | null>(null)
  const hydrating = ref(false)
  const saving = ref(false)
  const saveError = ref<string | null>(null)

  // Composition root: puertos concretos inyectados al use case (DIP)
  const exerciseRepo = new HttpExerciseRepository()
  const routineLookup = new HttpRoutineBaseLookupRepository()
  const updateWorkoutUseCase = new UpdateWorkoutUseCase(
    new HttpMemberRoutineRepository(),
  )

  const isHydrating = computed(() => hydrating.value)
  const isSaving = computed(() => saving.value)
  const exerciseIds = computed(() => assignedExercises.value.map((e) => e.id))
  const hasSaveError = computed(() => saveError.value !== null)

  async function openEdit(workout: MemberRoutine, memberName?: string | null): Promise<void> {
    isOpen.value = true
    workoutId.value = workout.id
    formState.value = MemberRoutineDomainService.toFormState(workout)
    validationErrors.value = {}
    saveError.value = null
    selectedMemberName.value = memberName || null
    selectedRoutineName.value = null
    assignedExercises.value = []
    hydrating.value = true

    try {
      const [routine, exercises] = await Promise.all([
        routineLookup.findById(workout.routine_id),
        Promise.all(
          (workout.exercise_ids ?? []).map((id) => exerciseRepo.findById(id)),
        ),
      ])

      selectedRoutineName.value = routine?.name || null
      assignedExercises.value = exercises.filter((e): e is Exercise => e !== null)
    } catch (e) {
      console.error('[WorkoutEditStore] Error hydrating edit form:', e)
    } finally {
      hydrating.value = false
    }
  }

  function closeEdit(): void {
    isOpen.value = false
    workoutId.value = null
    formState.value = MemberRoutineDomainService.createEmptyFormState()
    validationErrors.value = {}
    assignedExercises.value = []
    selectedMemberName.value = null
    selectedRoutineName.value = null
    saveError.value = null
    hydrating.value = false
    saving.value = false
  }

  function setFormState(next: MemberRoutineFormState): void {
    if (selectedRoutineName.value && next.routine_id !== formState.value.routine_id) {
      selectedRoutineName.value = null
    }
    if (selectedMemberName.value && !next.member_id.trim()) {
      selectedMemberName.value = null
    }
    formState.value = next
  }

  function setMember(member: { id: string; name_full: string }): void {
    selectedMemberName.value = member.name_full
    formState.value = { ...formState.value, member_id: member.id }
    if (validationErrors.value.member_id) {
      const { member_id: _, ...rest } = validationErrors.value
      validationErrors.value = rest
    }
  }

  function clearMember(): void {
    selectedMemberName.value = null
    formState.value = { ...formState.value, member_id: '' }
  }

  function setRoutine(routine: RoutineOption): void {
    selectedRoutineName.value = routine.name
    formState.value = { ...formState.value, routine_id: routine.id }
    if (validationErrors.value.routine_id) {
      const { routine_id: _, ...rest } = validationErrors.value
      validationErrors.value = rest
    }
  }

  function clearRoutine(): void {
    selectedRoutineName.value = null
    formState.value = { ...formState.value, routine_id: '' }
  }

  function setExercises(exercises: Exercise[]): void {
    assignedExercises.value = [...exercises]
    if (validationErrors.value.exercise_ids) {
      const { exercise_ids: _, ...rest } = validationErrors.value
      validationErrors.value = rest
    }
  }

  function removeExercise(exerciseId: string): void {
    assignedExercises.value = assignedExercises.value.filter((e) => e.id !== exerciseId)
  }

  function syncListStore(updated: MemberRoutine): void {
    const listStore = useMemberRoutineStore()
    listStore.workouts = listStore.workouts.map((w) =>
      w.id === updated.id ? updated : w,
    )
  }

  /**
   * PUT /colesio/workouts/{id}
   * Flujo: UpdateWorkoutUseCase → HttpMemberRoutineRepository (axios)
   * No depende de actions del otro store (evita fallos por HMR stale).
   */
  async function save(): Promise<MemberRoutine | null> {
    if (!workoutId.value) return null

    saveError.value = null
    validationErrors.value = {}
    saving.value = true

    try {
      const result = await updateWorkoutUseCase.execute(
        workoutId.value,
        formState.value,
        exerciseIds.value,
      )

      if (!result.success) {
        validationErrors.value = result.errors
        return null
      }

      syncListStore(result.workout)
      closeEdit()
      return result.workout
    } catch (e: any) {
      saveError.value = e?.message || 'Error al actualizar la rutina'
      console.error('[WorkoutEditStore] Error saving workout:', e)
      return null
    } finally {
      saving.value = false
    }
  }

  return {
    isOpen,
    workoutId,
    formState,
    validationErrors,
    assignedExercises,
    selectedMemberName,
    selectedRoutineName,
    saveError,
    isHydrating,
    isSaving,
    exerciseIds,
    hasSaveError,
    openEdit,
    closeEdit,
    setFormState,
    setMember,
    clearMember,
    setRoutine,
    clearRoutine,
    setExercises,
    removeExercise,
    save,
  }
})
