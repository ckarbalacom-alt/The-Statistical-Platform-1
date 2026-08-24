import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, ChevronLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { indicatorsApi } from '../../api/indicators'
import api from '../../lib/axios'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import RichTextEditor from '../../components/ui/RichTextEditor'
import type { Category, Indicator } from '../../types'

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up')   return <TrendingUp className="h-4 w-4 text-green-500" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-gray-400" />
}

interface IndicatorFormState {
  name_ar: string; name_en: string; unit_ar: string; unit_en: string
  source: string; methodology_ar: string; category_id: string; is_featured: boolean
}

const emptyForm: IndicatorFormState = {
  name_ar: '', name_en: '', unit_ar: '', unit_en: '', source: '', methodology_ar: '', category_id: '', is_featured: false,
}

export default function AdminIndicatorsPage() {
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<number | null>(null)
  const [form, setForm]             = useState<IndicatorFormState>(emptyForm)
  const [errors, setErrors]         = useState<Record<string, string[]>>({})
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-indicators', { page, search }],
    queryFn: () => indicatorsApi.adminList({ page, search: search || undefined }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: Category[] }>('/categories').then(r => r.data.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId ? indicatorsApi.update(editingId, payload) : indicatorsApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-indicators'] }); setShowForm(false); setEditingId(null); setForm(emptyForm) },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors
      if (errData) setErrors(errData)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => indicatorsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-indicators'] }),
  })

  const openEdit = (ind: Indicator) => {
    setForm({
      name_ar: ind.name_ar, name_en: ind.name_en ?? '', unit_ar: ind.unit_ar ?? '', unit_en: ind.unit_en ?? '',
      source: ind.source ?? '', methodology_ar: ind.methodology_ar ?? '',
      category_id: String(ind.category?.id ?? ''), is_featured: ind.is_featured,
    })
    setEditingId(ind.id)
    setShowForm(true)
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    saveMutation.mutate({ ...form, is_featured: form.is_featured ? 1 : 0 })
  }

  const f = (key: keyof IndicatorFormState) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">المؤشرات الإحصائية</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setErrors({}) }} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> إضافة مؤشر
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="card border-2 border-primary/20 space-y-4">
          <h2 className="font-semibold text-gray-800">{editingId ? 'تعديل المؤشر' : 'مؤشر جديد'}</h2>
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
                <label className="label">وحدة القياس (عربي) *</label>
                <input type="text" {...f('unit_ar')} className="input" required />
                {errors.unit_ar && <p className="text-red-500 text-xs mt-1">{errors.unit_ar[0]}</p>}
              </div>
              <div>
                <label className="label">وحدة القياس (إنجليزي)</label>
                <input type="text" {...f('unit_en')} className="input" dir="ltr" />
              </div>
              <div>
                <label className="label">التصنيف</label>
                <select {...f('category_id')} className="input">
                  <option value="">بدون تصنيف</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                </select>
              </div>
              <div>
                <label className="label">المصدر</label>
                <input type="text" {...f('source')} className="input" />
              </div>
              <div className="sm:col-span-2">
                <RichTextEditor
                  label="المنهجية"
                  value={form.methodology_ar}
                  onChange={value => setForm(prev => ({ ...prev, methodology_ar: value }))}
                  minHeight="160px"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ind_featured" checked={form.is_featured}
                  onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))} className="w-4 h-4 text-primary" />
                <label htmlFor="ind_featured" className="text-sm text-gray-700">مؤشر مميز</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2">
                {saveMutation.isPending && <Spinner size="sm" />}
                {editingId ? 'حفظ' : 'إضافة'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
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
          <input type="text" placeholder="بحث عن مؤشر..." value={search}
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
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المؤشر</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">التصنيف</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">آخر قيمة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الاتجاه</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map(ind => (
                  <tr key={ind.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{ind.name_ar}</p>
                      {ind.is_featured && <span className="badge bg-accent/10 text-accent text-xs">مميز</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ind.category?.name_ar ?? '—'}</td>
                    <td className="px-4 py-3">
                      {ind.latest_value !== null ? (
                        <span className="font-medium">{ind.latest_value.toLocaleString('ar-IQ')} {ind.unit_ar}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3"><TrendIcon trend={ind.trend} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/admin/indicators/${ind.id}/data-points`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                          البيانات <ChevronLeft className="h-3 w-3" />
                        </Link>
                        <button onClick={() => openEdit(ind)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`حذف "${ind.name_ar}"؟`)) deleteMutation.mutate(ind.id) }}
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
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400">لا توجد مؤشرات</td></tr>
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
