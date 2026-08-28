export interface CatalogMember {
  id: string
  name_full: string
  type_document: string
  number_document: string
  date_of_birth: string
  genre: string
  phone_number: string
  address: string
}

export interface CatalogUser {
  id: string
  name_full: string
  phone: string
  id_number: string
  date_of_birth: string
  email: string
  roles: string[]
}

export interface MemberUserAssignmentPayload {
  id_user: string
  member_id: string
}

export interface MemberUserAssignment {
  id: string
  id_user: string
  member_id: string
  created_at: string
  updated_at: string
}

export interface MemberUserAssignmentListItem {
  id: string
  id_user: string
  member_id: string
  userName: string
  memberName: string
  created_at: string
  updated_at: string
}

export type MemberUserAssignmentSubmitOutcome = 'success' | 'error'
