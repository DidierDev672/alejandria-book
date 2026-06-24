export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  name_full: string
  email: string
  phone?: string
  id_number?: string
  date_of_birth?: string
  roles?: string[]
}

export interface AuthResponse {
  token: string
  user: User
}
