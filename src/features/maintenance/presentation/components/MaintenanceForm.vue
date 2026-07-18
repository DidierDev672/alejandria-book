<script setup lang="ts">
import { useEquipmentStore } from '@/features/maintenance/application/stores/useEquipmentStore'
import { useExerciseStore } from '@/features/exercise/application/stores/useExerciseStore'
import ExerciseModal from '@/utils/components/ExerciseModal.vue'
import ImageViewer from '@/utils/components/ImageViewer.vue'
import SuccessModal from '@/utils/components/SuccessModal.vue'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'

// ============================================================
// STORES
// ============================================================
const equipmentStore = useEquipmentStore()
const { loading: isCreating, error: createError } = storeToRefs(equipmentStore)

const exerciseStore = useExerciseStore()
const { isLoading: isSavingExercise } = storeToRefs(exerciseStore)

// ============================================================
// INTERFACES
// ============================================================
interface MaintenanceForm {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'pending' | ''
  lastMaintenance: string
  imageUrl: string
}

interface FormErrors {
  id: string
  name: string
  type: string
  status: string
  lastMaintenance: string
  image: string
}

// ============================================================
// ESTADO REACTIVO - FORMULARIO PRINCIPAL
// ============================================================
const form = reactive<MaintenanceForm>({
  id: '',
  name: '',
  type: '',
  status: '',
  lastMaintenance: '',
  imageUrl: '',
})

const errors = reactive<FormErrors>({
  id: '',
  name: '',
  type: '',
  status: '',
  lastMaintenance: '',
  image: '',
})

// ============================================================
// ESTADO REACTIVO - IMAGEN DEL EQUIPO
// ============================================================
const selectedImageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string>('')
const showImageViewer = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDraggingImage = ref(false)

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const isSubmitting = ref(false)
const showSuccessMessage = ref(false)
const registeredEquipmentName = ref('')

// ============================================================
// MODAL DE EJERCICIOS
// ============================================================
const showExerciseModal = ref(false)
const lastCreatedEquipmentId = ref('')

// ============================================================
// MODAL DE ÉXITO - EJERCICIO
// ============================================================
const showExerciseSuccessModal = ref(false)
const registeredExerciseName = ref('')

// ============================================================
// DATAGRID DE EJERCICIOS
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

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.type = ''
  form.status = ''
  form.lastMaintenance = ''
  form.imageUrl = ''

  errors.id = ''
  errors.name = ''
  errors.type = ''
  errors.status = ''
  errors.lastMaintenance = ''
  errors.image = ''

  // Limpiar imagen
  clearImage()
}

// ============================================================
// MANEJO DE IMAGEN DEL EQUIPO
// ============================================================

const validateImageFile = (file: File): boolean => {
  errors.image = ''

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.image = 'Formato no válido. Use: JPG, PNG, WebP o GIF'
    return false
  }

  if (file.size > MAX_IMAGE_SIZE) {
    errors.image = `Imagen muy grande. Máximo: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB`
    return false
  }

  return true
}

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    processImageFile(file)
  }
}

const handleImageDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDraggingImage.value = true
}

const handleImageDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDraggingImage.value = false
}

const handleImageDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingImage.value = false

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    processImageFile(file)
  }
}

