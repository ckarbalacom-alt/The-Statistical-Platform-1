import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Edit, Image as ImageIcon, Plus, Search, Trash2, X } from 'lucide-react'
import { newsApi } from '../../api/news'
import { categoriesApi } from '../../api/categories'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import RichTextEditor from '../../components/ui/RichTextEditor'
import type { Category, NewsArticle } from '../../types'

const typeMap: Record<string, string> = { news: 'خبر', event: 'فعالية', announcement: 'إعلان' }

const flattenCategories = (items: Category[], level = 0): Array<Category & { level: number }> =>
  items.flatMap(item => [{ ...item, level }, ...flattenCategories(item.children ?? [], level + 1)])

interface NewsForm {
  title_ar: string
  title_en: string
  body_ar: string
  article_type: string
  category_id: string
  is_featured: boolean
  published_at: string
  tags: string
}

const emptyForm: NewsForm = {
  title_ar: '',
  title_en: '',
  body_ar: '',
  article_type: 'news',
  category_id: '',
  is_featured: false,
  published_at: '',
  tags: '',
}

function buildNewsFormData(form: NewsForm, thumbFile: File | null) {
  const fd = new FormData()
  fd.append('title_ar', form.title_ar)
  fd.append('title_en', form.title_en)
  fd.append('body_ar', form.body_ar)
  fd.append('article_type', form.article_type)
  fd.append('category_id', form.category_id)
  fd.append('is_featured', form.is_featured ? '1' : '0')
  fd.append('published_at', form.published_at)

  form.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
    .forEach(tag => fd.append('tags[]', tag))

  if (thumbFile) fd.append('thumbnail', thumbFile)
  return fd
}

