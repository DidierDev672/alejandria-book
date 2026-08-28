import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  MemberUserAssignment,
  MemberUserAssignmentListItem,
} from '../../domain/entities/MemberUserAssignment.types'
import type { MemberUserAssignmentRepository } from '../../domain/repositories/MemberUserAssignmentRepository'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'
import { HttpMemberUserAssignmentRepository } from '../../infrastructure/http/HttpMemberUserAssignmentRepository'
import { useMemberUserMemberCatalogStore } from './useMemberUserMemberCatalogStore'
import { useMemberUserUserCatalogStore } from './useMemberUserUserCatalogStore'

export const useMemberUserAssignmentListStore = defineStore('memberUserAssignmentList', () => {
  const repository: MemberUserAssignmentRepository = new HttpMemberUserAssignmentRepository()
  const assignments = ref<MemberUserAssignment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const deleteError = ref<string | null>(null)

  const rows = computed<MemberUserAssignmentListItem[]>(() => {
    const userStore = useMemberUserUserCatalogStore()
    const memberStore = useMemberUserMemberCatalogStore()

    return assignments.value.map((assignment) =>
      MemberUserAssignmentDomainService.toListItem(
        assignment,
        userStore.users,
        memberStore.members,
      ),
    )
  })

  async function fetchAssignments(): Promise<void> {
    const userStore = useMemberUserUserCatalogStore()
    const memberStore = useMemberUserMemberCatalogStore()

    isLoading.value = true
    error.value = null

    try {
      assignments.value = await repository.findAll()
      await Promise.allSettled([
        userStore.users.length === 0 ? userStore.fetchUsers() : Promise.resolve(),
        memberStore.members.length === 0 ? memberStore.fetchMembers() : Promise.resolve(),
      ])
    } catch (err: unknown) {
      assignments.value = []
      error.value = err instanceof Error
        ? err.message
        : MemberUserAssignmentDomainService.listErrorMessage()
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAssignment(id: string): Promise<boolean> {
    deleteError.value = null
    try {
      await repository.delete(id)
      assignments.value = assignments.value.filter((item) => item.id !== id)
      return true
    } catch (err: unknown) {
      deleteError.value = err instanceof Error
        ? err.message
        : MemberUserAssignmentDomainService.deleteErrorMessage()
      return false
    }
  }

  function clearDeleteError(): void {
    deleteError.value = null
  }

  return {
    assignments,
    rows,
    isLoading,
    error,
    deleteError,
    fetchAssignments,
    deleteAssignment,
    clearDeleteError,
  }
})
