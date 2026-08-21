import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  CatalogEquipment,
  CatalogExercise,
  CatalogUser,
  ExerciseAssignmentDraft,
  ExerciseAssignmentSubmitOutcome,
  ExerciseAssignmentValidationErrors,
} from '../../domain/entities/ExerciseAssignment.types'
import type { ExerciseAssignmentRepository } from '../../domain/repositories/ExerciseAssignmentRepository'
import { ExerciseAssignmentDomainService } from '../../domain/services/ExerciseAssignmentDomainService'
import { HttpExerciseAssignmentRepository } from '../../infrastructure/http/HttpExerciseAssignmentRepository'
import { useAssignmentUserCatalogStore } from './useAssignmentUserCatalogStore'

export const useExerciseAssignmentFormStore = defineStore('exerciseAssignmentForm', () => {
  const repository: ExerciseAssignmentRepository = new HttpExerciseAssignmentRepository()
  const draft = ref<ExerciseAssignmentDraft>(ExerciseAssignmentDomainService.createDraft())
  const selectedUser = ref<CatalogUser | null>(null)
  const selectedExercises = ref<CatalogExercise[]>([])
  const selectedEquipment = ref<CatalogEquipment[]>([])
  const validationErrors = ref<ExerciseAssignmentValidationErrors>({})
  const isSubmitting = ref(false)
  const submitOutcome = ref<ExerciseAssignmentSubmitOutcome | null>(null)

  const userIdDisplay = computed({
    get: () => draft.value.id_user,
    set: (value: string) => {
      draft.value.id_user = value
      if (selectedUser.value && selectedUser.value.id !== value) {
        selectedUser.value = null
      }
    },
  })

  const exerciseIdsDisplay = computed(() => draft.value.id_exercise.join(', '))
  const equipmentIdsDisplay = computed(() => draft.value.id_equipment.join(', '))
  const isActive = computed({
    get: () => draft.value.is_active,
    set: (value: boolean) => {
      draft.value.is_active = value
    },
  })

  function selectUser(user: CatalogUser): void {
    selectedUser.value = user
    draft.value.id_user = user.id
    validationErrors.value = {}
  }

  function clearUser(): void {
    selectedUser.value = null
    draft.value.id_user = ''
  }

  function toggleExercise(exercise: CatalogExercise): void {
    const exists = selectedExercises.value.some((item) => item.id === exercise.id)
    if (exists) {
      selectedExercises.value = selectedExercises.value.filter((item) => item.id !== exercise.id)
    } else {
      selectedExercises.value = [...selectedExercises.value, exercise]
    }
    draft.value.id_exercise = selectedExercises.value.map((item) => item.id)
  }

  function removeExercise(exerciseId: string): void {
    selectedExercises.value = selectedExercises.value.filter((item) => item.id !== exerciseId)
    draft.value.id_exercise = selectedExercises.value.map((item) => item.id)
  }

  function toggleEquipment(item: CatalogEquipment): void {
    const exists = selectedEquipment.value.some((equipment) => equipment.id === item.id)
    if (exists) {
      selectedEquipment.value = selectedEquipment.value.filter((equipment) => equipment.id !== item.id)
    } else {
      selectedEquipment.value = [...selectedEquipment.value, item]
    }
    draft.value.id_equipment = selectedEquipment.value.map((equipment) => equipment.id)
  }

  function removeEquipment(equipmentId: string): void {
    selectedEquipment.value = selectedEquipment.value.filter((item) => item.id !== equipmentId)
    draft.value.id_equipment = selectedEquipment.value.map((item) => item.id)
  }

  function isExerciseSelected(id: string): boolean {
    return draft.value.id_exercise.includes(id)
  }

  function isEquipmentSelected(id: string): boolean {
    return draft.value.id_equipment.includes(id)
  }

  function validate(): boolean {
    const userStore = useAssignmentUserCatalogStore()
    const payload = ExerciseAssignmentDomainService.withDefaults(draft.value)
    draft.value = payload
    validationErrors.value = ExerciseAssignmentDomainService.validate(payload, userStore.users)
    return !ExerciseAssignmentDomainService.hasErrors(validationErrors.value)
  }

  async function prepareAssignment(): Promise<ExerciseAssignmentDraft | null> {
    const userStore = useAssignmentUserCatalogStore()
    if (userStore.users.length === 0) {
      await userStore.fetchUsers()
    }
    if (!validate()) return null
    return ExerciseAssignmentDomainService.withDefaults(draft.value)
  }

  async function submitAssignment(): Promise<void> {
    const prepared = await prepareAssignment()
    if (!prepared) return

    isSubmitting.value = true
    submitOutcome.value = null
    let outcome: ExerciseAssignmentSubmitOutcome = 'error'

    try {
      await repository.create(ExerciseAssignmentDomainService.toPayload(prepared))
      outcome = 'success'
    } catch {
      outcome = 'error'
    } finally {
      isSubmitting.value = false
      submitOutcome.value = outcome
    }
  }

  function clearSubmitOutcome(): void {
    submitOutcome.value = null
  }

  function $reset(): void {
    draft.value = ExerciseAssignmentDomainService.createDraft()
    selectedUser.value = null
    selectedExercises.value = []
    selectedEquipment.value = []
    validationErrors.value = {}
    isSubmitting.value = false
    submitOutcome.value = null
  }

  return {
    draft,
    selectedUser,
    selectedExercises,
    selectedEquipment,
    validationErrors,
    isSubmitting,
    submitOutcome,
    userIdDisplay,
    exerciseIdsDisplay,
    equipmentIdsDisplay,
    isActive,
    selectUser,
    clearUser,
    toggleExercise,
    removeExercise,
    toggleEquipment,
    removeEquipment,
    isExerciseSelected,
    isEquipmentSelected,
    validate,
    prepareAssignment,
    submitAssignment,
    clearSubmitOutcome,
    $reset,
  }
})
