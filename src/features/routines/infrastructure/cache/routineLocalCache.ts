// ============================================================
// INFRASTRUCTURE CACHE - Routine Local Storage Cache
// ============================================================

import type { Routine } from '../../domain/entities/Routine.types'

const CACHE_KEY = 'routines_cache'

export function getCachedRoutines(): Routine[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : []
  } catch {
    return []
  }
}

export function upsertCachedRoutine(routine: Routine): void {
  const routines = getCachedRoutines()
  const index = routines.findIndex(r => r.id === routine.id)
  
  if (index !== -1) {
    routines[index] = routine
  } else {
    routines.unshift(routine)
  }
  
  localStorage.setItem(CACHE_KEY, JSON.stringify(routines))
}

export function removeCachedRoutine(id: string): void {
  const routines = getCachedRoutines().filter(r => r.id !== id)
  localStorage.setItem(CACHE_KEY, JSON.stringify(routines))
}

export function clearRoutineCache(): void {
  localStorage.removeItem(CACHE_KEY)
}
