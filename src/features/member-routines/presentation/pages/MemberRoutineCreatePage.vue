<script setup lang="ts">
// ============================================================
// PAGE - Member Routine Create Page
// Orquesta UI + store Pinia; la persistencia va a POST /colesio/workouts
// ============================================================

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberRoutineStore } from '../../application/stores/useMemberRoutineStore'
import { MemberRoutineDomainService } from '../../domain/services/MemberRoutineDomainService'
import {
  WorkoutFeedbackMessages,
  type FeedbackCopy,
} from '../../domain/services/WorkoutFeedbackMessages'
import type {
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
  RoutineOption,
} from '../../domain/entities/MemberRoutine.types'
import type { Exercise } from '../../domain/entities/Exercise.types'
import MemberRoutineForm from '../components/organisms/MemberRoutineForm.vue'
import RoutineSelectModal from '../components/organisms/RoutineSelectModal.vue'
import ExercisesSection from '../components/organisms/ExercisesSection.vue'
import ExerciseSelectModal from '../components/organisms/ExerciseSelectModal.vue'
import WorkoutSuccessModal from '../components/organisms/WorkoutSuccessModal.vue'
import WorkoutErrorModal from '../components/organisms/WorkoutErrorModal.vue'
import MemberListModal from '@/features/colesio/presentation/components/organisms/MemberListModal.vue'

// ============================================================
// COMPOSITION & STATE
// ============================================================

const router = useRouter()
const memberRoutineStore = useMemberRoutineStore()

const formState = ref<MemberRoutineFormState>(
  MemberRoutineDomainService.createEmptyFormState(),
)
const validationErrors = ref<MemberRoutineValidationErrors>({})

const showRoutineModal = ref(false)
const selectedRoutine = ref<RoutineOption | null>(null)

const showMemberModal = ref(false)
const selectedMemberName = ref<string | null>(null)

const showExerciseModal = ref(false)
const assignedExercises = ref<Exercise[]>([])

const showSuccessModal = ref(false)
const successFeedback = ref<FeedbackCopy | null>(null)

const showErrorModal = ref(false)
const errorFeedback = ref<FeedbackCopy | null>(null)

// ============================================================
// COMPUTED
// ============================================================

const isSubmitting = computed(() => memberRoutineStore.isLoading)
const exerciseIds = computed(() => assignedExercises.value.map((e) => e.id))

// ============================================================
// ACTIONS
// ============================================================

function handleFormUpdate(newState: MemberRoutineFormState) {
  if (selectedRoutine.value && newState.routine_id !== selectedRoutine.value.id) {
    selectedRoutine.value = null
  }
  if (selectedMemberName.value && !newState.member_id.trim()) {
    selectedMemberName.value = null
  }
  formState.value = newState
}

