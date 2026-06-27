import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ExerciseService from '@/features/exercise/infrastructure/services/exerciseService'
import type {
  Exercise,
  CreateExerciseDTO,
  UpdateExerciseDTO,
  ExerciseFilters,
  PaginatedResponse,
} from '@/features/exercise/infrastructure/services/exerciseService'

// ============================================================
// STORE DEFINITION
// ============================================================

export const useExerciseStore = defineStore('exercise', () => {
  // ==========================================================
  // STATE (Variables Reactivas)
  // ==========================================================

  /** Lista de ejercicios */
  const exercisesList = ref<Exercise[]>([])

  /** Ejercicio seleccionado */
  const selectedExercise = ref<Exercise | null>(null)

  /** Estado de carga global */
  const isLoading = ref(false)

  /** Estados de carga por operación */
  const loadingStates = ref<Record<string, boolean>>({})

  /** Error general */
  const error = ref<string | null>(null)

  /** Errores de validación */
  const validationErrors = ref<Record<string, string[]>>({})

  /** Metadata de paginación */
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  // ==========================================================
  // GETTERS (Computed)
  // ==========================================================

  const totalExercises = computed(() => pagination.value.total)
  const hasExercises = computed(() => exercisesList.value.length > 0)
  const hasError = computed(() => error.value !== null)

  /** Ejercicios agrupados por grupo muscular */
  const exercisesByMuscleGroup = computed(() => {
    const grouped: Record<string, Exercise[]> = {}
    exercisesList.value.forEach((exercise) => {
      if (!grouped[exercise.muscle_group]) {
        grouped[exercise.muscle_group] = []
      }
      grouped[exercise.muscle_group].push(exercise)
    })
    return grouped
  })

  /** Ejercicios filtrados por dificultad */
  const exercisesByDifficulty = computed(() => {
    return (difficulty: string) =>
      exercisesList.value.filter((e) => e.difficulty === difficulty)
  })

  const isOperationLoading = (operationId: string) =>
    computed(() => loadingStates.value[operationId] || false)

  // ==========================================================
  // ACTIONS (Métodos Asíncronos)
  // ==========================================================

  /**
   * Obtener lista de ejercicios
   */
  async function fetchExercises(filters: ExerciseFilters = {}): Promise<void> {
    const operationId = 'fetchExercises'

    loadingStates.value[operationId] = true
    isLoading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await ExerciseService.getAll(filters)
      exercisesList.value = response.data
      pagination.value = response.meta
    } catch (err: any) {
      error.value = err.message || 'Error al cargar ejercicios'
      console.error('[ExerciseStore] fetchExercises error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
      isLoading.value = false
    }
  }

  /**
   * Obtener ejercicios por equipo
   */
  async function fetchExercisesByEquipment(equipmentId: string): Promise<void> {
    const operationId = `fetchByEquipment-${equipmentId}`

    loadingStates.value[operationId] = true
    error.value = null

    try {
      const data = await ExerciseService.getByEquipmentId(equipmentId)
      exercisesList.value = data
    } catch (err: any) {
      error.value = err.message || `Error al cargar ejercicios del equipo ${equipmentId}`
      console.error('[ExerciseStore] fetchExercisesByEquipment error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
    }
  }

  /**
   * Crear un ejercicio
   */
  async function createExercise(exerciseData: CreateExerciseDTO): Promise<Exercise> {
    const operationId = 'createExercise'

    loadingStates.value[operationId] = true
    isLoading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const data = await ExerciseService.create(exerciseData)

      // Agregar a la lista local
      if (pagination.value.page === 1) {
        exercisesList.value.unshift(data)
      }
      pagination.value.total++

      return data
    } catch (err: any) {
      if (err.errors) {
        validationErrors.value = err.errors
      }
      error.value = err.message || 'Error al crear ejercicio'
      console.error('[ExerciseStore] createExercise error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
      isLoading.value = false
    }
  }

  /**
   * Crear múltiples ejercicios (bulk)
   */
  async function createMultipleExercises(
    exercisesData: CreateExerciseDTO[],
  ): Promise<Exercise[]> {
    const operationId = 'createMultipleExercises'

    loadingStates.value[operationId] = true
    isLoading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const data = await ExerciseService.createBulk(exercisesData)

      // Agregar todos a la lista local
      exercisesList.value.unshift(...data)
      pagination.value.total += data.length

      return data
    } catch (err: any) {
      if (err.errors) {
        validationErrors.value = err.errors
      }
      error.value = err.message || 'Error al crear ejercicios'
      console.error('[ExerciseStore] createMultipleExercises error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
      isLoading.value = false
    }
  }

  /**
   * Actualizar ejercicio
   */
  async function updateExercise(
    id: string,
    updateData: UpdateExerciseDTO,
  ): Promise<Exercise> {
    const operationId = `updateExercise-${id}`

    loadingStates.value[operationId] = true
    error.value = null

    try {
      const data = await ExerciseService.update(id, updateData)

      // Actualizar en lista local
      const index = exercisesList.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        exercisesList.value[index] = { ...exercisesList.value[index], ...data }
      }

      if (selectedExercise.value?.id === id) {
        selectedExercise.value = { ...selectedExercise.value, ...data }
      }

      return data
    } catch (err: any) {
      if (err.errors) {
        validationErrors.value = err.errors
      }
      error.value = err.message || `Error al actualizar ejercicio ${id}`
      console.error('[ExerciseStore] updateExercise error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
    }
  }

  /**
   * Eliminar ejercicio
   */
  async function deleteExercise(id: string): Promise<void> {
    const operationId = `deleteExercise-${id}`

    loadingStates.value[operationId] = true
    error.value = null

    try {
      await ExerciseService.delete(id)

      exercisesList.value = exercisesList.value.filter((e) => e.id !== id)
      pagination.value.total--

      if (selectedExercise.value?.id === id) {
        selectedExercise.value = null
      }
    } catch (err: any) {
      error.value = err.message || `Error al eliminar ejercicio ${id}`
      console.error('[ExerciseStore] deleteExercise error:', err)
      throw err
    } finally {
      loadingStates.value[operationId] = false
    }
  }

  /**
   * Seleccionar ejercicio
   */
  function selectExercise(exercise: Exercise | null): void {
    selectedExercise.value = exercise
  }

  /**
   * Limpiar errores
   */
  function clearErrors(): void {
    error.value = null
    validationErrors.value = {}
  }

  /**
   * Resetear store
   */
  function resetStore(): void {
    exercisesList.value = []
    selectedExercise.value = null
    isLoading.value = false
    loadingStates.value = {}
    error.value = null
    validationErrors.value = {}
    pagination.value = {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }
  }

  // ==========================================================
  // RETURN (API Pública)
  // ==========================================================

  return {
    // State
    exercisesList,
    selectedExercise,
    isLoading,
    loadingStates,
    error,
    validationErrors,
    pagination,

    // Getters
    totalExercises,
    hasExercises,
    hasError,
    exercisesByMuscleGroup,
    exercisesByDifficulty,
    isOperationLoading,

    // Actions
    fetchExercises,
    fetchExercisesByEquipment,
    createExercise,
    createMultipleExercises,
    updateExercise,
    deleteExercise,

    // Utilities
    selectExercise,
    clearErrors,
    resetStore,
  }
})

export type ExerciseStore = ReturnType<typeof useExerciseStore>
