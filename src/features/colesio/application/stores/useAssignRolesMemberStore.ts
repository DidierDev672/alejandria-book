// ============================================================
// APPLICATION STORE - Assign Roles Member Selection
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/infrastructure/http/axiosInstance'

// ============================================================
// TYPES - Simplified Member for role assignment
// ============================================================

export interface SimpleMember {
  id: string
  name_full: string
  type_document: string
  number_document: string
  date_of_birth: string
  genre: string
  phone_number: string
  address: string
  createdAt: string
  updatedAt: string
}

// ============================================================
// STORE - Member Selection State
// ============================================================

export const useAssignRolesMemberStore = defineStore('assignRolesMembers', () => {
  // State
  const members = ref<SimpleMember[]>([])
  const selectedMember = ref<SimpleMember | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  // Getters
  const filteredMembers = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return members.value
    return members.value.filter(
      member =>
        member.name_full.toLowerCase().includes(query) ||
        member.phone_number.includes(query)
    )
  })

  const hasMembers = computed(() => members.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Actions
  async function fetchMembers(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data } = await axiosInstance.get<SimpleMember[]>('/members')
      members.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar los miembros'
      console.error('[AssignRolesMemberStore] fetchMembers error:', err)
    } finally {
      loading.value = false
    }
  }

  function selectMember(member: SimpleMember | null): void {
    selectedMember.value = member
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function clearSelection(): void {
    selectedMember.value = null
  }

  function resetStore(): void {
    members.value = []
    selectedMember.value = null
    loading.value = false
    error.value = null
    searchQuery.value = ''
  }

  return {
    // State
    members,
    selectedMember,
    loading,
    error,
    searchQuery,

    // Getters
    filteredMembers,
    hasMembers,
    isLoading,

    // Actions
    fetchMembers,
    selectMember,
    setSearchQuery,
    clearSelection,
    resetStore
  }
})
