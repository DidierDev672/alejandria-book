import type { AuthRepository } from '../domain/AuthRepository'
import type { LoginCredentials, AuthResponse } from '../domain/AuthEntity'
import axiosInstance from '@/infrastructure/http/axiosInstance'

export class AuthApi implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials)
    return data
  }
}
