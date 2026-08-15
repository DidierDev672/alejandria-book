// ============================================================
// DOMAIN SERVICE - Member Summary Mapper
// ============================================================

import type { MemberSummary } from '../entities/MemberSummary.types'

export class MemberSummaryMapper {
  static toDomain(id: string, raw: Record<string, unknown>): MemberSummary {
    // Soporta respuesta directa {...} o envuelta { data: {...} }
    const payload =
      raw && !Array.isArray(raw) && 'data' in raw && raw.data && typeof raw.data === 'object'
        ? (raw.data as Record<string, unknown>)
        : raw

    return {
      id,
      name_full: String(payload.name_full ?? ''),
      type_document: String(payload.type_document ?? ''),
      number_document: String(payload.number_document ?? ''),
      date_of_birth: String(payload.date_of_birth ?? ''),
      genre: String(payload.genre ?? ''),
      phone_number: String(payload.phone_number ?? ''),
      address: String(payload.address ?? ''),
    }
  }
}
