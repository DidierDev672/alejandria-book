<script setup lang="ts">
import { useEquipmentStore, type Equipment } from '@/features/maintenance/application/stores/useEquipmentStore'
import { getSupabaseVideoConfig } from '@/features/video/infrastructure/config/supabase'
import { SupabaseVideoRepository } from '@/features/video/infrastructure/repositories/SupabaseVideoRepository'
import { useVideoUpload } from '@/features/video/presentation/composables/useVideoUpload'
import CustomVideoPlayer from '@/utils/components/CustomVideoPlayer.vue'
import { storeToRefs } from 'pinia'
import { reactive, ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  equipmentId?: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  equipmentId: '',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', exercise: { name: string; muscle_group: string; difficulty: string; videoFile: File | null; videoUrl: string; equipmentIds: string[] }): void
}>()

interface ExerciseForm {
  name: string
  muscle_group: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

const form = reactive<ExerciseForm>({
  name: '',
  muscle_group: '',
  difficulty: 'BEGINNER',
})

const errors = reactive({
  name: '',
  muscle_group: '',
  video: '',
  equipment: '',
})

const isSubmitting = ref(false)

// ============================================================
// STORE DE EQUIPOS
// ============================================================
const equipmentStore = useEquipmentStore()
const { equipments, loading: isLoadingEquipment } = storeToRefs(equipmentStore)

// ============================================================
// SUPABASE VIDEO UPLOAD
// ============================================================
const supabaseRepository = new SupabaseVideoRepository(getSupabaseVideoConfig())
const currentUserId = ref('user-system-001')

const {
  state: uploadState,
  uploadVideoOnly,
  resetState: resetUploadState,
  formatProgress,
} = useVideoUpload({
  repository: supabaseRepository,
  currentUserId: currentUserId.value,
})

// ============================================================
// ESTADO DE SUBIDA Y VERIFICACIÓN
// ============================================================
const isUploadingVideo = ref(false)
const uploadProgressText = ref('')
const showUrlVerificationModal = ref(false)
const verifiedVideoUrl = ref('')
const isVerifyingUrl = ref(false)
const urlVerificationError = ref('')

// ============================================================
// SELECCIÓN DE EQUIPOS
// ============================================================
const showEquipmentModal = ref(false)
const selectedEquipmentIds = ref<string[]>([])
const equipmentSearch = ref('')

const filteredEquipments = ref<Equipment[]>([])

const fetchEquipmentList = async () => {
  try {
    await equipmentStore.fetchEquipments()
    filteredEquipments.value = equipments.value
  } catch (err) {
    console.error('Error fetching equipment:', err)
  }
}

const filterEquipment = () => {
  const query = equipmentSearch.value.toLowerCase().trim()
  if (!query) {
    filteredEquipments.value = equipments.value
    return
  }
  filteredEquipments.value = equipments.value.filter(
    (eq) => eq.name.toLowerCase().includes(query) || eq.type.toLowerCase().includes(query)
  )
}

const toggleEquipmentSelection = (id: string) => {
  const index = selectedEquipmentIds.value.indexOf(id)
  if (index === -1) {
    selectedEquipmentIds.value.push(id)
  } else {
    selectedEquipmentIds.value.splice(index, 1)
  }
}

const isSelected = (id: string) => selectedEquipmentIds.value.includes(id)

const openEquipmentModal = async () => {
  equipmentSearch.value = ''
  await fetchEquipmentList()
  showEquipmentModal.value = true
}

const confirmEquipmentSelection = () => {
  errors.equipment = ''
  showEquipmentModal.value = false
}

const removeSelectedEquipment = (id: string) => {
  selectedEquipmentIds.value = selectedEquipmentIds.value.filter((eid) => eid !== id)
}

const selectedEquipmentNames = ref<string[]>([])

const getSelectedEquipmentNames = () => {
  return equipments.value
    .filter((eq) => selectedEquipmentIds.value.includes(eq.id))
    .map((eq) => eq.name)
}

// ============================================================
// ESTADO DE VIDEO
// ============================================================
const selectedVideoFile = ref<File | null>(null)
const videoFilePreview = ref<string>('')
const videoFileInputRef = ref<HTMLInputElement | null>(null)
const isDraggingVideo = ref(false)

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

const muscleGroups = [
  { value: 'chest', label: 'Pecho', icon: '💪' },
  { value: 'back', label: 'Espalda', icon: '🏋️' },
  { value: 'legs', label: 'Piernas', icon: '🦵' },
  { value: 'shoulders', label: 'Hombros', icon: '🤷' },
  { value: 'arms', label: 'Brazos', icon: '💪' },
  { value: 'core', label: 'Core', icon: '🎯' },
  { value: 'cardio', label: 'Cardio', icon: '❤️' },
  { value: 'fullbody', label: 'Cuerpo Completo', icon: '🏃' },
]

const difficultyLevels = [
  { value: 'BEGINNER' as const, label: 'Principiante', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'INTERMEDIATE' as const, label: 'Intermedio', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'ADVANCED' as const, label: 'Avanzado', color: 'bg-rose-100 text-rose-700 border-rose-200' },
]

// ============================================================
// MANEJO DE VIDEO
// ============================================================
const handleVideoFile = (file: File) => {
  errors.video = ''

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    errors.video = 'Tipo de archivo no válido. Use MP4, MOV, AVI o WebM.'
    return
  }

