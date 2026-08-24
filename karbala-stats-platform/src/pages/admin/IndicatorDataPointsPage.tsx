import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { indicatorsApi } from '../../api/indicators'
import IndicatorLineChart from '../../components/charts/IndicatorLineChart'
import Spinner from '../../components/ui/Spinner'
import type { DataPoint } from '../../types'

const PERIOD_TYPES = [
  { value: 'yearly',    label: 'سنوي' },
  { value: 'quarterly', label: 'ربعي' },
  { value: 'monthly',   label: 'شهري' },
]

interface DPForm { period_label: string; period_type: string; period_sort: string; value: string; notes: string }
const emptyForm: DPForm = { period_label: '', period_type: 'yearly', period_sort: '', value: '', notes: '' }

export default function AdminIndicatorDataPointsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const qc = useQueryClient()
  const [form, setForm]   = useState<DPForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const { data: indicator, isLoading } = useQuery({
    queryKey: ['indicator', id],
    queryFn: () => indicatorsApi.get(Number(id)),
    enabled: !!id,
  })

  const { data: chartData, refetch: refetchChart } = useQuery({
    queryKey: ['indicator-chart', id, 'yearly'],
    queryFn: () => indicatorsApi.chartData(Number(id), 'yearly'),
    enabled: !!id,
  })

  const addMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => indicatorsApi.addDataPoint(Number(id), payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicator', id] })
      refetchChart()
      setForm(emptyForm)
      setErrors({})
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data?.errors
      if (errData) setErrors(errData)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (dpId: number) => indicatorsApi.removeDataPoint(Number(id), dpId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['indicator', id] }); refetchChart() },
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    addMutation.mutate({
      period_label: form.period_label,
      period_type:  form.period_type,
      period_sort:  form.period_sort ? Number(form.period_sort) : null,
      value:        Number(form.value),
      notes:        form.notes || null,
    })
  }

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!indicator) return null

  const dataPoints: (DataPoint & { id?: number })[] = (indicator as unknown as { data_points?: (DataPoint & { id?: number })[] }).data_points ?? []

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/indicators')} className="text-gray-500 hover:text-primary">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{indicator.name_ar}</h1>
          <p className="text-sm text-gray-500">إدارة نقاط البيانات</p>
        </div>
      </div>

      {/* Chart preview */}
      {chartData && chartData.labels.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">معاينة الرسم البياني</h2>
          <IndicatorLineChart labels={chartData.labels} values={chartData.values} unit={indicator.unit_ar ?? ''} />
        </div>
      )}

      {/* Add data point form */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">إضافة نقطة بيانات</h2>
        <form onSubmit={handleAdd}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="label">نوع الفترة</label>
              <select value={form.period_type} onChange={e => setForm(f => ({ ...f, period_type: e.target.value }))} className="input">
                {PERIOD_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">التسمية *</label>
              <input type="text" placeholder="مثال: 2023" value={form.period_label}
                onChange={e => setForm(f => ({ ...f, period_label: e.target.value }))} className="input" required />
              {errors.period_label && <p className="text-red-500 text-xs mt-1">{errors.period_label[0]}</p>}
            </div>
            <div>
              <label className="label">القيمة *</label>
              <input type="number" step="any" value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="input" required />
              {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value[0]}</p>}
            </div>
            <div>
              <label className="label">الترتيب</label>
              <input type="number" value={form.period_sort}
                onChange={e => setForm(f => ({ ...f, period_sort: e.target.value }))} className="input" />
            </div>
            <div className="sm:col-span-4">
              <label className="label">ملاحظات</label>
              <input type="text" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" />
            </div>
          </div>
          <button type="submit" disabled={addMutation.isPending} className="btn-primary flex items-center gap-2 px-5 py-2">
            {addMutation.isPending && <Spinner size="sm" />}
            <Plus className="h-4 w-4" /> إضافة
          </button>
        </form>
      </div>

      {/* Data table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600">الفترة</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">القيمة</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">ملاحظات</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {dataPoints.map((dp, i) => (
              <tr key={dp.id ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{dp.period_label}</td>
                <td className="px-4 py-3 text-gray-500">
                  {PERIOD_TYPES.find(p => p.value === dp.period_type)?.label ?? dp.period_type}
                </td>
                <td className="px-4 py-3">{dp.value.toLocaleString('ar-IQ')} {indicator.unit_ar}</td>
                <td className="px-4 py-3 text-gray-500">{dp.notes ?? '—'}</td>
                <td className="px-4 py-3">
                  {dp.id && (
                    <button
                      onClick={() => { if (confirm('حذف نقطة البيانات؟')) deleteMutation.mutate(dp.id!) }}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {dataPoints.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">لا توجد بيانات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
