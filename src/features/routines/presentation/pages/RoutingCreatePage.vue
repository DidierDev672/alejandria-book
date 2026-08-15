<script setup lang="ts">
// ============================================================
// PAGE - Routine Create Page
// ============================================================

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoutineStore } from '../../application/stores/useRoutineStore'
import { RoutineDomainService } from '../../domain/services/RoutingDomainService'
import RoutineForm from '../components/organisms/RoutingForm.vue'
import BaseIcon from '../components/atoms/BaseIcon.vue'
import type { RoutineFormState, RoutineValidationErrors } from '../../domain/entities/Routine.types'

// ============================================================
// COMPOSITION & STATE
// ============================================================

const router = useRouter()
const routineStore = useRoutineStore()

const formState = ref<RoutineFormState>(routineStore.createEmptyFormState())
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref(false)
const validationErrors = ref<RoutineValidationErrors>({})

// ============================================================
// COMPUTED
// ============================================================

const pageTitle = computed(() => 'Rutinas Genéricas')

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
// VALIDATION
// ============================================================

function validateForm(): boolean {
  const errors: RoutineValidationErrors = {}
  let hasErrors = false

  // Name validation
  if (!formState.value.name.trim()) {
    errors.name = ['El nombre de la rutina es obligatorio']
    hasErrors = true
  } else if (!RoutineDomainService.isValidName(formState.value.name)) {
    errors.name = ['El nombre debe tener entre 2 y 100 caracteres']
    hasErrors = true
  }

  // Time validation
  if (formState.value.time_minutes === '' || formState.value.time_minutes === 0) {
    errors.time_minutes = ['El tiempo es obligatorio']
    hasErrors = true
  } else if (!RoutineDomainService.isValidTime(formState.value.time_minutes)) {
    errors.time_minutes = ['El tiempo debe estar entre 1 y 600 minutos']
    hasErrors = true
  }

  // Section validation (optional)
  if (formState.value.section !== '' && !RoutineDomainService.isValidSection(formState.value.section)) {
    errors.section = ['La sección debe estar entre 1 y 100']
    hasErrors = true
  }

  // Repetitions validation (optional)
  if (formState.value.repetitions !== '' && !RoutineDomainService.isValidRepetitions(formState.value.repetitions)) {
    errors.repetitions = ['Las repeticiones deben estar entre 1 y 1000']
    hasErrors = true
  }

  validationErrors.value = errors
  return !hasErrors
}

// ============================================================
// ACTIONS
// ============================================================

async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true
  submitError.value = null
  submitSuccess.value = false

  try {
    const dto = RoutineDomainService.formStateToDTO(formState.value)
    const newRoutine = await routineStore.createRoutine(dto)

    if (newRoutine) {
      submitSuccess.value = true
      formState.value = routineStore.createEmptyFormState()
      validationErrors.value = {}

      // Redirect after 2 seconds
      setTimeout(() => {
        submitSuccess.value = false
      }, 3000)
    }
  } catch (error: any) {
    submitError.value = error.message || 'Error al crear la rutina'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.')) {
    router.back()
  }
}

function handleFormUpdate(newState: RoutineFormState) {
  formState.value = newState
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push({ name: 'login' })
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] px-6 py-8">
    <!-- Decorative Background Elements -->
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

    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 backdrop-blur-sm px-6 py-5 shadow-xl shadow-orange-200/60">
        <!-- Chromatic Orange Gradient Overlay -->
        <div class="pointer-events-none absolute inset-0 opacity-30">
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 blur-3xl"></div>
          <div class="absolute -left-8 top-1/2 h-32 w-32 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 blur-2xl"></div>
          <div class="absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-gradient-to-t from-orange-300 to-amber-300 blur-xl"></div>
        </div>

        <div class="flex items-center gap-4 relative z-10">
          <!-- Timer Icon with Hover Animation -->
          <div
            v-motion
            :initial="{ scale: 1 }"
            :hovered="{ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.5, ease: 'easeInOut' } }"
            class="w-14 h-14 bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 rounded-2xl 
                   flex items-center justify-center shadow-lg shadow-orange-500/30 cursor-pointer"
          >
            <BaseIcon name="timer" size="lg" color="amber" />
          </div>
          
          <div class="flex-1">
            <h1 class="text-3xl font-bold font-serif text-stone-900">{{ pageTitle }}</h1>
            <p class="text-sm text-stone-500 mt-0.5">
              Define las rutinas de entrenamiento para los gladiadores del Coliseo
            </p>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="submitSuccess" 
             class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
          <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <BaseIcon name="check" size="md" color="green" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-emerald-800">Rutina creada exitosamente</p>
            <p class="text-sm text-emerald-600 mt-1">{{ randomSuccessMessage }}</p>
          </div>
          <button 
            @click="submitSuccess = false" 
            class="text-emerald-500 hover:text-emerald-700 transition-colors"
          >
            <BaseIcon name="x" size="sm" />
          </button>
        </div>
      </Transition>

      <!-- Error Message -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="submitError" 
             class="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <BaseIcon name="alert-circle" size="md" color="red" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-red-800">Error al crear la rutina</p>
            <p class="text-sm text-red-600 mt-1">{{ submitError }}</p>
          </div>
          <button 
            @click="submitError = null" 
            class="text-red-500 hover:text-red-700 transition-colors"
          >
            <BaseIcon name="x" size="sm" />
          </button>
        </div>
      </Transition>

      <!-- Form -->
      <RoutineForm
        :form-state="formState"
        :errors="validationErrors"
        :disabled="isSubmitting"
        @update:form-state="handleFormUpdate"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
