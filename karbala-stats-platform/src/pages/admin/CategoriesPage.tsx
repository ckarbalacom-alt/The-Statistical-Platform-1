import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, FolderTree, Plus, Search, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react'
import { categoriesApi } from '../../api/categories'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import type { Category } from '../../types'

interface CategoryForm {
  name_ar: string
  name_en: string
  slug: string
  description_ar: string
  icon: string
  parent_id: string
  display_order: string
  is_active: boolean
}

const emptyForm: CategoryForm = {
  name_ar: '',
  name_en: '',
  slug: '',
  description_ar: '',
  icon: '',
  parent_id: '',
  display_order: '0',
  is_active: true,
}

const flattenCategories = (items: Category[], level = 0): Array<Category & { level: number }> =>
  items.flatMap(item => [
    { ...item, level },
    ...flattenCategories(item.children ?? [], level + 1),
  ])

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [parentFilter, setParentFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories', { page, search, parentFilter }],
    queryFn: () => categoriesApi.adminList({
      page,
      search: search || undefined,
      parent_id: parentFilter || undefined,
    }),
  })

  const { data: tree = [] } = useQuery({
    queryKey: ['admin-categories-tree'],
    queryFn: categoriesApi.adminTree,
  })

  const parentOptions = flattenCategories(tree).filter(category => category.id !== editingId)

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingId ? categoriesApi.update(editingId, payload) : categoriesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['admin-categories-tree'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      setErrors({})
      setMessage('')
    },
    onError: (err: unknown) => {
      const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data
      setErrors(response?.errors ?? {})
      setMessage(response?.message ?? '')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['admin-categories-tree'] })
      setMessage('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setMessage(msg ?? 'تعذر حذف التصنيف')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['admin-categories-tree'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const openCreate = () => {
    setShowForm(true)
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setMessage('')
  }

  const openEdit = (category: Category) => {
    setForm({
      name_ar: category.name_ar,
      name_en: category.name_en ?? '',
      slug: category.slug ?? '',
      description_ar: category.description_ar ?? '',
      icon: category.icon ?? '',
      parent_id: category.parent_id ? String(category.parent_id) : '',
      display_order: String(category.display_order ?? 0),
      is_active: category.is_active ?? true,
    })
    setEditingId(category.id)
    setShowForm(true)
    setErrors({})
    setMessage('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setMessage('')
    saveMutation.mutate({
      ...form,
      parent_id: form.parent_id || null,
      display_order: Number(form.display_order || 0),
      is_active: form.is_active ? 1 : 0,
    })
  }

  const f = (key: keyof CategoryForm) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التصنيفات</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة تصنيفات الموقع والإصدارات والمؤشرات بشكل هرمي ومنظم.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> إضافة تصنيف
        </button>
      </div>

      {message && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          {message}
        </div>
      )}

      {showForm && (
        <div className="card border-2 border-primary/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">{editingId ? 'تعديل التصنيف' : 'تصنيف جديد'}</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <label className="label">الرابط المختصر</label>
                <input type="text" {...f('slug')} className="input" dir="ltr" placeholder="metadata-agriculture" />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug[0]}</p>}
              </div>
              <div>
                <label className="label">التصنيف الأب</label>
                <select {...f('parent_id')} className="input">
                  <option value="">تصنيف رئيسي</option>
                  {parentOptions.map(category => (
                    <option key={category.id} value={category.id}>
                      {'-'.repeat(category.level)} {category.name_ar}
                    </option>
                  ))}
                </select>
                {errors.parent_id && <p className="text-red-500 text-xs mt-1">{errors.parent_id[0]}</p>}
              </div>
              <div>
                <label className="label">الأيقونة</label>
                <input type="text" {...f('icon')} className="input" dir="ltr" placeholder="FolderTree" />
              </div>
              <div>
                <label className="label">الترتيب</label>
                <input type="number" min="0" {...f('display_order')} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="label">الوصف</label>
                <textarea {...f('description_ar')} rows={3} className="input resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="category_active"
                  checked={form.is_active}
                  onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="category_active" className="text-sm text-gray-700">تصنيف مفعّل</label>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2">
                {saveMutation.isPending && <Spinner size="sm" />}
                {editingId ? 'حفظ التغييرات' : 'إضافة'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث باسم التصنيف أو الرابط..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pr-9 w-full"
          />
        </div>
        <select value={parentFilter} onChange={e => { setParentFilter(e.target.value); setPage(1) }} className="input">
          <option value="">كل التصنيفات</option>
          <option value="root">التصنيفات الرئيسية فقط</option>
          {parentOptions.map(category => (
            <option key={category.id} value={category.id}>
              {'-'.repeat(category.level)} {category.name_ar}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">التصنيف</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الأب</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المحتوى</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الترتيب</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map(category => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">{category.name_ar}</p>
                          <p className="text-xs text-gray-400" dir="ltr">{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{category.parent?.name_ar ?? 'تصنيف رئيسي'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {(category.publications_count ?? 0)} إصدار / {(category.indicators_count ?? 0)} مؤشر / {(category.news_articles_count ?? 0)} خبر
                    </td>
                    <td className="px-4 py-3 text-gray-500">{category.display_order}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMutation.mutate(category.id)}
                        disabled={toggleMutation.isPending}
                        className={`flex items-center gap-1.5 text-sm font-medium ${(category.is_active ?? true) ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {(category.is_active ?? true) ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        {(category.is_active ?? true) ? 'مفعّل' : 'معطّل'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(category)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`حذف "${category.name_ar}"؟`)) deleteMutation.mutate(category.id) }}
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
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400">لا توجد تصنيفات</td></tr>
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
