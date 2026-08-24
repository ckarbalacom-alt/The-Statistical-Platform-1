import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Upload, X, ArrowRight } from 'lucide-react'
import { publicationsApi } from '../../api/publications'
import api from '../../lib/axios'
import Spinner from '../../components/ui/Spinner'
import RichTextEditor from '../../components/ui/RichTextEditor'
import type { Category } from '../../types'

const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

export default function AdminPublicationFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title_ar: '', title_en: '', description_ar: '', category_id: '',
    stat_year: String(new Date().getFullYear()), stat_quarter: '',
    release_date: new Date().toISOString().slice(0, 10), status: 'published', is_featured: false,
  })
  const [coverFile, setCoverFile]   = useState<File | null>(null)
  const [docFile, setDocFile]       = useState<File | null>(null)
  const [errors, setErrors]         = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ data: Category[] }>('/categories').then(r => r.data.data),
  })

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['admin-publication', id],
    queryFn: () => api.get(`/admin/publications/${id}`).then(r => r.data),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      const p = existing.data ?? existing
      setForm({
        title_ar: p.title_ar ?? '',
        title_en: p.title_en ?? '',
        description_ar: p.description_ar ?? '',
        category_id: String(p.category?.id ?? ''),
        stat_year: String(p.stat_year ?? ''),
        stat_quarter: String(p.stat_quarter ?? ''),
        release_date: p.release_date ?? '',
        status: p.status ?? 'draft',
        is_featured: p.is_featured ?? false,
      })
      if (p.cover_image_url) setCoverPreview(p.cover_image_url)
    }
  }, [existing])

  const mutation = useMutation({
    mutationFn: (fd: FormData) => isEdit ? publicationsApi.update(Number(id), fd) : publicationsApi.create(fd),
    onSuccess: () => navigate('/admin/publications'),
    onError: (err: unknown) => {
      const responseData = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data
      const errData = responseData?.errors
      if (errData) setErrors(errData)
      setGeneralError(responseData?.message ?? 'تعذر حفظ الإصدار. تحقق من الملف والحقول ثم حاول مرة أخرى.')
    },
  })

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) fd.append(k, String(v))
    })
    fd.set('is_featured', form.is_featured ? '1' : '0')
    if (coverFile) fd.append('cover_image', coverFile)
    if (docFile)   fd.append('file', docFile)
    if (isEdit)    fd.append('_method', 'PUT')
    mutation.mutate(fd)
  }

  if (isEdit && loadingExisting) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/publications')} className="text-gray-500 hover:text-primary">
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'تعديل إصدار' : 'إضافة إصدار جديد'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {generalError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {generalError}
          </div>
        )}

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 pb-2 border-b border-gray-100">المعلومات الأساسية</h2>

          <div>
            <label className="label">العنوان بالعربية *</label>
            <input type="text" value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} className="input" required />
            {errors.title_ar && <p className="text-red-500 text-xs mt-1">{errors.title_ar[0]}</p>}
          </div>
          <div>
            <label className="label">العنوان بالإنجليزية</label>
            <input type="text" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} className="input" dir="ltr" />
          </div>
          <div>
            <RichTextEditor
              label="الوصف"
              value={form.description_ar}
              onChange={value => setForm(f => ({ ...f, description_ar: value }))}
              minHeight="180px"
            />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 pb-2 border-b border-gray-100">التصنيف والتاريخ</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">التصنيف *</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input" required>
                <option value="">اختر تصنيفاً</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
            </div>
            <div>
              <label className="label">الحالة</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
            <div>
              <label className="label">سنة الإحصاء</label>
              <select value={form.stat_year} onChange={e => setForm(f => ({ ...f, stat_year: e.target.value }))} className="input">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">الربع (اختياري)</label>
              <select value={form.stat_quarter} onChange={e => setForm(f => ({ ...f, stat_quarter: e.target.value }))} className="input">
                <option value="">—</option>
                <option value="1">الربع الأول</option>
                <option value="2">الربع الثاني</option>
                <option value="3">الربع الثالث</option>
                <option value="4">الربع الرابع</option>
              </select>
            </div>
            <div>
              <label className="label">تاريخ الإصدار</label>
              <input type="date" value={form.release_date} onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} className="input" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                className="w-4 h-4 text-primary"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-700">إصدار مميز</label>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 pb-2 border-b border-gray-100">الملفات</h2>

          {/* Cover image */}
          <div>
            <label className="label">صورة الغلاف</label>
            <div className="flex items-start gap-4">
              {coverPreview && (
                <div className="relative">
                  <img src={coverPreview} alt="غلاف" className="w-20 h-24 object-cover rounded-lg border" />
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null) }} className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <button type="button" onClick={() => coverRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                {coverPreview ? 'تغيير الصورة' : 'رفع صورة الغلاف'}
              </button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </div>
            {errors.cover_image && <p className="text-red-500 text-xs mt-1">{errors.cover_image[0]}</p>}
          </div>

          {/* Document file */}
          <div>
            <label className="label">ملف الإصدار {!isEdit && '*'}</label>
            {docFile ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{docFile.name}</span>
                <button type="button" onClick={() => setDocFile(null)} className="text-red-500 hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                رفع ملف (PDF / Excel / CSV)
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              className="hidden"
              onChange={e => setDocFile(e.target.files?.[0] ?? null)}
              required={!isEdit}
            />
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file[0]}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2 px-6 py-2.5">
            {mutation.isPending && <Spinner size="sm" />}
            {mutation.isPending ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التغييرات' : 'إضافة الإصدار'}
          </button>
          <button type="button" onClick={() => navigate('/admin/publications')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
