import type {
  CatalogExercise,
  CatalogEquipment,
  CatalogUser,
  ExerciseAssignment,
  ExerciseAssignmentDraft,
  ExerciseAssignmentListItem,
  ExerciseAssignmentPayload,
  ExerciseAssignmentValidationErrors,
} from '../entities/ExerciseAssignment.types'

export class ExerciseAssignmentDomainService {
  static createDraft(): ExerciseAssignmentDraft {
    return {
      id: '',
      id_user: '',
      id_exercise: [],
      id_equipment: [],
      is_active: true,
    }
  }

  static withDefaults(partial: Partial<ExerciseAssignmentDraft>): ExerciseAssignmentDraft {
    return {
      id: partial.id ?? '',
      id_user: partial.id_user?.trim() ?? '',
      id_exercise: partial.id_exercise ?? [],
      id_equipment: partial.id_equipment ?? [],
      is_active: partial.is_active ?? true,
    }
  }

  static validate(
    draft: ExerciseAssignmentDraft,
    knownUsers: CatalogUser[],
  ): ExerciseAssignmentValidationErrors {
    const errors: ExerciseAssignmentValidationErrors = {}
    const userId = draft.id_user.trim()

    if (!userId) {
      errors.id_user = 'El usuario es obligatorio. Elige a alguien de la lista.'
      return errors
    }

    const exists = knownUsers.some((user) => user.id === userId)
    if (!exists) {
      errors.id_user = 'Ese ID no corresponde a un usuario registrado.'
    }

    return errors
  }

  static toPayload(draft: ExerciseAssignmentDraft): ExerciseAssignmentPayload {
    return {
      id_user: draft.id_user.trim(),
      id_exercise: draft.id_exercise,
      id_equipment: draft.id_equipment,
      is_active: draft.is_active,
    }
  }

  static hasErrors(errors: ExerciseAssignmentValidationErrors): boolean {
    return Object.keys(errors).length > 0
  }

  static toSpanishDifficulty(difficulty: string): string {
    const labels: Record<string, string> = {
      BEGINNER: 'Principiante',
      INTERMEDIATE: 'Intermedio',
      ADVANCED: 'Avanzado',
    }

    const normalized = difficulty.trim().toUpperCase()
    if (!normalized) return '—'
    return labels[normalized] ?? difficulty
  }

  static toSpanishEquipmentType(type: string): string {
    const labels: Record<string, string> = {
      electrical: 'Eléctrico',
      electronic: 'Electrónico',
      mechanical: 'Mecánico',
      hydraulic: 'Hidráulico',
      pneumatic: 'Neumático',
      machine: 'Máquina',
      free_weight: 'Peso libre',
      freeweight: 'Peso libre',
      cardio: 'Cardio',
      strength: 'Fuerza',
      flexibility: 'Flexibilidad',
      balance: 'Equilibrio',
      dumbbell: 'Mancuerna',
      barbell: 'Barra',
      kettlebell: 'Pesa rusa',
      cable: 'Polea',
      bench: 'Banco',
      rack: 'Rack',
      smith: 'Máquina Smith',
      bodyweight: 'Peso corporal',
    }

    const normalized = type.trim().toLowerCase().replace(/[\s-]+/g, '_')
    if (!normalized) return '—'
    return labels[normalized] ?? type
  }

  static listErrorMessage(status?: number): string {
    if (status === 400) {
      return 'No es tu culpa. Esta lista se quedó a medio camino y no pudimos traer las asignaciones. Respira un segundo e inténtalo otra vez: lo que ya asignaste sigue en su lugar.'
    }

    return 'Algo se atascó al abrir esta lista. No perdiste nada: vuelve a intentarlo cuando quieras.'
  }

  static deleteErrorMessage(status?: number): string {
    if (status === 400) {
      return 'No pudimos quitar esta asignación ahora. No es tu culpa: inténtalo otra vez, lo demás sigue en su lugar.'
    }

    return 'Algo se atascó al eliminar. Puedes intentarlo otra vez cuando quieras.'
  }

  static toListItem(
    assignment: ExerciseAssignment,
    index: number,
    users: CatalogUser[],
    exercises: CatalogExercise[],
    equipment: CatalogEquipment[],
  ): ExerciseAssignmentListItem {
    const user = users.find((item) => item.id === assignment.id_user)
    const exerciseNamesById = new Map(exercises.map((item) => [item.id, item.name]))
    const equipmentNamesById = new Map(equipment.map((item) => [item.id, item.name]))

    return {
      key: assignment.id || `${assignment.id_user}-${index}`,
      id: assignment.id || `${assignment.id_user}-${index}`,
      userName: user?.name_full?.trim() || 'Persona por identificar',
      userId: assignment.id_user,
      exerciseIds: assignment.id_exercise,
      exerciseNames: assignment.id_exercise.map((id) => exerciseNamesById.get(id) || 'Ejercicio'),
      equipmentNames: assignment.id_equipment.map((id) => equipmentNamesById.get(id) || 'Equipo'),
      isActive: assignment.is_active,
    }
  }

  static resolveAssignmentExercises(
    exerciseIds: string[],
    catalog: CatalogExercise[],
  ): CatalogExercise[] {
    const byId = new Map(catalog.map((exercise) => [exercise.id, exercise]))
    return exerciseIds
      .map((id) => byId.get(id))
      .filter((exercise): exercise is CatalogExercise => Boolean(exercise))
  }

  static exercisesWithVideo(exercises: CatalogExercise[]): CatalogExercise[] {
    return exercises.filter((exercise) => Boolean(exercise.video_url?.trim()))
  }

  static matchesQuery(haystack: string, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return true
    return haystack.toLowerCase().includes(normalizedQuery)
  }

  static filterUsers(users: CatalogUser[], query: string): CatalogUser[] {
    return users.filter((user) =>
      this.matchesQuery(`${user.name_full} ${user.phone} ${user.id_number} ${user.id}`, query),
    )
  }

  static filterExercises(exercises: CatalogExercise[], query: string): CatalogExercise[] {
    return exercises.filter((exercise) =>
      this.matchesQuery(
        `${exercise.name} ${exercise.muscle_group} ${exercise.difficulty} ${this.toSpanishDifficulty(exercise.difficulty)} ${exercise.id}`,
        query,
      ),
    )
  }

  static filterEquipment(items: CatalogEquipment[], query: string): CatalogEquipment[] {
    return items.filter((item) =>
      this.matchesQuery(`${item.name} ${item.type} ${this.toSpanishEquipmentType(item.type)} ${item.id}`, query),
    )
  }

  static filterListItems(
    items: ExerciseAssignmentListItem[],
    query: string,
  ): ExerciseAssignmentListItem[] {
    return items.filter((item) =>
      this.matchesQuery(
        `${item.userName} ${item.userId} ${item.exerciseNames.join(' ')} ${item.equipmentNames.join(' ')} ${item.isActive ? 'activo' : 'inactivo'}`,
        query,
      ),
    )
  }
}
