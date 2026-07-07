import type { Member } from '../../domain/entities/Member.types'

const STORAGE_KEY = 'coliseo_members_cache'

export const MEMBERS_LIST_FALLBACK_KEY = 'members_list_fallback'

function readCache(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCache(members: Member[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
}

export function getCachedMembers(): Member[] {
  return readCache()
}

export function upsertCachedMember(member: Member): void {
  const members = readCache()
  const index = members.findIndex(item => item.id === member.id)

  if (index === -1) {
    members.unshift(member)
  } else {
    members[index] = member
  }

  writeCache(members)
}

export function removeCachedMember(id: string): void {
  writeCache(readCache().filter(member => member.id !== id))
}

export function setMembersListFallback(active: boolean): void {
  if (active) {
    sessionStorage.setItem(MEMBERS_LIST_FALLBACK_KEY, '1')
  } else {
    sessionStorage.removeItem(MEMBERS_LIST_FALLBACK_KEY)
  }
}

export function isMembersListFallbackActive(): boolean {
  return sessionStorage.getItem(MEMBERS_LIST_FALLBACK_KEY) === '1'
}
