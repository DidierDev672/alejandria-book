/**
 * Entidad de dominio para videos
 * Representa un video en el sistema de Alejandría
 */

export interface Video {
  id: string
  title: string
  description: string
  url: string
  storagePath: string
  fileName: string
  mimeType: string
  sizeBytes: number
  durationSeconds?: number
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  metadata?: VideoMetadata
}

export interface VideoMetadata {
  width?: number
  height?: number
  codec?: string
  bitrate?: number
  frameRate?: number
}

export interface VideoUploadPayload {
  title: string
  description: string
  file: File
  metadata?: Partial<VideoMetadata>
}

export interface VideoUploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface VideoUploadState {
  isUploading: boolean
  isProcessing: boolean
  progress: VideoUploadProgress
  error: string | null
  video: Video | null
}

export class VideoValidator {
  static readonly ALLOWED_MIME_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ]

  static readonly MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB

  static validateFile(file: File): void {
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(
        `Formato de video no soportado. Formatos permitidos: ${this.ALLOWED_MIME_TYPES.join(', ')}`
      )
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `El archivo es demasiado grande. Tamaño máximo: ${this.formatBytes(this.MAX_FILE_SIZE)}`
      )
    }

    if (file.size === 0) {
      throw new Error('El archivo está vacío')
    }
  }

  static validatePayload(payload: VideoUploadPayload): void {
    if (!payload.title.trim()) {
      throw new Error('El título es obligatorio')
    }

    if (payload.title.length > 200) {
      throw new Error('El título no puede exceder 200 caracteres')
    }

    if (payload.description.length > 2000) {
      throw new Error('La descripción no puede exceder 2000 caracteres')
    }

    this.validateFile(payload.file)
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
