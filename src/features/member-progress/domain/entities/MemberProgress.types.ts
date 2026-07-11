export interface MemberProgress {
  id: string
  user_id: string
  user_name?: string
  month_year: string
  recorded_value: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateMemberProgressDTO {
  user_id: string
  month_year: string
  recorded_value: number
  notes?: string
}

export interface UpdateMemberProgressDTO extends Partial<CreateMemberProgressDTO> {
  id: string
}

export interface MemberProgressFormState {
  user_id: string
  user_name: string
  month_year: string
  recorded_value: number | ''
  notes: string
}

export interface MemberProgressValidationErrors {
  user_id?: string[]
  month_year?: string[]
  recorded_value?: string[]
  notes?: string[]
}