import api from '../lib/axios'
import type { Category, CategoryPage, PaginatedResponse } from '../types'

export const categoriesApi = {
  siteMap: () =>
    api.get<{ data: Category[] }>('/site-map').then(r => r.data.data),

  section: (slug: string) =>
    api.get<{ category: Category; page: CategoryPage | null }>(`/sections/${slug}`).then(r => r.data),

  adminList: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Category>>('/admin/categories', { params }).then(r => r.data),

  adminTree: () =>
    api.get<{ data: Category[] }>('/admin/categories/tree').then(r => r.data.data),

  create: (data: Record<string, unknown>) =>
    api.post<{ data: Category }>('/admin/categories', data).then(r => r.data.data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put<{ data: Category }>(`/admin/categories/${id}`, data).then(r => r.data.data),

  remove: (id: number) =>
    api.delete(`/admin/categories/${id}`).then(r => r.data),

  toggleActive: (id: number) =>
    api.patch(`/admin/categories/${id}/toggle-active`).then(r => r.data),

  pageByCategory: (categoryId: number) =>
    api.get<{ data: CategoryPage | null }>(`/admin/category-pages/by-category/${categoryId}`).then(r => r.data.data),

  savePage: (data: Record<string, unknown>) =>
    api.post<{ data: CategoryPage }>('/admin/category-pages', data).then(r => r.data.data),
}
