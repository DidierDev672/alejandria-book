// ============================================================
// DOMAIN SERVICE - Gym Inventory Context Formatter (SRP)
// Inyecta el inventario real (equipo activo + ejercicios) al prompt.
// ============================================================

import type { GymInventoryContextResult } from '../entities/GymInventoryContext.types'
import type { ExercisesCoachCatalog } from '../entities/ExerciseCoach.types'
import type { EquipmentCoachItem } from '../entities/EquipmentCoach.types'

export class GymInventoryContextFormatter {
  static toSystemContext(result: GymInventoryContextResult): string {
    if (result.equipmentFetchFailed) {
      return (
        '\n\n## Inventario del gym — NO DISPONIBLE\n' +
        'GET /equipment no respondió. Genera una recomendación GENERAL y avisa al entrenador ' +
        'que no se pudo confirmar el equipamiento activo ni los ejercicios registrados. ' +
        'NO inventes nombres de máquinas ni de ejercicios del Coliseo.\n'
      )
    }

    if (result.emptyActiveEquipment || !result.blocks.length) {
      return (
        '\n\n## Inventario del gym — SIN EQUIPOS ACTIVOS\n' +
        'No hay equipos con status active. Informa al entrenador que no hay equipamiento activo ' +
        'registrado y NO inventes equipos ni ejercicios.\n'
      )
    }

    const withExercises = result.blocks.filter((b) => b.exercises.length > 0)
    const withoutExercises = result.blocks.filter((b) => b.exercises.length === 0)

    return (
      '\n\n## Inventario REAL del Coliseo (secuencia GET /equipment active → GET /exercises?equipment_id=)\n' +
      'Eres Gurney Halleck, estratega atlético del Coliseo. Debes crear rutinas SOLO con este inventario.\n' +
      '```json\n' +
      `${JSON.stringify(result.blocks, null, 2)}\n` +
      '```\n\n' +
      'REGLAS DE INVENTARIO (obligatorias):\n' +
      '1. SOLO usa equipos y ejercicios de este JSON. PROHIBIDO inventar nombres o IDs.\n' +
      '2. Cada ejercicio ya está ligado a su equipment_id / equipment_name.\n' +
      '3. Incluye el video_url de cada ejercicio que recomiendes.\n' +
      '4. Agrupa por equipo y luego por grupo muscular.\n' +
      '5. Si un grupo muscular no tiene ejercicios en el inventario, dilo con claridad.\n' +
      '6. Dificultad: principiante→BEGINNER; intermedio→BEGINNER+INTERMEDIATE; avanzado→todos.\n' +
      '7. En la respuesta al entrenador: nombres, grupo muscular, dificultad, equipamiento y video — sin IDs técnicos visibles.\n' +
      (withoutExercises.length
        ? `8. Equipos activos sin ejercicios registrados (omitir o avisar): ${withoutExercises
            .map((b) => b.equipment_name)
            .join(', ')}.\n`
        : '') +
      (withExercises.length === 0
        ? '9. Ningún equipo activo tiene ejercicios: informa al entrenador y no inventes.\n'
        : '')
    )
  }

  /** Aplana el inventario a catálogo para validación post-respuesta */
  static toExercisesCatalog(result: GymInventoryContextResult): ExercisesCoachCatalog {
    const data = result.blocks.flatMap((block) =>
      block.exercises.map((ex) => ({
        id: ex.exercise_id,
        name: ex.name,
        muscle_group: ex.muscle_group,
        difficulty: ex.difficulty,
        video_url: ex.video_url,
        equipment_id: block.equipment_id,
        created_at: '',
        updated_at: '',
      })),
    )
    return {
      data,
      meta: {
        total: data.length,
        page: 1,
        limit: data.length || 100,
        totalPages: 1,
      },
    }
  }

  static toEquipmentList(result: GymInventoryContextResult): EquipmentCoachItem[] {
    return result.blocks.map((b) => ({
      id: b.equipment_id,
      name: b.equipment_name,
      type: b.equipment_type,
      status: 'active',
      LastMaintenance: '',
      created_at: '',
      updated_at: '',
    }))
  }
}
