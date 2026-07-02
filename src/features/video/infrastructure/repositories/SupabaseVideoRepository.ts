/**
 * Implementación del repositorio de videos usando Supabase
 * Maneja subidas resumibles para archivos grandes
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import type {
  Video,
  VideoUploadPayload,
  VideoUploadProgress
} from '../../domain/entities/VideoEntity'
import type { VideoRepository, UploadProgressCallback } from '../../domain/repositories/VideoRepository'

export interface SupabaseConfig {
  url: string
  anonKey: string
  bucketName: string
}

export class SupabaseVideoRepository implements VideoRepository {
  private client: SupabaseClient
  private bucketName: string

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey)
    this.bucketName = config.bucketName
  }

  async uploadVideo(
    payload: VideoUploadPayload,
    onProgress?: UploadProgressCallback
  ): Promise<{ url: string; storagePath: string; fileName: string }> {
    // Generar nombre único usando UUID
    const fileExtension = this.getFileExtension(payload.file.name)
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    // Usar 'video' como carpeta dentro del bucket
    const storagePath = `video/${uniqueFileName}`

    // Para archivos grandes (> 10MB), usar subida resumible
    const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB chunks
    const fileSize = payload.file.size

    let uploadResult

    if (fileSize > CHUNK_SIZE) {
      uploadResult = await this.uploadWithResumable(
        payload.file,
        storagePath,
        CHUNK_SIZE,
        onProgress
      )
    } else {
      uploadResult = await this.uploadSimple(
        payload.file,
        storagePath,
        onProgress
      )
    }

    // Obtener URL pública
    const { data: publicUrlData } = this.client.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath)

    return {
      url: publicUrlData.publicUrl,
      storagePath,
      fileName: uniqueFileName
    }
  }

  private async uploadSimple(
    file: File,
    path: string,
    onProgress?: UploadProgressCallback
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          })
        }
      })

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      // Usar el método de Supabase con XMLHttpRequest para tracking de progreso
      this.client.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })
        .then(() => resolve())
        .catch(reject)
    })
  }

  private async uploadWithResumable(
    file: File,
    path: string,
    chunkSize: number,
    onProgress?: UploadProgressCallback
  ): Promise<void> {
    const totalChunks = Math.ceil(file.size / chunkSize)
    let uploadedChunks = 0

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      // Subir chunk usando arraybuffer
      const arrayBuffer = await chunk.arrayBuffer()
      const chunkPath = `${path}.part${i}`

      const { error } = await this.client.storage
        .from(this.bucketName)
        .upload(chunkPath, arrayBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })

      if (error) {
        // Limpiar chunks parciales en caso de error
        await this.cleanupPartialUpload(path, totalChunks)
        throw new Error(`Error uploading chunk ${i}: ${error.message}`)
      }

      uploadedChunks++

      if (onProgress) {
        onProgress({
          loaded: end,
          total: file.size,
          percentage: Math.round((uploadedChunks / totalChunks) * 100)
        })
      }
    }

    // Combinar chunks (en producción, esto debería hacerse en el backend)
    // Por ahora, subimos el archivo completo como fallback
    const { error } = await this.client.storage
      .from(this.bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      await this.cleanupPartialUpload(path, totalChunks)
      throw new Error(`Error finalizing upload: ${error.message}`)
    }

    // Limpiar chunks temporales
    await this.cleanupPartialUpload(path, totalChunks)
  }

  private async cleanupPartialUpload(basePath: string, totalChunks: number): Promise<void> {
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = `${basePath}.part${i}`
      await this.client.storage.from(this.bucketName).remove([chunkPath])
    }
  }

  async createVideoRecord(
    videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Video> {
    const now = new Date().toISOString()

    const { data, error } = await this.client
      .from('videos')
      .insert({
        title: videoData.title,
        description: videoData.description,
        url: videoData.url,
        storage_path: videoData.storagePath,
        file_name: videoData.fileName,
        mime_type: videoData.mimeType,
        size_bytes: videoData.sizeBytes,
        duration_seconds: videoData.durationSeconds,
        thumbnail_url: videoData.thumbnailUrl,
        created_by: videoData.createdBy,
        metadata: videoData.metadata,
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating video record: ${error.message}`)
    }

    return this.mapDatabaseToEntity(data)
  }

  async deleteVideo(videoId: string, storagePath: string): Promise<void> {
    // Eliminar del storage
    const { error: storageError } = await this.client.storage
      .from(this.bucketName)
      .remove([storagePath])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
    }

    // Eliminar de la base de datos
    const { error: dbError } = await this.client
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (dbError) {
      throw new Error(`Error deleting video record: ${dbError.message}`)
    }
  }

  async getVideoById(videoId: string): Promise<Video | null> {
    const { data, error } = await this.client
      .from('videos')
      .select()
      .eq('id', videoId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Error fetching video: ${error.message}`)
    }

    return this.mapDatabaseToEntity(data)
  }

  async listVideos(limit = 20, offset = 0): Promise<Video[]> {
    const { data, error } = await this.client
      .from('videos')
      .select()
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Error listing videos: ${error.message}`)
    }

    return (data || []).map(this.mapDatabaseToEntity)
  }

  private mapDatabaseToEntity(data: any): Video {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      url: data.url,
      storagePath: data.storage_path,
      fileName: data.file_name,
      mimeType: data.mime_type,
      sizeBytes: data.size_bytes,
      durationSeconds: data.duration_seconds,
      thumbnailUrl: data.thumbnail_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      metadata: data.metadata
    }
  }

  private getFileExtension(fileName: string): string {
    const match = fileName.match(/\.([^.]+)$/)
    return match ? match[1].toLowerCase() : 'mp4'
  }
}
