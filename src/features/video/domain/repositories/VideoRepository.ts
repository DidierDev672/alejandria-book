/**
 * Interfaz de repositorio para videos
 * Define el contrato que debe implementar cualquier infraestructura de video
 */

import type { Video, VideoUploadPayload, VideoUploadProgress } from '../entities/VideoEntity'

export interface UploadProgressCallback {
  (progress: VideoUploadProgress): void
}

export interface VideoRepository {
  /**
   * Sube un archivo de video al almacenamiento
   * @param payload - Datos del video y archivo
   * @param onProgress - Callback opcional para reportar progreso
   * @returns Promise con la URL pública del video
   */
  uploadVideo(
    payload: VideoUploadPayload,
    onProgress?: UploadProgressCallback
  ): Promise<{ url: string; storagePath: string; fileName: string }>

  /**
   * Registra un video en la base de datos después de subirlo
   * @param videoData - Datos completos del video
   * @returns Promise con el video registrado
   */
  createVideoRecord(videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video>

  /**
   * Elimina un video del almacenamiento y la base de datos
   * @param videoId - ID del video a eliminar
   * @param storagePath - Ruta del archivo en el storage
   */
  deleteVideo(videoId: string, storagePath: string): Promise<void>

  /**
   * Obtiene un video por su ID
   * @param videoId - ID del video
   */
  getVideoById(videoId: string): Promise<Video | null>

  /**
   * Lista videos con paginación opcional
   * @param limit - Límite de resultados
   * @param offset - Offset para paginación
   */
  listVideos(limit?: number, offset?: number): Promise<Video[]>
}
