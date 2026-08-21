<script setup lang="ts">
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import LoadingView from '@/utils/loading/presentation/components/LoadingView.vue'
import { computed, watch } from 'vue'
import { useAssignmentExerciseCatalogStore } from '../../../application/stores/useAssignmentExerciseCatalogStore'
import type { ExerciseAssignmentListItem } from '../../../domain/entities/ExerciseAssignment.types'
import { ExerciseAssignmentDomainService } from '../../../domain/services/ExerciseAssignmentDomainService'
import ExerciseVideoCarousel from '../molecules/ExerciseVideoCarousel.vue'

const props = defineProps<{
  isOpen: boolean
  assignment: ExerciseAssignmentListItem | null
}>()

defineEmits<{
  close: []
}>()

const exerciseCatalog = useAssignmentExerciseCatalogStore()

const assignedExercises = computed(() =>
  ExerciseAssignmentDomainService.resolveAssignmentExercises(
    props.assignment?.exerciseIds ?? [],
    exerciseCatalog.exercises,
  ),
)

const carouselExercises = computed(() =>
  ExerciseAssignmentDomainService.exercisesWithVideo(assignedExercises.value),
)

watch(
  () => [props.isOpen, props.assignment?.id] as const,
  ([isOpen]) => {
    if (!isOpen || !props.assignment) return
    void exerciseCatalog.fetchExercises()
  },
)
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-2xl" :expandable="true" @close="$emit('close')">
    <template #header>
      <h3 class="font-serif text-2xl font-bold tracking-wide text-white">Detalle de la asignación</h3>
      <p class="mt-1 text-sm text-amber-100/80">El siguiente paso de esta persona, con calma y completo.</p>
    </template>
    <template #content>
      <LoadingView
        :is-loading="exerciseCatalog.isLoading"
        title="Abriendo los movimientos"
        description="Traemos los videos de esta asignación. Un momento, no se pierde nada."
      />

      <div v-if="assignment" class="space-y-5">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Nombre del usuario</p>
          <p class="mt-1 font-serif text-lg font-semibold text-stone-800">{{ assignment.userName }}</p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Estado</p>
          <span
            class="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
            :class="assignment.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ assignment.isActive ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Ejercicios</p>
          <div v-if="assignment.exerciseNames.length > 0" class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="(name, index) in assignment.exerciseNames"
              :key="`${name}-${index}`"
              class="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm shadow-orange-500/25"
            >
              {{ name }}
            </span>
          </div>
          <p v-else class="mt-1 text-sm text-stone-500">Sin ejercicios en esta asignación.</p>

          <div class="mt-4">
            <BaseErrorDisplay
              v-if="exerciseCatalog.error"
              title="No pudimos traer los videos"
              :message="exerciseCatalog.error"
              mode="container"
              action-text="Intentarlo otra vez"
              @retry="exerciseCatalog.fetchExercises"
            />

            <ExerciseVideoCarousel
              v-else-if="carouselExercises.length > 0"
              :exercises="carouselExercises"
            />

            <div
              v-else-if="!exerciseCatalog.isLoading && assignment.exerciseNames.length > 0"
              class="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 py-10 text-center"
            >
              <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 class="font-serif text-base font-semibold text-stone-700">Todavía no hay videos</h4>
              <p class="mt-1 max-w-xs text-sm text-stone-400">
                Estos ejercicios están asignados, pero aún no tienen un video para mostrar.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-stone-500">Equipos</p>
          <div v-if="assignment.equipmentNames.length > 0" class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="(name, index) in assignment.equipmentNames"
              :key="`${name}-${index}`"
              class="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm shadow-orange-500/25"
            >
              {{ name }}
            </span>
          </div>
          <p v-else class="mt-1 text-sm text-stone-500">Sin equipos en esta asignación.</p>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
