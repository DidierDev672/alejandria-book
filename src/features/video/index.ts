/**
 * Feature: Video
 * Módulo completo para gestión de videos con Supabase
 */

// Domain
export type {
  Video,
  VideoMetadata,
  VideoUploadPayload,
  VideoUploadProgress,
  VideoUploadState
} from './domain/entities/VideoEntity'
export { VideoValidator } from './domain/entities/VideoEntity'
export type {
  VideoRepository,
  UploadProgressCallback
} from './domain/repositories/VideoRepository'

// Application
export { VideoService } from './application/VideoService'
export type { VideoServiceConfig } from './application/VideoService'

// Infrastructure
export { SupabaseVideoRepository } from './infrastructure/repositories/SupabaseVideoRepository'
export type { SupabaseConfig } from './infrastructure/repositories/SupabaseVideoRepository'
export { getSupabaseVideoConfig } from './infrastructure/config/supabase'

// Presentation
export { useVideoUpload, useVideoUploadQueue } from './presentation/composables/useVideoUpload'

// Component
export { default as VideoUploadForm } from './presentation/components/VideoUploadForm.vue'