export default function AdminNewsPage() {
  const [searchParams] = useSearchParams()
  const initialCategoryId = searchParams.get('category_id') ?? ''
  const initialCreate = searchParams.get('create') === '1'
  const initialEditId = Number(searchParams.get('edit') ?? 0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const [showForm, setShowForm] = useState(initialCreate)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<NewsForm>({ ...emptyForm, category_id: initialCategoryId })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news', { page, search, type, categoryId }],
    queryFn: () => newsApi.adminList({
      page,
      search: search || undefined,
      type: type || undefined,
      category_id: categoryId || undefined,
    }),
  })

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['admin-categories-tree'],
    queryFn: categoriesApi.adminTree,
  })

  const { data: editArticle } = useQuery({
    queryKey: ['admin-news-item', initialEditId],
    queryFn: () => newsApi.adminGet(initialEditId),
    enabled: initialEditId > 0,
  })

  const categories = useMemo(() => flattenCategories(categoryTree), [categoryTree])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setThumbFile(null)
    setCurrentThumbnailUrl(null)
    setErrors({})
  }

  const saveMutation = useMutation({
    mutationFn: (payload: FormData) => (
      editingId ? newsApi.update(editingId, payload) : newsApi.create(payload)
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-news'] })
      qc.invalidateQueries({ queryKey: ['news'] })
      qc.invalidateQueries({ queryKey: ['section-news'] })
      setShowForm(false)
      resetForm()
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors
      setErrors(errData ?? {})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => newsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-news'] })
      qc.invalidateQueries({ queryKey: ['news'] })
      qc.invalidateQueries({ queryKey: ['section-news'] })
    },
  })

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, category_id: categoryId })
    setThumbFile(null)
    setCurrentThumbnailUrl(null)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (article: NewsArticle) => {
    setForm({
      title_ar: article.title_ar,
      title_en: article.title_en ?? '',
      body_ar: article.body_ar ?? '',
      article_type: article.article_type,
      category_id: article.category_id ? String(article.category_id) : '',
      is_featured: article.is_featured,
      published_at: article.published_at ? article.published_at.slice(0, 16).replace(' ', 'T') : '',
      tags: (article.tags ?? []).join(', '),
    })
    setEditingId(article.id)
    setThumbFile(null)
    setCurrentThumbnailUrl(article.thumbnail_url)
    setShowForm(true)
    setErrors({})
  }

  useEffect(() => {
    if (editArticle && editingId !== editArticle.id) openEdit(editArticle)
  }, [editArticle, editingId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    saveMutation.mutate(buildNewsFormData(form, thumbFile))
  }

  const f = (key: keyof NewsForm) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأخبار والفعاليات</h1>
          <p className="text-sm text-gray-500 mt-1">انشر أي عدد من الأخبار واربط كل خبر بالتصنيف المناسب.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> إضافة خبر
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-primary/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">{editingId ? 'تعديل الخبر' : 'خبر جديد'}</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="label">العنوان بالعربية *</label>
                <input type="text" {...f('title_ar')} className="input" required />
                {errors.title_ar && <p className="text-red-500 text-xs mt-1">{errors.title_ar[0]}</p>}
              </div>

              <div>
                <label className="label">نوع المحتوى</label>
                <select {...f('article_type')} className="input">
                  <option value="news">خبر</option>
                  <option value="event">فعالية</option>
                  <option value="announcement">إعلان</option>
                </select>
              </div>

              <div>
                <label className="label">التصنيف</label>
                <select {...f('category_id')} className="input">
                  <option value="">بدون تصنيف</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {'-'.repeat(category.level)} {category.name_ar}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
              </div>

              <div>
                <label className="label">تاريخ النشر</label>
                <input type="datetime-local" {...f('published_at')} className="input" />
              </div>

              <div>
                <label className="label">العنوان بالإنجليزية</label>
                <input type="text" {...f('title_en')} className="input" dir="ltr" />
              </div>

              <div className="sm:col-span-2">
                <RichTextEditor
                  label="المحتوى"
                  value={form.body_ar}
                  onChange={value => setForm(prev => ({ ...prev, body_ar: value }))}
                  minHeight="260px"
                />
              </div>

              <div>
                <label className="label">الوسوم، مفصولة بفاصلة</label>
                <input type="text" {...f('tags')} className="input" placeholder="إحصاء، كربلاء، ..." />
              </div>

              <div>
                <label className="label">{editingId ? 'تغيير صورة الخبر' : 'صورة الخبر'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setThumbFile(e.target.files?.[0] ?? null)}
                  className="input"
                />
                {errors.thumbnail && <p className="text-red-500 text-xs mt-1">{errors.thumbnail[0]}</p>}
                {thumbFile && <p className="text-xs text-gray-500 mt-1">الصورة الجديدة: {thumbFile.name}</p>}
              </div>

              {currentThumbnailUrl && (
                <div className="sm:col-span-2 rounded-xl border border-gray-200 p-3 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    الصورة الحالية
                  </p>
                  <img src={currentThumbnailUrl} alt="الصورة الحالية" className="max-h-48 rounded-lg object-cover" />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="news_featured"
                  checked={form.is_featured}
                  onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="news_featured" className="text-sm text-gray-700">خبر مميز</label>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2">
                {saveMutation.isPending && <Spinner size="sm" />}
                {editingId ? 'حفظ' : 'نشر'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pr-9 w-full"
          />
        </div>
        <select value={type} onChange={e => { setType(e.target.value); setPage(1) }} className="input w-auto">
          <option value="">كل الأنواع</option>
          <option value="news">أخبار</option>
          <option value="event">فعاليات</option>
          <option value="announcement">إعلانات</option>
        </select>
        <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1) }} className="input w-auto">
          <option value="">كل التصنيفات</option>
          {categories.map(category => (
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
                  <th className="text-right px-4 py-3 font-medium text-gray-600">العنوان</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الصورة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">التصنيف</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">تاريخ النشر</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المشاهدات</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map(article => (
                  <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{article.title_ar}</p>
                      {article.is_featured && <span className="badge bg-accent/10 text-accent text-xs">مميز</span>}
                    </td>
                    <td className="px-4 py-3">
                      {article.thumbnail_url ? (
                        <img src={article.thumbnail_url} alt={article.title_ar} className="h-12 w-16 object-cover rounded-lg" />
                      ) : (
                        <span className="text-xs text-gray-400">بدون صورة</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{article.category?.name_ar ?? 'بدون تصنيف'}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-primary/10 text-primary text-xs">{typeMap[article.article_type]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString('ar-IQ') : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{article.views_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(article)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`حذف "${article.title_ar}"؟`)) deleteMutation.mutate(article.id) }}
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
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-400">لا توجد أخبار</td></tr>
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
