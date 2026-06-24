export interface Author {
  id: string
  name: string
  country: string
  genres: string[]
  birthDay: string
  createdAt: string
  updatedAt: string
}

export interface CreateAuthorPayload {
  name: string
  country: string
  genres: string[]
  birthDay: string
}

export interface UpdateAuthorPayload extends CreateAuthorPayload {}
