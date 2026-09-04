import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  HttpMembershipRepository,
  MembershipRegisterHttpError,
} from '../../infrastructure/http/HttpMembershipRepository'
import type { MembershipRegisterPayload, MembershipSubmitOutcome } from '../../domain/entities/Membership.types'

export const useMembershipEnrollStore = defineStore('membershipEnroll', () => {
  const repository = new HttpMembershipRepository()

  const memberName = ref('')
  const memberId = ref('')
  const planName = ref('')
  const planId = ref('')
  const startDate = ref('')
  const endDate = ref('')
  const isRenewable = ref(true)
  const isCancellable = ref(true)

  const isSubmitting = ref(false)
  const submitOutcome = ref<MembershipSubmitOutcome | null>(null)

  const hasMember = computed(() => memberName.value.trim() !== '')
  const hasPlan = computed(() => planName.value.trim() !== '')
  const hasDates = computed(() => startDate.value !== '' && endDate.value !== '')

  const canSubmit = computed(() =>
    hasMember.value && hasPlan.value && hasDates.value,
  )

  async function registerMembership(): Promise<void> {
    if (isSubmitting.value) return

    isSubmitting.value = true
    submitOutcome.value = null

    const payload: MembershipRegisterPayload = {
      member_id: memberId.value,
      plan_id: planId.value,
      date_start: startDate.value,
      date_end: endDate.value,
      automatic_renewal: isRenewable.value,
    }

    try {
      await repository.register(payload)
      submitOutcome.value = 'success'
    } catch (error) {
      submitOutcome.value = 'error'
      console.error('[MembershipEnrollStore] registerMembership error:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  function clearSubmitOutcome(): void {
    submitOutcome.value = null
  }

  function setSelection(member: { id: string; name: string } | null, plan: { id: string; name: string } | null): void {
    memberId.value = member?.id ?? ''
    memberName.value = member?.name ?? ''
    planId.value = plan?.id ?? ''
    planName.value = plan?.name ?? ''
  }

  function clearSelection(): void {
    memberId.value = ''
    memberName.value = ''
    planId.value = ''
    planName.value = ''
  }

  function $reset(): void {
    clearSelection()
    startDate.value = ''
    endDate.value = ''
    isRenewable.value = true
    isCancellable.value = true
    isSubmitting.value = false
    submitOutcome.value = null
  }

  return {
    memberName,
    memberId,
    planName,
    planId,
    startDate,
    endDate,
    isRenewable,
    isCancellable,
    isSubmitting,
    submitOutcome,
    hasMember,
    hasPlan,
    hasDates,
    canSubmit,
    registerMembership,
    clearSubmitOutcome,
    setSelection,
    clearSelection,
    $reset,
  }
})

export function isRegisterSuccess(outcome: MembershipSubmitOutcome | null): boolean {
  return outcome === 'success'
}

export { MembershipRegisterHttpError }
