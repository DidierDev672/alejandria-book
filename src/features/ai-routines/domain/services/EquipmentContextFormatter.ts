// ============================================================
// DOMAIN SERVICE - Equipment Context Formatter (SRP)
// Serializa GET /equipment para el system prompt del Coach.
// ============================================================

import type { EquipmentCoachItem } from '../entities/EquipmentCoach.types'

export class EquipmentContextFormatter {
  /**
   * Inyecta el JSON de equipos como referencia obligatoria
   * para indicar el equipamiento en cada rutina.
   */
  static toSystemContext(equipment: EquipmentCoachItem[]): string {
    if (!equipment.length) {
      return (
        '\n\nCATÁLOGO DE EQUIPAMIENTO (GET /equipment) — OBLIGATORIO:\n' +
        '```json\n[]\n```\n' +
        'No hay equipos registrados. Si un ejercicio requiere máquina/mancuerna, dilo con claridad ' +
        'y pide al entrenador registrar el equipo en el sistema. No inventes nombres de equipos.'
      )
    }

    const allowlist = equipment
      .map(
        (e) =>
          `- (interno) ${e.id} → name="${e.name}" | type=${e.type} | status=${e.status} | LastMaintenance=${e.LastMaintenance || 'N/A'}`,
      )
      .join('\n')

    return (
      '\n\nCATÁLOGO DE EQUIPAMIENTO DEL GYM (contrato GET /equipment — fuente de verdad):\n' +
      '```json\n' +
      `${JSON.stringify(equipment, null, 2)}\n` +
      '```\n\n' +
      'ALLOWLIST RÁPIDA DE EQUIPOS:\n' +
      `${allowlist}\n\n` +
      'CÓMO USAR ESTE JSON EN LAS RUTINAS:\n' +
      '- Cada ejercicio de GET /exercises trae equipment_id: resuélvelo contra este catálogo (mismo id) y muestra el name del equipo.\n' +
      '- En la rutina visible DEBES indicar el equipamiento: "equipamiento: {name}" (traduce type/status al español).\n' +
      '- Prefiere equipos con status active/activo. Si está inactive o pending, avisa al entrenador.\n' +
      '- Campos del contrato: id, name, type, status, LastMaintenance, created_at, updated_at.\n' +
      '- PROHIBIDO inventar equipos fuera de este JSON. PROHIBIDO mostrar el id del equipo al entrenador.\n' +
      '- Ejemplo correcto: "Press banca — grupo muscular pectorales, dificultad intermedia, equipamiento: Banco plano".'
    )
  }
}
