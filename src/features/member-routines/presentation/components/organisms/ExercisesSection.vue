<script setup lang="ts">
// ============================================================
// ORGANISM - Exercises Section
// Caja de borde naranja: mensaje motivacional, acción y ejercicios asignados
// ============================================================

import type { Exercise } from '../../../domain/entities/Exercise.types'
import ExerciseBadge from '../atoms/ExerciseBadge.vue'

defineProps<{
  exercises: Exercise[]
  disabled?: boolean
  error?: string
}>()

defineEmits<{
  (e: 'open'): void
  (e: 'remove', exerciseId: string): void
}>()
</script>

<template>
  <div
    :class="[
      'rounded-2xl border-2 bg-orange-50/40 p-6 space-y-5',
      error ? 'border-red-400' : 'border-orange-300/70',
    ]"
  >
    <!-- ══════════ Estado vacío: invitación motivacional ══════════ -->
    <div v-if="exercises.length === 0" class="text-center py-2 space-y-3">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600
                  flex items-center justify-center shadow-lg shadow-orange-500/30">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div class="max-w-md mx-auto">
        <h3 class="text-base font-semibold font-serif text-stone-800">
          Un gran plan se construye ejercicio por ejercicio
        </h3>
        <p class="text-sm text-stone-500 mt-1.5 leading-relaxed">
          Los entrenadores que registran cada movimiento no dejan nada al azar: le dan a su gladiador
          una hoja de ruta clara y medible. Cada ejercicio que agregas hoy es una prueba concreta de
          progreso que tu atleta podrá ver mañana. Empieza con el primero.
        </p>
      </div>

      <button
        type="button"
        @click="$emit('open')"
        :disabled="disabled"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600
               hover:from-orange-600 hover:via-amber-700 hover:to-orange-700
               text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/30
               transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar ejercicios
      </button>

      <p v-if="error" class="text-xs text-red-600 font-medium">{{ error }}</p>
    </div>

    <!-- ══════════ Estado con ejercicios asignados ══════════ -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold font-serif text-stone-800">Ejercicios asignados</h3>
          <p class="text-xs text-stone-500 mt-0.5">
            {{ exercises.length }} ejercicio{{ exercises.length === 1 ? '' : 's' }} en esta rutina
          </p>
        </div>
        <button
          type="button"
          @click="$emit('open')"
          :disabled="disabled"
          class="inline-flex items-center gap-1.5 shrink-0 border border-orange-500 text-orange-700
                 hover:bg-orange-50 text-xs font-semibold px-3 py-1.5 rounded-lg
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar más
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <ExerciseBadge
          v-for="exercise in exercises"
          :key="exercise.id"
          :name="exercise.name"
          :muscle-group="exercise.muscleGroup"
          :disabled="disabled"
          @remove="$emit('remove', exercise.id)"
        />
      </div>
    </div>
  </div>
</template>
