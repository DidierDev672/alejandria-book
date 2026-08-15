<script setup lang="ts">
// ============================================================
// ORGANISM - Workout edit modal (Atomic Design composition)
// Persistencia: useWorkoutEditStore → UpdateWorkoutUseCase → PUT axios
// ============================================================

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkoutEditStore } from '../../../application/stores/useWorkoutEditStore'
import type {
  MemberRoutine,
  RoutineOption,
} from '../../../domain/entities/MemberRoutine.types'
import type { Exercise } from '../../../domain/entities/Exercise.types'
import OrangeGradientBadge from '../atoms/OrangeGradientBadge.vue'
import WorkoutEditIdentityFields from '../molecules/WorkoutEditIdentityFields.vue'
import WorkoutEditDetailsFields from '../molecules/WorkoutEditDetailsFields.vue'
import WorkoutEditPeriodFields from '../molecules/WorkoutEditPeriodFields.vue'
import ExercisesSection from './ExercisesSection.vue'
import RoutineSelectModal from './RoutineSelectModal.vue'
import ExerciseSelectModal from './ExerciseSelectModal.vue'
import MemberListModal from '@/features/colesio/presentation/components/organisms/MemberListModal.vue'

const editStore = useWorkoutEditStore()

const {
  isOpen,
  formState,
  validationErrors,
  assignedExercises,
  selectedMemberName,
  selectedRoutineName,
  saveError,
  isHydrating,
  isSaving,
} = storeToRefs(editStore)

const showMemberModal = ref(false)
const showRoutineModal = ref(false)
const showExerciseModal = ref(false)

const emit = defineEmits<{
  (e: 'saved', workout: MemberRoutine): void
}>()

const disabled = () => isSaving.value || isHydrating.value

async function handleSubmit() {
  const updated = await editStore.save()
  if (updated) emit('saved', updated)
}

function handleMemberSelected(member: { id: string; name_full: string }) {
  editStore.setMember(member)
  showMemberModal.value = false
}

function handleRoutineSelected(routine: RoutineOption) {
  editStore.setRoutine(routine)
  showRoutineModal.value = false
}

function handleExercisesConfirmed(exercises: Exercise[]) {
  editStore.setExercises(exercises)
  showExerciseModal.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        @click.self="!isSaving && editStore.closeEdit()"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workout-edit-title"
          class="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl
                 border border-amber-200 shadow-2xl overflow-hidden"
        >
          <!-- Accent bar -->
          <div
            class="h-1.5 shrink-0"
            style="
              background: linear-gradient(
                90deg,
                #fb923c 0%,
                #f97316 40%,
                #ea580c 70%,
                #c2410c 100%
              );
            "
          />

          <!-- Header -->
          <div
            class="shrink-0 flex items-start justify-between gap-4 px-6 py-4
                   border-b border-amber-100 bg-[#FFFBF5]"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h2
                  id="workout-edit-title"
                  class="text-xl font-bold font-serif text-stone-900"
                >
                  Editar rutina
                </h2>
                <OrangeGradientBadge label="edición" />
              </div>
              <p class="text-sm text-stone-500 truncate">
                {{ formState.name || 'Actualiza los datos de la asignación' }}
              </p>
            </div>

            <button
              type="button"
              class="shrink-0 w-9 h-9 rounded-xl border border-amber-200
                     flex items-center justify-center text-stone-500
                     hover:bg-amber-50 hover:text-stone-800 transition-colors
                     disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="isSaving"
              @click="editStore.closeEdit()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form
            class="flex-1 overflow-y-auto px-6 py-5 space-y-6"
            novalidate
            @submit.prevent="handleSubmit"
          >
            <div
              v-if="isHydrating"
              class="flex flex-col items-center justify-center py-10"
            >
              <div
                class="w-8 h-8 border-4 border-amber-200 border-t-amber-600
                       rounded-full animate-spin"
              />
              <span class="mt-3 text-sm text-stone-500">Cargando datos de la rutina...</span>
            </div>

            <template v-else>
              <WorkoutEditIdentityFields
                :form-state="formState"
                :errors="validationErrors"
                :selected-member-name="selectedMemberName"
                :selected-routine-name="selectedRoutineName"
                :disabled="disabled()"
                @update:form-state="editStore.setFormState"
                @select-member="showMemberModal = true"
                @clear-member="editStore.clearMember()"
                @select-routine="showRoutineModal = true"
                @clear-routine="editStore.clearRoutine()"
              />

              <WorkoutEditDetailsFields
                :form-state="formState"
                :errors="validationErrors"
                :disabled="disabled()"
                @update:form-state="editStore.setFormState"
              />

              <WorkoutEditPeriodFields
                :form-state="formState"
                :errors="validationErrors"
                :disabled="disabled()"
                @update:form-state="editStore.setFormState"
              />

              <ExercisesSection
                :exercises="assignedExercises"
                :disabled="disabled()"
                :error="validationErrors.exercise_ids"
                @open="showExerciseModal = true"
                @remove="editStore.removeExercise"
              />

              <div
                v-if="saveError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {{ saveError }}
              </div>
            </template>

            <!-- Footer inside form for submit -->
            <div
              class="sticky bottom-0 -mx-6 -mb-5 px-6 py-4 border-t border-amber-100
                     bg-[#FFFBF5] flex items-center justify-between gap-3"
            >
              <button
                type="button"
                :disabled="isSaving"
                class="inline-flex items-center gap-2 border border-amber-600 text-amber-700
                       hover:bg-amber-50 text-sm font-medium px-4 py-2 rounded-lg
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="editStore.closeEdit()"
              >
                Cancelar
              </button>

              <button
                type="submit"
                :disabled="disabled()"
                class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700
                       text-white text-sm font-semibold px-5 py-2.5 rounded-xl
                       shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="isSaving"
                  class="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <MemberListModal
    :is-open="showMemberModal"
    :selected-member-id="formState.member_id"
    @close="showMemberModal = false"
    @select="handleMemberSelected"
  />

  <RoutineSelectModal
    :visible="showRoutineModal"
    :selected-id="formState.routine_id"
    @close="showRoutineModal = false"
    @select="handleRoutineSelected"
  />

  <ExerciseSelectModal
    :visible="showExerciseModal"
    :selected-ids="assignedExercises.map((e) => e.id)"
    @close="showExerciseModal = false"
    @confirm="handleExercisesConfirmed"
  />
</template>
