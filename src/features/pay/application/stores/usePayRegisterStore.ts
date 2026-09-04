import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { HttpPayRepository } from '../../infrastructure/http/HttpPayRepository'
import { PayService } from '../PayService'
import { PaymentDomainService } from '../../domain/Pay'
import type { PayMembership, PaymentDraft, PaySubmitOutcome } from '../../domain/Pay'
import type { Member } from '../../../members/domain/entities/Member.types'
import { HttpMembershipRepository } from '../../../memberships/infrastructure/http/HttpMembershipRepository'
import type { MembershipPlanPayload } from '../../../memberships/domain/entities/Membership.types'

// ============================================================
// APPLICATION · usePayRegisterStore
// Composition root de la feature: aquí se construye la
// dependencia (adaptador → servicio) y se expone el estado
// reactivo que la presentación consume.
// ============================================================

export type MembershipListKind = 'idle' | 'loading' | 'ok' | 'empty' | 'error'

export interface MembershipListFeedback {
  title: string
  description: string
}

export const usePayRegisterStore = defineStore('payRegister', () => {
  const service = new PayService(new HttpPayRepository())

  const draft = ref<PaymentDraft>(PaymentDomainService.createDraft())
  const member = ref<Member | null>(null)
  const memberships = ref<PayMembership[]>([])
  const membershipsKind = ref<MembershipListKind>('idle')
  const membershipsFeedback = ref<MembershipListFeedback | null>(null)
  const selectedMembership = ref<PayMembership | null>(null)

  const plans = ref<Record<string, MembershipPlanPayload>>({})
  const planKinds = ref<Record<string, MembershipListKind>>({})
  const planErrorMessages = ref<Record<string, string>>({})

  const isSubmitting = ref(false)
  const submitOutcome = ref<PaySubmitOutcome | null>(null)
  const hasAttemptedSubmit = ref(false)

  const validationErrors = computed(() => PaymentDomainService.validate(draft.value))

  const visibleValidationErrors = computed(() =>
    hasAttemptedSubmit.value ? validationErrors.value : {},
  )

  const selectionErrors = computed(() =>
    PaymentDomainService.validateSelection({
      member: member.value ? { id: member.value.id, name: member.value.name_full } : null,
      membership: selectedMembership.value
        ? { id: selectedMembership.value.id, name: selectedMembership.value.plan_id }
        : null,
    }),
  )

  const hasSelection = computed(() => member.value !== null && selectedMembership.value !== null)

  const canSubmit = computed(
    () =>
      hasSelection.value &&
      !PaymentDomainService.hasErrors(validationErrors.value) &&
      !PaymentDomainService.hasErrors(selectionErrors.value) &&
      !isSubmitting.value,
  )

  async function setMember(next: Member | null): Promise<void> {
    member.value = next
    selectedMembership.value = null
    memberships.value = []
    membershipsKind.value = 'idle'
    membershipsFeedback.value = null
    matchPlansToMemberships()

    if (next) {
      await fetchMemberships()
    }
  }

  async function fetchMemberships(): Promise<void> {
    if (!member.value) return

    membershipsKind.value = 'loading'
    membershipsFeedback.value = null
    memberships.value = []

    try {
      const items = await service.listMembershipsByMember(member.value.id)
      memberships.value = items

      if (items.length === 0) {
        membershipsKind.value = 'empty'
        membershipsFeedback.value = {
          title: 'Aún no hay membresías para este miembro',
          description:
            'Parece que esta persona todavía no tiene un plan que la sostenga. Regístralo primero y el pago tendrá sobre qué apoyarse.',
        }
        return
      }

      membershipsKind.value = 'ok'
    } catch (error) {
      membershipsKind.value = 'error'
      membershipsFeedback.value = buildMembershipErrorFeedback(error)
    }
  }

  function setMembership(next: PayMembership | null): void {
    selectedMembership.value = next
  }

  async function fetchPlan(planId: string): Promise<void> {
    if (!planId || plans.value[planId] || planKinds.value[planId] === 'loading') return

    planKinds.value[planId] = 'loading'
    planErrorMessages.value[planId] = ''

    try {
      const plan = await new HttpMembershipRepository().findPlanById(planId)
      plans.value[planId] = plan
      planKinds.value[planId] = 'ok'
    } catch (error) {
      planKinds.value[planId] = 'error'
      const status =
        error instanceof Error && 'status' in error && typeof error.status === 'number' ? error.status : null
      planErrorMessages.value[planId] = buildPlanErrorMessage(status)
    }
  }

  function matchPlansToMemberships(): void {
    if (member.value === null) {
      plans.value = {}
      planKinds.value = {}
      planErrorMessages.value = {}
      return
    }
    const activePlanIds = new Set(memberships.value.map((membership) => membership.plan_id))
    const newPlans: Record<string, MembershipPlanPayload> = {}
    const newKinds: Record<string, MembershipListKind> = {}
    const newErrors: Record<string, string> = {}
    for (const planId of activePlanIds) {
      if (plans.value[planId]) newPlans[planId] = plans.value[planId]
      if (planKinds.value[planId]) newKinds[planId] = planKinds.value[planId]
      if (planErrorMessages.value[planId]) newErrors[planId] = planErrorMessages.value[planId]
    }
    plans.value = newPlans
    planKinds.value = newKinds
    planErrorMessages.value = newErrors
  }

  async function registerPay(): Promise<void> {
    if (isSubmitting.value) return

    hasAttemptedSubmit.value = true
    isSubmitting.value = true
    submitOutcome.value = null

    const outcome = await service.register(draft.value, {
      member: member.value ? { id: member.value.id, name: member.value.name_full } : null,
      membership: selectedMembership.value
        ? { id: selectedMembership.value.id, name: selectedMembership.value.plan_id }
        : null,
    })

    submitOutcome.value = outcome
    isSubmitting.value = false
  }

  function $reset(): void {
    draft.value = PaymentDomainService.createDraft()
    member.value = null
    memberships.value = []
    membershipsKind.value = 'idle'
    membershipsFeedback.value = null
    selectedMembership.value = null
    plans.value = {}
    planKinds.value = {}
    planErrorMessages.value = {}
    isSubmitting.value = false
    submitOutcome.value = null
    hasAttemptedSubmit.value = false
  }

  return {
    draft,
    member,
    memberships,
    membershipsKind,
    membershipsFeedback,
    selectedMembership,
    plans,
    planKinds,
    planErrorMessages,
    isSubmitting,
    submitOutcome,
    validationErrors,
    visibleValidationErrors,
    hasAttemptedSubmit,
    selectionErrors,
    hasSelection,
    canSubmit,
    setMember,
    fetchMemberships,
    setMembership,
    fetchPlan,
    registerPay,
    $reset,
  }
})

function buildMembershipErrorFeedback(error: unknown): MembershipListFeedback {
  const status = error instanceof Error && 'status' in error && typeof error.status === 'number' ? error.status : null

  if (status === 400) {
    return {
      title: 'La información no llegó en el formato esperado',
      description:
        'No ha sido culpa tuya: el servidor no pudo contarnos qué plan sostiene a este miembro. Tranquilo(a), nada se perdió. Revisa la conexión y vuelve a intentarlo.',
    }
  }

  return {
    title: 'No pudimos cargar las membresías',
    description:
      'Algo se interpuso entre el sistema y los planes de este miembro. Respira: nada se perdió, esto suele resolverse con un segundo intento.',
  }
}

function buildPlanErrorMessage(status: number | null): string {
  if (status === 500) {
    return 'No pudimos contarte los detalles de este plan. No fue tu culpa: el servidor no respondió como esperábamos. Respira, nada se perdió; vuelve a intentarlo y el plan aparecerá.'
  }
  return 'No se pudo obtener la información de este plan por ahora. Tranquilo(a): puedes seguir y la conexión amable volverá a intentarlo.'
}

export function isPaySuccess(outcome: PaySubmitOutcome | null): boolean {
  return outcome === 'success'
}
