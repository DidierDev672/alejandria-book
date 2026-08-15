<script setup lang="ts">
// ============================================================
// PAGE - Lista de rutinas asignadas (workouts)
// ============================================================

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberRoutineStore } from '../../application/stores/useMemberRoutineStore'
import { useWorkoutDetailStore } from '../../application/stores/useWorkoutDetailStore'
import { useWorkoutEditStore } from '../../application/stores/useWorkoutEditStore'
import type { MemberRoutine } from '../../domain/entities/MemberRoutine.types'
import {
  WorkoutFeedbackMessages,
  type FeedbackCopy,
} from '../../domain/services/WorkoutFeedbackMessages'
import DumbbellIcon from '../components/atoms/DumbbellIcon.vue'
import SearchInput from '../components/atoms/SearchInput.vue'
import AssignedWorkoutsTable from '../components/organisms/AssignedWorkoutsTable.vue'
import WorkoutDeleteConfirmModal from '../components/organisms/WorkoutDeleteConfirmModal.vue'
import WorkoutDetailModal from '../components/organisms/WorkoutDetailModal.vue'
import WorkoutEditModal from '../components/organisms/WorkoutEditModal.vue'
import WorkoutErrorModal from '../components/organisms/WorkoutErrorModal.vue'
import WorkoutSuccessModal from '../components/organisms/WorkoutSuccessModal.vue'

const router = useRouter()
const workoutStore = useMemberRoutineStore()
const detailStore = useWorkoutDetailStore()
const editStore = useWorkoutEditStore()

const isSearching = computed(() => workoutStore.searchQuery.trim().length > 0)
const resultCount = computed(() => workoutStore.filteredWorkouts.length)

const showUpdateSuccessModal = ref(false)
const updateSuccessFeedback = ref<FeedbackCopy | null>(null)

const showDeleteConfirmModal = ref(false)
const deleteWarningFeedback = ref<FeedbackCopy | null>(null)
const workoutPendingDelete = ref<MemberRoutine | null>(null)
const isDeleting = ref(false)

const showDeleteSuccessModal = ref(false)
const deleteSuccessFeedback = ref<FeedbackCopy | null>(null)

const showDeleteErrorModal = ref(false)
const deleteErrorFeedback = ref<FeedbackCopy | null>(null)

function goToCreate() {
  router.push({ name: 'member-routine-create' })
}

function onViewWorkout(workout: MemberRoutine) {
  detailStore.openDetail(workout)
}

function onEditWorkout(workout: MemberRoutine) {
  editStore.openEdit(workout, workoutStore.memberNameById[workout.member_id])
}

function onWorkoutUpdated(workout: MemberRoutine) {
  updateSuccessFeedback.value = WorkoutFeedbackMessages.updateSuccess(workout.name)
  showUpdateSuccessModal.value = true
}

function closeUpdateSuccessModal() {
  showUpdateSuccessModal.value = false
  updateSuccessFeedback.value = null
}

function onDeleteWorkout(workout: MemberRoutine) {
  workoutPendingDelete.value = workout
  deleteWarningFeedback.value = WorkoutFeedbackMessages.deleteWarning(
    workout.name,
    workoutStore.memberNameById[workout.member_id],
  )
  showDeleteConfirmModal.value = true
}

function closeDeleteConfirmModal() {
  if (isDeleting.value) return
  showDeleteConfirmModal.value = false
  workoutPendingDelete.value = null
  deleteWarningFeedback.value = null
}

async function confirmDeleteWorkout() {
  const workout = workoutPendingDelete.value
  if (!workout) return

  isDeleting.value = true
  workoutStore.clearError()

  const ok = await workoutStore.deleteMemberRoutine(workout.id)

  isDeleting.value = false

  if (ok) {
    showDeleteConfirmModal.value = false
    workoutPendingDelete.value = null
    deleteWarningFeedback.value = null
    deleteSuccessFeedback.value = WorkoutFeedbackMessages.deleteSuccess(workout.name)
    showDeleteSuccessModal.value = true
    return
  }

  showDeleteConfirmModal.value = false
  deleteErrorFeedback.value = WorkoutFeedbackMessages.fromError(workoutStore.error)
  showDeleteErrorModal.value = true
}

function closeDeleteSuccessModal() {
  showDeleteSuccessModal.value = false
  deleteSuccessFeedback.value = null
}

function closeDeleteErrorModal() {
  showDeleteErrorModal.value = false
  deleteErrorFeedback.value = null
  workoutStore.clearError()
}

function retryDeleteAfterError() {
  closeDeleteErrorModal()
  if (workoutPendingDelete.value) {
    showDeleteConfirmModal.value = true
  }
}

