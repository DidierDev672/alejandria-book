<script setup lang="ts">
import { useExerciseStore } from '@/features/exercise/application/stores/useExerciseStore'
import type { CreateExerciseDTO } from '@/features/exercise/infrastructure/services/exerciseService'
import type { Equipment } from '@/features/maintenance/application/stores/useEquipmentStore'
import { useEquipmentStore } from '@/features/maintenance/application/stores/useEquipmentStore'
import type { VideoUploadPayload } from '@/features/video/domain/entities/VideoEntity'
import { getSupabaseVideoConfig } from '@/features/video/infrastructure/config/supabase'
import { SupabaseVideoRepository } from '@/features/video/infrastructure/repositories/SupabaseVideoRepository'
import { useVideoUpload } from '@/features/video/presentation/composables/useVideoUpload'
import BaseModal from '@/utils/components/BaseModal.vue'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const exerciseStore = useExerciseStore()
const equipmentStore = useEquipmentStore()

// ============================================================
// STATE - FORM
// ============================================================

const form = ref<CreateExerciseDTO>({
  name: '',
  muscle_group: '',
  difficulty: 'BEGINNER',
  video_url: '',
  equipment_id: '',
})

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const validationErrors = ref<Record<string, string[]>>({})

// ============================================================
// STATE - VIDEO FILE
// ============================================================

const videoFile = ref<File | null>(null)
const videoPreview = ref<string | null>(null)
const videoFileInputRef = ref<HTMLInputElement | null>(null)

// ============================================================
// STATE - EQUIPMENT MODAL
// ============================================================

const showEquipmentModal = ref(false)
const equipmentSearch = ref('')
const selectedEquipment = ref<Equipment | null>(null)

// ============================================================
// STATE - RESULT MODALS
// ============================================================

const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const successMessage = ref('')
const errorTitle = ref('')
const errorDetail = ref('')

// ============================================================
// STATE - VIDEO UPLOAD TO SUPABASE
// ============================================================

let videoUploadComposable: ReturnType<typeof useVideoUpload> | null = null

try {
  const supabaseConfig = getSupabaseVideoConfig()
  const repository = new SupabaseVideoRepository(supabaseConfig)
  videoUploadComposable = useVideoUpload({
    repository,
    currentUserId: localStorage.getItem('auth_user_id') || 'anonymous',
  })
} catch {
  videoUploadComposable = null
}

const isUploadingVideo = computed(() => videoUploadComposable?.state.isUploading ?? false)
const videoUploadProgress = computed(() => videoUploadComposable?.state.progress.percentage ?? 0)
const videoUploadError = computed(() => videoUploadComposable?.state.error ?? null)

const showVideoConfirmModal = ref(false)
const supabaseVideoUrl = ref('')
const supabaseUploadError = ref<string | null>(null)

// ============================================================
// PSYCHOLOGICAL SUCCESS MESSAGES
// ============================================================

const successMessages = [
  'Tu ejercicio ha sido registrado en la Gran Biblioteca de Alejandría. Cada repetición es un pergamino que engrosa el saber de la Casa Atreides.',
  'El camino del guerrero se forja con cada movimiento. Este nuevo ejercicio queda inscrito en tu legado de entrenamiento.',
  'Como un nuevo manuscrito en los archivos imperiales, este ejercicio fortalece tu arsenal. El conocimiento es poder.',
  'Ejercicio añadido con honor a tu repertorio. La disciplina de hoy es la victoria de mañana.',
  'El cuerpo es el primer templo del saber. Has añadido un nuevo ritual a tu disciplina. Bien hecho.',
]

function pickRandomMessage(): string {
  return successMessages[Math.floor(Math.random() * successMessages.length)]
}

// ============================================================
// COMPUTED
// ============================================================

const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.muscle_group.trim() !== '' &&
    form.value.equipment_id !== ''
  )
})

const difficultyOptions = [
  { value: 'BEGINNER', label: 'Principiante', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'INTERMEDIATE', label: 'Intermedio', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'ADVANCED', label: 'Avanzado', color: 'bg-red-100 text-red-700 border-red-200' },
] as const

