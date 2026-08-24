import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BarChart2, BookOpen, Download, FileText, Grid, Newspaper, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeApi } from '../../api/home'
import StatCard from '../../components/ui/StatCard'
import PublicationCard from '../../components/ui/PublicationCard'
import IndicatorCard from '../../components/ui/IndicatorCard'
import Spinner from '../../components/ui/Spinner'
import { categoriesApi } from '../../api/categories'
import CategoryIcon from '../../components/ui/CategoryIcon'

export default function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ['home-stats'], queryFn: homeApi.stats })
  const { data: siteMap = [] } = useQuery({ queryKey: ['site-map'], queryFn: categoriesApi.siteMap })
  const homeSections = siteMap.find(item => item.slug === 'home')?.children ?? []
  const metadataSections = siteMap.find(item => item.slug === 'metadata')?.children ?? []

  if (isLoading) return (
    <div className="flex items-center justify-center py-32"><Spinner size="lg" /></div>
  )

  return (
    <div>
      {/* Hero */}
      <section className="relative aspect-[1860/845] overflow-hidden bg-primary-900 md:flex md:aspect-auto md:min-h-[680px] md:items-center md:justify-center md:px-4 md:py-20 lg:min-h-[760px]">
        <img
          src="/hero-cover.png"
          alt="غلاف المنصة الإحصائية"
          className="absolute inset-0 z-0 block h-full w-full object-contain md:hidden"
        />
        <img
          src="/hero-cover.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 hidden h-full w-full object-cover object-center md:block"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/15 to-white/60 md:from-white/15 md:via-white/45 md:to-white/80" />
        <div className="absolute inset-0 bg-primary-900/0 md:bg-primary-900/10" />
        <div className="absolute left-3 top-1/2 z-10 w-[54vw] max-w-[230px] -translate-y-1/2 rounded-2xl bg-white/45 px-3 py-2 text-center shadow-sm backdrop-blur-[2px] min-[430px]:left-5 md:relative md:left-auto md:top-auto md:mx-auto md:w-auto md:max-w-5xl md:translate-y-0 md:rounded-3xl md:bg-transparent md:px-0 md:py-0 md:shadow-none md:backdrop-blur-0">
          <div className="mx-auto mb-1 inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/70 px-2 py-0.5 text-[8px] font-medium text-primary shadow-sm md:mb-5 md:gap-2 md:px-4 md:py-2 md:text-sm">
            <BarChart2 className="h-3 w-3 md:h-4 md:w-4" />
            منصة بيانات وإحصاءات رسمية
          </div>
          <h1 className="mb-0.5 text-[clamp(0.9rem,4.4vw,1.25rem)] font-bold leading-tight text-primary-900 drop-shadow-sm md:mb-4 md:text-5xl md:leading-tight">
            المنصة الإحصائية<br />
            <span className="text-primary/80 md:text-primary">مركز كربلاء للدراسات والبحوث</span>
          </h1>
          <p className="mx-auto max-w-[190px] text-[clamp(0.48rem,2.2vw,0.65rem)] leading-snug text-gray-700 max-[370px]:hidden md:block md:max-w-2xl md:text-lg md:leading-7">
            بياناتٌ موثوقة وإحصاءاتٌ دقيقة لمحافظة كربلاء المقدسة
          </p>
          <div className="mt-1.5 flex flex-nowrap justify-center gap-1 md:mt-10 md:flex-wrap md:gap-3">
            <Link to="/publications" className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-primary-900/60 bg-primary-900/10 px-2 py-1 text-[clamp(0.48rem,2.1vw,0.62rem)] font-semibold text-primary-900 shadow-sm shadow-primary-900/10 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 md:min-w-[190px] md:flex-none md:gap-2 md:rounded-2xl md:px-8 md:py-3 md:text-base">
              <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
              تصفح الإصدارات
            </Link>
            <Link to="/requests" className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-white/80 bg-white/75 px-2 py-1 text-[clamp(0.48rem,2.1vw,0.62rem)] font-semibold text-primary shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white md:min-w-[150px] md:flex-none md:gap-2 md:rounded-2xl md:px-6 md:py-3 md:text-base">
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              طلب بيانات
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-2 md:-mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="الإصدارات الإحصائية" value={data?.publications_count ?? 0} icon={BookOpen} />
          <StatCard title="المؤشرات الإحصائية" value={data?.indicators_count ?? 0}   icon={TrendingUp} />
          <StatCard title="التصنيفات"            value={data?.categories_count ?? 0}   icon={Grid} color="text-accent-600" />
          <StatCard title="إجمالي التحميلات"    value={data?.downloads_total ?? 0}    icon={Download} color="text-green-600" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className="card lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CategoryIcon slug="metadata" size="sm" />
                <h2 className="text-lg font-bold text-gray-900">البيانات الوصفية</h2>
              </div>
              <Link to="/sections/metadata" className="text-primary text-xs hover:underline">عرض الكل</Link>
            </div>
            <nav className="space-y-1">
              {metadataSections.map(section => (
                <Link
                  key={section.id}
                  to={section.path ?? `/sections/${section.slug}`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  <CategoryIcon slug={section.slug} icon={section.icon} size="sm" wrapperClassName="h-7 w-7 rounded-xl" className="h-3.5 w-3.5" />
                  <span>{section.name_ar}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">أقسام الصفحة الرئيسية</h2>
              <Link to="/sections/statistics-a-z" className="text-primary text-sm hover:underline">الإحصاءات أبجديا</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {homeSections.map(section => (
                <Link key={section.id} to={section.path ?? `/sections/${section.slug}`} className="card hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 transition-all group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <CategoryIcon slug={section.slug} icon={section.icon} />
                    <ArrowLeft className="h-4 w-4 text-gray-300 transition-colors group-hover:text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary">{section.name_ar}</h3>
                  <p className="text-sm text-gray-500">
                    {section.children?.length ? `${section.children.length} أقسام فرعية` : 'عرض القسم'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured publications */}
      {data?.featured_publications?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">أحدث الإصدارات</h2>
            </div>
            <Link to="/publications" className="text-primary text-sm hover:underline">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.featured_publications.map((pub: { id: number }) => (
              <PublicationCard key={pub.id} pub={pub as Parameters<typeof PublicationCard>[0]['pub']} />
            ))}
          </div>
        </section>
      )}

      {/* Featured indicators */}
      {data?.featured_indicators?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">المؤشرات الإحصائية</h2>
            </div>
            <Link to="/indicators" className="text-primary text-sm hover:underline">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.featured_indicators.map((ind: { id: number }) => (
              <IndicatorCard key={ind.id} indicator={ind as Parameters<typeof IndicatorCard>[0]['indicator']} />
            ))}
          </div>
        </section>
      )}

      {/* Latest news */}
      {data?.latest_news?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12 mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">آخر الأخبار</h2>
            </div>
            <Link to="/news" className="text-primary text-sm hover:underline">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.latest_news.map((article: { id: number; title_ar: string; published_at: string; thumbnail_url: string | null }) => (
              <Link key={article.id} to={`/news/${article.id}`} className="card hover:shadow-md transition-shadow">
                {article.thumbnail_url && (
                  <img src={article.thumbnail_url} alt={article.title_ar} className="w-full h-36 object-cover rounded-lg mb-3" />
                )}
                <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-primary transition-colors">
                  {article.title_ar}
                </h3>
                <p className="text-xs text-gray-400 mt-2">
                  {article.published_at ? new Date(article.published_at).toLocaleDateString('ar-IQ') : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
