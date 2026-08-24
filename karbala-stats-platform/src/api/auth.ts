import api from '../lib/axios'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; token: string; user: { id: number; name_ar: string; name_en: string | null; email: string; role: string; avatar_url: string | null } }>(
      '/auth/login', { email, password }
    ).then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),

  me: () =>
    api.get('/auth/me').then(r => r.data),

  googleRedirect: () =>
    api.get<{ url: string }>('/auth/google/redirect').then(r => r.data),
}
