<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// ============================================================
// INTERFACES
// ============================================================
interface MaintenanceForm {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'pending' | ''
  lastMaintenance: string
}

interface FormErrors {
  id: string
  name: string
  type: string
  status: string
  lastMaintenance: string
}

// ============================================================
// ESTADO REACTIVO
// ============================================================
const form = reactive<MaintenanceForm>({
  id: '',
  name: '',
  type: '',
  status: '',
  lastMaintenance: '',
})

const errors = reactive<FormErrors>({
  id: '',
  name: '',
  type: '',
  status: '',
  lastMaintenance: '',
})

const isSubmitting = ref(false)
const showSuccessMessage = ref(false)

// ============================================================
// OPCIONES DE SELECTORES
// ============================================================
const equipmentTypes = [
  { value: 'electrical', label: 'Eléctrico' },
  { value: 'mechanical', label: 'Mecánico' },
  { value: 'electronic', label: 'Electrónico' },
  { value: 'hydraulic', label: 'Hidráulico' },
  { value: 'pneumatic', label: 'Neumático' },
]

const statusOptions = [
  { value: 'active', label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'inactive', label: 'Inactivo', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'pending', label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200' },
]

// ============================================================
// COMPUTED
// ============================================================
const isFormValid = computed(() => {
  return form.id && form.name && form.type && form.status && form.lastMaintenance
})

const getStatusColor = computed(() => {
  const status = statusOptions.find((s) => s.value === form.status)
  return status?.color || 'bg-slate-100 text-slate-700 border-slate-200'
})

// ============================================================
// VALIDACIÓN
// ============================================================
const validateField = (field: keyof MaintenanceForm): boolean => {
  const value = form[field].toString().trim()

  if (!value) {
    errors[field] = 'Este campo es obligatorio'
    return false
  }

  // Validación específica por campo
  switch (field) {
    case 'id':
      if (value.length < 3) {
        errors[field] = 'El ID debe tener al menos 3 caracteres'
        return false
      }
      break
    case 'name':
      if (value.length < 2) {
        errors[field] = 'El nombre debe tener al menos 2 caracteres'
        return false
      }
      break
  }

  errors[field] = ''
  return true
}

const validateForm = (): boolean => {
  let isValid = true
  const fields: (keyof MaintenanceForm)[] = ['id', 'name', 'type', 'status', 'lastMaintenance']

  fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

const clearError = (field: keyof MaintenanceForm) => {
  errors[field] = ''
}

// ============================================================
// MANEJO DE ENVÍO
// ============================================================
const handleSubmit = async () => {
  if (!validateForm()) {
    // Animación de shake en el formulario si hay errores
    return
  }

  isSubmitting.value = true

  // Simulación de envío a API
  await new Promise((resolve) => setTimeout(resolve, 1500))

  console.log('Formulario enviado:', { ...form })

  showSuccessMessage.value = true
  isSubmitting.value = false

  // Ocultar mensaje de éxito después de 3 segundos
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)

  // Reset form opcional
  // resetForm()
}

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.type = ''
  form.status = ''
  form.lastMaintenance = ''

  errors.id = ''
  errors.name = ''
  errors.type = ''
  errors.status = ''
  errors.lastMaintenance = ''
}

// ============================================================
// HELPERS
// ============================================================
const getMaxDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

// Generar ID aleatorio para equipo
const generateRandomId = (): void => {
  const prefix = 'EQ'
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const randomId = `${prefix}-${year}-${random}`

  form.id = randomId
  clearError('id')
}
</script>

