import type { AuthRepository } from '../domain/AuthRepository'
import type { LoginCredentials, AuthResponse } from '../domain/AuthEntity'

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!credentials.email.trim()) throw new Error('El correo es obligatorio')
    if (!credentials.password.trim()) throw new Error('La contraseña es obligatoria')

    const response = await this.repository.login(credentials)

    localStorage.setItem('auth_token', response.token)
    localStorage.setItem('auth_user', JSON.stringify(response.user))

    return response
  }

  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  getStoredUser() {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}
