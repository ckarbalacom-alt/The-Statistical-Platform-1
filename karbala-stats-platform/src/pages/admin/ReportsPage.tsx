import { useQuery } from '@tanstack/react-query'
import { Download, BookOpen, TrendingUp, ClipboardList, FileText, FileSpreadsheet } from 'lucide-react'
import api from '../../lib/axios'
import Spinner from '../../components/ui/Spinner'
import StatCard from '../../components/ui/StatCard'

interface ReportSummary {
  publications_total: number
  publications_this_year: number
  indicators_total: number
  requests_total: number
  requests_completed: number
  requests_pending: number
  downloads_total: number
  top_categories: Array<{ name_ar: string; publications_count: number }>
}

const EXPORT_TYPES = [
  { type: 'publications', formats: ['pdf', 'excel'], label: 'الإصدارات' },
  { type: 'requests',     formats: ['pdf', 'excel'], label: 'الطلبات الإحصائية' },
]

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.get<ReportSummary>('/admin/reports').then(r => r.data),
  })

  const handleExport = (type: string, format: string) => {
    window.open(`${api.defaults.baseURL}/admin/reports/export/${type}?format=${format}`, '_blank')
  }

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي الإصدارات"   value={data.publications_total}    icon={BookOpen}       color="text-primary" />
        <StatCard title="إصدارات هذا العام"   value={data.publications_this_year} icon={BookOpen}       color="text-accent" />
        <StatCard title="المؤشرات"             value={data.indicators_total}       icon={TrendingUp}     color="text-primary" />
        <StatCard title="إجمالي الطلبات"      value={data.requests_total}         icon={ClipboardList}  color="text-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests breakdown */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">حالة الطلبات</h2>
          <div className="space-y-3">
            {[
              { label: 'مكتملة',       value: data.requests_completed, color: 'bg-green-500' },
              { label: 'قيد الانتظار', value: data.requests_pending,   color: 'bg-yellow-500' },
              { label: 'الإجمالي',     value: data.requests_total,     color: 'bg-primary' },
            ].map(({ label, value, color }) => {
              const pct = data.requests_total > 0 ? Math.round((value / data.requests_total) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top categories */}
        {data.top_categories?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">أكثر التصنيفات إصدارات</h2>
            <div className="space-y-2">
              {data.top_categories.map((cat, i) => (
                <div key={cat.name_ar} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-gray-700">{cat.name_ar}</span>
                  </div>
                  <span className="font-medium text-gray-900">{cat.publications_count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export section */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">تصدير البيانات</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXPORT_TYPES.map(({ type, formats, label }) => (
            <div key={type} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-gray-800">{label}</h3>
              <div className="flex gap-2">
                {formats.includes('pdf') && (
                  <button
                    onClick={() => handleExport(type, 'pdf')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                    <Download className="h-3 w-3" />
                  </button>
                )}
                {formats.includes('excel') && (
                  <button
                    onClick={() => handleExport(type, 'excel')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                    <Download className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
