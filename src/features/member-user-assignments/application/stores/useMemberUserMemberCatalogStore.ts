import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CatalogMember } from '../../domain/entities/MemberUserAssignment.types'
import type { MemberCatalogRepository } from '../../domain/repositories/MemberCatalogRepository'
import { MemberUserAssignmentDomainService } from '../../domain/services/MemberUserAssignmentDomainService'
import { HttpMemberCatalogRepository } from '../../infrastructure/http/HttpMemberCatalogRepository'

export const useMemberUserMemberCatalogStore = defineStore('memberUserMemberCatalog', () => {
  const repository: MemberCatalogRepository = new HttpMemberCatalogRepository()
  const members = ref<CatalogMember[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredMembers = computed(() =>
    MemberUserAssignmentDomainService.filterMembers(members.value, searchQuery.value),
  )

  async function fetchMembers(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      members.value = await repository.findAll()
    } catch (err: unknown) {
      error.value = err instanceof Error
        ? err.message
        : MemberUserAssignmentDomainService.catalogErrorMessage()
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function findById(id: string): CatalogMember | undefined {
    return members.value.find((member) => member.id === id)
  }

  return {
    members,
    isLoading,
    error,
    searchQuery,
    filteredMembers,
    fetchMembers,
    setSearchQuery,
    findById,
  }
})
