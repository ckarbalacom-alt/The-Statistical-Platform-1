import api from '../lib/axios'
import type { Indicator, PaginatedResponse } from '../types'

export const indicatorsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<{ data: Indicator[] }>('/indicators', { params }).then(r => r.data.data),

  get: (id: number) =>
    api.get<{ data: Indicator }>(`/indicators/${id}`).then(r => r.data.data),

  chartData: (id: number, periodType = 'yearly') =>
    api.get<{ labels: string[]; values: number[] }>(`/indicators/${id}/chart-data`, { params: { period_type: periodType } }).then(r => r.data),

  // Admin
  adminList: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Indicator>>('/admin/indicators', { params }).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post<Indicator>('/admin/indicators', data).then(r => r.data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put<Indicator>(`/admin/indicators/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/admin/indicators/${id}`).then(r => r.data),

  addDataPoint: (indicatorId: number, data: Record<string, unknown>) =>
    api.post(`/admin/indicators/${indicatorId}/data-points`, data).then(r => r.data),

  removeDataPoint: (indicatorId: number, dpId: number) =>
    api.delete(`/admin/indicators/${indicatorId}/data-points/${dpId}`).then(r => r.data),
}
