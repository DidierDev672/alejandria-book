// ============================================================
// APPLICATION SERVICE - Member Routine facade (OCP / DIP)
// Expone casos de uso; no conoce axios ni Vue.
// ============================================================

import type { MemberRoutineRepository } from '../../domain/repositories/MemberRoutineRepository'
import type {
  MemberRoutine,
  CreateMemberRoutineDTO,
  UpdateMemberRoutineDTO,
  MemberRoutineFormState,
} from '../../domain/entities/MemberRoutine.types'
import { UpdateWorkoutUseCase } from '../use-cases/UpdateWorkoutUseCase'
import type { UpdateWorkoutResult } from '../use-cases/UpdateWorkoutUseCase'
import { DeleteWorkoutUseCase } from '../use-cases/DeleteWorkoutUseCase'

export class MemberRoutineService {
  private readonly updateWorkoutUseCase: UpdateWorkoutUseCase
  private readonly deleteWorkoutUseCase: DeleteWorkoutUseCase

  // Depende del puerto (abstracción), no del adaptador HTTP concreto (DIP)
  constructor(private readonly repository: MemberRoutineRepository) {
    this.updateWorkoutUseCase = new UpdateWorkoutUseCase(repository)
    this.deleteWorkoutUseCase = new DeleteWorkoutUseCase(repository)
  }

  async listWorkouts(): Promise<MemberRoutine[]> {
    return this.repository.findAll()
  }

  async assignRoutine(data: CreateMemberRoutineDTO): Promise<MemberRoutine> {
    return this.repository.create(data)
  }

  /** PUT /colesio/workouts/{id} con payload ya construido */
  async updateWorkout(id: string, data: UpdateMemberRoutineDTO): Promise<MemberRoutine> {
    return this.repository.update(id, data)
  }

  /**
   * Caso de uso PUT /colesio/workouts/{id}:
   * valida dominio → arma payload → persiste vía repositorio.
   */
  async updateWorkoutFromForm(
    id: string,
    form: MemberRoutineFormState,
    exerciseIds: string[],
  ): Promise<UpdateWorkoutResult> {
    return this.updateWorkoutUseCase.execute(id, form, exerciseIds)
  }

  /** Caso de uso DELETE /colesio/workouts/{id} */
  async deleteWorkout(id: string): Promise<void> {
    return this.deleteWorkoutUseCase.execute(id)
  }
}
