import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/infrastructure/http/axiosInstance'

export interface UserListItem {
  id: string
  name_full: string
  phone: string
  id_number: string
  roles: string[]
  createdAt: string
  updatedAt: string
}

export const useAssignRolesUserStore = defineStore('assignRolesUser', () => {
  const users = ref<UserListItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredUsers = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return users.value
    return users.value.filter(
      user =>
        user.name_full.toLowerCase().includes(query) ||
        user.phone.includes(query)
    )
  })

  const hasUsers = computed(() => users.value.length > 0)

  async function fetchUsers(): Promise<void> {
    if (users.value && users.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      const { data } = await axiosInstance.get<UserListItem[] | { data: UserListItem[] }>('/users')
      users.value = Array.isArray(data) ? data : (data?.data || [])
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener usuarios'
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function $reset(): void {
    users.value = []
    isLoading.value = false
    error.value = null
    searchQuery.value = ''
  }

  return { users, isLoading, error, searchQuery, filteredUsers, hasUsers, fetchUsers, setSearchQuery, $reset }
})
