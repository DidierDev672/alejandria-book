<script setup lang="ts">
// ============================================================
// MOLECULE - Routine Delete Confirmation Modal
// ============================================================
// Uses loss aversion, commitment escalation, and irreversibility
// psychological principles to inform the user before deleting.
// ============================================================

import { ref } from 'vue'
import axios from 'axios'
import type { Routine } from '../../../domain/entities/Routine.types'
import BaseIcon from '../atoms/BaseIcon.vue'

interface Props {
  routine: Routine | null
  visible: boolean
  totalRoutines?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalRoutines: 0
})

const emit = defineEmits<{
  close: []
  deleted: [id: string]
}>()

const routineApi = axios.create({
  headers: { 'Content-Type': 'application/json' }
})

const isDeleting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const confirmChecked = ref(false)

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysSince(dateStr: string): number {
  const created = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

async function handleDelete() {
  if (!props.routine || !confirmChecked.value || isDeleting.value) return

  isDeleting.value = true
  errorMessage.value = ''

  try {
    await routineApi.delete(`/api/routines/${props.routine.id}`)
    showSuccess.value = true

    emit('deleted', props.routine.id)

    setTimeout(() => {
      showSuccess.value = false
      emit('close')
    }, 2500)
  } catch (error: any) {
    showError.value = true
    if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Error al eliminar la rutina'
    }
  } finally {
    isDeleting.value = false
  }
}

function closeError() {
  showError.value = false
  errorMessage.value = ''
}

function resetState() {
  confirmChecked.value = false
  isDeleting.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0"
      @after-leave="resetState">
      <div v-if="visible && routine" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="!isDeleting && emit('close')">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" />

        <!-- Modal -->
        <Transition enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="visible && routine"
            class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden">

            <!-- Header - Danger Zone -->
            <div class="relative px-6 pt-6 pb-4 bg-gradient-to-br from-red-50 to-orange-50">
              <div class="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-red-200/30 blur-2xl" />
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl 
                              flex items-center justify-center shadow-lg shadow-red-500/30">
                    <BaseIcon name="trash" size="md" color="white" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold font-serif text-stone-900">Eliminar Rutina</h2>
                    <p class="text-xs text-red-500 font-medium mt-0.5">Accion irreversible</p>
                  </div>
                </div>
                <button @click="emit('close')" :disabled="isDeleting"
                  class="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400
                         hover:bg-stone-100 hover:text-stone-600 transition-colors duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed">
                  <BaseIcon name="x" size="sm" color="stone" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- Warning Banner -->
              <div class="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p class="text-sm font-semibold text-amber-800">Estas a punto de eliminar esta rutina</p>
                  <p class="text-xs text-amber-600 mt-0.5">Esta accion no se puede deshacer.</p>
                </div>
              </div>

              <!-- Routine Info -->
              <div class="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <div class="flex items-center gap-2 mb-3">
                  <BaseIcon name="timer" size="sm" color="amber" />
                  <span class="text-sm font-bold text-stone-900">{{ routine.name }}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <div v-if="routine.section">
                    <span class="text-stone-400">Seccion:</span>
                    <span class="ml-1 font-medium">{{ routine.section }}</span>
                  </div>
                  <div v-if="routine.repetitions">
                    <span class="text-stone-400">Repeticiones:</span>
                    <span class="ml-1 font-medium">{{ routine.repetitions }}</span>
                  </div>
                  <div>
                    <span class="text-stone-400">Tiempo:</span>
                    <span class="ml-1 font-medium">{{ formatTime(routine.time_minutes) }}</span>
                  </div>
                  <div>
                    <span class="text-stone-400">Creada:</span>
                    <span class="ml-1 font-medium">{{ formatDate(routine.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Consequences List -->
              <div class="space-y-2.5">
                <p class="text-xs font-bold text-stone-500 uppercase tracking-wider">Que perderas:</p>
                
                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p class="text-sm text-stone-600">
                    <span class="font-medium text-stone-800">El registro completo</span> de la rutina con todos sus datos y notas.
                  </p>
                </div>

                <div v-if="daysSince(routine.created_at) > 0" class="flex items-start gap-2.5">
                  <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p class="text-sm text-stone-600">
                    <span class="font-medium text-stone-800">{{ daysSince(routine.created_at) }} dias de historial</span> acumulado desde su creacion.
                  </p>
                </div>

                <div class="flex items-start gap-2.5">
                  <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p class="text-sm text-stone-600">
                    <span class="font-medium text-stone-800">El tiempo invertido</span> en definir esta estrategia de entrenamiento.
                  </p>
                </div>

                <div v-if="totalRoutines <= 2" class="flex items-start gap-2.5">
                  <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p class="text-sm text-stone-600">
                    <span class="font-medium text-stone-800">Reduciras tu coleccion</span> a solo {{ totalRoutines - 1 }} rutina{{ totalRoutines - 1 === 1 ? '' : 's' }}.
                  </p>
                </div>
              </div>

              <!-- Confirm Checkbox -->
              <label class="flex items-start gap-3 cursor-pointer group">
                <div class="relative flex items-center">
                  <input type="checkbox" v-model="confirmChecked" :disabled="isDeleting"
                    class="w-4 h-4 rounded border-stone-300 text-red-500 focus:ring-red-400 
                           disabled:opacity-50 cursor-pointer" />
                </div>
                <span class="text-sm text-stone-600 group-hover:text-stone-800 transition-colors">
                  Entiendo que esta accion es <span class="font-bold text-red-600">permanente</span> y no se puede deshacer
                </span>
              </label>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
              <button @click="emit('close')" :disabled="isDeleting"
                class="flex-1 py-2.5 bg-stone-100 text-stone-600 font-semibold rounded-xl
                       hover:bg-stone-200 transition-colors duration-200 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed">
                Mantener Rutina
              </button>
              <button @click="handleDelete" :disabled="!confirmChecked || isDeleting"
                class="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold 
                       rounded-xl shadow-lg shadow-red-500/30
                       hover:from-red-600 hover:to-red-700 hover:shadow-xl
                       transition-all duration-200 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <svg v-if="isDeleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{{ isDeleting ? 'Eliminando...' : 'Si, Eliminar' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ============================================================ -->
    <!-- SUCCESS FEEDBACK -->
    <!-- ============================================================ -->
    <Transition enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
      <div v-if="showSuccess" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
        <div class="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div class="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full 
                      flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
            <BaseIcon name="check" size="lg" color="white" />
          </div>
          <h3 class="text-lg font-bold font-serif text-stone-900 mb-1">Rutina Eliminada</h3>
          <p class="text-sm text-stone-500">La rutina ha sido removida de los archivos del Coliseo.</p>
        </div>
      </div>
    </Transition>

    <!-- ============================================================ -->
    <!-- ERROR FEEDBACK -->
    <!-- ============================================================ -->
    <Transition enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
      <div v-if="showError" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" @click="closeError" />
        <div class="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div class="mx-auto w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full 
                      flex items-center justify-center shadow-lg shadow-red-500/30 mb-4">
            <BaseIcon name="alert-circle" size="lg" color="white" />
          </div>
          <h3 class="text-lg font-bold font-serif text-stone-900 mb-1">Error al Eliminar</h3>
          <p class="text-sm text-stone-600 mb-4">{{ errorMessage }}</p>
          <button @click="closeError"
            class="w-full py-2.5 bg-stone-100 text-stone-600 font-semibold rounded-xl
                   hover:bg-stone-200 transition-colors duration-200 text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
