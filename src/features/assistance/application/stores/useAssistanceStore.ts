import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { RegisterAssistancePayload, AssistanceSubmitOutcome } from '../../domain/Assistance'
import { HttpAssistanceRepository, AssistanceHttpError } from '../../infrastructure/http/HttpAssistanceRepository'
import { AssistanceService } from '../AssistanceService'

// ============================================================
// APPLICATION · useAssistanceStore
// Composition root de la feature: construye la dependencia
// (adaptador → servicio) y expone el estado del envío de
// la asistencia que la presentación consume.
// ============================================================

export const useAssistanceStore = defineStore('assistance', () => {
  const service = new AssistanceService(new HttpAssistanceRepository())

  const isSubmitting = ref(false)
  const submitOutcome = ref<AssistanceSubmitOutcome | null>(null)

  async function registerAssistance(payload: RegisterAssistancePayload): Promise<void> {
    if (isSubmitting.value) return

    isSubmitting.value = true
    submitOutcome.value = null

    try {
      await service.registerAssistance(payload)
      submitOutcome.value = 'success'
    } catch (error) {
      submitOutcome.value = 'error'
      if (error instanceof AssistanceHttpError) {
        console.log('[useAssistanceStore] register error status:', error.status)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  function $reset(): void {
    isSubmitting.value = false
    submitOutcome.value = null
  }

  return {
    isSubmitting,
    submitOutcome,
    registerAssistance,
    $reset,
  }
})
