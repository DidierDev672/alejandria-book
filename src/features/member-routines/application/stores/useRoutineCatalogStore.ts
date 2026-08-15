// ============================================================
// APPLICATION STORE - Routine Catalog Pinia Store
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { HttpRoutineCatalogRepository } from '../../infrastructure/http/HttpRoutineCatalogRepository'
import type { RoutineOption } from '../../domain/entities/MemberRoutine.types'

export const useRoutineCatalogStore = defineStore('routineCatalog', () => {
  // ============================================================
  // STATE
  // ============================================================

  const routines = ref<RoutineOption[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================
  // REPOSITORY (adapter inyectado en el composition root)
  // ============================================================

  const repository = new HttpRoutineCatalogRepository()

  // ============================================================
  // GETTERS
  // ============================================================

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const hasRoutines = computed(() => routines.value.length > 0)

  // ============================================================
  // ACTIONS
  // ============================================================

  async function fetchRoutines(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      routines.value = await repository.findAll()
    } catch (e: any) {
      error.value = e.message || 'Error al cargar las rutinas'
      console.error('[RoutineCatalogStore] Error fetching routines:', e)
    } finally {
      loading.value = false
    }
  }

  // ============================================================
  // EXPOSED API
  // ============================================================

  return {
    // State
    routines,
    loading,
    error,

    // Getters
    isLoading,
    hasError,
    hasRoutines,

    // Actions
    fetchRoutines,
  }
})
