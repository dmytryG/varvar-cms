import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3000/api';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SetRoleRequest {
  userId: string;
  role: 'ADMIN' | 'USER';
}

export class APIService {
  private static currentUser: User | null = null;

  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async checkAuth(): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const userData = await this.request<{ user: User }>('/auth/me');
        console.log('User data:', userData.user);
        this.currentUser = userData.user;
      } catch (error) {
        localStorage.removeItem('authToken');
        this.currentUser = null;
        console.error('Error checking auth:', error);
        throw new Error('Not authenticated. Please log in.')
      }
    }
    else {
        console.error('No token');
        throw new Error('Not authenticated. Please log in.')
    }
  }

  // Auth methods
  static async login(email: string, password: string): Promise<void> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('authToken', response.token);
      this.currentUser = response.user;
      toast.success('Login successful!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
    }
  }

  static async register(email: string, password: string): Promise<void> {
    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      localStorage.setItem('authToken', response.token);
      this.currentUser = response.user;
      toast.success('Registration successful!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
    }
  }

  static logout(): void {
    localStorage.removeItem('authToken');
    this.currentUser = null;
    toast.info('Logged out successfully');
  }

  // Getters for auth state
  static get user(): User | null {
    return this.currentUser;
  }

  static get getCurrentUser(): User | null {
    return this.currentUser;
  }

  static async getUsers(): Promise<User[]> {
    return this.request<User[]>('/auth/users');
  }

  static async setRole(data: SetRoleRequest): Promise<void> {
    return this.request<void>('/auth/set-role', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helper method to check user role
  static hasRole(requiredRole: 'ADMIN' | 'USER'): boolean {
    return this.currentUser?.role === requiredRole;
  }
}