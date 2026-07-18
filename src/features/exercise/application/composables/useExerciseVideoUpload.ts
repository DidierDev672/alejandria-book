/**
 * Composable: useExerciseVideoUpload
 * Orchestrates the video upload flow for exercise editing.
 * Application layer — wires domain service to Vue reactivity.
 */

import { reactive, readonly } from 'vue'
import {
  ExerciseVideoUploadService,
  type UploadProgress,
  type UploadResult,
} from '../../domain/services/ExerciseVideoUploadService'
import type { VideoUploadPayload } from '@/features/video/domain/entities/VideoEntity'

// ── State ────────────────────────────────────────────────────

export type UploadPhase = 'idle' | 'uploading' | 'uploaded' | 'error'

export interface ExerciseVideoUploadState {
  phase: UploadPhase
  progress: UploadProgress
  uploadedUrl: string | null
  storagePath: string | null
  error: string | null
}

// ── Composable ───────────────────────────────────────────────

export function useExerciseVideoUpload(service: ExerciseVideoUploadService) {
  const state = reactive<ExerciseVideoUploadState>({
    phase: 'idle',
    progress: { loaded: 0, total: 0, percentage: 0 },
    uploadedUrl: null,
    storagePath: null,
    error: null,
  })

  /** Upload a video file. Returns the result on success, null on failure. */
  async function upload(payload: VideoUploadPayload): Promise<UploadResult | null> {
    state.phase = 'uploading'
    state.error = null
    state.progress = { loaded: 0, total: 0, percentage: 0 }
    state.uploadedUrl = null
    state.storagePath = null

    try {
      const result = await service.uploadVideo(payload, (progress: UploadProgress) => {
        state.progress = progress
      })

      state.phase = 'uploaded'
      state.uploadedUrl = result.url
      state.storagePath = result.storagePath
      return result
    } catch (err: any) {
      state.phase = 'error'
      state.error = err?.message ?? 'Error al subir el video'
      return null
    }
  }

  /** Reset to idle state. */
  function reset() {
    state.phase = 'idle'
    state.progress = { loaded: 0, total: 0, percentage: 0 }
    state.uploadedUrl = null
    state.storagePath = null
    state.error = null
  }

  return {
    state: readonly(state) as ExerciseVideoUploadState,
    upload,
    reset,
  }
}

export type UseExerciseVideoUploadReturn = ReturnType<typeof useExerciseVideoUpload>