const processImageFile = (file: File) => {
  if (!validateImageFile(file)) {
    return
  }

  selectedImageFile.value = file

  // Crear URL de previsualización
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviewUrl.value = e.target?.result as string
    form.imageUrl = imagePreviewUrl.value // Guardar en el formulario
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  selectedImageFile.value = null
  imagePreviewUrl.value = ''
  form.imageUrl = ''
  errors.image = ''

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const openImageViewer = () => {
  if (imagePreviewUrl.value) {
    showImageViewer.value = true
  }
}

const closeImageViewer = () => {
  showImageViewer.value = false
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ============================================================
// MANEJO DE MODALES
// ============================================================

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const created = await equipmentStore.createEquipment({
      name: form.name,
      type: form.type,
      status: form.status as 'active' | 'inactive' | 'pending',
      lastMaintenance: form.lastMaintenance,
    })

    lastCreatedEquipmentId.value = created.id
    registeredEquipmentName.value = form.name
    showSuccessMessage.value = true
    resetForm()
  } catch (err: any) {
    alert(err.message || 'Error al crear el equipo. Intente nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessMessage.value = false
  registeredEquipmentName.value = ''
}

const openExerciseModal = () => {
  showExerciseModal.value = true
}

const handleExerciseSaved = async (exerciseData: { name: string; muscle_group: string; difficulty: string; videoFile: File | null; videoUrl: string; equipmentIds: string[] }) => {
  try {
    for (const eqId of exerciseData.equipmentIds) {
      await exerciseStore.createExercise({
        name: exerciseData.name,
        muscle_group: exerciseData.muscle_group,
        difficulty: exerciseData.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        equipment_id: eqId,
        video_url: exerciseData.videoUrl || '',
      })
    }
    registeredExerciseName.value = exerciseData.name
    showExerciseSuccessModal.value = true
  } catch (err: any) {
    alert(err.message || 'Error al crear el ejercicio')
  }
}

</script>

<template>
  <section
    class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
    <!-- Decoradoras de fondo globales  -->
    <div class="pointer-events-none fixed right-0 top-0 opacity-10 -z-10">
      <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
        <circle cx="360" cy="-30" r="180" fill="#f59e0b" />
        <circle cx="310" cy="60" r="90" fill="#ea580c" />
      </svg>
    </div>
    <div class="pointer-events-none fixed bottom-0 left-0 opacity-5 -z-10">
      <svg width="260" height="200" viewBox="0 0 260 200" fill="none">
        <circle cx="0" cy="200" r="150" fill="#f59e0b" />
      </svg>
    </div>
    <!-- Contenedor Principal con Animación de Entrada -->
    <div v-motion :initial="{ opacity: 0, y: 40 }" :enter="{ opacity: 1, y: 0 }"
      :transition="{ duration: 600, ease: 'easeOut' }" class="w-full max-w-4xl mx-auto">

      <!-- ============================================================
           HEADER - TÍTULO Y DESCRIPCIÓN
           ============================================================ -->
      <header class="relative mb-8 sm:mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 p-8 sm:p-10 shadow-2xl shadow-amber-500/25">
        <!-- Patrón decorativo de fondo -->
        <div class="absolute inset-0 opacity-10">
          <svg class="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
            <defs>
              <pattern id="header-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect x="10" y="10" width="20" height="60" fill="white" opacity="0.3" rx="3" />
                <rect x="40" y="10" width="20" height="70" fill="white" opacity="0.2" rx="3" />
                <rect x="70" y="10" width="20" height="50" fill="white" opacity="0.3" rx="3" />
              </pattern>
            </defs>
            <rect width="800" height="400" fill="url(#header-pattern)" />
          </svg>
        </div>

        <!-- Círculos decorativos -->
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full blur-2xl" />

        <!-- Contenido del Header -->
        <div class="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <!-- Icono -->
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0, rotate: -180 }"
            :enter="{ opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 15, delay: 200 } }"
            class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30"
          >
            <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <!-- Texto -->
          <div class="text-center sm:text-left">
            <h1
              v-motion
              :initial="{ opacity: 0, x: -30 }"
              :enter="{ opacity: 1, x: 0, transition: { duration: 500, delay: 300, ease: [0.16, 1, 0.3, 1] } }"
              class="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-md tracking-wide"
            >
              Registro de Mantenimiento
            </h1>
            <p
              v-motion
              :initial="{ opacity: 0, x: -30 }"
              :enter="{ opacity: 1, x: 0, transition: { duration: 500, delay: 400, ease: [0.16, 1, 0.3, 1] } }"
              class="mt-2 text-sm sm:text-base text-white/80 max-w-md sm:max-w-lg"
            >
              Complete los datos del equipo para registrar su mantenimiento
            </p>
          </div>
        </div>
      </header>

      <!-- Tarjeta del Formulario -->
      <div v-motion :initial="{ opacity: 0, scale: 0.95 }" :enter="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 500, delay: 300, ease: 'easeOut' }"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-2xl shadow-amber-100/80">

        <!--  Decorador SVG interior  -->
        <div class="pointer-events-none absolute right-0 top-0 opacity-5">
          <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
            <circle cx="180" cy="-10" r="100" fill="#f59e0b" />
            <circle cx="150" cy="40" r="50" fill="#ea580c" />
          </svg>
        </div>
        <!-- Mensaje de Éxito -->
        <Transition enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 -translate-y-4" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in" leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4">
          <div v-if="showSuccessMessage" v-motion :initial="{ scale: 0.9 }" :enter="{ scale: 1 }"
            class="x-6 mt-6 p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-center gap-3">
            <div
              class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <form @submit.prevent="handleSubmit" class="relative p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <!-- Campo: ID -->
          <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 400 }" class="space-y-2">
            <label for="equipment-id" class="block text-sm font-semibold text-stone-700">
              ID del Equipo
              <span class="text-orange-500">*</span>
            </label>
            <div class="flex gap-2 sm:gap-3">
              <!-- Input con icono -->
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input id="equipment-id" v-model="form.id" type="text" placeholder="Ej: EQ-2024-001" :class="[
                  'w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-amber-50/40 border-2 rounded-xl text-sm sm:text-base text-stone-700 placeholder-stone-400 transition-all duration-300',
                  'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-amber-500/10',
                  errors.id
                    ? 'border-rose-300 focus:border-rose-400 bg-rose-50/30'
                    : 'border-amber-200/60 focus:border-amber-500 hover:border-amber-300',
                ]" @blur="validateField('id')" @input="clearError('id')">
                <!-- Indicador de validación -->
                <div class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                  <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 scale-0"
                    enter-to-class="opacity-100 scale-100">
                    <svg v-if="form.id && !errors.id" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </Transition>
                </div>
              </div>

              <!-- Botón Generar ID Aleatorio -->
              <button type="button"
                class="flex-shrink-0 px-3 sm:px-4 py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600 focus:outline-none active:scale-95"
                @click="generateRandomId">
                <span class="flex items-center gap-1.5 sm:gap-2">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span class="hidden sm:inline">Generar</span>
                </span>
              </button>
            </div>
            <!-- Mensaje de Error -->
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <p v-if="errors.id" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.id }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Name -->
          <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 500 }" class="space-y-2">
            <label for="equipment-name" class="block text-sm font-semibold text-stone-700">
              Nombre del Equipo
              <span class="text-orange-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input id="equipment-name" v-model="form.name" type="text" placeholder="Ej: Compresor Industrial Pro 5000"
                :class="[
                  'w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-amber-50/40 border-2 rounded-xl text-sm sm:text-base text-stone-700 placeholder-stone-400 transition-all duration-300',
                  'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-amber-500/10',
                  errors.name
                    ? 'border-rose-300 focus:border-rose-400 bg-rose-50/30'
                    : 'border-amber-200/60 focus:border-amber-500 hover:border-amber-300',
                ]" @blur="validateField('name')" @input="clearError('name')">
              <div class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 scale-0"
                  enter-to-class="opacity-100 scale-100">
                  <svg v-if="form.name && !errors.name" class="w-5 h-5 text-emerald-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </Transition>
              </div>
            </div>
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <p v-if="errors.name" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.name }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Type (Selector) -->
          <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 600 }" class="space-y-2">
            <label for="equipment-type" class="block text-sm font-semibold text-stone-700">
              Tipo de Equipo
              <span class="text-orange-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <select id="equipment-type" v-model="form.type" :class="[
                'w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-amber-50/40 border-2 rounded-xl text-sm sm:text-base text-stone-700 transition-all duration-300 appearance-none cursor-pointer',
                'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-amber-500/10',
                errors.type
                  ? 'border-rose-300 focus:border-rose-400 bg-rose-50/30'
                  : 'border-amber-200/60 focus:border-amber-500 hover:border-amber-300',
                !form.type && 'text-stone-400',
              ]" @blur="validateField('type')" @change="clearError('type')">
                <option value="" disabled>Seleccione un tipo de equipo</option>
                <option v-for="type in equipmentTypes" :key="type.value" :value="type.value" class="text-stone-700">
                  {{ type.label }}
                </option>
              </select>
              <!-- Icono de flecha -->
              <div class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <p v-if="errors.type" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.type }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Status (Radio Buttons estilizados) -->
          <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 700 }" class="space-y-2">
            <label class="block text-sm font-semibold text-stone-700">
              Estado del Equipo
              <span class="text-orange-500">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label v-for="status in statusOptions" :key="status.value" :class="[
                'relative flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                form.status === status.value
                  ? `${status.color} shadow-md`
                  : 'bg-amber-50/30 border-amber-200/50 hover:border-amber-300 hover:bg-amber-50',
              ]">
                <input v-model="form.status" type="radio" :value="status.value" class="sr-only"
                  @change="clearError('status')">
                <div class="flex items-center gap-2 sm:gap-3">
                  <div :class="[
                    'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                    form.status === status.value ? 'border-current bg-current' : 'border-amber-300 bg-white',
                  ]">
                    <div
                      :class="['w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white transition-transform duration-300', form.status === status.value ? 'scale-100' : 'scale-0']" />
                  </div>
                  <span
                    :class="['text-sm sm:text-base font-medium', form.status === status.value ? 'text-current' : 'text-stone-600']">
                    {{ status.label }}
                  </span>
                </div>
              </label>
            </div>
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <p v-if="errors.status" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.status }}
              </p>
            </Transition>
          </div>

          <!-- Campo: Last_Maintenance (Date) -->
          <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 800 }" class="space-y-2">
            <label for="last-maintenance" class="block text-sm font-semibold text-stone-700">
              Último Mantenimiento
              <span class="text-orange-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input id="last-maintenance" v-model="form.lastMaintenance" type="date" :max="getMaxDate()" :class="[
                'w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-amber-50/40 border-2 rounded-xl text-sm sm:text-base text-stone-700 transition-all duration-300',
                'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-amber-500/10',
                errors.lastMaintenance
                  ? 'border-rose-300 focus:border-rose-400 bg-rose-50/30'
                  : 'border-amber-200/60 focus:border-amber-500 hover:border-amber-300',
                !form.lastMaintenance && 'text-stone-400',
              ]" @blur="validateField('lastMaintenance')" @input="clearError('lastMaintenance')" />
            </div>
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <p v-if="errors.lastMaintenance" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.lastMaintenance }}
              </p>
            </Transition>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- CAMPO: IMAGEN DEL EQUIPO (con previsualización) -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }"
            :transition="{ duration: 400, delay: 850 }" class="space-y-3">
            <label class="block text-sm font-semibold text-stone-700">
              Imagen del Equipo
              <span class="text-stone-400 font-normal">(opcional)</span>
            </label>

            <!-- Área de Drag & Drop o Previsualización -->
            <div v-if="!imagePreviewUrl"
              :class="[
                'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-300 cursor-pointer',
                isDraggingImage
                  ? 'border-amber-500 bg-amber-100/50'
                  : 'border-amber-300/60 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50/50'
              ]"
              @dragenter="handleImageDragEnter"
              @dragleave="handleImageDragLeave"
              @dragover.prevent
              @drop="handleImageDrop"
              @click="fileInputRef?.click()"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="hidden"
                @change="handleImageSelect"
              />

              <!-- Icono de imagen -->
              <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <p class="text-center text-sm text-stone-600">
                Arrastra una imagen o <span class="font-medium text-amber-600 underline">haz clic para seleccionar</span>
              </p>
              <p class="mt-1 text-xs text-stone-400">JPG, PNG, WebP o GIF hasta 5MB</p>
            </div>

            <!-- Previsualización de imagen seleccionada -->
            <div v-else class="relative overflow-hidden rounded-xl border-2 border-amber-200/60 bg-amber-50/30 p-3">
              <div class="flex gap-4">
                <!-- Thumbnail clickeable para abrir visor -->
                <div
                  class="group relative h-32 w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm transition hover:shadow-md"
                  @click="openImageViewer"
                >
                  <img
                    :src="imagePreviewUrl"
                    alt="Previsualización del equipo"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <!-- Overlay con icono de expandir -->
                  <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <svg class="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>

                <!-- Información del archivo -->
                <div class="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <p class="text-sm font-medium text-stone-800">{{ selectedImageFile?.name }}</p>
                    <p class="text-xs text-stone-500">
                      {{ selectedImageFile ? formatFileSize(selectedImageFile.size) : '' }}
                    </p>
                    <p class="mt-2 text-xs text-amber-600">
                      Haz clic en la imagen para ver en pantalla completa
                    </p>
                  </div>

                  <!-- Botón eliminar -->
                  <button
                    type="button"
                    class="self-start flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50"
                    @click="clearImage"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar imagen
                  </button>
                </div>
              </div>
            </div>

            <!-- Mensaje de error -->
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2">
              <p v-if="errors.image" class="text-xs sm:text-sm text-rose-500 flex items-center gap-1.5">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ errors.image }}
              </p>
            </Transition>
          </div>

          <!-- Botones de Acción -->
          <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }"
            :transition="{ duration: 400, delay: 900 }"
            class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100">
            <!-- Botón Reset -->
            <button type="button"
              class="order-2 sm:order-1 px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-stone-600 bg-stone-100 rounded-xl border-2 border-transparent hover:bg-amber-100 hover:text-stone-700 hover:border-amber-200 transition-all duration-300 active:scale-95"
              @click="resetForm">
              <span class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Limpiar
              </span>
            </button>

            <!-- Botón Submit con animación bounce/scale en hover -->
            <button type="submit" :disabled="isSubmitting"
              class="order-1 sm:order-2 flex-1 relative overflow-hidden px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 group active:scale-95">
              <!-- Efecto brillo -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span class="relative flex items-center justify-center gap-2">
                <Transition mode="out-in">
                  <span v-if="isSubmitting" class="flex items-center gap-2">
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
      <p v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :transition="{ duration: 400, delay: 1000 }"
        class="text-center text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8">
        Sistema de Gestión de Mantenimiento © 2024
      </p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- MODAL DE CONFIRMACIÓN PSICOLÓGICA -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- VISOR DE IMAGEN EN PANTALLA COMPLETA -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <ImageViewer
      :is-open="showImageViewer"
      :images="[imagePreviewUrl]"
      :initial-index="0"
      @close="closeImageViewer"
    />

    <!-- Modal de éxito - Equipo -->
    <SuccessModal
      :is-open="showSuccessMessage"
      :equipment-name="registeredEquipmentName"
      @close="closeSuccessModal"
    />

    <!-- Modal de éxito - Ejercicio -->
    <SuccessModal
      :is-open="showExerciseSuccessModal"
      title="Ejercicio registrado exitosamente"
      message="El ejercicio fue guardado en el sistema correctamente."
      :equipment-name="registeredExerciseName"
      @close="showExerciseSuccessModal = false"
    />

    <!-- Modal de ejercicios -->
    <ExerciseModal
      :is-open="showExerciseModal"
      :equipment-id="lastCreatedEquipmentId"
      @close="showExerciseModal = false"
      @saved="handleExerciseSaved"
    />

    <!-- Botón flotante para agregar ejercicios -->
    <button
      v-motion
      :initial="{ opacity: 0, scale: 0 }"
      :enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 600 } }"
      @click="openExerciseModal"
      class="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full shadow-lg hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      aria-label="Agregar ejercicio"
      title="Agregar ejercicio"
    >
      <svg class="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
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
