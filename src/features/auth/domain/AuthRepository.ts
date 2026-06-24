import type { LoginCredentials, AuthResponse } from './AuthEntity'

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>
}
