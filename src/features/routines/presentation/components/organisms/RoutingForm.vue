<script setup lang="ts">
// ============================================================
// ORGANISM - Routine Form Component
// ============================================================
// Formulario completo con HTTP POST integrado, modales de
// loading y éxito, usando axios + motion para animaciones.
// ============================================================

import axios from 'axios'
import { computed, ref } from 'vue'
import type { RoutineFormState, RoutineValidationErrors } from '../../../domain/entities/Routine.types'
import BaseButton from '../atoms/BaseButton.vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import FormField from '../molecules/FormField.vue'
import TimePicker from '../molecules/TimePicker.vue'

// Axios instance para rutinas: sin baseURL para que Vite proxy lo enrute a :8081
const routineApi = axios.create({
  headers: { 'Content-Type': 'application/json' }
})

interface Props {
  formState: RoutineFormState
  errors?: RoutineValidationErrors
  disabled?: boolean
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  disabled: false,
  isEditing: false
})

const emit = defineEmits<{
  'update:formState': [value: RoutineFormState]
  submit: []
  cancel: []
  routineCreated: [routine: any]
}>()

// ============================================================
// STATE
// ============================================================

const isSubmitting = ref(false)
const showLoadingModal = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')
const createdRoutine = ref<any>(null)

// ============================================================
// COMPUTED
// ============================================================

const isFormValid = computed(() => {
  return (
    props.formState.name.trim().length >= 2 &&
    props.formState.time_minutes !== '' &&
    props.formState.time_minutes > 0
  )
})

const successMessages = [
  'La rutina ha sido registrada en los archivos del Coliseo. Que el entrenamiento comience.',
  'Un nuevo plan de entrenamiento se ha inscrito en los pergaminos de la biblioteca.',
  'Las directrices del entrenador quedan guardadas. Cada repetición cuenta hacia la victoria.',
  'Rutina registrada exitosamente. La disciplina es el puente entre metas y logros.',
  'La estrategia de entrenamiento ha sido archivada. Que la constancia forje resultados.'
]

const randomSuccessMessage = computed(() => {
  return successMessages[Math.floor(Math.random() * successMessages.length)]
})

// ============================================================
// METHODS
// ============================================================

function updateField<K extends keyof RoutineFormState>(field: K, value: RoutineFormState[K]) {
  emit('update:formState', { ...props.formState, [field]: value })
}

async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return

  // Mostrar modal de loading
  showLoadingModal.value = true
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // Preparar payload
    const payload = {
      name: props.formState.name.trim(),
      section: props.formState.section !== '' ? Number(props.formState.section) : null,
      repetitions: props.formState.repetitions !== '' ? Number(props.formState.repetitions) : null,
      time_minutes: Number(props.formState.time_minutes),
      notes: props.formState.notes.trim() || null
    }

    // Realizar petición POST (ruta relativa → Vite proxy → :8081)
    const response = await routineApi.post('/api/routines', payload)

    // Guardar rutina creada
    createdRoutine.value = response.data.data || response.data

    // Cerrar modal de loading y mostrar éxito
    showLoadingModal.value = false
    showSuccessModal.value = true

    // Emitir evento
    emit('routineCreated', createdRoutine.value)

  } catch (error: any) {
    // Cerrar modal de loading y mostrar error
    showLoadingModal.value = false
    showErrorModal.value = true

    if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Error desconocido al crear la rutina'
    }
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  if (isSubmitting.value) return
  emit('cancel')
}

function closeSuccessModal() {
  showSuccessModal.value = false
  createdRoutine.value = null

  // Limpiar formulario
  emit('update:formState', {
    name: '',
    section: '',
    repetitions: '',
    time_minutes: '',
    notes: ''
  })
}

