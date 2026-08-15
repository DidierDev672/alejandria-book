<script setup lang="ts">
// ============================================================
// MOLECULE - Routine Detail Modal
// ============================================================

import type { Routine } from '../../../domain/entities/Routine.types'
import BaseIcon from '../atoms/BaseIcon.vue'

interface Props {
  routine: Routine | null
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="visible && routine" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('close')">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

        <!-- Modal -->
        <Transition enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="visible && routine"
            class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden">

            <!-- Header -->
            <div class="relative px-6 pt-6 pb-4 bg-gradient-to-br from-amber-50 to-orange-50">
              <div class="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-200/30 blur-2xl" />
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl 
                              flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <BaseIcon name="timer" size="md" color="white" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold font-serif text-stone-900">{{ routine.name }}</h2>
                    <p class="text-xs text-stone-400 font-mono mt-0.5">{{ routine.id }}</p>
                  </div>
                </div>
                <button @click="emit('close')"
                  class="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400
                         hover:bg-stone-100 hover:text-stone-600 transition-colors duration-150">
                  <BaseIcon name="x" size="sm" color="stone" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- Sección -->
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center">
                  <span class="text-sm font-bold text-stone-600">
                    {{ routine.section ?? '—' }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-stone-400 uppercase tracking-wider">Sección</p>
                  <p class="text-sm font-semibold text-stone-700">
                    {{ routine.section != null ? `Sección ${routine.section}` : 'No asignada' }}
                  </p>
                </div>
              </div>

              <!-- Repeticiones -->
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <span class="text-sm font-bold text-emerald-600">
                    {{ routine.repetitions ?? '—' }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-stone-400 uppercase tracking-wider">Repeticiones</p>
                  <p class="text-sm font-semibold text-stone-700">
                    {{ routine.repetitions != null ? `${routine.repetitions} repeticiones` : 'No definidas' }}
                  </p>
                </div>
              </div>

              <!-- Tiempo -->
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BaseIcon name="timer" size="sm" color="amber" />
                </div>
                <div>
                  <p class="text-xs text-stone-400 uppercase tracking-wider">Tiempo</p>
                  <p class="text-sm font-semibold text-stone-700">{{ formatTime(routine.time_minutes) }}</p>
                </div>
              </div>

              <!-- Notas -->
              <div class="pt-2 border-t border-stone-100">
                <p class="text-xs text-stone-400 uppercase tracking-wider mb-1.5">Notas</p>
                <p class="text-sm text-stone-600 leading-relaxed">
                  {{ routine.notes || 'Sin notas' }}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-stone-50 border-t border-stone-100">
              <button @click="emit('close')"
                class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold 
                       rounded-xl shadow-lg shadow-amber-500/30
                       hover:from-amber-600 hover:to-amber-700 hover:shadow-xl
                       transition-all duration-200 text-sm">
                Cerrar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
