import { useState } from 'react'
import { CheckCircle, ClipboardList } from 'lucide-react'
import api from '../../lib/axios'
import Spinner from '../../components/ui/Spinner'

const REQUEST_TYPES = [
  { value: 'data',         label: 'طلب بيانات' },
  { value: 'report',       label: 'طلب تقرير' },
  { value: 'consultation', label: 'استشارة إحصائية' },
  { value: 'partnership',  label: 'شراكة بحثية' },
]

export default function RequestFormPage() {
  const [form, setForm] = useState({ requester_name: '', requester_email: '', requester_phone: '', requester_organization: '', request_type: 'data', description: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const res = await api.post<{ message: string; request_code: string }>('/statistical-requests', form)
      setSuccess(`${res.data.message} رقم الطلب: ${res.data.request_code}`)
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors
      if (errData) setErrors(errData)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبكم بنجاح</h2>
      <p className="text-gray-600">{success}</p>
    </div>
  )

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [name]: e.target.value })),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="pastel-icon h-11 w-11 bg-pastel-butter text-amber-700 ring-amber-100">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلب بيانات إحصائية</h1>
          <p className="text-gray-500">يمكنكم تقديم طلباتكم وسيتم الرد عليها في أقرب وقت ممكن.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">الاسم الكامل *</label>
            <input type="text" {...field('requester_name')} className="input" required />
            {errors.requester_name && <p className="text-red-500 text-xs mt-1">{errors.requester_name[0]}</p>}
          </div>
          <div>
            <label className="label">البريد الإلكتروني *</label>
            <input type="email" {...field('requester_email')} className="input" required />
            {errors.requester_email && <p className="text-red-500 text-xs mt-1">{errors.requester_email[0]}</p>}
          </div>
          <div>
            <label className="label">رقم الهاتف</label>
            <input type="tel" {...field('requester_phone')} className="input" />
          </div>
          <div>
            <label className="label">الجهة / المؤسسة</label>
            <input type="text" {...field('requester_organization')} className="input" />
          </div>
        </div>

        <div>
          <label className="label">نوع الطلب *</label>
          <select {...field('request_type')} className="input" required>
            {REQUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label">تفاصيل الطلب * (30 حرف على الأقل)</label>
          <textarea {...field('description')} rows={5} className="input resize-none" required minLength={30} />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
          <p className="text-xs text-gray-400 mt-1">{form.description.length} / 5000</p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
          {loading && <Spinner size="sm" />}
          {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
        </button>
      </form>
    </div>
  )
}
