<script setup lang="ts">
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useExerciseAssignmentListStore } from '../../application/stores/useExerciseAssignmentListStore'
import type { ExerciseAssignmentListItem } from '../../domain/entities/ExerciseAssignment.types'
import ExerciseAssignmentCard from '../components/molecules/ExerciseAssignmentCard.vue'
import ExerciseAssignmentDeleteModal from '../components/organisms/ExerciseAssignmentDeleteModal.vue'
import ExerciseAssignmentDetailModal from '../components/organisms/ExerciseAssignmentDetailModal.vue'

const router = useRouter()
const listStore = useExerciseAssignmentListStore()

const selectedAssignment = ref<ExerciseAssignmentListItem | null>(null)
const isDetailOpen = ref(false)
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

function openDetail(assignment: ExerciseAssignmentListItem): void {
  selectedAssignment.value = assignment
  isDetailOpen.value = true
}

function closeDetail(): void {
  isDetailOpen.value = false
  selectedAssignment.value = null
}

function openDelete(assignment: ExerciseAssignmentListItem): void {
  selectedAssignment.value = assignment
  listStore.clearDeleteError()
  isDeleteOpen.value = true
}

function closeDelete(): void {
  if (isDeleting.value) return
  isDeleteOpen.value = false
  selectedAssignment.value = null
  listStore.clearDeleteError()
}

async function confirmDelete(): Promise<void> {
  const assignment = selectedAssignment.value
  if (!assignment || isDeleting.value) return

  isDeleting.value = true
  const ok = await listStore.deleteAssignment(assignment.id)
  isDeleting.value = false

  if (ok) {
    isDeleteOpen.value = false
    selectedAssignment.value = null
  }
}

onMounted(() => {
  void listStore.fetchAssignments()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <div class="pointer-events-none fixed top-0 right-0 -z-10 opacity-10">
      <svg width="360" height="260" viewBox="0 0 360 260" fill="none">
        <circle cx="320" cy="-20" r="160" fill="#f59e0b" />
        <circle cx="270" cy="55" r="80" fill="#ea580c" />
      </svg>
    </div>

    <div class="mx-auto max-w-5xl space-y-6">
      <header
        v-motion
        :initial="{ opacity: 0, y: -12 }"
        :enter="{ opacity: 1, y: 0 }"
        :transition="{ duration: 400, ease: [0.16, 1, 0.3, 1] }"
        class="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-100 px-5 py-6 shadow-sm sm:px-8"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 opacity-90"
        />
        <div class="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/90">
              Coliseo · Asignaciones
            </p>
            <h1 class="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
              Lista de ejercicios asignados
            </h1>
            <p class="mt-1 max-w-xl text-sm text-amber-50/80">
              Aquí ves a quién le toca el siguiente paso, con los movimientos y el equipo que lo acompañan.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/30 transition-colors hover:bg-white/30"
            @click="router.push({ name: 'assign-exercises' })"
          >
            Nueva asignación
          </button>
        </div>
      </header>

      <div v-if="listStore.isLoading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <span class="ml-3 text-sm text-stone-500">Cargando asignaciones...</span>
      </div>

      <BaseErrorDisplay
        v-else-if="listStore.error"
        title="No pudimos abrir esta lista"
        :message="listStore.error"
        mode="container"
        action-text="Intentarlo otra vez"
        @retry="listStore.fetchAssignments"
      />

      <template v-else>
        <input
          :value="listStore.searchQuery"
          type="search"
          placeholder="Consultar asignaciones por nombre, ejercicio o equipo..."
          class="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          @input="listStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        >

        <div
          v-if="listStore.cards.length === 0"
          class="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-100 py-16 text-center"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <svg class="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">Todavía no hay asignaciones</h3>
          <p class="max-w-xs text-sm text-stone-400">
            Cuando elijas el siguiente paso de alguien, aparecerá aquí con calma.
          </p>
        </div>

        <div
          v-else-if="listStore.filteredCards.length === 0"
          class="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-100 py-16 text-center"
        >
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <svg class="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">No encontramos coincidencias</h3>
          <p class="max-w-xs text-sm text-stone-400">
            Prueba con el nombre de la persona, un ejercicio o un equipo. La lista no se ha perdido.
          </p>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="(card, index) in listStore.filteredCards"
            :key="card.key"
            v-motion
            :initial="{ opacity: 0, y: 14 }"
            :enter="{ opacity: 1, y: 0 }"
            :transition="{ duration: 380, delay: index * 70, ease: [0.16, 1, 0.3, 1] }"
          >
            <ExerciseAssignmentCard
              :user-name="card.userName"
              :exercise-names="card.exerciseNames"
              :equipment-names="card.equipmentNames"
              :is-active="card.isActive"
              @view="openDetail(card)"
              @delete="openDelete(card)"
            />
          </div>
        </div>
      </template>
    </div>

    <ExerciseAssignmentDetailModal
      :is-open="isDetailOpen"
      :assignment="selectedAssignment"
      @close="closeDetail"
    />
    <ExerciseAssignmentDeleteModal
      :is-open="isDeleteOpen"
      :user-name="selectedAssignment?.userName ?? ''"
      :is-deleting="isDeleting"
      :error="listStore.deleteError"
      @close="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
