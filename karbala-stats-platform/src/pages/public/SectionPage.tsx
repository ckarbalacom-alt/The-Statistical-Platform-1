import { Link, Navigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, ChevronLeft, Newspaper } from 'lucide-react'
import { categoriesApi } from '../../api/categories'
import { newsApi } from '../../api/news'
import Spinner from '../../components/ui/Spinner'
import CategoryIcon from '../../components/ui/CategoryIcon'

export default function SectionPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['section', slug],
    queryFn: () => categoriesApi.section(slug as string),
    enabled: !!slug,
  })

  const categoryId = data?.category?.id
  const { data: sectionNews, isLoading: loadingNews } = useQuery({
    queryKey: ['section-news', categoryId],
    queryFn: () => newsApi.list({ category_id: categoryId, per_page: 12 }),
    enabled: !!categoryId,
  })

  if (!slug || isError) return <Navigate to="/" replace />
  if (isLoading || !data) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  const { category, page } = data

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">الرئيسية</Link>
        {category.parent && (
          <>
            <ChevronLeft className="h-4 w-4" />
            <Link to={category.parent.path ?? `/sections/${category.parent.slug}`} className="hover:text-primary">
              {category.parent.name_ar}
            </Link>
          </>
        )}
        <ChevronLeft className="h-4 w-4" />
        <span className="text-gray-900">{category.name_ar}</span>
      </nav>

      <section className="card bg-gradient-to-l from-primary-50 via-white to-pastel-mint border-primary/10 mb-8">
        <div className="flex items-start gap-4">
          <CategoryIcon slug={category.slug} icon={category.icon} size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{page?.title_ar ?? category.name_ar}</h1>
            {(page?.summary_ar || category.description_ar) && (
              <div
                className="rich-content text-gray-600 leading-7 max-w-3xl"
                dangerouslySetInnerHTML={{ __html: page?.summary_ar ?? category.description_ar ?? '' }}
              />
            )}
          </div>
        </div>
      </section>

      {page?.body_ar ? (
        <section className="card mb-8">
          <div
            className="rich-content prose prose-lg max-w-none leading-8 text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.body_ar }}
          />
        </section>
      ) : null}

      <section className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary-50 text-primary rounded-2xl p-2 ring-1 ring-primary-100">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">منشورات التصنيف</h2>
              <p className="text-sm text-gray-500">آخر الأخبار والفعاليات المنشورة ضمن هذا التصنيف.</p>
            </div>
          </div>
          <Link to={`/news?category_id=${category.id}`} className="text-primary text-sm hover:underline">
            عرض الكل
          </Link>
        </div>

        {loadingNews ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : sectionNews?.data.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionNews.data.map(article => (
              <Link key={article.id} to={`/news/${article.id}`} className="card hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 transition-all">
                {article.thumbnail_url && (
                  <img src={article.thumbnail_url} alt={article.title_ar} className="w-full h-36 object-cover rounded-lg mb-3" />
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  {article.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(article.published_at).toLocaleDateString('ar-IQ')}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors">{article.title_ar}</h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-10 text-gray-400">
            لا توجد منشورات منشورة لهذا التصنيف بعد.
          </div>
        )}
      </section>

      {category.children?.length ? (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">الأقسام الفرعية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.children.map(child => (
              <Link key={child.id} to={child.path ?? `/sections/${child.slug}`} className="card hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 transition-all group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon slug={child.slug} icon={child.icon} size="sm" />
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary">{child.name_ar}</h3>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                </div>
                {child.page?.summary_ar ? (
                  <div
                    className="rich-content text-sm text-gray-500 mt-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: child.page.summary_ar }}
                  />
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
