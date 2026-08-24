import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Eye, Newspaper, Save, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoriesApi } from '../../api/categories'
import { newsApi } from '../../api/news'
import Spinner from '../../components/ui/Spinner'
import RichTextEditor from '../../components/ui/RichTextEditor'
import type { Category } from '../../types'

const typeMap: Record<string, string> = { news: 'خبر', event: 'فعالية', announcement: 'إعلان' }

const flattenCategories = (items: Category[], level = 0): Array<Category & { level: number }> =>
  items.flatMap(item => [{ ...item, level }, ...flattenCategories(item.children ?? [], level + 1)])

const emptyForm = {
  title_ar: '',
  title_en: '',
  summary_ar: '',
  body_ar: '',
  status: 'draft',
  is_featured: false,
  published_at: '',
}

export default function AdminCategoryPublishingPage() {
  const qc = useQueryClient()
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [saved, setSaved] = useState(false)

  const { data: tree = [], isLoading: loadingTree } = useQuery({
    queryKey: ['admin-categories-tree'],
    queryFn: categoriesApi.adminTree,
  })

  const categories = useMemo(() => flattenCategories(tree), [tree])
  const filteredCategories = categories.filter(category =>
    category.name_ar.includes(search) || category.slug.includes(search.toLowerCase()),
  )
  const selectedCategory = categories.find(category => String(category.id) === categoryId)

  useEffect(() => {
    if (!categoryId && categories.length) setCategoryId(String(categories[0].id))
  }, [categories, categoryId])

  const { data: existing, isFetching: loadingPage } = useQuery({
    queryKey: ['category-page', categoryId],
    queryFn: () => categoriesApi.pageByCategory(Number(categoryId)),
    enabled: !!categoryId,
  })

  const { data: categoryNews, isFetching: loadingNews } = useQuery({
    queryKey: ['admin-category-news', categoryId],
    queryFn: () => newsApi.adminList({ category_id: Number(categoryId), per_page: 50 }),
    enabled: !!categoryId,
  })

  useEffect(() => {
    setErrors({})
    setSaved(false)

    if (existing) {
      setForm({
        title_ar: existing.title_ar ?? '',
        title_en: existing.title_en ?? '',
        summary_ar: existing.summary_ar ?? '',
        body_ar: existing.body_ar ?? '',
        status: existing.status ?? 'draft',
        is_featured: existing.is_featured ?? false,
        published_at: existing.published_at ? existing.published_at.slice(0, 16).replace(' ', 'T') : '',
      })
    } else if (selectedCategory) {
      setForm({ ...emptyForm, title_ar: selectedCategory.name_ar })
    } else {
      setForm(emptyForm)
    }
  }, [existing, selectedCategory])

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => categoriesApi.savePage(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['category-page', categoryId] })
      qc.invalidateQueries({ queryKey: ['site-map'] })
      qc.invalidateQueries({ queryKey: ['section'] })
      setSaved(true)
      setErrors({})
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors
      setErrors(errData ?? {})
      setSaved(false)
    },
  })

  const deleteNewsMutation = useMutation({
    mutationFn: (id: number) => newsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-category-news', categoryId] })
      qc.invalidateQueries({ queryKey: ['admin-news'] })
      qc.invalidateQueries({ queryKey: ['news'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    saveMutation.mutate({
      ...form,
      category_id: Number(categoryId),
      is_featured: form.is_featured ? 1 : 0,
      published_at: form.published_at || null,
    })
  }

  const f = (key: keyof typeof emptyForm) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  if (loadingTree) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نشر صفحات التصنيفات</h1>
          <p className="text-sm text-gray-500 mt-1">اختر التصنيف، اكتب المحتوى، ثم احفظ. التغيير يظهر مباشرة عند النشر.</p>
        </div>
        {selectedCategory && (
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/news?category_id=${selectedCategory.id}&create=1`} className="btn-primary flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              إضافة خبر لهذا التصنيف
            </Link>
            <Link to={selectedCategory.path ?? `/sections/${selectedCategory.slug}`} className="btn-outline flex items-center gap-2" target="_blank">
              <Eye className="h-4 w-4" />
              معاينة
            </Link>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-4 py-3">
        هذه الصفحة مخصصة لمحتوى صفحة التصنيف نفسها فقط. لنشر أخبار متعددة داخل أي تصنيف استخدم زر “إضافة خبر لهذا التصنيف” أو صفحة “الأخبار”.
      </div>

      {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">تم الحفظ بنجاح.</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5 items-start">
        <aside className="card p-0 overflow-hidden xl:sticky xl:top-24">
          <div className="p-4 border-b border-gray-100">
            <label className="label">التصنيف</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث سريع..."
                className="input pr-9"
              />
            </div>
          </div>
          <div className="max-h-[65vh] overflow-y-auto p-2">
            {filteredCategories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(String(category.id))}
                className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                  String(category.id) === categoryId ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-gray-400">{'-'.repeat(category.level)}</span> {category.name_ar}
              </button>
            ))}
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {loadingPage ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">تعمل الآن على</p>
                  <h2 className="font-bold text-gray-900">{selectedCategory?.name_ar}</h2>
                </div>
                <select {...f('status')} className="input w-36">
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">عنوان الصفحة بالعربية *</label>
                  <input type="text" {...f('title_ar')} className="input" required />
                  {errors.title_ar && <p className="text-red-500 text-xs mt-1">{errors.title_ar[0]}</p>}
                </div>
                <div>
                  <label className="label">عنوان الصفحة بالإنجليزية</label>
                  <input type="text" {...f('title_en')} className="input" dir="ltr" />
                </div>
                <div>
                  <label className="label">تاريخ النشر</label>
                  <input type="datetime-local" {...f('published_at')} className="input" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="category_page_featured"
                    checked={form.is_featured}
                    onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-primary"
                  />
                  <label htmlFor="category_page_featured" className="text-sm text-gray-700">محتوى مميز</label>
                </div>
                <div className="md:col-span-2">
                  <label className="label">ملخص الصفحة</label>
                  <textarea {...f('summary_ar')} rows={3} className="input resize-none" />
                </div>
                <div className="md:col-span-2">
                  <RichTextEditor
                    label="محتوى الصفحة التفصيلي"
                    value={form.body_ar}
                    onChange={value => setForm(prev => ({ ...prev, body_ar: value }))}
                    minHeight="380px"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                  {saveMutation.isPending ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
                  حفظ
                </button>
                <span className="text-xs text-gray-400">اختر “منشور” حتى يظهر المحتوى للزوار.</span>
              </div>
            </>
          )}
        </form>
      </div>

      <section className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-gray-900">منشورات هذا التصنيف</h2>
            <p className="text-sm text-gray-500 mt-1">
              هذه الأخبار تظهر داخل صفحة التصنيف للزوار عند نشرها.
            </p>
          </div>
          {selectedCategory && (
            <Link to={`/admin/news?category_id=${selectedCategory.id}&create=1`} className="btn-primary flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              إضافة منشور
            </Link>
          )}
        </div>

        {loadingNews ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">العنوان</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">تاريخ النشر</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المشاهدات</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {categoryNews?.data.map(article => {
                  const isPublished = article.published_at ? new Date(article.published_at).getTime() <= Date.now() : false
                  return (
                    <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{article.title_ar}</p>
                        {article.is_featured && <span className="badge bg-accent/10 text-accent text-xs">مميز</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-primary/10 text-primary text-xs">{typeMap[article.article_type]}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString('ar-IQ') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {isPublished ? 'منشور' : 'غير ظاهر'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{article.views_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            to={`/admin/news?category_id=${categoryId}&edit=${article.id}`}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary"
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => { if (confirm(`حذف "${article.title_ar}"؟`)) deleteNewsMutation.mutate(article.id) }}
                            disabled={deleteNewsMutation.isPending}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!categoryNews?.data.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      لا توجد منشورات لهذا التصنيف بعد. اضغط “إضافة منشور” لنشر أول خبر.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