const filteredEquipments = computed(() => {
  const equipments = equipmentStore.equipments ?? []
  if (!equipmentSearch.value.trim()) return equipments
  const query = equipmentSearch.value.toLowerCase()
  return equipments.filter(
    (eq) =>
      eq.name.toLowerCase().includes(query) ||
      eq.type.toLowerCase().includes(query)
  )
})

// ============================================================
// VALIDATION (Robusta, SOLID - una responsabilidad por función)
// ============================================================

function validateName(name: string): string[] {
  const errors: string[] = []
  const trimmed = name.trim()
  if (!trimmed) {
    errors.push('El nombre del ejercicio es obligatorio')
  } else if (trimmed.length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres')
  } else if (trimmed.length > 100) {
    errors.push('El nombre no debe exceder los 100 caracteres')
  } else if (!/[a-zA-ZáéíóúñÑ]/.test(trimmed)) {
    errors.push('El nombre debe contener al menos una letra')
  }
  return errors
}

function validateDifficulty(difficulty: string): string[] {
  const errors: string[] = []
  const valid = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  if (!valid.includes(difficulty)) {
    errors.push('Selecciona una dificultad válida (Principiante, Intermedio o Avanzado)')
  }
  return errors
}

function clearNameError() {
  if (validationErrors.value.name && form.value.name.trim().length >= 2) {
    delete validationErrors.value.name
  }
}

function validateForm(): boolean {
  validationErrors.value = {}
  const nameErrors = validateName(form.value.name)
  if (nameErrors.length) validationErrors.value.name = nameErrors
  const difficultyErrors = validateDifficulty(form.value.difficulty)
  if (difficultyErrors.length) validationErrors.value.difficulty = difficultyErrors
  return Object.keys(validationErrors.value).length === 0
}

// ============================================================
// METHODS - DIFFICULTY
// ============================================================

function handleDifficultySelect(level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') {
  form.value.difficulty = level
  if (validationErrors.value.difficulty) {
    delete validationErrors.value.difficulty
  }
}

// ============================================================
// METHODS - VIDEO FILE
// ============================================================

function openVideoFileSelector() {
  videoFileInputRef.value?.click()
}

function handleVideoFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  if (!validTypes.includes(file.type)) {
    validationErrors.value.video = ['Formato de video no soportado. Usa MP4, WebM u OGG.']
    return
  }

  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    validationErrors.value.video = ['El video no debe superar los 100MB.']
    return
  }

  delete validationErrors.value.video
  videoFile.value = file

  const url = URL.createObjectURL(file)
  videoPreview.value = url

  target.value = ''
}

