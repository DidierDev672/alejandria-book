<script setup lang="ts">
/**
 * Componente de formulario para subir videos
 * Ejemplo de uso del composable useVideoUpload
 */

import { ref, computed } from 'vue'
import { useVideoUpload } from '../composables/useVideoUpload'
import { SupabaseVideoRepository } from '../../infrastructure/repositories/SupabaseVideoRepository'
import { getSupabaseVideoConfig } from '../../infrastructure/config/supabase'
import { VideoValidator } from '../../domain/entities/VideoEntity'
import type { VideoUploadPayload } from '../../domain/entities/VideoEntity'

// Props
interface Props {
  userId: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'success', videoId: string): void
  (e: 'error', message: string): void
}>()

// Inicializar repositorio y composable
const repository = new SupabaseVideoRepository(getSupabaseVideoConfig())

const { state, uploadVideo, resetState, cancelUpload, formatProgress } = useVideoUpload({
  repository,
  currentUserId: props.userId
})

// Formulario
const title = ref('')
const description = ref('')
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragActive = ref(false)

// Validación
const titleError = ref('')
const fileError = ref('')

const isValid = computed(() => {
  return title.value.trim() && selectedFile.value && !titleError.value && !fileError.value
})

// Handlers
const validateTitle = () => {
  if (!title.value.trim()) {
    titleError.value = 'El título es obligatorio'
  } else if (title.value.length > 200) {
    titleError.value = 'El título no puede exceder 200 caracteres'
  } else {
    titleError.value = ''
  }
}

const validateFile = (file: File): boolean => {
  try {
    VideoValidator.validateFile(file)
    fileError.value = ''
    return true
  } catch (error) {
    if (error instanceof Error) {
      fileError.value = error.message
    }
    return false
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (validateFile(file)) {
      selectedFile.value = file
    } else {
      selectedFile.value = null
    }
  }
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = false

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (validateFile(file)) {
      selectedFile.value = file
    }
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleSubmit = async () => {
  validateTitle()

  if (!isValid.value || !selectedFile.value) {
    return
  }

  const payload: VideoUploadPayload = {
    title: title.value,
    description: description.value,
    file: selectedFile.value
  }

  const video = await uploadVideo(payload)

  if (video) {
    emit('success', video.id)
    // Opcional: limpiar formulario después de éxito
    // resetForm()
  } else if (state.error) {
    emit('error', state.error)
  }
}

const resetForm = () => {
  title.value = ''
  description.value = ''
  selectedFile.value = null
  titleError.value = ''
  fileError.value = ''
  resetState()
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Formatear tamaño del archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="font-serif text-2xl font-bold text-stone-800">Subir Video</h2>
      <p class="mt-1 text-sm text-stone-500">Comparte tu contenido con la biblioteca</p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Título -->
      <div>
        <label for="title" class="mb-1.5 block text-sm font-medium text-stone-700">
          Título <span class="text-red-500">*</span>
        </label>
        <input
          id="title"
          v-model="title"
          type="text"
          :disabled="state.isUploading"
          class="w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:opacity-50"
          placeholder="Nombre del video"
          @blur="validateTitle"
        />
        <p v-if="titleError" class="mt-1.5 text-sm text-red-600">{{ titleError }}</p>
      </div>

      <!-- Descripción -->
      <div>
        <label for="description" class="mb-1.5 block text-sm font-medium text-stone-700">
          Descripción
        </label>
        <textarea
          id="description"
          v-model="description"
          :disabled="state.isUploading"
          rows="3"
          class="w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-stone-800 placeholder-stone-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:opacity-50 resize-none"
          placeholder="Describe el contenido del video..."
        />
      </div>

      <!-- Área de Drag & Drop para archivo -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-stone-700">
          Archivo de video <span class="text-red-500">*</span>
        </label>

        <div
          v-if="!selectedFile"
          :class="[
            'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
            dragActive
              ? 'border-amber-500 bg-amber-100'
              : 'border-amber-300 bg-white hover:border-amber-400 hover:bg-amber-50',
            state.isUploading && 'pointer-events-none opacity-50'
          ]"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          @dragover.prevent
          @drop="handleDrop"
          @click="fileInputRef?.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            class="hidden"
            @change="handleFileSelect"
          />

          <!-- Icono -->
          <svg
            class="mb-3 h-12 w-12 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p class="text-center text-sm font-medium text-stone-600">
            Arrastra un video aquí o <span class="text-amber-600 underline">haz clic para seleccionar</span>
          </p>
          <p class="mt-1 text-xs text-stone-400">MP4, WebM, OGG hasta 2GB</p>
        </div>

        <!-- Archivo seleccionado -->
        <div
          v-else
          class="flex items-center justify-between rounded-xl border border-amber-300 bg-white p-4"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-stone-800">{{ selectedFile.name }}</p>
              <p class="text-xs text-stone-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>

          <button
            v-if="!state.isUploading"
            type="button"
            class="rounded-lg p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-500"
            @click.stop="clearFile"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p v-if="fileError" class="mt-1.5 text-sm text-red-600">{{ fileError }}</p>
      </div>

      <!-- Barra de progreso -->
      <div v-if="state.isUploading" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium text-stone-600">
            {{ state.progress.percentage < 100 ? 'Subiendo...' : 'Procesando...' }}
          </span>
          <span class="font-medium text-amber-600">{{ formatProgress() }}</span>
        </div>

        <div class="h-2 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            class="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out"
            :style="{ width: `${state.progress.percentage}%` }"
          />
        </div>

        <button
          type="button"
          class="text-sm text-red-500 underline transition hover:text-red-600"
          @click="cancelUpload"
        >
          Cancelar subida
        </button>
      </div>

      <!-- Error -->
      <div
        v-if="state.error && !state.isUploading"
        class="rounded-xl border border-red-200 bg-red-50 p-4"
      >
        <div class="flex items-start gap-3">
          <svg class="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p class="font-medium text-red-800">Error al subir</p>
            <p class="text-sm text-red-600">{{ state.error }}</p>
          </div>
        </div>
      </div>

      <!-- Éxito -->
      <div
        v-if="state.video && !state.isUploading"
        class="rounded-xl border border-green-200 bg-green-50 p-4"
      >
        <div class="flex items-start gap-3">
          <svg class="mt-0.5 h-5 w-5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <p class="font-medium text-green-800">¡Video subido correctamente!</p>
            <p class="text-sm text-green-600">ID: {{ state.video.id }}</p>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="!isValid || state.isUploading"
          :class="[
            'flex-1 rounded-xl px-6 py-3 font-medium transition-all',
            !isValid || state.isUploading
              ? 'cursor-not-allowed bg-stone-300 text-stone-500'
              : 'bg-amber-600 text-white shadow-md hover:bg-amber-700 hover:shadow-lg active:scale-[0.98]'
          ]"
        >
          <span v-if="state.isUploading">Subiendo...</span>
          <span v-else>Subir Video</span>
        </button>

        <button
          type="button"
          :disabled="state.isUploading"
          class="rounded-xl border border-amber-300 bg-white px-6 py-3 font-medium text-stone-700 transition hover:bg-amber-50 disabled:opacity-50"
          @click="resetForm"
        >
          Limpiar
        </button>
      </div>
    </form>
  </div>
</template>
