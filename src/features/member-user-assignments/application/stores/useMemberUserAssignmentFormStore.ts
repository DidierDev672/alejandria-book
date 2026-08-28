import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
  CatalogMember,
  CatalogUser,
  MemberUserAssignmentSubmitOutcome,
} from '../../domain/entities/MemberUserAssignment.types'
import type { MemberUserAssignmentRepository } from '../../domain/repositories/MemberUserAssignmentRepository'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'
import { HttpMemberUserAssignmentRepository } from '../../infrastructure/http/HttpMemberUserAssignmentRepository'

export const useMemberUserAssignmentFormStore = defineStore('memberUserAssignmentForm', () => {
  const repository: MemberUserAssignmentRepository = new HttpMemberUserAssignmentRepository()
  const memberName = ref('')
  const userName = ref('')
  const selectedMember = ref<CatalogMember | null>(null)
  const selectedUser = ref<CatalogUser | null>(null)
  const isSubmitting = ref(false)
  const submitOutcome = ref<MemberUserAssignmentSubmitOutcome | null>(null)

  const isReady = computed(() => Boolean(selectedMember.value && selectedUser.value))

  function selectMember(member: CatalogMember): void {
    if (selectedMember.value?.id === member.id) {
      clearMember()
      return
    }
    selectedMember.value = member
    memberName.value = member.name_full
  }

  function selectUser(user: CatalogUser): void {
    if (selectedUser.value?.id === user.id) {
      clearUser()
      return
    }
    selectedUser.value = user
    userName.value = user.name_full
  }

  function clearMember(): void {
    selectedMember.value = null
    memberName.value = ''
  }

  function clearUser(): void {
    selectedUser.value = null
    userName.value = ''
  }

  async function submitAssignment(): Promise<void> {
    const member = selectedMember.value
    const user = selectedUser.value
    if (!member || !user || isSubmitting.value) return

    isSubmitting.value = true
    submitOutcome.value = null

    try {
      await repository.create(
        MemberUserAssignmentDomainService.toPayload(user.id, member.id),
      )
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
    clearMember()
    clearUser()
    isSubmitting.value = false
    submitOutcome.value = null
  }

  watch(memberName, (value) => {
    if (!value.trim()) selectedMember.value = null
  })

  watch(userName, (value) => {
    if (!value.trim()) selectedUser.value = null
  })

  return {
    memberName,
    userName,
    selectedMember,
    selectedUser,
    isReady,
    isSubmitting,
    submitOutcome,
    selectMember,
    selectUser,
    clearMember,
    clearUser,
    submitAssignment,
    clearSubmitOutcome,
    $reset,
  }
})