function removeVideoFile() {
  if (videoPreview.value) {
    URL.revokeObjectURL(videoPreview.value)
  }
  videoFile.value = null
  videoPreview.value = null
  form.value.video_url = ''
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ============================================================
// METHODS - EQUIPMENT MODAL
// ============================================================

function openEquipmentModal() {
  equipmentSearch.value = ''
  selectedEquipment.value = equipmentStore.equipments?.find((eq) => eq.id === form.value.equipment_id) ?? null
  showEquipmentModal.value = true
}

function closeEquipmentModal() {
  showEquipmentModal.value = false
  equipmentSearch.value = ''
}

function selectEquipment(equipment: Equipment) {
  selectedEquipment.value = equipment
}

function confirmEquipmentSelection() {
  if (selectedEquipment.value) {
    form.value.equipment_id = selectedEquipment.value.id
  }
  closeEquipmentModal()
}

function clearEquipmentSelection() {
  selectedEquipment.value = null
  form.value.equipment_id = ''
}

// ============================================================
// METHODS - SUBMIT
// ============================================================

async function uploadVideoToSupabase(): Promise<string> {
  if (!videoFile.value || !videoUploadComposable) {
    if (!videoUploadComposable) {
      throw new Error('La configuración de Supabase no está disponible. Verifica las variables de entorno.')
    }
    return ''
  }

  const payload: VideoUploadPayload = {
    title: form.value.name.trim() || 'Ejercicio',
    description: `Video de referencia para el ejercicio: ${form.value.name.trim()}`,
    file: videoFile.value,
  }

  const result = await videoUploadComposable.uploadVideoOnly(payload)

  if (videoUploadComposable.state.error) {
    throw new Error(videoUploadComposable.state.error)
  }

  const url = result?.url || ''
  if (!url) {
    throw new Error('Supabase no devolvió una URL pública')
  }
  return url
}

async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true
  submitError.value = null

  try {
    if (videoFile.value && !(form.value.video_url ?? '').trim()) {
      supabaseUploadError.value = null
      const url = await uploadVideoToSupabase()
      supabaseVideoUrl.value = url
      isSubmitting.value = false
      showVideoConfirmModal.value = true
      return
    }

    const videoUrl = (form.value.video_url ?? '').trim() || undefined

    await exerciseStore.createExercise({
      name: form.value.name.trim(),
      muscle_group: form.value.muscle_group.trim(),
      difficulty: form.value.difficulty,
      video_url: videoUrl,
      equipment_id: form.value.equipment_id,
    })

    successMessage.value = pickRandomMessage()
    showSuccessModal.value = true
  } catch (err: any) {
    if (showVideoConfirmModal.value) return

    const status = err?.response?.status
    const serverMessage = err?.response?.data?.error || err?.message

    if (!status) {
      supabaseUploadError.value = err.message
    }

    errorTitle.value = 'No se pudo crear el ejercicio'
    if (status === 400 || status === 422) {
      errorTitle.value = 'Datos inválidos'
      errorDetail.value = serverMessage || 'Revisa los campos e intenta de nuevo.'
      if (err.errors) {
        const fieldList = Object.keys(err.errors).join(', ')
        errorDetail.value += ` Campos: ${fieldList}.`
      }
    } else if (status === 401 || status === 403) {
      errorTitle.value = 'Sin autorización'
      errorDetail.value = 'Tu sesión ha expirado o no tienes permisos. Inicia sesión nuevamente.'
    } else if (status === 409) {
      errorTitle.value = 'Conflicto'
      errorDetail.value = serverMessage || 'Ya existe un ejercicio con ese nombre.'
    } else if (status === 500) {
      errorTitle.value = 'Error del servidor'
      errorDetail.value = 'Ocurrió un error interno. Intenta de nuevo más tarde.'
    } else if (!status) {
      if (supabaseUploadError.value) {
        errorTitle.value = 'Error al subir el video'
        errorDetail.value = supabaseUploadError.value
      } else {
        errorTitle.value = 'Error de conexión'
        errorDetail.value = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
      }
    } else {
      errorDetail.value = serverMessage || `Error inesperado (código ${status}).`
    }

    showErrorModal.value = true
    submitError.value = errorDetail.value
    console.error('[ExerciseCreatePage] handleSubmit error:', err)
  } finally {
    if (!showVideoConfirmModal.value) {
      isSubmitting.value = false
    }
  }
}

