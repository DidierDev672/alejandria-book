// ============================================================
// APPLICATION USE CASE - Update Workout (SOLID)
// SRP: orquesta validación de dominio + persistencia
// DIP: depende del puerto MemberRoutineRepository, no de axios
// ============================================================

import type { MemberRoutineRepository } from '../../domain/repositories/MemberRoutineRepository'
import { MemberRoutineDomainService } from '../../domain/services/MemberRoutineDomainService'
import { WorkoutWritePayloadMapper } from '../../domain/services/WorkoutWritePayloadMapper'
import type {
  MemberRoutine,
  MemberRoutineFormState,
  MemberRoutineValidationErrors,
  UpdateMemberRoutineDTO,
} from '../../domain/entities/MemberRoutine.types'

export type UpdateWorkoutResult =
  | { success: true; workout: MemberRoutine; payload: UpdateMemberRoutineDTO }
  | { success: false; errors: MemberRoutineValidationErrors }

export class UpdateWorkoutUseCase {
  constructor(private readonly repository: MemberRoutineRepository) {}

  async execute(
    id: string,
    form: MemberRoutineFormState,
    exerciseIds: string[],
  ): Promise<UpdateWorkoutResult> {
    // Reglas de negocio en dominio (no en la UI ni en axios)
    const errors = MemberRoutineDomainService.validate(form, exerciseIds)
    if (Object.keys(errors).length > 0) {
      return { success: false, errors }
    }

    // Payload exacto del contrato PUT /colesio/workouts/{id}
    const payload = WorkoutWritePayloadMapper.toUpdatePayload(form, exerciseIds)

    const workout = await this.repository.update(id, payload)
    return { success: true, workout, payload }
  }
}