<template>
  <section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
    <!-- Contenedor Principal con Animación de Entrada -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 40 }"
      :enter="{ opacity: 1, y: 0 }"
      :transition="{ duration: 600, ease: 'easeOut' }"
      class="w-full max-w-2xl mx-auto"
    >
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-10">
        <h1
          v-motion
          :initial="{ opacity: 0, y: -20 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ duration: 500, delay: 100, ease: 'easeOut' }"
          class="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3"
        >
          Registro de Mantenimiento
        </h1>
        <p
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ duration: 500, delay: 200, ease: 'easeOut' }"
          class="text-sm sm:text-base text-slate-500 max-w-md mx-auto"
        >
          Complete los datos del equipo para registrar su mantenimiento
        </p>
      </div>

      <!-- Tarjeta del Formulario -->
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 500, delay: 300, ease: 'easeOut' }"
        class="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/60 border border-white/50 overflow-hidden"
      >
        <!-- Barra de progreso decorativa -->
        <div class="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 w-full" />

        <!-- Mensaje de Éxito -->
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <div
            v-if="showSuccessMessage"
            v-motion
            :initial="{ scale: 0.9 }"
            :enter="{ scale: 1 }"
            class="mx-4 sm:mx-6 mt-6 p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-xl flex items-center gap-3"
          >
            <div class="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-emerald-800 text-sm sm:text-base">¡Registro exitoso!</p>
              <p class="text-emerald-600 text-xs sm:text-sm">El mantenimiento ha sido registrado correctamente.</p>
            </div>
          </div>
        </Transition>

        <!-- Formulario -->
        <form
          @submit.prevent="handleSubmit"
          class="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6"
        >
          <!-- Campo: ID -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 400 }"
            class="space-y-2"
          >
            <label for="equipment-id" class="block text-sm font-semibold text-slate-700">
              ID del Equipo
              <span class="text-rose-500">*</span>
            </label>
            <div class="flex gap-2 sm:gap-3">
              <!-- Input con icono -->
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg
                    class="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                </div>
                <input
                  id="equipment-id"
                  v-model="form.id"
                  type="text"
                  placeholder="Ej: EQ-2024-001"
                  :class="[
                    'w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-slate-50/80 border-2 rounded-xl text-sm sm:text-base text-slate-700 placeholder-slate-400 transition-all duration-300',
                    'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-violet-500/10',
                    errors.id
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:border-violet-500 hover:border-slate-300',
                  ]"
                  @blur="validateField('id')"
                  @input="clearError('id')"
                >
                <!-- Indicador de validación -->
                <div class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                  <Transition
                    enter-active-class="transition-all duration-300"
                    enter-from-class="opacity-0 scale-0"
                    enter-to-class="opacity-100 scale-100"
                  >
                    <svg
                      v-if="form.id && !errors.id"
                      class="w-5 h-5 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </Transition>
                </div>
              </div>

              <!-- Botón Generar ID Aleatorio -->
              <button
                type="button"
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                class="flex-shrink-0 px-3 sm:px-4 py-3 sm:py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 active:scale-95"
                @click="generateRandomId"
              >
                <span class="flex items-center gap-1.5 sm:gap-2">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span class="hidden sm:inline">Generar</span>
                </span>
              </button>
            </div>
            <!-- Mensaje de Error -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <p v-if="errors.id" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.id }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Name -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 500 }"
            class="space-y-2"
          >
            <label for="equipment-name" class="block text-sm font-semibold text-slate-700">
              Nombre del Equipo
              <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <input
                id="equipment-name"
                v-model="form.name"
                type="text"
                placeholder="Ej: Compresor Industrial Pro 5000"
                :class="[
                  'w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50/80 border-2 rounded-xl text-sm sm:text-base text-slate-700 placeholder-slate-400 transition-all duration-300',
                  'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-violet-500/10',
                  errors.name
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:border-violet-500 hover:border-slate-300',
                ]"
                @blur="validateField('name')"
                @input="clearError('name')"
              >
              <div class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                <Transition
                  enter-active-class="transition-all duration-300"
                  enter-from-class="opacity-0 scale-0"
                  enter-to-class="opacity-100 scale-100"
                >
                  <svg
                    v-if="form.name && !errors.name"
                    class="w-5 h-5 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </Transition>
              </div>
            </div>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <p v-if="errors.name" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.name }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Type (Selector) -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 600 }"
            class="space-y-2"
          >
            <label for="equipment-type" class="block text-sm font-semibold text-slate-700">
              Tipo de Equipo
              <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <select
                id="equipment-type"
                v-model="form.type"
                :class="[
                  'w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-slate-50/80 border-2 rounded-xl text-sm sm:text-base text-slate-700 transition-all duration-300 appearance-none cursor-pointer',
                  'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-violet-500/10',
                  errors.type
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:border-violet-500 hover:border-slate-300',
                  !form.type && 'text-slate-400',
                ]"
                @blur="validateField('type')"
                @change="clearError('type')"
              >
                <option value="" disabled>Seleccione un tipo de equipo</option>
                <option
                  v-for="type in equipmentTypes"
                  :key="type.value"
                  :value="type.value"
                  class="text-slate-700"
                >
                  {{ type.label }}
                </option>
              </select>
              <!-- Icono de flecha -->
              <div class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <p v-if="errors.type" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.type }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Status (Radio Buttons estilizados) -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 700 }"
            class="space-y-2"
          >
            <label class="block text-sm font-semibold text-slate-700">
              Estado del Equipo
              <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                v-for="status in statusOptions"
                :key="status.value"
                :class="[
                  'relative flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                  form.status === status.value
                    ? `${status.color} border-current shadow-md shadow-current/10`
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white',
                ]"
              >
                <input
                  v-model="form.status"
                  type="radio"
                  :value="status.value"
                  class="sr-only"
                  @change="clearError('status')"
                >
                <div class="flex items-center gap-2 sm:gap-3">
                  <!-- Radio custom -->
                  <div
                    :class="[
                      'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                      form.status === status.value
                        ? 'border-current bg-current'
                        : 'border-slate-300 bg-white',
                    ]"
                  >
                    <div
                      :class="[
                        'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform duration-300',
                        form.status === status.value ? 'scale-100' : 'scale-0',
                      ]"
                    />
                  </div>
                  <span
                    :class="[
                      'text-sm sm:text-base font-medium',
                      form.status === status.value ? 'text-current' : 'text-slate-600',
                    ]"
                  >
                    {{ status.label }}
                  </span>
                </div>
              </label>
            </div>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <p v-if="errors.status" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.status }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Last_Maintenance (Date) -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 800 }"
            class="space-y-2"
          >
            <label for="last-maintenance" class="block text-sm font-semibold text-slate-700">
              Último Mantenimiento
              <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                id="last-maintenance"
                v-model="form.lastMaintenance"
                type="date"
                :max="getMaxDate()"
                :class="[
                  'w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50/80 border-2 rounded-xl text-sm sm:text-base text-slate-700 transition-all duration-300',
                  'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-violet-500/10',
                  errors.lastMaintenance
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:border-violet-500 hover:border-slate-300',
                  !form.lastMaintenance && 'text-slate-400',
                ]"
                @blur="validateField('lastMaintenance')"
                @input="clearError('lastMaintenance')"
              >
            </div>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <p v-if="errors.lastMaintenance" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.lastMaintenance }}
              </p>
            </Transition>
          </div>

          <!-- Botones de Acción -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            :transition="{ duration: 400, delay: 900 }"
            class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100"
          >
            <!-- Botón Reset -->
            <button
              type="button"
              v-motion
              :hovered="{ scale: 1.02 }"
              :tapped="{ scale: 0.98 }"
              class="order-2 sm:order-1 px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-slate-600 bg-slate-100 rounded-xl border-2 border-transparent hover:bg-slate-200 hover:text-slate-700 transition-all duration-300 active:scale-95"
              @click="resetForm"
            >
              <span class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Limpiar
              </span>
            </button>

            <!-- Botón Submit con animación bounce/scale en hover -->
            <button
              type="submit"
              :disabled="isSubmitting"
              v-motion
              :hovered="{ scale: 1.03 }"
              :tapped="{ scale: 0.97 }"
              class="order-1 sm:order-2 flex-1 px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              <!-- Efecto de brillo en hover -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <span class="relative flex items-center justify-center gap-2">
                <Transition mode="out-in">
                  <span v-if="isSubmitting" class="flex items-center gap-2">
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Registro
                  </span>
                </Transition>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Footer decorativo -->
      <p
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :transition="{ duration: 400, delay: 1000 }"
        class="text-center text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8"
      >
        Sistema de Gestión de Mantenimiento © 2024
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Estilos adicionales para inputs date en diferentes navegadores */
input[type="date"]::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}

/* Animación suave para transiciones Vue */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
