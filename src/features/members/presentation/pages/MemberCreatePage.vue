<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MemberBasicInfoForm from '../components/organisms/MemberBasicInfoForm.vue'
import MemberHealthForm from '../components/organisms/MemberHealthForm.vue'
import { useMemberStore } from '../../application/stores/useMemberStore'
import { MemberDomainService } from '../../domain/services/MemberDomainService'
import type { MemberValidationErrors } from '../../domain/entities/Member.types'

// ============================================================
// COMPOSITION & STATE
// ============================================================

const router = useRouter()
const memberStore = useMemberStore()

const currentStep = ref(1)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const validationErrors = ref<MemberValidationErrors>({})

// Form state
const formState = ref(memberStore.createEmptyFormState())

// ============================================================
// COMPUTED
// ============================================================

const totalSteps = 2

const isStep1Valid = computed(() => {
  return (
    formState.value.basicInfo.name_full.trim() !== '' &&
    formState.value.basicInfo.type_document !== '' &&
    formState.value.basicInfo.number_document.trim() !== '' &&
    formState.value.basicInfo.date_of_birth !== '' &&
    formState.value.basicInfo.gender !== '' &&
    formState.value.basicInfo.phone_number.trim() !== '' &&
    formState.value.basicInfo.address.trim() !== '' &&
    formState.value.bodyMetrics.weight_kg !== '' &&
    formState.value.bodyMetrics.height_cm !== ''
  )
})

const isStep2Valid = computed(() => {
  return (
    formState.value.mentalHealth.mood !== '' &&
    formState.value.mentalHealth.sleep_hours !== ''
  )
})

const canProceedToStep2 = computed(() => isStep1Valid.value)
const canSubmit = computed(() => isStep1Valid.value && isStep2Valid.value)

const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100
})

// ============================================================
// METHODS
// ============================================================

function validateCurrentStep(): boolean {
  validationErrors.value = {}
  
  if (currentStep.value === 1) {
    return validateStep1()
  } else if (currentStep.value === 2) {
    return validateStep2()
  }
  
  return true
}

function validateStep1(): boolean {
  const errors: MemberValidationErrors = { basicInfo: {}, bodyMetrics: {} }
  
  // Basic info validation
  if (!formState.value.basicInfo.name_full.trim()) {
    errors.basicInfo!.name_full = ['El nombre completo es obligatorio']
  } else if (formState.value.basicInfo.name_full.trim().length < 2) {
    errors.basicInfo!.name_full = ['El nombre debe tener al menos 2 caracteres']
  }
  
  if (!formState.value.basicInfo.type_document) {
    errors.basicInfo!.type_document = ['El tipo de documento es obligatorio']
  }
  
  if (!formState.value.basicInfo.number_document.trim()) {
    errors.basicInfo!.number_document = ['El número de documento es obligatorio']
  } else if (!/^\d+$/.test(formState.value.basicInfo.number_document.trim())) {
    errors.basicInfo!.number_document = ['El número de documento solo debe contener números']
  }
  
  if (!formState.value.basicInfo.date_of_birth) {
    errors.basicInfo!.date_of_birth = ['La fecha de nacimiento es obligatoria']
  } else if (!MemberDomainService.isValidAge(formState.value.basicInfo.date_of_birth)) {
    errors.basicInfo!.date_of_birth = ['La edad debe estar entre 12 y 120 años']
  }
  
  if (!formState.value.basicInfo.gender) {
    errors.basicInfo!.gender = ['El género es obligatorio']
  }
  
  if (!formState.value.basicInfo.phone_number.trim()) {
    errors.basicInfo!.phone_number = ['El teléfono es obligatorio']
  }
  
  if (!formState.value.basicInfo.address.trim()) {
    errors.basicInfo!.address = ['La dirección es obligatoria']
  }
  
  // Body metrics validation
  const weight = Number(formState.value.bodyMetrics.weight_kg)
  const height = Number(formState.value.bodyMetrics.height_cm)
  
  if (!weight || weight <= 0) {
    errors.bodyMetrics!.weight_kg = ['El peso es obligatorio y debe ser mayor a 0']
  } else if (weight < 1 || weight > 500) {
    errors.bodyMetrics!.weight_kg = ['El peso debe estar entre 1 y 500 kg']
  }
  
  if (!height || height <= 0) {
    errors.bodyMetrics!.height_cm = ['La altura es obligatoria y debe ser mayor a 0']
  } else if (height < 50 || height > 250) {
    errors.bodyMetrics!.height_cm = ['La altura debe estar entre 50 y 250 cm']
  }
  
  // Optional metrics validation
  const bodyFat = Number(formState.value.bodyMetrics.body_fat_percentage)
  if (bodyFat && (bodyFat < 1 || bodyFat > 50)) {
    errors.bodyMetrics!.body_fat_percentage = ['El porcentaje de grasa debe estar entre 1% y 50%']
  }
  
  const hasErrors = Object.keys(errors.basicInfo!).length > 0 || Object.keys(errors.bodyMetrics!).length > 0
  if (hasErrors) {
    validationErrors.value = errors
  }
  
  return !hasErrors
}