function closeErrorModal() {
  showErrorModal.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- ============================================================ -->
    <!-- FORM CARD -->
    <!-- ============================================================ -->
    <div
      class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-6 py-6 shadow-xl shadow-amber-100/60">
      <!-- Decorative Background -->
      <div class="pointer-events-none absolute right-0 top-0 opacity-10">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          <circle cx="100" cy="-10" r="60" fill="#f59e0b" />
        </svg>
      </div>

      <!-- Form Fields -->
      <div class="space-y-5">
        <!-- Nombre de la Rutina -->
        <FormField label="Nombre de la rutina" :model-value="formState.name" placeholder="Ej: Rutina de pecho y tríceps"
          :disabled="disabled || isSubmitting" :error="errors.name" :required="true"
          @update:model-value="updateField('name', $event as string)" />

        <!-- Sección -->
        <FormField label="Sección" type="number" :model-value="formState.section" placeholder="Ej: 1, 2, 3..."
          :disabled="disabled || isSubmitting" :error="errors.section" hint="Opcional" :min="1" :max="100"
          @update:model-value="updateField('section', $event as number | '')" />

        <!-- Repeticiones -->
        <FormField label="Repeticiones" type="number" :model-value="formState.repetitions"
          placeholder="Ej: 12, 15, 20..." :disabled="disabled || isSubmitting" :error="errors.repetitions"
          hint="Opcional" :min="1" :max="1000"
          @update:model-value="updateField('repetitions', $event as number | '')" />

        <!-- Tiempo -->
        <div class="space-y-2">
          <label class="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
            Tiempo
            <span class="text-red-500">*</span>
          </label>
          <TimePicker :model-value="formState.time_minutes" :disabled="disabled || isSubmitting"
            :error="errors.time_minutes" @update:model-value="updateField('time_minutes', $event)" />
          <div v-if="errors.time_minutes?.length" class="flex items-center gap-1.5 text-red-600 text-xs">
            <svg class="w-3.5 h-3.5 shrink-0 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errors.time_minutes[0] }}</span>
          </div>
        </div>

        <!-- Notas -->
        <FormField label="Notas" type="textarea" :model-value="formState.notes"
          placeholder="Instrucciones adicionales, consejos, recomendaciones..." :disabled="disabled || isSubmitting"
          :error="errors.notes" hint="Opcional" :rows="3" :max-length="500"
          @update:model-value="updateField('notes', $event as string)" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- ACTION BUTTONS -->
    <!-- ============================================================ -->
    <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6 flex items-center justify-between">
      <BaseButton variant="secondary" icon="arrow-left" :disabled="disabled || isSubmitting" @click="handleCancel">
        Cancelar
      </BaseButton>

      <BaseButton variant="primary" icon="save" :disabled="!isFormValid || disabled || isSubmitting"
        :loading="isSubmitting" @click="handleSubmit">
        {{ isEditing ? 'Actualizar Rutina' : 'Crear Rutina' }}
      </BaseButton>
    </div>

    <!-- ============================================================ -->
    <!-- LOADING MODAL -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showLoadingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />

          <!-- Modal Content -->
          <div v-motion :initial="{ opacity: 0, scale: 0.9, y: 20 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.9, y: 20 }"
            class="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <!-- Animated Spinner -->
            <div class="relative mx-auto w-20 h-20 mb-6">
              <!-- Outer ring -->
              <div v-motion :initial="{ rotate: 0 }"
                :enter="{ rotate: 360, transition: { repeat: Infinity, duration: 2, ease: 'linear' } }"
                class="absolute inset-0 border-4 border-amber-200 rounded-full" />
              <!-- Inner spinner -->
              <div v-motion :initial="{ rotate: 0 }"
                :enter="{ rotate: -360, transition: { repeat: Infinity, duration: 1.5, ease: 'linear' } }"
                class="absolute inset-2 border-4 border-transparent border-t-amber-500 rounded-full" />
              <!-- Center icon -->
              <div class="absolute inset-0 flex items-center justify-center">
                <BaseIcon name="timer" size="lg" color="amber" />
              </div>
            </div>

            <!-- Loading Text -->
            <h3 v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
              class="text-xl font-bold font-serif text-stone-900 mb-2">
              Registrando Rutina
            </h3>
            <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 0.4 } }"
              class="text-sm text-stone-500">
              Guardando en los archivos del Coliseo...
            </p>

            <!-- Animated dots -->
            <div class="flex justify-center gap-1.5 mt-4">
              <div v-motion :initial="{ scale: 0.5, opacity: 0.3 }"
                :enter="{ scale: 1, opacity: 1, transition: { repeat: Infinity, repeatType: 'reverse', duration: 0.6, delay: 0 } }"
                class="w-2 h-2 bg-amber-500 rounded-full" />
              <div v-motion :initial="{ scale: 0.5, opacity: 0.3 }"
                :enter="{ scale: 1, opacity: 1, transition: { repeat: Infinity, repeatType: 'reverse', duration: 0.6, delay: 0.2 } }"
                class="w-2 h-2 bg-amber-500 rounded-full" />
              <div v-motion :initial="{ scale: 0.5, opacity: 0.3 }"
                :enter="{ scale: 1, opacity: 1, transition: { repeat: Infinity, repeatType: 'reverse', duration: 0.6, delay: 0.4 } }"
                class="w-2 h-2 bg-amber-500 rounded-full" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================================ -->
    <!-- SUCCESS MODAL -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" @click="closeSuccessModal" />

          <!-- Modal Content -->
          <div v-motion :initial="{ opacity: 0, scale: 0.9, y: 20 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.9, y: 20 }"
            class="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center overflow-hidden">
            <!-- Success Background Decoration -->
            <div v-motion :initial="{ scale: 0, opacity: 0 }"
              :enter="{ scale: 1, opacity: 0.1, transition: { delay: 0.3, duration: 0.5 } }"
              class="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500 rounded-full" />
            <div v-motion :initial="{ scale: 0, opacity: 0 }"
              :enter="{ scale: 1, opacity: 0.05, transition: { delay: 0.4, duration: 0.5 } }"
              class="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500 rounded-full" />

            <!-- Success Icon with Animation -->
            <div v-motion :initial="{ scale: 0, rotate: -180 }"
              :enter="{ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 15, delay: 0.2 } }"
              class="relative mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full 
                     flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
              <svg v-motion :initial="{ pathLength: 0 }"
                :enter="{ pathLength: 1, transition: { delay: 0.5, duration: 0.5 } }" class="w-10 h-10 text-white"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <!-- Success Title -->
            <h3 v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
              class="text-2xl font-bold font-serif text-stone-900 mb-2">
              Rutina Creada
            </h3>

            <!-- Success Message -->
            <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 0.5 } }"
              class="text-sm text-stone-600 mb-6 leading-relaxed">
              {{ randomSuccessMessage }}
            </p>

            <!-- Routine Info Card -->
            <div v-if="createdRoutine" v-motion :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.6 } }"
              class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
              <div class="flex items-center gap-2 mb-3">
                <BaseIcon name="timer" size="sm" color="amber" />
                <span class="text-sm font-semibold text-amber-800">{{ createdRoutine.name }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs text-stone-600">
                <div v-if="createdRoutine.section">
                  <span class="text-stone-400">Sección:</span>
                  <span class="ml-1 font-medium">{{ createdRoutine.section }}</span>
                </div>
                <div v-if="createdRoutine.repetitions">
                  <span class="text-stone-400">Repeticiones:</span>
                  <span class="ml-1 font-medium">{{ createdRoutine.repetitions }}</span>
                </div>
                <div>
                  <span class="text-stone-400">Tiempo:</span>
                  <span class="ml-1 font-medium">{{ createdRoutine.time_minutes }} min</span>
                </div>
                <div>
                  <span class="text-stone-400">ID:</span>
                  <span class="ml-1 font-medium font-mono text-[10px]">{{ createdRoutine.id }}</span>
                </div>
              </div>
            </div>

            <!-- Close Button -->
            <BaseButton v-motion :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.7 } }" variant="primary" class="w-full"
              @click="closeSuccessModal">
              <BaseIcon name="check" size="sm" />
              <span>Entendido</span>
            </BaseButton>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================================ -->
    <!-- ERROR MODAL -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showErrorModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" @click="closeErrorModal" />

          <!-- Modal Content -->
          <div v-motion :initial="{ opacity: 0, scale: 0.9, y: 20 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
            :leave="{ opacity: 0, scale: 0.9, y: 20 }"
            class="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <!-- Error Icon -->
            <div v-motion :initial="{ scale: 0 }"
              :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200, damping: 15, delay: 0.2 } }" class="mx-auto w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full 
                     flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
              <BaseIcon name="alert-circle" size="lg" color="red" />
            </div>

            <!-- Error Title -->
            <h3 v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
              class="text-xl font-bold font-serif text-stone-900 mb-2">
              Error al Crear
            </h3>

            <!-- Error Message -->
            <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { delay: 0.4 } }"
              class="text-sm text-stone-600 mb-6">
              {{ errorMessage }}
            </p>

            <!-- Close Button -->
            <BaseButton v-motion :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.5 } }" variant="secondary" class="w-full"
              @click="closeErrorModal">
              <BaseIcon name="x" size="sm" />
              <span>Cerrar</span>
            </BaseButton>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
