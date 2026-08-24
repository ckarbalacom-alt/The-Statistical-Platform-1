import api from '../lib/axios'
import type { PaginatedResponse, Publication } from '../types'

export const publicationsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Publication>>('/publications', { params }).then(r => r.data),

  featured: () =>
    api.get<{ data: Publication[] }>('/publications/featured').then(r => r.data.data),

  get: (id: number) =>
    api.get<{ data: Publication; related: Publication[] }>(`/publications/${id}`).then(r => r.data),

  download: (id: number) =>
    api.get<{ success: boolean; url: string }>(`/publications/${id}/download`).then(r => r.data),

  // Admin
  adminList: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Publication>>('/admin/publications', { params }).then(r => r.data),

  create: (form: FormData) =>
    api.post<Publication>('/admin/publications', form).then(r => r.data),

  update: (id: number, form: FormData) =>
    api.post<Publication>(`/admin/publications/${id}`, form).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/admin/publications/${id}`).then(r => r.data),
}
