// ============================================================
// APPLICATION STORE - Workout Detail (hydrate member / routine / exercises)
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { HttpMemberLookupRepository } from '../../infrastructure/http/HttpMemberLookupRepository'
import { HttpRoutineBaseLookupRepository } from '../../infrastructure/http/HttpRoutineBaseLookupRepository'
import { HttpExerciseRepository } from '../../infrastructure/http/HttpExerciseRepository'
import type { MemberRoutine } from '../../domain/entities/MemberRoutine.types'
import type { MemberSummary } from '../../domain/entities/MemberSummary.types'
import type { RoutineBaseSummary } from '../../domain/entities/RoutineBase.types'
import type { Exercise } from '../../domain/entities/Exercise.types'

export const useWorkoutDetailStore = defineStore('workoutDetail', () => {
  const workout = ref<MemberRoutine | null>(null)
  const member = ref<MemberSummary | null>(null)
  const routine = ref<RoutineBaseSummary | null>(null)
  const exercises = ref<Exercise[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isOpen = ref(false)

  const memberLookup = new HttpMemberLookupRepository()
  const routineLookup = new HttpRoutineBaseLookupRepository()
  const exerciseRepo = new HttpExerciseRepository()

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const hasExercises = computed(() => exercises.value.length > 0)

  async function openDetail(source: MemberRoutine): Promise<void> {
    isOpen.value = true
    workout.value = source
    member.value = null
    routine.value = null
    exercises.value = []
    error.value = null
    loading.value = true

    try {
      const [memberResult, routineResult, exerciseResults] = await Promise.all([
        memberLookup.findById(source.member_id),
        routineLookup.findById(source.routine_id),
        Promise.all(
          (source.exercise_ids ?? []).map(async (id) => {
            const exercise = await exerciseRepo.findById(id)
            return exercise
          }),
        ),
      ])

      member.value = memberResult
      routine.value = routineResult
      exercises.value = exerciseResults.filter((e): e is Exercise => e !== null)
    } catch (e: any) {
      error.value = e.message || 'Error al cargar el detalle de la rutina'
      console.error('[WorkoutDetailStore] Error loading detail:', e)
    } finally {
      loading.value = false
    }
  }

  function closeDetail(): void {
    isOpen.value = false
    workout.value = null
    member.value = null
    routine.value = null
    exercises.value = []
    error.value = null
    loading.value = false
  }

  return {
    workout,
    member,
    routine,
    exercises,
    loading,
    error,
    isOpen,
    isLoading,
    hasError,
    hasExercises,
    openDetail,
    closeDetail,
  }
})
