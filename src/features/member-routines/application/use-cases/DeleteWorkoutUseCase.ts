// ============================================================
// APPLICATION USE CASE - Delete Workout (SOLID)
// SRP: orquesta la eliminación de un entrenamiento asignado
// DIP: depende del puerto MemberRoutineRepository, no de axios
// ============================================================

import type { MemberRoutineRepository } from '../../domain/repositories/MemberRoutineRepository'

export class DeleteWorkoutUseCase {
  constructor(private readonly repository: MemberRoutineRepository) {}

  async execute(id: string): Promise<void> {
    const trimmed = id?.trim()
    if (!trimmed) {
      throw new Error('El identificador del entrenamiento es obligatorio')
    }
    await this.repository.delete(trimmed)
  }
}
