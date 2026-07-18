/**
 * Domain Service: Exercise Video Upload
 * Pure business logic for uploading exercise videos to storage.
 * No framework dependencies — only domain types.
 */

import type { VideoRepository } from '@/features/video/domain/repositories/VideoRepository'
import type { VideoUploadPayload } from '@/features/video/domain/entities/VideoEntity'

// ── Value Objects ────────────────────────────────────────────

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  url: string
  storagePath: string
  fileName: string
}

export type UploadProgressCallback = (progress: UploadProgress) => void

// ── Domain Errors ────────────────────────────────────────────

export class VideoUploadError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'VideoUploadError'
  }
}

// ── Service ──────────────────────────────────────────────────

export interface ExerciseVideoUploadServiceConfig {
  videoRepository: VideoRepository
  currentUserId: string
}

export class ExerciseVideoUploadService {
  constructor(private readonly config: ExerciseVideoUploadServiceConfig) {}

  /**
   * Uploads a video file to storage and returns the public URL.
   * Does NOT create a DB record — the caller handles persistence.
   */
  async uploadVideo(
    payload: VideoUploadPayload,
    onProgress?: UploadProgressCallback,
  ): Promise<UploadResult> {
    this.validatePayload(payload)

    try {
      const result = await this.config.videoRepository.uploadVideo(payload, onProgress)

      if (!result.url) {
        throw new VideoUploadError('Storage returned no public URL')
      }

      return {
        url: result.url,
        storagePath: result.storagePath,
        fileName: result.fileName,
      }
    } catch (error) {
      if (error instanceof VideoUploadError) throw error
      throw new VideoUploadError(
        error instanceof Error ? error.message : 'Error desconocido al subir video',
        error,
      )
    }
  }

  private validatePayload(payload: VideoUploadPayload): void {
    if (!payload.file) {
      throw new VideoUploadError('No se proporcionó archivo de video')
    }
    if (payload.file.size === 0) {
      throw new VideoUploadError('El archivo de video está vacío')
    }
    const maxSize = 2 * 1024 * 1024 * 1024 // 2 GB
    if (payload.file.size > maxSize) {
      throw new VideoUploadError('El archivo excede el tamaño máximo de 2 GB')
    }
  }
}
