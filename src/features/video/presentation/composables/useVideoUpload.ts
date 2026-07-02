/**
 * Composable Vue 3 para manejar la subida de videos
 * Maneja estado reactivo, progreso y errores
 */

import { reactive, readonly, toRaw } from 'vue'
import type {
  Video,
  VideoUploadPayload,
  VideoUploadState,
  VideoUploadProgress
} from '../../domain/entities/VideoEntity'
import { VideoService } from '../../application/VideoService'
import type { VideoRepository } from '../../domain/repositories/VideoRepository'

// Estado reactivo compartido (opcional, para persistencia entre componentes)
const globalState = reactive<VideoUploadState>(VideoService.createInitialState())

interface UseVideoUploadOptions {
  useGlobalState?: boolean
  repository: VideoRepository
  currentUserId: string
}

interface UseVideoUploadReturn {
  // Estado (readonly para evitar modificaciones externas directas)
  state: VideoUploadState

  // Acciones
  uploadVideo: (payload: VideoUploadPayload) => Promise<Video | null>
  uploadVideoOnly: (payload: VideoUploadPayload) => Promise<{ url: string; storagePath: string; fileName: string } | null>
  resetState: () => void
  cancelUpload: () => void

  // Utilidades
  formatProgress: () => string
  isComplete: () => boolean
  hasError: () => boolean
}

export function useVideoUpload(options: UseVideoUploadOptions): UseVideoUploadReturn {
  // Usar estado global o local según configuración
  const state = options.useGlobalState
    ? globalState
    : reactive<VideoUploadState>(VideoService.createInitialState())

  // Instanciar servicio
  const service = new VideoService(options.repository, {
    currentUserId: options.currentUserId
  })

  // AbortController para cancelar subidas
  let currentAbortController: AbortController | null = null

  /**
   * Handler de progreso que actualiza el estado reactivo
   */
  const handleProgress = (progress: VideoUploadProgress): void => {
    state.progress = progress
  }

  /**
   * Sube un video completo: archivo + metadatos + registro en BD
   */
  const uploadVideo = async (payload: VideoUploadPayload): Promise<Video | null> => {
    // Resetear estado previo
    resetState()

    // Iniciar upload
    state.isUploading = true
    state.error = null

    try {
      const video = await service.uploadVideo(payload, handleProgress)

      state.video = video
      state.isUploading = false
      state.progress = { loaded: 100, total: 100, percentage: 100 }

      return video
    } catch (error) {
      state.isUploading = false

      if (error instanceof Error) {
        // Detectar si fue cancelado por el usuario
        if (error.name === 'AbortError') {
          state.error = 'Subida cancelada por el usuario'
        } else {
          state.error = error.message
        }
      } else {
        state.error = 'Error desconocido durante la subida'
      }

      console.error('Video upload error:', error)
      return null
    }
  }

  /**
   * Sube solo el archivo a storage y retorna la URL pública
   * Sin crear registro en base de datos (útil para APIs externas)
   */
  const uploadVideoOnly = async (
    payload: VideoUploadPayload
  ): Promise<{ url: string; storagePath: string; fileName: string } | null> => {
    // Resetear estado previo
    resetState()

    // Iniciar upload
    state.isUploading = true
    state.error = null

    try {
      const result = await service.uploadVideoOnly(payload, handleProgress)

      state.isUploading = false
      state.progress = { loaded: 100, total: 100, percentage: 100 }

      return result
    } catch (error) {
      state.isUploading = false

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          state.error = 'Subida cancelada por el usuario'
        } else {
          state.error = error.message
        }
      } else {
        state.error = 'Error desconocido durante la subida'
      }

      console.error('Video upload error:', error)
      return null
    }
  }

  /**
   * Resetea el estado a valores iniciales
   */
  const resetState = (): void => {
    if (currentAbortController) {
      currentAbortController.abort()
      currentAbortController = null
    }

    state.isUploading = false
    state.isProcessing = false
    state.progress = { loaded: 0, total: 0, percentage: 0 }
    state.error = null
    state.video = null
  }

  /**
   * Cancela una subida en progreso
   */
  const cancelUpload = (): void => {
    if (currentAbortController) {
      currentAbortController.abort()
    }
    resetState()
    state.error = 'Subida cancelada'
  }

  /**
   * Formatea el progreso para mostrar al usuario
   */
  const formatProgress = (): string => {
    const { loaded, total, percentage } = state.progress

    if (total === 0) return '0%'

    const loadedFormatted = formatBytes(loaded)
    const totalFormatted = formatBytes(total)

    return `${percentage}% (${loadedFormatted} / ${totalFormatted})`
  }

  /**
   * Verifica si la subida está completa
   */
  const isComplete = (): boolean => {
    return state.video !== null && !state.isUploading && state.error === null
  }

  /**
   * Verifica si hay un error
   */
  const hasError = (): boolean => {
    return state.error !== null
  }

  /**
   * Formatea bytes a unidades legibles
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return {
    // Retornar estado como readonly para prevenir modificaciones externas
    state: readonly(state) as VideoUploadState,

    uploadVideo,
    uploadVideoOnly,
    resetState,
    cancelUpload,
    formatProgress,
    isComplete,
    hasError
  }
}

/**
 * Composable para gestionar múltiples subidas simultáneas
 */
export function useVideoUploadQueue(options: UseVideoUploadOptions) {
  const uploads = reactive<Map<string, VideoUploadState & { id: string; fileName: string }>>(new Map())

  const addUpload = (id: string, fileName: string): VideoUploadState => {
    const uploadState = reactive({
      id,
      fileName,
      ...VideoService.createInitialState()
    })
    uploads.set(id, uploadState)
    return uploadState
  }

  const removeUpload = (id: string): void => {
    uploads.delete(id)
  }

  const getUpload = (id: string): (VideoUploadState & { id: string; fileName: string }) | undefined => {
    return uploads.get(id)
  }

  const getAllUploads = (): (VideoUploadState & { id: string; fileName: string })[] => {
    return Array.from(uploads.values())
  }

  const clearCompleted = (): void => {
    const completed = Array.from(uploads.entries())
      .filter(([, state]) => state.video !== null || state.error !== null)
      .map(([id]) => id)

    completed.forEach(id => uploads.delete(id))
  }

  return {
    uploads: readonly(uploads),
    addUpload,
    removeUpload,
    getUpload,
    getAllUploads,
    clearCompleted
  }
}