  if (file.size > MAX_VIDEO_SIZE) {
    errors.video = 'El archivo excede el tamaño máximo de 100MB.'
    return
  }

  selectedVideoFile.value = file
  videoFilePreview.value = URL.createObjectURL(file)
}

const onVideoFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleVideoFile(file)
  input.value = ''
}

const onVideoFileDrop = (event: DragEvent) => {
  isDraggingVideo.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) handleVideoFile(file)
}

const removeVideoFile = () => {
  if (videoFilePreview.value) {
    URL.revokeObjectURL(videoFilePreview.value)
  }
  selectedVideoFile.value = null
  videoFilePreview.value = ''
  errors.video = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ============================================================
// VALIDACIÓN
// ============================================================
const validate = (): boolean => {
  let isValid = true
  errors.name = ''
  errors.muscle_group = ''
  errors.equipment = ''

  if (!form.name.trim()) {
    errors.name = 'El nombre es obligatorio'
    isValid = false
  }
  if (!form.muscle_group) {
    errors.muscle_group = 'Selecciona un grupo muscular'
    isValid = false
  }
  if (selectedEquipmentIds.value.length === 0 && !props.equipmentId) {
    errors.equipment = 'Selecciona al menos un equipo'
    isValid = false
  }
  return isValid
}

const resetForm = () => {
  form.name = ''
  form.muscle_group = ''
  form.difficulty = 'BEGINNER'
  errors.name = ''
  errors.muscle_group = ''
  errors.video = ''
  errors.equipment = ''
  selectedEquipmentIds.value = []
  showEquipmentModal.value = false
  isUploadingVideo.value = false
  uploadProgressText.value = ''
  showUrlVerificationModal.value = false
  verifiedVideoUrl.value = ''
  isVerifyingUrl.value = false
  urlVerificationError.value = ''
  removeVideoFile()
}

const handleClose = () => {
  resetForm()
  emit('close')
}

// ============================================================
// FLUJO DE SUBIDA DE VIDEO A SUPABASE
// ============================================================
const uploadVideoToSupabase = async (): Promise<string | null> => {
  if (!selectedVideoFile.value) return null

  isUploadingVideo.value = true
  uploadProgressText.value = 'Preparando video para subir...'
  resetUploadState()

  try {
    const uploadPayload = {
      title: `Ejercicio: ${form.name.trim()}`,
      description: `Video del ejercicio ${form.name.trim()}`,
      file: selectedVideoFile.value,
    }

    uploadProgressText.value = 'Subiendo video a Supabase...'
    const result = await uploadVideoOnly(uploadPayload)

    if (!result) {
      throw new Error(uploadState.error || 'Error al subir el video')
    }

    const cleanUrl = result.url.trim()
    uploadProgressText.value = 'Video subido correctamente'
    return cleanUrl
  } catch (err: any) {
    console.error('[ExerciseModal] Error subiendo video:', err)
    throw err
  } finally {
    isUploadingVideo.value = false
  }
}

const verifyVideoUrl = async (url: string): Promise<boolean> => {
  isVerifyingUrl.value = true
  urlVerificationError.value = ''

  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type') || ''
    const isValid = response.ok && contentType.startsWith('video/')

    if (!isValid) {
      urlVerificationError.value = `URL no válida. Content-Type: ${contentType || 'desconocido'}`
      return false
    }

    return true
  } catch (err: any) {
    urlVerificationError.value = 'No se pudo verificar la URL del video'
    return false
  } finally {
    isVerifyingUrl.value = false
  }
}

