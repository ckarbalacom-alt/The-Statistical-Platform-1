import api from '../lib/axios'
import type { NewsArticle, PaginatedResponse } from '../types'

export const newsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<NewsArticle>>('/news', { params }).then(r => r.data),

  featured: () =>
    api.get<{ data: NewsArticle[] }>('/news/featured').then(r => r.data.data),

  get: (id: number) =>
    api.get<{ data: NewsArticle; related: NewsArticle[] }>(`/news/${id}`).then(r => r.data),

  // Admin
  adminList: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<NewsArticle>>('/admin/news', { params }).then(r => r.data),

  adminGet: (id: number) =>
    api.get<{ data: NewsArticle }>(`/admin/news/${id}`).then(r => r.data.data),

  create: (form: FormData) =>
    api.post<{ data: NewsArticle }>('/admin/news', form).then(r => r.data.data),

  update: (id: number, form: FormData) =>
    api.post<{ data: NewsArticle }>(`/admin/news/${id}`, form).then(r => r.data.data),

  remove: (id: number) =>
    api.delete(`/admin/news/${id}`).then(r => r.data),
}
