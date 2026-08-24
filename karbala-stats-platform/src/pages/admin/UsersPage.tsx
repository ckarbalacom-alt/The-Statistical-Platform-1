import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import api from '../../lib/axios'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import type { User, PaginatedResponse } from '../../types'

const roleMap: Record<string, string> = {
  superadmin: 'مدير عام', admin: 'مدير', editor: 'محرر', viewer: 'مشاهد',
}
const roleColors: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700', admin: 'bg-primary/10 text-primary',
  editor: 'bg-blue-100 text-blue-700', viewer: 'bg-gray-100 text-gray-600',
}

interface UserForm { name_ar: string; name_en: string; email: string; password: string; role: string; is_active: boolean }
const emptyForm: UserForm = { name_ar: '', name_en: '', email: '', password: '', role: 'editor', is_active: true }

export default function AdminUsersPage() {
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm]           = useState<UserForm>(emptyForm)
  const [errors, setErrors]       = useState<Record<string, string[]>>({})
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { page, search }],
    queryFn: () => api.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, search: search || undefined },
    }).then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId
        ? api.put(`/admin/users/${editingId}`, payload).then(r => r.data)
        : api.post('/admin/users', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setShowForm(false); setEditingId(null); setForm(emptyForm); setErrors({})
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors
      if (errData) setErrors(errData)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/users/${id}/toggle-active`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const openEdit = (user: User) => {
    setForm({ name_ar: user.name_ar, name_en: user.name_en ?? '', email: user.email, password: '', role: user.role, is_active: user.is_active })
    setEditingId(user.id); setShowForm(true); setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setErrors({})
    const payload: Record<string, unknown> = { ...form, is_active: form.is_active ? 1 : 0 }
    if (!payload.password) delete payload.password
    saveMutation.mutate(payload)
  }

  const f = (key: keyof UserForm) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">المستخدمون</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setErrors({}) }} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> إضافة مستخدم
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-primary/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">{editingId ? 'تعديل المستخدم' : 'مستخدم جديد'}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">الاسم بالعربية *</label>
                <input type="text" {...f('name_ar')} className="input" required />
                {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar[0]}</p>}
              </div>
              <div>
                <label className="label">الاسم بالإنجليزية</label>
                <input type="text" {...f('name_en')} className="input" dir="ltr" />
              </div>
              <div>
                <label className="label">البريد الإلكتروني *</label>
                <input type="email" {...f('email')} className="input" required dir="ltr" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
              </div>
              <div>
                <label className="label">كلمة المرور {editingId ? '(اتركها فارغة للإبقاء)' : '*'}</label>
                <input type="password" {...f('password')} className="input" required={!editingId} dir="ltr" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
              </div>
              <div>
                <label className="label">الدور</label>
                <select {...f('role')} className="input">
                  <option value="viewer">مشاهد</option>
                  <option value="editor">محرر</option>
                  <option value="admin">مدير</option>
                  <option value="superadmin">مدير عام</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="user_active" checked={form.is_active}
                  onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4 text-primary" />
                <label htmlFor="user_active" className="text-sm text-gray-700">حساب نشط</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2">
                {saveMutation.isPending && <Spinner size="sm" />}
                {editingId ? 'حفظ' : 'إضافة'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="بحث بالاسم أو البريد..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} className="input pr-9 w-full" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المستخدم</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الدور</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">آخر دخول</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.name_ar}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${roleColors[user.role]}`}>{roleMap[user.role]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleString('ar-IQ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleMutation.mutate(user.id)} disabled={toggleMutation.isPending}
                        className={`flex items-center gap-1.5 text-sm font-medium ${user.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {user.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        {user.is_active ? 'نشط' : 'موقوف'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`حذف "${user.name_ar}"؟`)) deleteMutation.mutate(user.id) }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.data.length && (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400">لا يوجد مستخدمون</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}