onMounted(() => {
  workoutStore.fetchWorkouts()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <!-- Decorative Background -->
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

    <div class="max-w-5xl mx-auto space-y-6">
      <!-- ══════════ Header ══════════ -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 28 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.45 } }"
        class="relative overflow-hidden rounded-3xl px-6 py-5 shadow-xl shadow-orange-500/30
               bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600"
      >
        <div class="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div class="pointer-events-none absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-amber-300/20 blur-2xl" />

        <div class="relative z-10 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              v-motion
              :initial="{ scale: 0.85, opacity: 0 }"
              :enter="{
                scale: 1,
                opacity: 1,
                transition: { type: 'spring', stiffness: 220, damping: 14 },
              }"
              class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl
                     flex items-center justify-center shadow-lg shadow-orange-600/30 text-white"
            >
              <DumbbellIcon size="lg" />
            </div>

            <div>
              <h1 class="text-3xl font-bold font-serif text-white drop-shadow-sm">
                Lista de rutinas asignadas
              </h1>
              <p class="text-sm text-orange-100 mt-0.5">
                Entrenamientos registrados para los gladiadores del Coliseo
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="workoutStore.fetchWorkouts()"
              :disabled="workoutStore.isLoading"
              class="w-10 h-10 rounded-xl border border-white/20 bg-white/10
                     flex items-center justify-center text-white
                     hover:bg-white/20 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar lista"
            >
              <svg
                class="w-5 h-5"
                :class="{ 'animate-spin': workoutStore.isLoading }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            <button
              type="button"
              @click="goToCreate"
              class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5
                     bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl
                     hover:bg-white/30 border border-white/20 transition-all duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nueva rutina
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════ Search ══════════ -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.35 } }"
        class="flex items-center gap-3"
      >
        <div class="flex-1 max-w-md">
          <SearchInput
            :model-value="workoutStore.searchQuery"
            placeholder="Buscar por miembro, nombre o estado..."
            :disabled="workoutStore.isLoading && !workoutStore.hasWorkouts"
            @update:model-value="workoutStore.setSearchQuery"
          />
        </div>
        <p v-if="isSearching" class="text-xs text-stone-400 shrink-0">
          {{ resultCount }} resultado{{ resultCount === 1 ? '' : 's' }}
        </p>
      </div>

      <!-- ══════════ Loading ══════════ -->
      <div
        v-if="workoutStore.isLoading && !workoutStore.hasWorkouts"
        class="flex flex-col items-center justify-center py-16"
      >
        <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        <span class="mt-3 text-sm text-stone-500">Cargando rutinas asignadas...</span>
      </div>

      <!-- ══════════ Error ══════════ -->
      <div
        v-else-if="workoutStore.hasError"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
      >
        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold font-serif text-red-800 mb-1">
          Error al cargar rutinas
        </h3>
        <p class="text-sm text-red-600 mb-4">{{ workoutStore.error }}</p>
        <button
          type="button"
          @click="workoutStore.fetchWorkouts()"
          class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium
                 rounded-xl transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- ══════════ Empty catalog ══════════ -->
      <div
        v-else-if="!workoutStore.hasWorkouts"
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0 }"
        class="relative overflow-hidden rounded-3xl border border-amber-500/20
               bg-white/80 backdrop-blur-sm p-12 text-center"
      >
        <div
          class="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl
                 flex items-center justify-center mx-auto mb-5 text-amber-600"
        >
          <DumbbellIcon size="lg" />
        </div>
        <h3 class="text-xl font-bold font-serif text-stone-900 mb-2">
          Sin rutinas asignadas
        </h3>
        <p class="text-sm text-stone-500 mb-6 max-w-md mx-auto leading-relaxed">
          Aún no hay entrenamientos registrados para los gladiadores. Asigna la primera rutina
          para comenzar el seguimiento.
        </p>
        <button
          type="button"
          @click="goToCreate"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600
                 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30
                 hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Asignar primera rutina
        </button>
      </div>

      <!-- ══════════ Table ══════════ -->
      <div
        v-else
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.12 } }"
      >
        <AssignedWorkoutsTable
          :workouts="workoutStore.filteredWorkouts"
          :member-names="workoutStore.memberNameById"
          :is-searching="isSearching"
          :search-query="workoutStore.searchQuery"
          @view="onViewWorkout"
          @edit="onEditWorkout"
          @delete="onDeleteWorkout"
        />
      </div>
    </div>

    <WorkoutDetailModal
      :visible="detailStore.isOpen"
      :loading="detailStore.isLoading"
      :error="detailStore.error"
      :workout="detailStore.workout"
      :member="detailStore.member"
      :routine="detailStore.routine"
      :exercises="detailStore.exercises"
      @close="detailStore.closeDetail()"
    />

    <WorkoutEditModal @saved="onWorkoutUpdated" />

    <WorkoutSuccessModal
      :visible="showUpdateSuccessModal"
      :title="updateSuccessFeedback?.title ?? '¡Rutina actualizada con éxito!'"
      :message="updateSuccessFeedback?.message ?? 'Los cambios se guardaron correctamente.'"
      @close="closeUpdateSuccessModal"
    />

    <WorkoutDeleteConfirmModal
      :visible="showDeleteConfirmModal"
      :title="deleteWarningFeedback?.title ?? '¿Eliminar esta rutina?'"
      :message="deleteWarningFeedback?.message ?? ''"
      :cause="deleteWarningFeedback?.cause"
      :next-step="deleteWarningFeedback?.nextStep"
      :routine-name="workoutPendingDelete?.name"
      :loading="isDeleting"
      @close="closeDeleteConfirmModal"
      @confirm="confirmDeleteWorkout"
    />

    <WorkoutSuccessModal
      :visible="showDeleteSuccessModal"
      :title="deleteSuccessFeedback?.title ?? 'Rutina eliminada'"
      :message="deleteSuccessFeedback?.message ?? 'La rutina se eliminó correctamente.'"
      @close="closeDeleteSuccessModal"
    />

    <WorkoutErrorModal
      :visible="showDeleteErrorModal"
      :title="deleteErrorFeedback?.title ?? 'No pudimos eliminar la rutina'"
      :message="deleteErrorFeedback?.message ?? ''"
      :cause="deleteErrorFeedback?.cause"
      :next-step="deleteErrorFeedback?.nextStep"
      @close="closeDeleteErrorModal"
      @retry="retryDeleteAfterError"
    />
  </div>
</template>