const openUrlVerification = async (url: string) => {
  verifiedVideoUrl.value = url
  showUrlVerificationModal.value = true
}

const confirmUrlAndSend = async () => {
  showUrlVerificationModal.value = false
  await sendExercisePayload(verifiedVideoUrl.value)
}

const retryUpload = async () => {
  showUrlVerificationModal.value = false
  verifiedVideoUrl.value = ''
  await handleSubmit()
}

const sendExercisePayload = async (videoUrl: string) => {
  isSubmitting.value = true
  try {
    const targetIds = props.equipmentId
      ? [props.equipmentId]
      : selectedEquipmentIds.value

    emit('saved', {
      name: form.name.trim(),
      muscle_group: form.muscle_group,
      difficulty: form.difficulty,
      videoFile: null,
      videoUrl,
      equipmentIds: targetIds,
    })
    resetForm()
    emit('close')
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  try {
    // Si hay video, subir a Supabase primero
    if (selectedVideoFile.value) {
      const supabaseUrl = await uploadVideoToSupabase()

      if (!supabaseUrl) {
        alert('Error al subir el video. Intente nuevamente.')
        return
      }

      // Abrir modal de verificación de URL
      await openUrlVerification(supabaseUrl)
      return // El flujo continúa desde confirmUrlAndSend
    }

    // Si no hay video, enviar directamente
    const targetIds = props.equipmentId
      ? [props.equipmentId]
      : selectedEquipmentIds.value

    emit('saved', {
      name: form.name.trim(),
      muscle_group: form.muscle_group,
      difficulty: form.difficulty,
      videoFile: null,
      videoUrl: '',
      equipmentIds: targetIds,
    })
    resetForm()
    emit('close')
  } catch (err: any) {
    alert(err.message || 'Error al procesar el ejercicio')
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.isOpen, (open) => {
  if (!open) resetForm()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 250 } }"
        :leave="{ opacity: 0, transition: { duration: 200 } }"
        class="absolute inset-0 bg-black/40 backdrop-blur-md"
        @click="handleClose"
      />

      <!-- Modal card -->
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.85, y: 30 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: [0.16, 1, 0.3, 1] } }"
        :leave="{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 250 } }"
        class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-100/60 overflow-hidden max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-6 pt-6 pb-5">
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <pattern id="exercise-modal-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect x="10" y="10" width="12" height="40" fill="white" opacity="0.25" rx="2" />
                  <rect x="28" y="10" width="12" height="45" fill="white" opacity="0.2" rx="2" />
                  <rect x="46" y="10" width="12" height="35" fill="white" opacity="0.25" rx="2" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#exercise-modal-pattern)" />
            </svg>
          </div>

          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">Agregar Ejercicio</h3>
            </div>
            <button
              @click="handleClose"
              class="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all duration-300"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Formulario con scroll -->
        <div class="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
          <form @submit.prevent="handleSubmit" class="px-6 py-6 space-y-5">
            <!-- Nombre -->
            <div v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { delay: 0.1, duration: 400, ease: [0.16, 1, 0.3, 1] } }">
              <label for="ex-name" class="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del ejercicio *</label>
              <input
                id="ex-name"
                v-model="form.name"
                type="text"
                placeholder="Ej: Press de banca"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                :class="{ 'border-red-300 focus:ring-red-400 focus:border-red-400': errors.name }"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
            </div>

            <!-- Grupo muscular -->
            <div v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { delay: 0.15, duration: 400, ease: [0.16, 1, 0.3, 1] } }">
              <label for="ex-muscle" class="block text-sm font-semibold text-gray-700 mb-1.5">Grupo muscular *</label>
              <select
                id="ex-muscle"
                v-model="form.muscle_group"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300 appearance-none"
                :class="{ 'border-red-300 focus:ring-red-400 focus:border-red-400': errors.muscle_group }"
              >
                <option value="" disabled>Seleccionar grupo</option>
                <option v-for="group in muscleGroups" :key="group.value" :value="group.value">
                  {{ group.icon }} {{ group.label }}
                </option>
              </select>
              <p v-if="errors.muscle_group" class="mt-1 text-xs text-red-500">{{ errors.muscle_group }}</p>
            </div>

            <!-- Dificultad -->
            <div v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { delay: 0.2, duration: 400, ease: [0.16, 1, 0.3, 1] } }">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Dificultad</label>
              <div class="flex gap-2">
                <button
                  v-for="level in difficultyLevels"
                  :key="level.value"
                  type="button"
                  @click="form.difficulty = level.value"
                  class="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border-2 transition-all duration-300"
                  :class="form.difficulty === level.value
                    ? `${level.color} border-current shadow-sm scale-[1.02]`
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-500'
                  "
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <!-- ============================================================
                 SELECCIÓN DE EQUIPOS
                 ============================================================ -->
            <div v-if="!equipmentId" v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { delay: 0.25, duration: 400, ease: [0.16, 1, 0.3, 1] } }">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Equipos <span class="text-gray-400 font-normal">(requerido)</span>
              </label>

            <!-- Botón para abrir selector -->
            <button
              v-if="selectedEquipmentIds.length === 0"
              type="button"
              @click="openEquipmentModal"
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 300 } }"
              class="w-full border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer group"
              :class="errors.equipment
                ? 'border-red-300 hover:border-red-400 hover:bg-red-50/30'
                : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'"
            >
              <div
                class="w-12 h-12 mx-auto mb-3 bg-amber-50 border border-amber-200 group-hover:bg-amber-100 rounded-2xl flex items-center justify-center transition-colors"
              >
                <svg class="w-6 h-6 text-amber-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-600 mb-1">
                <span class="text-amber-600 group-hover:underline">Seleccionar equipos</span>
              </p>
              <p class="text-xs text-gray-400">El ejercicio se vinculará a los equipos elegidos</p>
            </button>

            <!-- Equipos seleccionados -->
            <div v-else class="space-y-2">
              <div
                v-for="(eq, index) in getSelectedEquipmentNames()"
                :key="eq"
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: index * 0.05, duration: 300 } }"
                class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200"
              >
                <div class="w-8 h-8 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span class="flex-1 text-sm font-semibold text-gray-800 truncate">{{ eq }}</span>
                <button
                  @click="removeSelectedEquipment(selectedEquipmentIds[index])"
                  type="button"
                  class="p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <button
                @click="openEquipmentModal"
                type="button"
                class="text-xs text-gray-400 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar más equipos
              </button>
            </div>

            <p v-if="errors.equipment" class="mt-1.5 text-xs text-red-500">{{ errors.equipment }}</p>
          </div>

          <!-- Video del ejercicio (opcional) -->
          <div v-motion :initial="{ opacity: 0, x: -30 }" :enter="{ opacity: 1, x: 0, transition: { delay: 0.3, duration: 400, ease: [0.16, 1, 0.3, 1] } }">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              Video del ejercicio <span class="text-gray-400 font-normal">(opcional)</span>
            </label>

            <!-- Zona de drag & drop / selección -->
            <div
              v-if="!selectedVideoFile"
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 300 } }"
              class="relative border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer group"
              :class="isDraggingVideo
                ? 'border-amber-400 bg-amber-50/60 scale-[1.01]'
                : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'"
              @click="videoFileInputRef?.click()"
              @dragover.prevent="isDraggingVideo = true"
              @dragleave.prevent="isDraggingVideo = false"
              @drop.prevent="onVideoFileDrop"
            >
              <input
                ref="videoFileInputRef"
                type="file"
                accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                class="hidden"
                @change="onVideoFileChange"
              />
              <div
                v-motion
                :initial="{ scale: 0.8 }"
                :enter="{ scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }"
                class="w-12 h-12 mx-auto mb-3 bg-amber-50 border border-amber-200 group-hover:bg-amber-100 rounded-2xl flex items-center justify-center transition-colors"
              >
                <svg class="w-6 h-6 text-amber-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-600 mb-1">
                <span class="text-amber-600 group-hover:underline">Seleccionar archivo</span> o arrastrar aquí
              </p>
              <p class="text-xs text-gray-400">MP4, MOV, AVI o WebM (máx. 100MB)</p>
            </div>

            <!-- Archivo seleccionado + preview -->
            <div
              v-else
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
              class="space-y-3"
            >
              <!-- Info del archivo -->
              <div class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div class="w-10 h-10 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{{ selectedVideoFile.name }}</p>
                  <p class="text-xs text-gray-400">{{ formatFileSize(selectedVideoFile.size) }}</p>
                </div>
                <button
                  @click.stop="removeVideoFile"
                  type="button"
                  class="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Preview del video -->
              <div
                v-motion
                :initial="{ opacity: 0, scale: 0.95 }"
                :enter="{ opacity: 1, scale: 1, transition: { delay: 0.1, duration: 300 } }"
                class="rounded-2xl overflow-hidden border border-amber-200 shadow-sm"
              >
                <CustomVideoPlayer :video-src="videoFilePreview" />
              </div>

              <!-- Botón cambiar archivo -->
              <button
                @click="videoFileInputRef?.click()"
                type="button"
                class="text-xs text-gray-400 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Cambiar archivo
              </button>
            </div>

            <!-- Error de video -->
            <p v-if="errors.video" class="mt-1.5 text-xs text-red-500">{{ errors.video }}</p>
          </div>
        </form>
        </div>

        <!-- Footer con animación -->
        <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 400, ease: [0.16, 1, 0.3, 1] } }" class="px-6 pb-6 flex gap-3 flex-shrink-0 border-t border-gray-100 pt-4">
          <button
            type="button"
            @click="handleClose"
            class="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting || !form.name.trim() || !form.muscle_group"
            class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </span>
            <span v-else>Agregar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         MODAL DE SELECCIÓN DE EQUIPOS
         ============================================================ -->
    <div v-if="showEquipmentModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 200 } }"
        :leave="{ opacity: 0, transition: { duration: 150 } }"
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="showEquipmentModal = false"
      />

      <!-- Modal card -->
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.9, y: 20 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350, ease: [0.16, 1, 0.3, 1] } }"
        :leave="{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 200 } }"
        class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-100/60 overflow-hidden max-h-[75vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="relative bg-gradient-to-r from-amber-600 to-orange-600 px-5 pt-5 pb-4 flex-shrink-0">
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <pattern id="eq-modal-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <rect x="5" y="5" width="10" height="35" fill="white" opacity="0.25" rx="2" />
                  <rect x="20" y="5" width="10" height="40" fill="white" opacity="0.2" rx="2" />
                  <rect x="35" y="5" width="10" height="30" fill="white" opacity="0.25" rx="2" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#eq-modal-pattern)" />
            </svg>
          </div>

          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Seleccionar Equipos</h3>
                <p class="text-xs text-white/70">{{ selectedEquipmentIds.length }} seleccionado(s)</p>
              </div>
            </div>
            <button
              @click="showEquipmentModal = false"
              class="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all duration-300"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Buscador -->
        <div class="px-5 pt-4 pb-3 flex-shrink-0">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="equipmentSearch"
              @input="filterEquipment"
              type="text"
              placeholder="Buscar equipo..."
              class="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Lista de equipos -->
        <div class="flex-1 overflow-y-auto px-5 pb-3">
          <!-- Loading -->
          <div v-if="isLoadingEquipment" class="flex flex-col items-center justify-center py-10">
            <svg class="animate-spin h-8 w-8 text-amber-500 mb-3" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p class="text-sm text-gray-400">Cargando equipos...</p>
          </div>

          <!-- Sin resultados -->
          <div v-else-if="filteredEquipments.length === 0" class="flex flex-col items-center justify-center py-10">
            <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p class="text-sm text-gray-400">No se encontraron equipos</p>
          </div>

          <!-- Lista -->
          <div v-else class="space-y-2">
            <button
              v-for="(eq, index) in filteredEquipments"
              :key="eq.id"
              type="button"
              @click="toggleEquipmentSelection(eq.id)"
              v-motion
              :initial="{ opacity: 0, x: -15 }"
              :enter="{ opacity: 1, x: 0, transition: { delay: index * 0.03, duration: 250 } }"
              class="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 text-left"
              :class="isSelected(eq.id)
                ? 'bg-amber-50 border-amber-400 shadow-sm'
                : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-amber-50/30'"
            >
              <!-- Checkbox custom -->
              <div
                class="flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                :class="isSelected(eq.id)
                  ? 'bg-amber-500 border-amber-500'
                  : 'bg-white border-gray-300'"
              >
                <svg v-if="isSelected(eq.id)" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <!-- Info del equipo -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ eq.name }}</p>
                <p class="text-xs text-gray-400">{{ eq.type }}</p>
              </div>

              <!-- Badge de estado -->
              <span
                class="flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full"
                :class="{
                  'bg-emerald-100 text-emerald-700': eq.status === 'active',
                  'bg-amber-100 text-amber-700': eq.status === 'pending',
                  'bg-red-100 text-red-700': eq.status === 'inactive',
                }"
              >
                {{ eq.status === 'active' ? 'Activo' : eq.status === 'pending' ? 'Pendiente' : 'Inactivo' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            @click="confirmEquipmentSelection"
            :disabled="selectedEquipmentIds.length === 0"
            class="w-full px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
          >
            Confirmar selección ({{ selectedEquipmentIds.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         OVERLAY DE CARGA - SUBIENDO VIDEO A SUPABASE
         ============================================================ -->
    <div v-if="isUploadingVideo" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.9, y: 20 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: [0.16, 1, 0.3, 1] } }"
        class="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        <!-- Spinner animado -->
        <div class="relative mx-auto w-20 h-20 mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-amber-100" />
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
          <div class="absolute inset-2 rounded-full border-4 border-transparent border-t-orange-400 animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;" />
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        </div>

        <h3 class="text-lg font-bold text-gray-800 mb-2">Subiendo video</h3>
        <p class="text-sm text-gray-500 mb-4">{{ uploadProgressText }}</p>

        <!-- Barra de progreso -->
        <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${uploadState.progress.percentage}%` }"
          />
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ formatProgress() }}</p>
      </div>
    </div>

    <!-- ============================================================
         MODAL DE VERIFICACIÓN DE URL
         ============================================================ -->
    <div v-if="showUrlVerificationModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 200 } }"
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="retryUpload"
      />

      <!-- Modal card -->
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.9, y: 20 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: [0.16, 1, 0.3, 1] } }"
        class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <!-- Header -->
        <div class="relative bg-gradient-to-r from-emerald-500 to-teal-500 px-6 pt-6 pb-5">
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <pattern id="verify-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <circle cx="25" cy="25" r="6" fill="white" opacity="0.25" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#verify-pattern)" />
            </svg>
          </div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Verificar video subido</h3>
                <p class="text-xs text-white/70">El video fue subido a Supabase correctamente</p>
              </div>
            </div>
            <button
              @click="showUrlVerificationModal = false"
              class="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-all duration-300"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Preview del video -->
        <div class="px-6 pt-5">
          <div class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <CustomVideoPlayer :video-src="verifiedVideoUrl" />
          </div>
        </div>

        <!-- Info de la URL -->
        <div class="px-6 pt-4">
          <div class="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <svg class="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-emerald-800 mb-1">URL pública de Supabase:</p>
              <p class="text-[11px] text-emerald-600 break-all leading-relaxed">{{ verifiedVideoUrl }}</p>
            </div>
          </div>
        </div>

        <!-- Verificación en progreso -->
        <div v-if="isVerifyingUrl" class="px-6 py-4 flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="text-sm text-gray-500">Verificando URL...</span>
        </div>

        <!-- Error de verificación -->
        <div v-if="urlVerificationError" class="px-6 py-3">
          <div class="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
            <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xs text-red-600">{{ urlVerificationError }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6 pt-4 flex gap-3">
          <button
            type="button"
            @click="retryUpload"
            class="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-300"
          >
            Reintentar
          </button>
          <button
            type="button"
            @click="confirmUrlAndSend"
            :disabled="isVerifyingUrl"
            class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98]"
          >
            <span v-if="isVerifyingUrl" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando...
            </span>
            <span v-else>Confirmar y enviar</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
