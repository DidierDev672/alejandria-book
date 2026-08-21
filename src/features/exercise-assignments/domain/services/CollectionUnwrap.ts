export function unwrapCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.data)) return record.data as T[]
    if (Array.isArray(record.items)) return record.items as T[]
    if (Array.isArray(record.users)) return record.users as T[]
    if (Array.isArray(record.exercises)) return record.exercises as T[]
    if (Array.isArray(record.equipment)) return record.equipment as T[]
    if (Array.isArray(record.assignments)) return record.assignments as T[]
  }

  return []
}

export function unwrapAssignmentCollection<T>(payload: unknown): T[] {
  const items = unwrapCollection<T>(payload)
  if (items.length > 0) return items

  if (payload && typeof payload === 'object' && 'id_user' in payload) {
    return [payload as T]
  }

  return []
}
