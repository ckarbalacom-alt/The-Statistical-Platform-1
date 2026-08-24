import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Home, Mail, Menu, X } from 'lucide-react'
import { categoriesApi } from '../../api/categories'
import type { Category } from '../../types'
import CategoryIcon from '../ui/CategoryIcon'
import AppLogo from '../ui/AppLogo'

const quickLinks = [
  { to: '/', label: 'الرئيسية', icon: Home },
  { to: '/requests', label: 'طلب بيانات', icon: Mail },
]

const itemPath = (item: Category) => item.path ?? (item.slug === 'home' ? '/' : `/sections/${item.slug}`)

function DesktopMenuItem({ item }: { item: Category }) {
  const to = itemPath(item)

  return (
    <div className="relative group">
      <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          `px-3 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 ${
            isActive ? 'bg-white/25 shadow-sm' : 'hover:bg-white/15'
          }`
        }
      >
        <CategoryIcon slug={item.slug} icon={item.icon} size="sm" wrapperClassName="bg-white/20 text-white ring-white/20" />
        {item.name_ar}
        {item.children?.length ? <ChevronDown className="h-3.5 w-3.5" /> : null}
      </NavLink>

      {item.children?.length ? (
        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute right-0 top-full pt-2 z-50">
          <div className="w-80 max-h-[70vh] overflow-y-auto bg-white/95 text-gray-800 rounded-2xl shadow-xl shadow-primary-900/10 border border-white p-2 backdrop-blur">
            {item.children.map(child => (
              <div key={child.id}>
                <Link to={itemPath(child)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary-50 hover:text-primary">
                  <CategoryIcon slug={child.slug} icon={child.icon} size="sm" />
                  <span>{child.name_ar}</span>
                </Link>
                {child.children?.length ? (
                  <div className="mr-3 border-r border-gray-100 pr-2 pb-1">
                    {child.children.map(grandChild => (
                      <Link
                        key={grandChild.id}
                        to={itemPath(grandChild)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-primary-50 hover:text-primary"
                      >
                        <CategoryIcon slug={grandChild.slug} icon={grandChild.icon} size="sm" wrapperClassName="h-6 w-6 rounded-lg" className="h-3 w-3" />
                        {grandChild.name_ar}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: siteMap = [] } = useQuery({
    queryKey: ['site-map'],
    queryFn: categoriesApi.siteMap,
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ee]">
      <header className="bg-gradient-to-l from-primary-700 via-primary-600 to-primary text-white shadow-lg shadow-primary-900/10 sticky top-0 z-40">
        <div className="w-full max-w-7xl lg:max-w-fit mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <AppLogo size="md" className="rounded-2xl bg-white" />
            <div>
              <p className="font-bold text-sm leading-tight">المنصة الإحصائية</p>
              <p className="text-xs text-primary-100 leading-tight">مركز كربلاء للدراسات والبحوث</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {siteMap.map(item => <DesktopMenuItem key={item.id} item={item} />)}
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(open => !open)}
            className="lg:hidden inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-white/20"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            القائمة
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-white/10 bg-primary-800/95 px-4 py-3 shadow-xl backdrop-blur">
            <div className="mx-auto max-w-xl space-y-2">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-white/20' : 'hover:bg-white/10'
                    }`
                  }
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </NavLink>
              ))}

              <div className="h-px bg-white/10" />

              {siteMap.filter(item => item.slug !== 'home').map(item => (
                <div key={item.id} className="rounded-2xl bg-white/5 p-1">
                  <NavLink
                    to={itemPath(item)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive ? 'bg-white/20' : 'hover:bg-white/10'
                      }`
                    }
                  >
                    <CategoryIcon slug={item.slug} icon={item.icon} size="sm" wrapperClassName="h-9 w-9 bg-white/15 text-white ring-white/20" className="h-4 w-4" />
                    <span>{item.name_ar}</span>
                  </NavLink>

                  {item.children?.length ? (
                    <div className="mt-1 space-y-1 pr-4">
                      {item.children.map(child => (
                        <Link
                          key={child.id}
                          to={itemPath(child)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-primary-50 transition-colors hover:bg-white/10"
                        >
                          <CategoryIcon slug={child.slug} icon={child.icon} size="sm" wrapperClassName="h-7 w-7 bg-white/10 text-white ring-white/10" className="h-3.5 w-3.5" />
                          <span>{child.name_ar}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-l from-primary-800 via-primary-700 to-primary-600 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-3 text-accent">مركز كربلاء للدراسات والبحوث</h4>
              <p className="text-sm text-primary-100 leading-relaxed">
                مؤسسة متخصصة في جمع وتحليل ونشر البيانات الإحصائية لخدمة الباحثين والجهات المستفيدة.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">روابط رئيسية</h4>
              <ul className="space-y-2 text-sm text-primary-100">
                {siteMap.slice(0, 6).map(item => (
                  <li key={item.id}><Link to={itemPath(item)} className="hover:text-accent transition-colors">{item.name_ar}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">تواصل معنا</h4>
              <p className="text-sm text-primary-100">info@karbala-stats.iq</p>
              <p className="text-sm text-primary-100 mt-1">+964-32-000000</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-4 text-center text-xs text-primary-100">
            جميع الحقوق محفوظة © {new Date().getFullYear()} مركز كربلاء للدراسات والبحوث
          </div>
        </div>
      </footer>
    </div>
  )
}
