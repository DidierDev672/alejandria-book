import type {
  CatalogMember,
  CatalogUser,
  MemberUserAssignment,
  MemberUserAssignmentListItem,
  MemberUserAssignmentPayload,
} from '../entities/MemberUserAssignment.types'

export class MemberUserAssignmentDomainService {
  static matchesQuery(haystack: string, query: string): boolean {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return true
    return haystack.toLowerCase().includes(normalizedQuery)
  }

  static filterMembers(members: CatalogMember[], query: string): CatalogMember[] {
    return members.filter((member) =>
      this.matchesQuery(
        `${member.name_full} ${member.type_document} ${member.number_document} ${member.phone_number}`,
        query,
      ),
    )
  }

  static filterUsers(users: CatalogUser[], query: string): CatalogUser[] {
    return users.filter((user) =>
      this.matchesQuery(
        `${user.name_full} ${user.id_number} ${user.email} ${user.phone}`,
        query,
      ),
    )
  }

  static documentLabel(typeDocument: string, numberDocument?: string): string {
    const type = typeDocument.trim()
    const number = numberDocument?.trim() ?? ''
    if (type && number) return `${type} ${number}`
    return type || number || '—'
  }

  static catalogErrorMessage(): string {
    return 'Algo se atascó al abrir esta lista. No perdiste nada: vuelve a intentarlo cuando quieras.'
  }

  static toPayload(idUser: string, memberId: string): MemberUserAssignmentPayload {
    return {
      id_user: idUser.trim(),
      member_id: memberId.trim(),
    }
  }

  static submitErrorMessage(): string {
    return 'Se presentó un error al intentar asignar el usuario. No es tu culpa: el vínculo no se guardó, pero lo que elegiste sigue aquí. Cuando quieras, lo intentamos otra vez.'
  }

  static listErrorMessage(status?: number): string {
    if (status === 400) {
      return 'Se presentó un error al intentar obtener las asignaciones. No es tu culpa: esta lista se quedó a medio camino y ningún vínculo se perdió. Cuando quieras, lo intentamos otra vez.'
    }

    return 'Algo se atascó al abrir esta lista. No perdiste nada: vuelve a intentarlo cuando quieras.'
  }

  static deleteErrorMessage(status?: number): string {
    if (status === 400) {
      return 'No pudimos quitar este vínculo ahora. No es tu culpa: inténtalo otra vez, lo demás sigue en su lugar.'
    }

    return 'Algo se atascó al eliminar. Puedes intentarlo otra vez cuando quieras.'
  }

  static toListItem(
    assignment: MemberUserAssignment,
    users: CatalogUser[],
    members: CatalogMember[],
  ): MemberUserAssignmentListItem {
    const user = users.find((item) => item.id === assignment.id_user)
    const member = members.find((item) => item.id === assignment.member_id)

    return {
      id: assignment.id,
      id_user: assignment.id_user,
      member_id: assignment.member_id,
      userName: user?.name_full?.trim() || 'Persona por identificar',
      memberName: member?.name_full?.trim() || 'Gladiador por identificar',
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
    }
  }

  static filterAssignments(
    items: MemberUserAssignmentListItem[],
    query: string,
  ): MemberUserAssignmentListItem[] {
    return items.filter((item) =>
      this.matchesQuery(
        `${item.userName} ${item.id_user} ${item.memberName} ${item.member_id}`,
        query,
      ),
    )
  }

  static formatDateTime(iso: string): string {
    const value = iso.trim()
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  static initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }
    return name.trim().slice(0, 2).toUpperCase() || '?'
  }
}
