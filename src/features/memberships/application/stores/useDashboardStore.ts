import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DashboardCounts } from '../../domain/entities/DashboardMetric.types'
import { HttpDashboardRepository, DashboardHttpError } from '../../infrastructure/http/HttpDashboardRepository'
import { DashboardService } from '../DashboardService'

// ============================================================
// APPLICATION · useDashboardStore
// Composition root del panel: construye la dependencia
// (adaptador → servicio) y expone el estado de los conteos
// que la presentación consume.
// ============================================================

export type DashboardKind = 'idle' | 'loading' | 'ok' | 'error'

export interface DashboardFeedback {
  title: string
  description: string
}

const EMPTY_COUNTS: DashboardCounts = { planes: 0, memberships: 0, assistance: 0, payments: 0 }

export const useDashboardStore = defineStore('dashboard', () => {
  const service = new DashboardService(new HttpDashboardRepository())

  const counts = ref<DashboardCounts>({ ...EMPTY_COUNTS })
  const isLoading = ref(false)
  const kind = ref<DashboardKind>('idle')
  const feedback = ref<DashboardFeedback | null>(null)

  async function fetchCounts(): Promise<void> {
    if (isLoading.value) return

    isLoading.value = true
    kind.value = 'loading'
    feedback.value = null

    try {
      const next = await service.fetchCounts()
      counts.value = next
      kind.value = 'ok'
      feedback.value = {
        title: 'Conteos al día',
        description: 'Cada número refleja lo que vive tu coliseo en este momento.',
      }
    } catch (error: unknown) {
      counts.value = { ...EMPTY_COUNTS }
      kind.value = 'error'
      feedback.value = buildErrorFeedback(error)
    } finally {
      isLoading.value = false
    }
  }

  function $reset(): void {
    counts.value = { ...EMPTY_COUNTS }
    isLoading.value = false
    kind.value = 'idle'
    feedback.value = null
  }

  return {
    counts,
    isLoading,
    kind,
    feedback,
    fetchCounts,
    $reset,
  }
})

function buildErrorFeedback(error: unknown): DashboardFeedback {
  if (error instanceof DashboardHttpError && error.status === 400) {
    return {
      title: 'Se presentó un error al cargar los conteos',
      description:
        'No fue culpa tuya: la información no llegó como esperábamos, así que preferimos no inventar nada. Respira, y cuando quieras lo intentamos otra vez.',
    }
  }

  return {
    title: 'No pudimos cargar los conteos',
    description:
      'Algo se interpuso entre el sistema y estos números. Nada se perdió; por favor, inténtalo de nuevo en un momento.',
  }
}