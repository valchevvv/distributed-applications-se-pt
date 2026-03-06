import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'restaurant_token';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/Auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response.data;
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/Auth/register', data);
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/Auth/me');
    return response.data;
  }

  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}