async function confirmVideoUrl() {
  isSubmitting.value = true
  showVideoConfirmModal.value = false

  try {
    await exerciseStore.createExercise({
      name: form.value.name.trim(),
      muscle_group: form.value.muscle_group.trim(),
      difficulty: form.value.difficulty,
      video_url: supabaseVideoUrl.value,
      equipment_id: form.value.equipment_id,
    })

    successMessage.value = pickRandomMessage()
    showSuccessModal.value = true
  } catch (err: any) {
    const status = err?.response?.status
    const serverMessage = err?.response?.data?.error || err?.message

    errorTitle.value = 'No se pudo crear el ejercicio'
    if (status === 400 || status === 422) {
      errorTitle.value = 'Datos inválidos'
      errorDetail.value = serverMessage || 'Revisa los campos e intenta de nuevo.'
    } else if (status === 401 || status === 403) {
      errorTitle.value = 'Sin autorización'
      errorDetail.value = 'Tu sesión ha expirado o no tienes permisos. Inicia sesión nuevamente.'
    } else if (status === 409) {
      errorTitle.value = 'Conflicto'
      errorDetail.value = serverMessage || 'Ya existe un ejercicio con ese nombre.'
    } else if (status === 500) {
      errorTitle.value = 'Error del servidor'
      errorDetail.value = 'Ocurrió un error interno. Intenta de nuevo más tarde.'
    } else if (!status) {
      errorTitle.value = 'Error de conexión'
      errorDetail.value = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    } else {
      errorDetail.value = serverMessage || `Error inesperado (código ${status}).`
    }

    showErrorModal.value = true
    submitError.value = errorDetail.value
    console.error('[ExerciseCreatePage] confirmVideoUrl error:', err)
  } finally {
    isSubmitting.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function retryVideoUpload() {
  showVideoConfirmModal.value = false
  supabaseVideoUrl.value = ''
  supabaseUploadError.value = null
  videoUploadComposable?.resetState()
  isSubmitting.value = false

  if (videoPreview.value) {
    URL.revokeObjectURL(videoPreview.value)
  }
  videoFile.value = null
  videoPreview.value = null
  form.value.video_url = ''
}

function handleCancel() {
  if (videoPreview.value) {
    URL.revokeObjectURL(videoPreview.value)
  }
  router.back()
}

function goToList() {
  showSuccessModal.value = false
  router.push({ name: 'exercise-list' })
}

function closeErrorModal() {
  showErrorModal.value = false
}

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push({ name: 'login' })
    return
  }
  if (equipmentStore.equipments.length === 0) {
    await equipmentStore.fetchEquipments()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 px-6 py-8">
    <!-- Decoradores globales -->
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

      <!-- ── Page Header ── -->
      <div
        class="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-white/80 backdrop-blur-sm px-6 py-5 shadow-xl shadow-amber-100/60">
        <div class="pointer-events-none absolute right-0 top-0 opacity-10">
          <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
            <circle cx="160" cy="-10" r="90" fill="#f59e0b" />
            <circle cx="120" cy="30" r="45" fill="#ea580c" />
          </svg>
        </div>
        <div class="flex items-center gap-3">
          <button @click="handleCancel"
            class="w-9 h-9 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200/70 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 shadow-sm hover:border-amber-300">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="font-serif text-2xl font-bold text-stone-800">Registrar Ejercicio</h1>
            <p class="text-xs text-stone-400 mt-0.5">
              Completa los datos para crear un nuevo ejercicio
            </p>
          </div>
        </div>
      </div>

      <!-- ── Form Card ── -->
      <form @submit.prevent="handleSubmit"
        class="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-100/40">

        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
        <!-- Form Body -->
        <div class="px-6 py-6 space-y-5">

          <!-- Nombre -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-stone-700">
              Nombre <span class="text-orange-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <input v-model="form.name" type="text" placeholder="Ej: Sentadilla con barra" :disabled="isSubmitting"
                @input="clearNameError" :class="[
                  'w-full pl-10 pr-4 py-2.5 bg-amber-50/40 border-2 rounded-xl text-sm text-stone-700 placeholder-stone-400',
                  'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200',
                  validationErrors.name
                    ? 'border-rose-300 focus:border-rose-400 bg-rose-50/30'
                    : 'border-amber-200/60 focus:border-amber-500 hover:border-amber-300',
                ]" />
            </div>
            <p v-if="validationErrors.name" class="text-xs text-rose-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ validationErrors.name[0] }}
            </p>
          </div>

          <!-- Grupo muscular -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-stone-700">
              Grupo muscular <span class="text-orange-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <input v-model="form.muscle_group" type="text" placeholder="Ej: Pecho, Espalda, Piernas, Cardiovascular…"
                :disabled="isSubmitting" :class="[
                  'w-full pl-10 pr-4 py-2.5 bg-amber-50/40 border-2 rounded-xl text-sm text-stone-700 placeholder-stone-400',
                  'focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200',
                  validationErrors.muscle_group
                    ? 'border-rose-300 focus:border-rose-400 bg-rose-50/30'
                    : 'border-amber-200/60 focus:border-amber-500 hover:border-amber-300',
                ]" />
            </div>
            <p v-if="validationErrors.muscle_group" class="text-xs text-rose-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ validationErrors.muscle_group[0] }}
            </p>
          </div>

          <!-- Dificultad -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-stone-700">
              Dificultad <span class="text-orange-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="level in difficultyOptions" :key="level.value" type="button"
                @click="handleDifficultySelect(level.value)" :disabled="isSubmitting"
                class="py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200"
                :class="form.difficulty === level.value
                  ? level.color + ' shadow-sm'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/40 hover:text-stone-700'">
                {{ level.label }}
              </button>
            </div>
            <p v-if="validationErrors.difficulty" class="text-xs text-rose-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ validationErrors.difficulty[0] }}
            </p>
          </div>

          <!-- Equipo -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-stone-700">
              Equipo <span class="text-orange-500">*</span>
            </label>
            <div :class="[
              'w-full border-2 rounded-xl px-4 py-2.5 text-sm bg-amber-50/40 cursor-pointer transition-all duration-200',
              validationErrors.equipment_id
                ? 'border-rose-300 bg-rose-50/30'
                : 'border-amber-200/60 hover:border-amber-400 hover:bg-amber-50',
            ]" @click="openEquipmentModal">
              <div v-if="selectedEquipment" class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm shadow-amber-300/40">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-stone-800">{{ selectedEquipment.name }}</p>
                    <p class="text-xs text-stone-400">{{ selectedEquipment.type }}</p>
                  </div>
                </div>
                <button type="button" @click.stop="clearEquipmentSelection"
                  class="w-6 h-6 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-else class="flex items-center gap-2 text-stone-400">
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="text-stone-400">Selecciona un equipo…</span>
              </div>
            </div>
            <p v-if="validationErrors.equipment_id" class="text-xs text-rose-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ validationErrors.equipment_id[0] }}
            </p>
          </div>

          <!-- Video -->
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-stone-700">
              Video de referencia
              <span class="text-stone-400 font-normal text-xs ml-1">(opcional)</span>
            </label>

            <input ref="videoFileInputRef" type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime"
              class="hidden" @change="handleVideoFileSelect" />

            <div v-if="!videoFile"
              class="border-2 border-dashed border-amber-200 rounded-2xl p-6 text-center hover:border-amber-400 hover:bg-amber-50/40 transition-all duration-200 cursor-pointer group bg-amber-50/20"
              @click="openVideoFileSelector">
              <div
                class="w-12 h-12 mx-auto mb-3 bg-amber-50 border border-amber-200 group-hover:bg-amber-100 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                <svg class="w-6 h-6 text-amber-400 group-hover:text-amber-500 transition-colors" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-stone-600 mb-1">
                <span class="text-amber-600 group-hover:underline">Haz clic para seleccionar</span> un video
              </p>
              <p class="text-xs text-stone-400">MP4, WebM u OGG (máx. 100MB)</p>
            </div>

            <div v-else class="rounded-2xl border border-amber-200 overflow-hidden bg-white">
              <div class="relative">
                <CustomVideoPlayer :videoSrc="videoPreview ?? ''" />
                <button type="button" @click="removeVideoFile"
                  class="absolute top-2 right-2 w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors z-10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="px-4 py-2.5 flex items-center justify-between bg-amber-50/60 border-t border-amber-100">
                <div class="flex items-center gap-2 min-w-0">
                  <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs text-stone-600 truncate font-medium">{{ videoFile.name }}</span>
                </div>
                <span class="text-xs text-stone-400 shrink-0 ml-2">{{ formatFileSize(videoFile.size) }}</span>
              </div>
            </div>

            <p v-if="validationErrors.video" class="text-xs text-rose-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ validationErrors.video[0] }}
            </p>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px mx-6 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>

        <!-- Form Footer -->
        <div class="px-6 py-4 bg-amber-50 border-t border-amber-200 flex items-center justify-end gap-3">
          <button type="button" @click="handleCancel" :disabled="isSubmitting"
            class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50 hover:text-stone-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Cancelar
          </button>
          <button type="submit" :disabled="isSubmitting || !isFormValid"
            class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <svg v-if="isSubmitting || isUploadingVideo" class="w-4 h-4 animate-spin relative" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <svg v-else class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span
              class="relative">{{ isUploadingVideo ? `Subiendo ${videoUploadProgress}%…` : isSubmitting ? 'Creando…' : 'Crear ejercicio' }}</span>
          </button>
        </div>
      </form>

    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Éxito                                              -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <BaseModal :isOpen="showSuccessModal" maxWithClass="max-w-lg" :expandable="false" @close="goToList">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-xl bg-emerald-400/30 border border-emerald-300/30 flex items-center justify-center">
          <svg class="w-6 h-6 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="font-serif text-xl font-bold text-white tracking-wide">Ejercicio Registrado</h3>
          <p class="text-xs text-amber-200/80 mt-0.5">El conocimiento se forja con cada repetición</p>
        </div>
      </div>
    </template>
    <template #content>
      <div class="text-center py-4">
        <div class="relative inline-flex mb-6">
          <div class="absolute inset-0 rounded-full bg-emerald-400/20 blur-lg scale-125"></div>
          <div
            class="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200/40">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p class="text-base leading-relaxed text-stone-600 italic">"{{ successMessage }}"</p>
      </div>
    </template>
    <template #footer>
      <button type="button" @click="goToList"
        class="relative overflow-hidden w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200/40 active:scale-95 group">
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <svg class="w-5 h-5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span class="relative">Ir al historial de ejercicios</span>
      </button>
    </template>
  </BaseModal>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Error                                               -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <BaseModal :isOpen="showErrorModal" maxWithClass="max-w-lg" :expandable="false" @close="closeErrorModal">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-rose-400/30 border border-rose-300/30 flex items-center justify-center">
          <svg class="w-6 h-6 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 class="font-serif text-xl font-bold text-white tracking-wide">{{ errorTitle }}</h3>
          <p class="text-xs text-amber-200/80 mt-0.5">No pudimos completar la operación</p>
        </div>
      </div>
    </template>
    <template #content>
      <div class="py-2">
        <div class="flex items-start gap-4 bg-rose-50 border border-rose-200/80 rounded-2xl p-4">
          <div
            class="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-stone-800 mb-1">{{ errorTitle }}</p>
            <p class="text-sm text-stone-500 leading-relaxed">{{ errorDetail }}</p>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <button type="button" @click="closeErrorModal"
        class="relative overflow-hidden w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 active:scale-95 group">
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="relative">Intentar de nuevo</span>
      </button>
    </template>
  </BaseModal>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Confirmar video subido a Supabase                  -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <BaseModal :isOpen="showVideoConfirmModal" maxWithClass="max-w-2xl" :expandable="false" @close="retryVideoUpload">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-sky-400/30 border border-sky-300/30 flex items-center justify-center">
          <svg class="w-6 h-6 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="font-serif text-xl font-bold text-white tracking-wide">Video Subido a Supabase</h3>
          <p class="text-xs text-amber-200/80 mt-0.5">Revisa la vista previa antes de confirmar</p>
        </div>
      </div>
    </template>
    <template #content>
      <div class="space-y-4 py-2">
        <div class="rounded-2xl overflow-hidden border border-amber-200 shadow-sm">
          <CustomVideoPlayer :video-src="supabaseVideoUrl" />
        </div>
        <div class="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest text-stone-400">URL pública en Supabase Storage</p>
          <div class="flex items-center gap-2">
            <input :value="supabaseVideoUrl" type="text" readonly
              class="flex-1 bg-white border-2 border-amber-200/60 rounded-xl px-3 py-2 text-xs text-stone-600 font-mono focus:outline-none focus:border-amber-400 select-all transition-colors"
              @click="$event.target.select()" />
            <button type="button" @click="copyToClipboard(supabaseVideoUrl)"
              class="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border-2 border-amber-200 text-stone-400 hover:text-amber-600 hover:border-amber-400 transition-all duration-200"
              title="Copiar URL">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-start gap-3 bg-sky-50 border border-sky-200/80 rounded-2xl p-4">
          <svg class="w-4 h-4 text-sky-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs text-sky-700 leading-relaxed">
            La URL pública ha sido generada por Supabase Storage. Confirma para asociarla al ejercicio, o reintenta si
            la vista previa no se reproduce correctamente.
          </p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-col sm:flex-row gap-3 w-full">
        <button type="button" @click="retryVideoUpload"
          class="flex-1 inline-flex items-center justify-center gap-2 border-2 border-amber-400 text-amber-700 hover:bg-amber-50 font-bold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reintentar
        </button>
        <button type="button" @click="confirmVideoUrl" :disabled="isSubmitting"
          class="relative overflow-hidden flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group">
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <svg v-if="isSubmitting" class="w-4 h-4 animate-spin relative" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <svg v-else class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span class="relative">{{ isSubmitting ? 'Creando…' : 'Confirmar y crear ejercicio' }}</span>
        </button>
      </div>
    </template>
  </BaseModal>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MODAL: Seleccionar equipo                                 -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showEquipmentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeEquipmentModal">
        <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"></div>

        <Transition enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0">
          <div v-if="showEquipmentModal"
            class="relative w-full max-w-lg rounded-3xl shadow-2xl shadow-black/20 border border-amber-200/60 bg-white/95 backdrop-blur-sm overflow-hidden">
            <!-- Línea de acento -->
            <div
              class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <!-- Header -->
            <div class="bg-amber-50/80 border-b border-amber-100 px-6 py-4 flex items-center justify-between gap-4">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm shadow-amber-300/40">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 class="font-serif text-base font-bold text-stone-800">Seleccionar equipo</h2>
              </div>
              <button @click="closeEquipmentModal"
                class="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-amber-100 transition-colors border border-transparent hover:border-amber-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Search -->
            <div class="px-6 pt-4 pb-2">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input v-model="equipmentSearch" type="text" placeholder="Buscar por nombre o tipo…"
                  class="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-amber-200/60 rounded-xl bg-amber-50/40 text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:shadow-lg focus:shadow-amber-500/10 transition-all duration-200"
                  autofocus />
              </div>
            </div>

            <!-- Equipment List -->
            <div class="px-6 py-2 max-h-80 overflow-y-auto">
              <div v-if="filteredEquipments.length === 0" class="py-8 text-center">
                <div
                  class="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p class="text-sm text-stone-400">No se encontraron equipos</p>
              </div>

              <div v-else class="space-y-1.5">
                <label v-for="equipment in filteredEquipments" :key="equipment.id" :class="[
                  'flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                  selectedEquipment?.id === equipment.id
                    ? 'bg-amber-50 border-amber-400 shadow-sm shadow-amber-200/40'
                    : 'bg-white border-amber-100 hover:border-amber-300 hover:bg-amber-50/50',
                ]">
                  <input type="checkbox" :checked="selectedEquipment?.id === equipment.id"
                    @change="selectEquipment(equipment)"
                    class="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <div :class="[
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                    selectedEquipment?.id === equipment.id
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shadow-amber-300/40'
                      : 'bg-amber-50 border border-amber-200',
                  ]">
                    <svg :class="['w-4 h-4', selectedEquipment?.id === equipment.id ? 'text-white' : 'text-amber-500']"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-stone-800 truncate">{{ equipment.name }}</p>
                    <p class="text-xs text-stone-400 truncate">{{ equipment.type }}</p>
                  </div>
                  <!-- Check activo -->
                  <div v-if="selectedEquipment?.id === equipment.id"
                    class="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-amber-50/40 border-t border-amber-100 flex items-center justify-end gap-2">
              <button type="button" @click="closeEquipmentModal"
                class="inline-flex items-center gap-2 border-2 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                Cancelar
              </button>
              <button type="button" @click="confirmEquipmentSelection" :disabled="!selectedEquipment"
                class="relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group">
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg class="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="relative">Seleccionar</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
