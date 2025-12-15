const API_BASE_URL = '/api'

export interface User {
  id: number
  email: string
  full_name: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  created_at: string
  updated_at: string
}

export interface RegisterData {
  email: string
  password: string
  password_confirm: string
  full_name?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  user: User
}

export interface ErrorResponse {
  error?: string
  [key: string]: string | string[] | undefined
}

export interface TrainingPreferences {
  excluded_equipment_modalities: string[]
  excluded_equipment_stations: string[]
  excluded_machine_types: string[]
  excluded_exercise_attributes: string[]
  sessions_per_week: number
  training_intensity: number
  max_session_mins: number
  updated_at: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirm: string
}

export interface ChangePasswordResponse {
  detail: string
}

export interface UpdateProfileData {
  email: string
  full_name: string
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`)
  if (!response.ok) {
    throw new Error('Failed to get CSRF token')
  }
  const data = await response.json()
  return data.csrfToken
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get CSRF token for POST/PUT/DELETE requests
  if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    const csrfToken = await getCsrfToken()
    options.headers = {
      ...options.headers,
      'X-CSRFToken': csrfToken,
      'Content-Type': 'application/json',
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Important for cookies
  })

  const data = await response.json()

  if (!response.ok) {
    throw { status: response.status, data }
  }

  return data as T
}

export const api = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async login(data: LoginData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async logout(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/logout/', {
      method: 'POST',
    })
  },

  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/auth/me/')
  },

  async refreshToken(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/refresh/', {
      method: 'POST',
    })
  },

  async getTrainingPreferences(): Promise<TrainingPreferences> {
    return apiRequest<TrainingPreferences>('/preferences/training/')
  },

  async updateTrainingPreferences(
    data: Partial<TrainingPreferences>
  ): Promise<TrainingPreferences> {
    return apiRequest<TrainingPreferences>('/preferences/training/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
    return apiRequest<ChangePasswordResponse>('/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiRequest<User>('/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