async function handleSubmit() {
  showSuccessModal.value = false
  showErrorModal.value = false
  memberRoutineStore.clearError()

  // Validación en dominio (incluye exercise_ids ≥ 1)
  const errors = MemberRoutineDomainService.validate(
    formState.value,
    exerciseIds.value,
  )
  validationErrors.value = errors
  if (Object.keys(errors).length > 0) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  // Payload exacto de POST /colesio/workouts
  const dto = MemberRoutineDomainService.formStateToDTO(
    formState.value,
    exerciseIds.value,
  )
  const created = await memberRoutineStore.createMemberRoutine(dto)

  if (created) {
    formState.value = MemberRoutineDomainService.createEmptyFormState()
    validationErrors.value = {}
    selectedRoutine.value = null
    selectedMemberName.value = null
    assignedExercises.value = []
    successFeedback.value = WorkoutFeedbackMessages.success(created.name)
    showSuccessModal.value = true
  } else {
    errorFeedback.value = WorkoutFeedbackMessages.fromError(memberRoutineStore.error)
    showErrorModal.value = true
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  successFeedback.value = null
}

function closeErrorModal() {
  showErrorModal.value = false
  errorFeedback.value = null
  memberRoutineStore.clearError()
}

function handleErrorRetry() {
  closeErrorModal()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleCancel() {
  if (confirm('¿Cancelar el registro? Se perderán los datos ingresados.')) {
    router.back()
  }
}

function handleRoutineSelected(routine: RoutineOption) {
  selectedRoutine.value = routine
  formState.value = { ...formState.value, routine_id: routine.id }
  if (validationErrors.value.routine_id) {
    const { routine_id: _, ...rest } = validationErrors.value
    validationErrors.value = rest
  }
}

function handleRoutineCleared() {
  selectedRoutine.value = null
  formState.value = { ...formState.value, routine_id: '' }
}

function handleMemberSelected(member: { id: string; name_full: string }) {
  selectedMemberName.value = member.name_full
  formState.value = { ...formState.value, member_id: member.id }
  if (validationErrors.value.member_id) {
    const { member_id: _, ...rest } = validationErrors.value
    validationErrors.value = rest
  }
}

function handleMemberCleared() {
  selectedMemberName.value = null
  formState.value = { ...formState.value, member_id: '' }
}

function handleExercisesConfirmed(exercises: Exercise[]) {
  const merged = new Map(assignedExercises.value.map((exercise) => [exercise.id, exercise]))
  for (const exercise of exercises) {
    merged.set(exercise.id, exercise)
  }
  assignedExercises.value = Array.from(merged.values())
  if (validationErrors.value.exercise_ids) {
    const { exercise_ids: _, ...rest } = validationErrors.value
    validationErrors.value = rest
  }
}

function handleExerciseRemoved(exerciseId: string) {
  assignedExercises.value = assignedExercises.value.filter((e) => e.id !== exerciseId)
}
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <!-- Decorative Background Elements -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
        <circle cx="0" cy="200" r="140" fill="#f59e0b" />
      </svg>
    </div>

    <div class="max-w-3xl mx-auto space-y-6">
      <!-- ══════════ Page Header ══════════ -->
      <div
        class="relative overflow-hidden rounded-3xl border border-orange-500/20
               bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100
               px-6 py-5 shadow-xl shadow-orange-200/60"
      >
        <div class="pointer-events-none absolute inset-0 opacity-30">
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full
                      bg-gradient-to-br from-orange-400 to-amber-500 blur-3xl" />
          <div class="absolute -left-8 top-1/2 h-32 w-32 rounded-full
                      bg-gradient-to-tr from-amber-400 to-orange-400 blur-2xl" />
        </div>

        <div class="relative z-10 flex items-center gap-4">
          <div
            class="w-14 h-14 shrink-0 bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600
                   rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>

          <div class="flex-1">
            <h1 class="text-3xl font-bold font-serif text-stone-900">
              Asignar Rutina a Gladiador
            </h1>
            <p class="text-sm text-stone-500 mt-0.5">
              Registra la rutina de entrenamiento de un miembro del Coliseo
            </p>
          </div>
        </div>
      </div>

      <!-- ══════════ Exercises Section ══════════ -->
      <ExercisesSection
        :exercises="assignedExercises"
        :disabled="isSubmitting"
        :error="validationErrors.exercise_ids"
        @open="showExerciseModal = true"
        @remove="handleExerciseRemoved"
      />

      <!-- ══════════ Form ══════════ -->
      <MemberRoutineForm
        :form-state="formState"
        :errors="validationErrors"
        :disabled="isSubmitting"
        :selected-routine-name="selectedRoutine?.name"
        :selected-member-name="selectedMemberName"
        @update:form-state="handleFormUpdate"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @select-routine="showRoutineModal = true"
        @clear-routine="handleRoutineCleared"
        @select-member="showMemberModal = true"
        @clear-member="handleMemberCleared"
      />
    </div>

    <!-- ══════════ Member Select Modal ══════════ -->
    <MemberListModal
      :is-open="showMemberModal"
      :selected-member-id="formState.member_id"
      @close="showMemberModal = false"
      @select="handleMemberSelected"
    />

    <!-- ══════════ Routine Select Modal ══════════ -->
    <RoutineSelectModal
      :visible="showRoutineModal"
      :selected-id="formState.routine_id"
      @close="showRoutineModal = false"
      @select="handleRoutineSelected"
    />

    <!-- ══════════ Exercise Select Modal ══════════ -->
    <ExerciseSelectModal
      :visible="showExerciseModal"
      :selected-ids="exerciseIds"
      @close="showExerciseModal = false"
      @confirm="handleExercisesConfirmed"
    />

    <!-- ══════════ POST Feedback Modals ══════════ -->
    <WorkoutSuccessModal
      :visible="showSuccessModal"
      :title="successFeedback?.title ?? ''"
      :message="successFeedback?.message ?? ''"
      @close="closeSuccessModal"
    />

    <WorkoutErrorModal
      :visible="showErrorModal"
      :title="errorFeedback?.title ?? ''"
      :message="errorFeedback?.message ?? ''"
      :cause="errorFeedback?.cause"
      :next-step="errorFeedback?.nextStep"
      @close="closeErrorModal"
      @retry="handleErrorRetry"
    />
  </div>
</template>
