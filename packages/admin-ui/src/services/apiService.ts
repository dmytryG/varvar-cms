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

export interface DeleteUserRequest {
  userId: string;
}

export interface UsersResponse {
  users: User[];
}

export interface Project {
    id: string;
    slug: string;
    name: string;
    description?: string;
}

export interface Page {
    _id: string;
    slug: string;
    language: string;
    projectSlug: string;
    data: any;
    isPublished: boolean;
    isRoot: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectsResponse {
    projects: Project[];
}

export interface ProjectResponse {
    project: Project;
}

export interface PagesResponse {
    pages: Page[];
}

export interface PageResponse {
    page: Page;
}

export interface PageDataResponse {
    data: Page;
}

export interface VersionsResponse {
    versions: Page[];
}

export class APIService {
  private static currentUser: User | null = null;
  private static BEVersion: string = 'Unknown';

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

    static async version(): Promise<string> {
        try {
            if (this.BEVersion !== 'Unknown') return this.BEVersion;
            const response = await this.request<{ version: string }>('/version', {
                method: 'GET',
            });
            this.BEVersion = response.version;
            return response.version;
        } catch (error) {
            console.error('Error fetching version:', error);
            return 'Unknown';
        } finally {
        }
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

  // Helper method to check user role
  static hasRole(requiredRole: 'ADMIN' | 'USER'): boolean {
    return this.currentUser?.role === requiredRole;
  }

  // User management methods
  static async listUsers(): Promise<User[]> {
    try {
      const response = await this.request<UsersResponse>('/users', {
        method: 'GET',
      });
      return response.users;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      toast.error(message);
      throw error;
    }
  }

  static async setUserRole(userId: string, role: 'ADMIN' | 'USER'): Promise<void> {
    try {
      await this.request<{ ok: boolean }>('/users/set-role', {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      });
      toast.success('User role updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user role';
      toast.error(message);
      throw error;
    }
  }

    static async deleteUser(userId: string): Promise<void> {
        try {
            await this.request<{ ok: boolean }>('/users', {
                method: 'DELETE',
                body: JSON.stringify({ userId }),
            });
            toast.success('User deleted successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error(message);
            throw error;
        }
    }

    // Project management methods
    static async listProjects(): Promise<Project[]> {
        try {
            const response = await this.request<ProjectsResponse>('/projects', {
                method: 'GET',
            });
            return response.projects;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch projects';
            toast.error(message);
            throw error;
        }
    }

    static async getProject(id: string): Promise<Project> {
        try {
            const response = await this.request<ProjectResponse>(`/projects/${id}`, {
                method: 'GET',
            });
            return response.project;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch project';
            toast.error(message);
            throw error;
        }
    }

    static async createProject(slug: string, name: string, description?: string): Promise<Project> {
        try {
            const response = await this.request<ProjectResponse>('/projects', {
                method: 'POST',
                body: JSON.stringify({ slug, name, description }),
            });
            toast.success('Project created successfully');
            return response.project;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create project';
            toast.error(message);
            throw error;
        }
    }

    static async updateProject(id: string, project: Partial<Project>): Promise<Project> {
        try {
            const response = await this.request<ProjectResponse>(`/projects/${id}`, {
                method: 'PUT',
                body: JSON.stringify(project),
            });
            toast.success('Project updated successfully');
            return response.project;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update project';
            toast.error(message);
            throw error;
        }
    }

    static async deleteProject(id: string): Promise<void> {
        try {
            await this.request<{ message: string }>(`/projects/${id}`, {
                method: 'DELETE',
            });
            toast.success('Project deleted successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete project';
            toast.error(message);
            throw error;
        }
    }

    // Page management methods
    static async listProjectPages(projectSlug: string): Promise<Page[]> {
        try {
            const response = await this.request<PagesResponse>(`/pages/project/${projectSlug}`, {
                method: 'GET',
            });
            return response.pages;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch project pages';
            toast.error(message);
            throw error;
        }
    }

    static async getPageVersions(slug: string, language: string, projectSlug: string): Promise<Page[]> {
        try {
            const response = await this.request<VersionsResponse>(`/pages/versions/${slug}/${language}/${projectSlug}`, {
                method: 'GET',
            });
            return response.versions;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch page versions';
            toast.error(message);
            throw error;
        }
    }

    static async getEditablePage(slug: string, language: string, projectSlug: string): Promise<Page> {
        try {
            const response = await this.request<PageDataResponse>(`/pages/editable/${slug}/${language}/${projectSlug}`, {
                method: 'GET',
            });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch page for editing';
            toast.error(message);
            throw error;
        }
    }

    static async getPageById(id: string): Promise<Page> {
        try {
            const response = await this.request<PageDataResponse>(`/pages/${id}`, {
                method: 'GET',
            });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch page for editing';
            toast.error(message);
            throw error;
        }
    }

    static async createPage(slug: string, language: string, projectSlug: string, data: any): Promise<Page> {
        try {
            const response = await this.request<PageResponse>(`/pages/${slug}/${language}/${projectSlug}`, {
                method: 'POST',
                body: JSON.stringify({ data }),
            });
            toast.success('Page created successfully');
            return response.page;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create page';
            toast.error(message);
            throw error;
        }
    }

    static async updatePageData(slug: string, projectSlug: string, language: string, data: any): Promise<void> {
        try {
            await this.request<{ ok: boolean }>(`/pages/${slug}/${language}/${projectSlug}`, {
                method: 'PUT',
                body: JSON.stringify({ data }),
            });
            toast.success('Page updated successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update page';
            toast.error(message);
            throw error;
        }
    }

    static async publishPage(slug: string, language: string, projectSlug: string): Promise<void> {
        try {
            await this.request<{ message: string }>(`/pages/publish/${slug}/${language}/${projectSlug}`, {
                method: 'POST',
            });
            toast.success('Page published successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to publish page';
            toast.error(message);
            throw error;
        }
    }

    static async unpublishPage(slug: string, language: string, projectSlug: string): Promise<void> {
        try {
            await this.request<{ message: string }>(`/pages/unpublish/${slug}/${language}/${projectSlug}`, {
                method: 'POST',
            });
            toast.success('Page unpublished successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to unpublish page';
            toast.error(message);
            throw error;
        }
    }

    static async deletePageVersion(id: string): Promise<void> {
        try {
            await this.request<{ message: string }>(`/pages/${id}`, {
                method: 'DELETE',
            });
            toast.success('Page version deleted successfully');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete page version';
            toast.error(message);
            throw error;
        }
    }
}