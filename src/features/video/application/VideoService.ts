/**
 * Servicio de aplicación para operaciones con videos
 * Orquesta la subida de archivos y registro en base de datos
 */

import type {
  Video,
  VideoUploadPayload,
  VideoUploadState
} from '../domain/entities/VideoEntity'
import { VideoValidator } from '../domain/entities/VideoEntity'
import type { VideoRepository, UploadProgressCallback } from '../domain/repositories/VideoRepository'

export interface VideoServiceConfig {
  currentUserId: string
}

export class VideoService {
  constructor(
    private readonly repository: VideoRepository,
    private readonly config: VideoServiceConfig
  ) {}

  /**
   * Procesa la subida completa de un video: valida, sube a storage y registra en BD
   */
  async uploadVideo(
    payload: VideoUploadPayload,
    onProgress?: UploadProgressCallback
  ): Promise<Video> {
    // 1. Validar payload
    VideoValidator.validatePayload(payload)

    // 2. Subir archivo a storage
    const { url, storagePath, fileName } = await this.repository.uploadVideo(
      payload,
      onProgress
    )

    // 3. Crear registro en base de datos
    try {
      const video = await this.repository.createVideoRecord({
        title: payload.title,
        description: payload.description,
        url,
        storagePath,
        fileName,
        mimeType: payload.file.type,
        sizeBytes: payload.file.size,
        createdBy: this.config.currentUserId,
        metadata: payload.metadata
      })

      return video
    } catch (error) {
      // Si falla el registro en BD, intentar limpiar el archivo subido
      console.error('Error creating video record, attempting cleanup:', error)
      try {
        await this.repository.deleteVideo('', storagePath)
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError)
      }
      throw error
    }
  }

  /**
   * Sube solo el archivo a storage sin crear registro en base de datos
   * Útil cuando solo necesitas la URL pública para enviar a otra API
   */
  async uploadVideoOnly(
    payload: VideoUploadPayload,
    onProgress?: UploadProgressCallback
  ): Promise<{ url: string; storagePath: string; fileName: string }> {
    // 1. Validar payload
    VideoValidator.validatePayload(payload)

    // 2. Subir archivo a storage y retornar URL directamente
    const result = await this.repository.uploadVideo(payload, onProgress)

    return result
  }

  /**
   * Elimina un video del sistema
   */
  async deleteVideo(videoId: string, storagePath: string): Promise<void> {
    await this.repository.deleteVideo(videoId, storagePath)
  }

  /**
   * Obtiene un video por ID
   */
  async getVideo(videoId: string): Promise<Video | null> {
    return this.repository.getVideoById(videoId)
  }

  /**
   * Lista videos con paginación
   */
  async listVideos(limit?: number, offset?: number): Promise<Video[]> {
    return this.repository.listVideos(limit, offset)
  }

  /**
   * Genera un estado inicial para el proceso de subida
   */
  static createInitialState(): VideoUploadState {
    return {
      isUploading: false,
      isProcessing: false,
      progress: {
        loaded: 0,
        total: 0,
        percentage: 0
      },
      error: null,
      video: null
    }
  }
}
