import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { MembershipRegistration } from '../../domain/entities/MembershipRegistration.types'
import {
  HttpMembershipRepository,
  MembershipListHttpError,
} from '../../infrastructure/http/HttpMembershipRepository'

export type MembershipRegistrationListKind = 'idle' | 'loading' | 'ok' | 'empty' | 'error'

export interface MembershipRegistrationListFeedback {
  title: string
  description: string
}

const OK_FEEDBACK: MembershipRegistrationListFeedback = {
  title: 'Todo listo, aquí están las membresías registradas',
  description:
    'Cada tarjeta refleja la permanencia de alguien en tu salón. Revísalas con calma: forman parte del compromiso que cada miembro eligió.',
}

export const useMembershipRegistrationsStore = defineStore('membershipRegistrations', () => {
  const repository = new HttpMembershipRepository()

  const registrations = ref<MembershipRegistration[]>([])
  const isLoading = ref(false)
  const kind = ref<MembershipRegistrationListKind>('idle')
  const feedback = ref<MembershipRegistrationListFeedback | null>(null)

  const hasRegistrations = computed(() => registrations.value.length > 0)

  async function fetchRegistrations(): Promise<void> {
    isLoading.value = true
    kind.value = 'loading'
    feedback.value = null

    try {
      const items = await repository.listRegistrations()
      registrations.value = items

      if (items.length === 0) {
        kind.value = 'empty'
        feedback.value = {
          title: 'Aún no hay membresías registradas',
          description:
            'Parece que el salón está recién abriendo sus puertas. Cuando registres la primera membresía, aparecerá aquí.',
        }
        return
      }

      kind.value = 'ok'
      feedback.value = OK_FEEDBACK
    } catch (error: unknown) {
      registrations.value = []
      kind.value = 'error'
      feedback.value = buildErrorFeedback(error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    registrations,
    isLoading,
    kind,
    feedback,
    hasRegistrations,
    fetchRegistrations,
  }
})

function buildErrorFeedback(error: unknown): MembershipRegistrationListFeedback {
  if (error instanceof MembershipListHttpError && error.status === 400) {
    return {
      title: 'Se presentó un error al obtener las membresías',
      description:
        'No ha sido culpa tuya: la información no llegó en el formato que esperábamos, así que preferimos no inventar nada. Respira, y cuando quieras lo intentamos otra vez.',
    }
  }

  return {
    title: 'No pudimos cargar las membresías',
    description:
      'Algo se interpuso entre el sistema y estos registros. Tranquilo(a), nada se perdió: cada membresía sigue a salvo. Inténtalo de nuevo en un momento.',
  }
}