import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  MembershipDraft,
  MembershipSubmitOutcome,
} from '../../domain/entities/Membership.types'
import type { MembershipRepository } from '../../domain/repositories/MembershipRepository'
import { MembershipDomainService } from '../../domain/services/MembershipDomainService'
import { HttpMembershipRepository } from '../../infrastructure/http/HttpMembershipRepository'

export const useMembershipFormStore = defineStore('membershipForm', () => {
  const repository: MembershipRepository = new HttpMembershipRepository()
  const isSubmitting = ref(false)
  const submitOutcome = ref<MembershipSubmitOutcome | null>(null)

  async function submitPlan(draft: MembershipDraft): Promise<void> {
    if (isSubmitting.value) return

    isSubmitting.value = true
    submitOutcome.value = null

    try {
      await repository.create(MembershipDomainService.toApiPayload(draft))
      submitOutcome.value = 'success'
    } catch {
      submitOutcome.value = 'error'
    } finally {
      isSubmitting.value = false
    }
  }

  function clearSubmitOutcome(): void {
    submitOutcome.value = null
  }

  function $reset(): void {
    isSubmitting.value = false
    submitOutcome.value = null
  }

  return {
    isSubmitting,
    submitOutcome,
    submitPlan,
    clearSubmitOutcome,
    $reset,
  }
})
