<script setup lang="ts">
// ============================================================
// ORGANISM - Workout detail modal (Atomic Design composition)
// ============================================================

import type { MemberRoutine } from '../../../domain/entities/MemberRoutine.types'
import type { MemberSummary } from '../../../domain/entities/MemberSummary.types'
import type { RoutineBaseSummary } from '../../../domain/entities/RoutineBase.types'
import type { Exercise } from '../../../domain/entities/Exercise.types'
import OrangeGradientBadge from '../atoms/OrangeGradientBadge.vue'
import WorkoutDetailMemberBlock from '../molecules/WorkoutDetailMemberBlock.vue'
import WorkoutDetailRoutineBlock from '../molecules/WorkoutDetailRoutineBlock.vue'
import WorkoutDetailMetaBlock from '../molecules/WorkoutDetailMetaBlock.vue'
import WorkoutDetailExerciseCard from '../molecules/WorkoutDetailExerciseCard.vue'

defineProps<{
  visible: boolean
  loading?: boolean
  error?: string | null
  workout: MemberRoutine | null
  member: MemberSummary | null
  routine: RoutineBaseSummary | null
  exercises: Exercise[]
}>()

defineEmits<{
  (e: 'close'): void
}>()
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
        v-if="visible"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workout-detail-title"
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
                  id="workout-detail-title"
                  class="text-xl font-bold font-serif text-stone-900 truncate"
                >
                  {{ workout?.name || 'Detalle de rutina' }}
                </h2>
                <OrangeGradientBadge
                  v-if="workout?.status"
                  :label="workout.status"
                />
              </div>
              <p
                v-if="workout?.routine_id"
                class="text-xs font-mono text-stone-400 truncate"
                :title="workout.routine_id"
              >
                routine_id · {{ workout.routine_id }}
              </p>
            </div>

            <button
              type="button"
              class="shrink-0 w-9 h-9 rounded-xl border border-amber-200
                     flex items-center justify-center text-stone-500
                     hover:bg-amber-50 hover:text-stone-800 transition-colors"
              aria-label="Cerrar"
              @click="$emit('close')"
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
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <!-- Loading -->
            <div
              v-if="loading && !workout"
              class="flex flex-col items-center justify-center py-12"
            >
              <div
                class="w-8 h-8 border-4 border-amber-200 border-t-amber-600
                       rounded-full animate-spin"
              />
              <span class="mt-3 text-sm text-stone-500">Cargando detalle...</span>
            </div>

            <!-- Error -->
            <div
              v-else-if="error && !workout"
              class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {{ error }}
            </div>

            <template v-else-if="workout">
              <WorkoutDetailMetaBlock :workout="workout" />

              <div class="h-px bg-amber-100" />

              <WorkoutDetailMemberBlock
                :member="member"
                :member-id="workout.member_id"
                :loading="loading"
              />

              <div class="h-px bg-amber-100" />

              <WorkoutDetailRoutineBlock
                :routine-id="workout.routine_id"
                :routine="routine"
                :loading="loading"
              />

              <div class="h-px bg-amber-100" />

              <!-- Exercises -->
              <section class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-sm font-bold font-serif text-stone-900">
                    Lista de ejercicios
                  </h3>
                  <OrangeGradientBadge
                    :label="`${exercises.length} ejercicio${exercises.length === 1 ? '' : 's'}`"
                  />
                </div>

                <div
                  v-if="loading && exercises.length === 0"
                  class="space-y-3"
                >
                  <div
                    v-for="n in 2"
                    :key="n"
                    class="h-28 rounded-xl bg-amber-50 animate-pulse border border-amber-100"
                  />
                </div>

                <div v-else-if="exercises.length > 0" class="space-y-3">
                  <WorkoutDetailExerciseCard
                    v-for="exercise in exercises"
                    :key="exercise.id"
                    :exercise="exercise"
                  />
                </div>

                <p v-else class="text-sm text-stone-500 italic">
                  Esta asignación no tiene ejercicios vinculados.
                </p>
              </section>
            </template>
          </div>

          <!-- Footer -->
          <div
            class="shrink-0 px-6 py-4 border-t border-amber-100 bg-[#FFFBF5]
                   flex justify-end"
          >
            <button
              type="button"
              class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700
                     text-white text-sm font-semibold px-5 py-2.5 rounded-xl
                     shadow-sm transition-colors"
              @click="$emit('close')"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