function validateStep2(): boolean {
  const errors: MemberValidationErrors = { mentalHealth: {} }
  
  if (!formState.value.mentalHealth.mood) {
    errors.mentalHealth!.mood = ['El estado de ánimo es obligatorio']
  }
  
  const sleepHours = Number(formState.value.mentalHealth.sleep_hours)
  if (!sleepHours || sleepHours <= 0) {
    errors.mentalHealth!.sleep_hours = ['Las horas de sueño son obligatorias']
  } else if (sleepHours < 1 || sleepHours > 24) {
    errors.mentalHealth!.sleep_hours = ['Las horas de sueño deben estar entre 1 y 24']
  }
  
  const hasErrors = Object.keys(errors.mentalHealth!).length > 0
  if (hasErrors) {
    validationErrors.value = errors
  }
  
  return !hasErrors
}

function nextStep() {
  if (validateCurrentStep() && currentStep.value < totalSteps) {
    currentStep.value++
    scrollToTop()
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
    scrollToTop()
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  if (!validateCurrentStep() || !canSubmit.value) {
    return
  }
  
  isSubmitting.value = true
  submitError.value = null
  
  try {
    const memberDTO = MemberDomainService.formStateToDTO(formState.value)
    const newMember = await memberStore.createMember(memberDTO)
    
    if (newMember) {
      // Success - redirect to member list or detail
      router.push({ 
        name: 'members-list', 
        query: { created: newMember.id }
      })
    }
  } catch (error: any) {
    submitError.value = error.message || 'Error al crear el miembro'
    scrollToTop()
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.')) {
    router.back()
  }
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

// ============================================================
// SUCCESS MESSAGES (Dune Style)
// ============================================================

const successMessages = [
  'Un nuevo guerrero se ha unido al Coliseo de Alejandría. Su fortaleza será forjada día tras día.',
  'Como los gladiadores de la Roma imperial, este miembro escribirá su leyenda en el arena del entrenamiento.',
  'Las máquinas del Coliseo han registrado a un nuevo aspirante. Que sus objetivos se conviertan en victorias.',
  'En los archivos de la Casa Atreides queda registrado otro valiente que busca perfeccionar su forma física.',
  'Un nombre más se inscribe en los pergaminos del Coliseo. La disciplina es el camino hacia la grandeza.'
]

const randomSuccessMessage = computed(() => {
  return successMessages[Math.floor(Math.random() * successMessages.length)]
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

    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-6 py-5 shadow-xl shadow-amber-100/60">
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
            <circle cx="160" cy="-10" r="90" fill="#f59e0b" />
            <circle cx="120" cy="30" r="45" fill="#ea580c" />
          </svg>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="handleCancel"
            class="w-10 h-10 bg-amber-100 hover:bg-amber-200 rounded-xl flex items-center justify-center
                   shadow-sm shrink-0 transition-colors border border-amber-200"
          >
            <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-3xl font-bold font-serif text-stone-900">Registrar Gladiador</h1>
            <p class="text-sm text-stone-500 mt-0.5">
              Inscripción de un nuevo guerrero en el Coliseo de Alejandría
            </p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-amber-600">{{ currentStep }}/{{ totalSteps }}</div>
            <div class="text-xs text-stone-500 uppercase tracking-wider">Paso actual</div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Información Básica</span>
            <span>Salud y Objetivos</span>
          </div>
          <div class="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-700">{{ submitError }}</p>
          <button 
            @click="submitError = null" 
            class="mt-2 text-xs font-medium text-amber-700 hover:underline"
          >
            Cerrar
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" novalidate>
        <!-- Step 1: Basic Information -->
        <div v-show="currentStep === 1">
          <MemberBasicInfoForm
            :form-state="formState"
            :errors="validationErrors.basicInfo || validationErrors.bodyMetrics ? {
              ...validationErrors.basicInfo,
              ...validationErrors.bodyMetrics
            } : undefined"
            :disabled="isSubmitting"
            @update:form-state="formState = $event"
          />
        </div>

        <!-- Step 2: Health and Goals -->
        <div v-show="currentStep === 2">
          <MemberHealthForm
            :form-state="formState"
            :errors="{
              mentalHealth: validationErrors.mentalHealth,
              healthConditions: validationErrors.healthConditions,
              goals: validationErrors.goals
            }"
            :disabled="isSubmitting"
            @update:form-state="formState = $event"
          />
        </div>

        <!-- Navigation Footer -->
        <div class="bg-amber-100 rounded-2xl border border-amber-200 p-6 flex items-center justify-between mt-8">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="previousStep"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 
                   hover:border-amber-200 hover:bg-amber-50 hover:text-stone-700 
                   text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          <div v-else></div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="handleCancel"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 
                     hover:border-amber-200 hover:bg-amber-50 hover:text-stone-700 
                     text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              v-if="currentStep < totalSteps"
              type="button"
              @click="nextStep"
              :disabled="!canProceedToStep2 || isSubmitting"
              class="relative overflow-hidden inline-flex items-center gap-2 
                     bg-gradient-to-r from-amber-500 to-amber-600 
                     hover:from-amber-600 hover:to-amber-700 text-white 
                     text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 
                     shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 
                     disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span class="relative">Siguiente</span>
              <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              v-else
              type="submit"
              :disabled="!canSubmit || isSubmitting"
              class="relative overflow-hidden inline-flex items-center gap-2 
                     bg-gradient-to-r from-emerald-500 to-emerald-600 
                     hover:from-emerald-600 hover:to-emerald-700 text-white 
                     text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 
                     shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 
                     disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg 
                v-if="isSubmitting" 
                class="w-4 h-4 animate-spin relative" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <svg v-else class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="relative">{{ isSubmitting ? 'Registrando...' : 'Registrar Gladiador' }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>