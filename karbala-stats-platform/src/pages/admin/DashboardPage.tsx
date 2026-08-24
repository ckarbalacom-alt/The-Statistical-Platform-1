import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  ClipboardList,
  Download,
  FolderTree,
  Newspaper,
  TrendingUp,
} from 'lucide-react'
import api from '../../lib/axios'
import Spinner from '../../components/ui/Spinner'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'

interface DashboardData {
  publications_count: number
  indicators_count: number
  requests_count: number
  downloads_this_month: number
  recent_requests: Array<{ id: number; request_code: string; requester_name: string; request_type: string; status: string; created_at: string }>
}

const quickActions = [
  { to: '/admin/news', title: 'إضافة خبر', desc: 'انشر خبر أو نشاط أو إعلان لأي تصنيف', icon: Newspaper, color: 'bg-pastel-blue text-primary-700' },
  { to: '/admin/publications/create', title: 'إضافة إصدار', desc: 'رفع تقرير أو ملف إحصائي', icon: BookOpen, color: 'bg-pastel-butter text-amber-700' },
  { to: '/admin/categories', title: 'تنظيم التصنيفات', desc: 'إضافة وترتيب أقسام الموقع', icon: FolderTree, color: 'bg-pastel-lavender text-violet-700' },
  { to: '/admin/indicators', title: 'إدارة المؤشرات', desc: 'تحديث المؤشرات والقيم الإحصائية', icon: TrendingUp, color: 'bg-pastel-mint text-emerald-700' },
]

const typeLabel: Record<string, string> = {
  data: 'بيانات',
  report: 'تقرير',
  consultation: 'استشارة',
  partnership: 'شراكة',
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get<DashboardData>('/admin/dashboard').then(r => r.data),
    refetchInterval: 60_000,
  })

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="pastel-panel p-6 flex items-start justify-between gap-4 bg-gradient-to-l from-white via-primary-50 to-pastel-mint">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مرحباً، ماذا تريد أن تنشر اليوم؟</h1>
          <p className="text-sm text-gray-500 mt-1">الأخبار والمنشورات أصبحت في صفحة الأخبار، مع اختيار التصنيف من نفس النموذج.</p>
        </div>
        <Link to="/admin/news" className="btn-primary flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          إضافة خبر
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickActions.map(({ to, title, desc, icon: Icon, color }) => (
          <Link key={to} to={to} className="card hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 transition-all group">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-gray-900 group-hover:text-primary">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="الإصدارات" value={data.publications_count} icon={BookOpen} color="text-primary" />
        <StatCard title="المؤشرات" value={data.indicators_count} icon={TrendingUp} color="text-accent" />
        <StatCard title="طلبات البيانات" value={data.requests_count} icon={ClipboardList} color="text-primary" />
        <StatCard title="تحميلات الشهر" value={data.downloads_this_month} icon={Download} color="text-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">أحدث طلبات البيانات</h2>
            <Link to="/admin/requests" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          {data.recent_requests.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">لا توجد طلبات حالياً</p>
          ) : (
            <div className="space-y-2">
              {data.recent_requests.map(req => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.requester_name}</p>
                    <p className="text-xs text-gray-500">{typeLabel[req.request_type]} - {req.request_code}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">اختصارات مفيدة</h2>
          <div className="space-y-2">
            <Link to="/admin/news" className="flex items-center gap-2 p-3 rounded-xl hover:bg-primary-50 text-sm">
              <Newspaper className="h-4 w-4 text-primary" />
              إدارة الأخبار والمنشورات
            </Link>
            <Link to="/admin/categories" className="flex items-center gap-2 p-3 rounded-xl hover:bg-primary-50 text-sm">
              <FolderTree className="h-4 w-4 text-primary" />
              ترتيب أقسام الموقع
            </Link>
            <Link to="/" className="flex items-center gap-2 p-3 rounded-xl hover:bg-primary-50 text-sm">
              <Newspaper className="h-4 w-4 text-primary" />
              معاينة الموقع
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
