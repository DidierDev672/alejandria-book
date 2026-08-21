<script setup lang="ts">
import { watch } from 'vue'
import BaseModal from '@/utils/components/BaseModal.vue'
import BaseLoading from '@/utils/components/BaseLoading.vue'
import BaseErrorDisplay from '@/utils/components/BaseErrorDisplay.vue'
import { useAssignmentExerciseCatalogStore } from '../../../application/stores/useAssignmentExerciseCatalogStore'
import ExercisePickerCard from '../molecules/ExercisePickerCard.vue'

const props = defineProps<{
  isOpen: boolean
  selectedIds: string[]
}>()

const emit = defineEmits<{
  close: []
  toggle: [exerciseId: string]
}>()

const exerciseStore = useAssignmentExerciseCatalogStore()

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      exerciseStore.setSearchQuery('')
      void exerciseStore.fetchExercises()
    }
  },
)
</script>

<template>
  <BaseModal :is-open="isOpen" max-with-class="max-w-2xl" @close="emit('close')">
    <template #header>
      <h3 class="font-serif text-2xl font-bold tracking-wide text-white">Elegir ejercicios</h3>
      <p class="mt-1 text-sm text-amber-100/80">Puedes marcar varios. Cada uno se sumará al plan.</p>
    </template>
    <template #content>
      <div class="space-y-4">
        <input
          :value="exerciseStore.searchQuery"
          type="search"
          placeholder="Consultar ejercicios por nombre, grupo o dificultad..."
          class="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          @input="exerciseStore.setSearchQuery(($event.target as HTMLInputElement).value)"
        >

        <div class="relative min-h-48">
          <BaseLoading :is-loading="exerciseStore.isLoading" text="Cargando ejercicios..." />

        <BaseErrorDisplay
          v-if="exerciseStore.error && !exerciseStore.isLoading"
          title="No se pudo cargar la lista"
          :message="exerciseStore.error"
          mode="container"
          @retry="exerciseStore.fetchExercises"
        />

        <div
          v-else-if="!exerciseStore.isLoading && exerciseStore.filteredExercises.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <h3 class="mb-1 font-serif text-lg font-semibold text-stone-700">No hay ejercicios</h3>
          <p class="max-w-xs text-sm text-stone-400">Ajusta la consulta o registra ejercicios en el Coliseo.</p>
        </div>

        <div v-else-if="!exerciseStore.isLoading" class="space-y-3">
          <div
            v-for="(exercise, index) in exerciseStore.filteredExercises"
            :key="exercise.id"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0 }"
            :transition="{ duration: 320, delay: index * 55, ease: [0.16, 1, 0.3, 1] }"
          >
            <ExercisePickerCard
              :name="exercise.name"
              :muscle-group="exercise.muscle_group"
              :difficulty="exercise.difficulty"
              :is-selected="selectedIds.includes(exercise.id)"
              @toggle="emit('toggle', exercise.id)"
            />
          </div>
        </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
