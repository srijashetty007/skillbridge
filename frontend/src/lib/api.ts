const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('skillbridge_token')
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('skillbridge_token', token)
  } else {
    localStorage.removeItem('skillbridge_token')
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`
    try {
      const data = await response.json()
      if (typeof data?.detail === 'string') {
        errorMessage = data.detail
      } else if (Array.isArray(data?.detail)) {
        errorMessage = data.detail.map((d: { msg?: string }) => d.msg).join(', ')
      } else if (data?.message) {
        errorMessage = data.message
      }
    } catch {
      // ignore non-json error bodies
    }
    throw new ApiError(errorMessage, response.status)
  }

  if (response.status === 204) {
    return {} as T
  }
  return response.json() as Promise<T>
}
