import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { MembershipPlanPayload } from '../../domain/entities/Membership.types'
import {
  HttpMembershipRepository,
  MembershipListHttpError,
} from '../../infrastructure/http/HttpMembershipRepository'

export type MembershipListKind = 'idle' | 'loading' | 'ok' | 'empty' | 'error'

export interface MembershipListFeedback {
  title: string
  description: string
}

const OK_FEEDBACK: MembershipListFeedback = {
  title: 'Todo listo, estas son tus membresías',
  description: 'Cada plan acá tiene su lugar y su ritmo. Míralos con calma y decide con claridad.',
}

export const useMembershipListStore = defineStore('membershipList', () => {
  const repository = new HttpMembershipRepository()

  const plans = ref<MembershipPlanPayload[]>([])
  const isLoading = ref(false)
  const kind = ref<MembershipListKind>('idle')
  const feedback = ref<MembershipListFeedback | null>(null)

  const hasPlans = computed(() => plans.value.length > 0)

  async function fetchPlans(): Promise<void> {
    isLoading.value = true
    kind.value = 'loading'
    feedback.value = null

    try {
      const items = await repository.list()
      plans.value = items

      if (items.length === 0) {
        kind.value = 'empty'
        feedback.value = {
          title: 'Aún no hay miembros',
          description: 'Parece que el salón está recién abriendo. Cuando crees tu primera membresía, aparecerá aquí.',
        }
        return
      }

      kind.value = 'ok'
      feedback.value = OK_FEEDBACK
    } catch (error: unknown) {
      plans.value = []
      kind.value = 'error'
      feedback.value = buildErrorFeedback(error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    plans,
    isLoading,
    kind,
    feedback,
    hasPlans,
    fetchPlans,
  }
})

function buildErrorFeedback(error: unknown): MembershipListFeedback {
  if (error instanceof MembershipListHttpError && error.status === 400) {
    return {
      title: 'Se presentó un error al obtener las membresías',
      description:
        'No fue culpa tuya: la información no llegó como esperábamos, así que preferimos no inventar nada. Respira, y cuando quieras lo intentamos otra vez.',
    }
  }

  return {
    title: 'No pudimos cargar las membresías',
    description:
      'Algo se interpuso entre el sistema y estos planes. No se perdió nada que pertenezca a tu salón; por favor, inténtalo de nuevo en un momento.',
  }
}
