<script setup lang="ts">
// ============================================================
// MOLECULE - Routine Edit Modal
// ============================================================

import { ref, watch } from 'vue'
import axios from 'axios'
import type { Routine, RoutineFormState } from '../../../domain/entities/Routine.types'
import BaseIcon from '../atoms/BaseIcon.vue'

interface Props {
  routine: Routine | null
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: [routine: Routine]
}>()

const routineApi = axios.create({
  headers: { 'Content-Type': 'application/json' }
})

const formState = ref<RoutineFormState>({
  name: '',
  section: '',
  repetitions: '',
  time_minutes: '',
  notes: ''
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

watch(() => props.routine, (r) => {
  if (r) {
    formState.value = {
      name: r.name,
      section: r.section ?? '',
      repetitions: r.repetitions ?? '',
      time_minutes: r.time_minutes,
      notes: r.notes
    }
  }
}, { immediate: true })

function updateField<K extends keyof RoutineFormState>(field: K, value: RoutineFormState[K]) {
  formState.value = { ...formState.value, [field]: value }
}

async function handleSubmit() {
  if (!props.routine || isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      name: formState.value.name.trim(),
      section: formState.value.section !== '' ? Number(formState.value.section) : null,
      repetitions: formState.value.repetitions !== '' ? Number(formState.value.repetitions) : null,
      time_minutes: Number(formState.value.time_minutes),
      notes: formState.value.notes.trim() || null
    }

    const response = await routineApi.put(`/api/routines/${props.routine.id}`, payload)
    const updated = response.data.data || response.data

    emit('updated', updated)
    showSuccess.value = true

    setTimeout(() => {
      showSuccess.value = false
      emit('close')
    }, 2000)
  } catch (error: any) {
    showError.value = true
    if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Error al actualizar la rutina'
    }
  } finally {
    isSubmitting.value = false
  }
}

function closeError() {
  showError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="visible && routine" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="!isSubmitting && emit('close')">
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
                    <BaseIcon name="edit" size="md" color="white" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold font-serif text-stone-900">Editar Rutina</h2>
                    <p class="text-xs text-stone-400 font-mono mt-0.5">{{ routine.id }}</p>
                  </div>
                </div>
                <button @click="emit('close')" :disabled="isSubmitting"
                  class="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400
                         hover:bg-stone-100 hover:text-stone-600 transition-colors duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed">
                  <BaseIcon name="x" size="sm" color="stone" />
                </button>
              </div>
            </div>

            <!-- Form Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- Nombre -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Nombre</label>
                <input :value="formState.name" @input="updateField('name', ($event.target as HTMLInputElement).value)"
                  :disabled="isSubmitting"
                  class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700
                         focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                         disabled:opacity-50 transition-all duration-200" />
              </div>

              <!-- Seccion & Repeticiones -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Seccion</label>
                  <input type="number" :value="formState.section"
                    @input="updateField('section', ($event.target as HTMLInputElement).valueAsNumber || '')"
                    :disabled="isSubmitting" min="1"
                    class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700
                           focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                           disabled:opacity-50 transition-all duration-200" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Repeticiones</label>
                  <input type="number" :value="formState.repetitions"
                    @input="updateField('repetitions', ($event.target as HTMLInputElement).valueAsNumber || '')"
                    :disabled="isSubmitting" min="1"
                    class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700
                           focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                           disabled:opacity-50 transition-all duration-200" />
                </div>
              </div>

              <!-- Tiempo -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Tiempo <span class="text-red-500">*</span>
                </label>
                <input type="number" :value="formState.time_minutes"
                  @input="updateField('time_minutes', ($event.target as HTMLInputElement).valueAsNumber || '')"
                  :disabled="isSubmitting" min="1" max="600" placeholder="Minutos"
                  class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700
                         focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                         disabled:opacity-50 transition-all duration-200" />
              </div>

              <!-- Notas -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Notas</label>
                <textarea :value="formState.notes"
                  @input="updateField('notes', ($event.target as HTMLTextAreaElement).value)"
                  :disabled="isSubmitting" rows="3" maxlength="500"
                  class="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700
                         focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                         disabled:opacity-50 transition-all duration-200 resize-none" />
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
              <button @click="emit('close')" :disabled="isSubmitting"
                class="flex-1 py-2.5 bg-stone-100 text-stone-600 font-semibold rounded-xl
                       hover:bg-stone-200 transition-colors duration-200 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed">
                Cancelar
              </button>
              <button @click="handleSubmit" :disabled="isSubmitting || !formState.name.trim() || !formState.time_minutes"
                class="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold 
                       rounded-xl shadow-lg shadow-amber-500/30
                       hover:from-amber-600 hover:to-amber-700 hover:shadow-xl
                       transition-all duration-200 text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}</span>
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
      <div v-if="showSuccess" class="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center pointer-events-auto">
          <div class="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full 
                      flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
            <BaseIcon name="check" size="lg" color="white" />
          </div>
          <h3 class="text-lg font-bold font-serif text-stone-900 mb-1">Rutina Actualizada</h3>
          <p class="text-sm text-stone-500">Los cambios se han guardado correctamente.</p>
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
          <h3 class="text-lg font-bold font-serif text-stone-900 mb-1">Error al Actualizar</h3>
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
