import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChevronLeft,
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'
import AppLogo from '../ui/AppLogo'

const mainLinks = [
  { to: '/admin/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { to: '/admin/news', label: 'الأخبار', icon: Newspaper },
  { to: '/admin/publications', label: 'الإصدارات', icon: BookOpen },
  { to: '/admin/indicators', label: 'المؤشرات', icon: TrendingUp },
]

const manageLinks = [
  { to: '/admin/categories', label: 'التصنيفات', icon: FolderTree },
  { to: '/admin/requests', label: 'طلبات البيانات', icon: ClipboardList },
  { to: '/admin/users', label: 'المستخدمون', icon: Users },
  { to: '/admin/settings', label: 'الإعدادات', icon: Settings },
  { to: '/admin/reports', label: 'التقارير', icon: FileText },
]

function SidebarLink({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-white/95 text-primary shadow-sm shadow-primary-900/10' : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </NavLink>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.warn('Logout request failed; clearing local session anyway.', error)
    }
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-[#f7f4ee]">
      <aside className="w-64 bg-gradient-to-b from-primary-800 via-primary-700 to-primary-600 text-white flex flex-col fixed h-full z-30 shadow-xl shadow-primary-900/10">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <AppLogo size="md" className="rounded-2xl bg-white" />
            <div>
              <p className="font-bold text-sm leading-tight">المنصة الإحصائية</p>
              <p className="text-xs text-white/60">لوحة تحكم المحتوى</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-white/45">النشر السريع</p>
          <div className="space-y-1 mb-5">
            {mainLinks.map(link => <SidebarLink key={link.to} {...link} />)}
          </div>

          <p className="px-3 mb-2 text-xs font-semibold text-white/45">الإدارة</p>
          <div className="space-y-1">
            {manageLinks.map(link => <SidebarLink key={link.to} {...link} />)}
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{user?.name_ar}</p>
          <p className="text-xs text-white/50 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 mr-64 min-h-screen">
        <div className="bg-white/85 backdrop-blur border-b border-white px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shadow-primary-100/50">
          <NavLink to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
            <ChevronLeft className="h-4 w-4" />
            العودة للموقع
          </NavLink>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user?.name_ar}</span>
            <span className="badge bg-primary/10 text-primary">{user?.role}</span>
          </div>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
