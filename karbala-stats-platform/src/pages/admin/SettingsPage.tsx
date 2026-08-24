import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import api from '../../lib/axios'
import Spinner from '../../components/ui/Spinner'

interface Setting { key: string; value: string | null; type: string; group: string; label?: string }

const GROUP_LABELS: Record<string, string> = {
  general: 'الإعدادات العامة',
  contact: 'معلومات التواصل',
  social:  'روابط التواصل الاجتماعي',
  footer:  'التذييل',
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved]   = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get<{ data: Record<string, Setting[]> }>('/admin/settings').then(r => r.data.data),
  })

  useEffect(() => {
    if (!data) return
    const initial: Record<string, string> = {}
    Object.values(data).flat().forEach(s => { initial[s.key] = s.value ?? '' })
    setValues(initial)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      api.post('/admin/settings', { settings: payload }).then(r => r.data),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(values)
  }

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!data) return null

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(data).map(([group, settings]) => (
          <div key={group} className="card space-y-4">
            <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">
              {GROUP_LABELS[group] ?? group}
            </h2>
            {settings.map(setting => (
              <div key={setting.key}>
                <label className="label">
                  {setting.label ?? setting.key.replace(/_/g, ' ')}
                </label>
                {setting.type === 'boolean' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={setting.key}
                      checked={values[setting.key] === '1' || values[setting.key] === 'true'}
                      onChange={e => setValues(v => ({ ...v, [setting.key]: e.target.checked ? '1' : '0' }))}
                      className="w-4 h-4 text-primary"
                    />
                    <label htmlFor={setting.key} className="text-sm text-gray-700">تفعيل</label>
                  </div>
                ) : setting.type === 'text' ? (
                  <textarea
                    rows={3}
                    value={values[setting.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [setting.key]: e.target.value }))}
                    className="input resize-none"
                  />
                ) : (
                  <input
                    type={setting.type === 'url' || setting.type === 'email' ? setting.type : 'text'}
                    value={values[setting.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [setting.key]: e.target.value }))}
                    className="input"
                    dir={setting.type === 'url' || setting.type === 'email' ? 'ltr' : undefined}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2 px-6 py-2.5">
            {saveMutation.isPending ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
            {saveMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">تم الحفظ بنجاح ✓</span>}
        </div>
      </form>
    </div>
  )
}
