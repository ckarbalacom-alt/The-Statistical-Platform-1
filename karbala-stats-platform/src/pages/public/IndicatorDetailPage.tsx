import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { indicatorsApi } from '../../api/indicators'
import IndicatorLineChart from '../../components/charts/IndicatorLineChart'
import Spinner from '../../components/ui/Spinner'

const PERIOD_TYPES = [
  { value: 'yearly', label: 'سنوي' },
  { value: 'quarterly', label: 'ربعي' },
  { value: 'monthly', label: 'شهري' },
]

export default function IndicatorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [periodType, setPeriodType] = useState('yearly')

  const { data: indicator, isLoading } = useQuery({
    queryKey: ['indicator', id],
    queryFn: () => indicatorsApi.get(Number(id)),
    enabled: !!id,
  })

  const { data: chartData } = useQuery({
    queryKey: ['indicator-chart', id, periodType],
    queryFn: () => indicatorsApi.chartData(Number(id), periodType),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!indicator) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{indicator.category?.name_ar}</p>
            <h1 className="text-2xl font-bold text-gray-900">{indicator.name_ar}</h1>
            {indicator.source && <p className="text-sm text-gray-500 mt-1">المصدر: {indicator.source}</p>}
          </div>
          <div className="text-left">
            <p className="text-4xl font-bold text-primary">
              {indicator.latest_value?.toLocaleString('ar-IQ')}
            </p>
            <p className="text-sm text-gray-500">{indicator.unit_ar} — {indicator.latest_period}</p>
          </div>
        </div>

        {indicator.methodology_ar && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">المنهجية</p>
            <div
              className="rich-content text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: indicator.methodology_ar }}
            />
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">الرسم البياني</h2>
          <div className="flex gap-2">
            {PERIOD_TYPES.map(pt => (
              <button
                key={pt.value}
                onClick={() => setPeriodType(pt.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  periodType === pt.value ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>
        {chartData && chartData.labels.length > 0 ? (
          <IndicatorLineChart labels={chartData.labels} values={chartData.values} unit={indicator.unit_ar ?? ''} />
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">لا توجد بيانات لهذه الفترة</div>
        )}
      </div>

      {/* Data table */}
      {indicator.data_points && indicator.data_points.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <h2 className="font-bold text-gray-900 mb-4">جدول البيانات</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-right pb-2 font-medium text-gray-600">الفترة</th>
              <th className="text-right pb-2 font-medium text-gray-600">القيمة</th>
              <th className="text-right pb-2 font-medium text-gray-600">الوحدة</th>
            </tr></thead>
            <tbody>
              {indicator.data_points.map(dp => (
                <tr key={dp.period_label} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2">{dp.period_label}</td>
                  <td className="py-2 font-medium">{dp.value.toLocaleString('ar-IQ')}</td>
                  <td className="py-2 text-gray-500">{indicator.unit_ar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
