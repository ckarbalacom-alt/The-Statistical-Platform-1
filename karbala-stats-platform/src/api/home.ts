import api from '../lib/axios'

export const homeApi = {
  stats: () => api.get('/home/stats').then(r => r.data),
  publicSettings: () => api.get('/settings/public').then(r => r.data),
  categories: () => api.get('/categories').then(r => r.data),
  calendarUpcoming: (days = 14) => api.get('/calendar/upcoming', { params: { days } }).then(r => r.data),
}
