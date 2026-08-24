import { create } from 'zustand'

interface AuthUser {
  id: number
  name_ar: string
  name_en: string | null
  email: string
  role: string
  avatar_url: string | null
  permissions?: string[]
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const storedUser  = localStorage.getItem('auth_user')
const storedToken = localStorage.getItem('auth_token')

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            storedUser ? JSON.parse(storedUser) : null,
  token:           storedToken ?? null,
  isAuthenticated: !!storedToken,

  setAuth: (user, token) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  hasPermission: (permission) => {
    const { user } = get()
    if (!user) return false
    if (user.role === 'superadmin') return true
    return user.permissions?.includes(permission) ?? false
  },
}))
