import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, ChevronLeft, Eye, ListTree, Newspaper } from 'lucide-react'
import { newsApi } from '../../api/news'
import { categoriesApi } from '../../api/categories'
import Spinner from '../../components/ui/Spinner'
import CategoryIcon from '../../components/ui/CategoryIcon'
import { sanitizeHtml } from '../../lib/sanitizeHtml'

const typeMap: Record<string, string> = { news: 'خبر', event: 'فعالية', announcement: 'إعلان' }

export default function NewsArticlePage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['news-article', id],
    queryFn: () => newsApi.get(Number(id)),
    enabled: !!id,
  })

  const { data: siteMap = [] } = useQuery({
    queryKey: ['site-map'],
    queryFn: categoriesApi.siteMap,
  })

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!data) return null

  const article = data.data
  const metadataSection = siteMap.find(section => section.slug === 'metadata')
  const metadataCategories = metadataSection?.children ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        <article className="min-w-0">
          <header className="card mb-6 bg-gradient-to-l from-white via-primary-50 to-pastel-mint">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge bg-primary-50 text-primary">{typeMap[article.article_type]}</span>
              {article.category && (
                <Link to={article.category.path ?? `/sections/${article.category.slug}`} className="badge bg-white/80 text-gray-600 hover:text-primary">
                  {article.category.name_ar}
                </Link>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug mb-5">{article.title_ar}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.published_at).toLocaleDateString('ar-IQ')}
                </span>
              )}
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.views_count} مشاهدة</span>
              {article.author && <span>بقلم: {article.author.name_ar}</span>}
            </div>
          </header>

          {article.thumbnail_url && (
            <div className="mb-8 overflow-hidden rounded-3xl border border-white bg-primary-50 shadow-sm shadow-primary-100/60">
              <img
                src={article.thumbnail_url}
                alt={article.title_ar}
                className="w-full h-80 md:h-[430px] lg:h-[500px] object-cover"
              />
            </div>
          )}

          <section className="card">
            {article.body_ar ? (
              <div
                className="rich-content prose prose-lg max-w-none text-gray-700 leading-loose"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.body_ar) }}
              />
            ) : (
              <p className="text-gray-400 text-center py-10">لا يوجد محتوى تفصيلي لهذا الخبر.</p>
            )}
          </section>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-28">
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-white bg-gradient-to-l from-primary-700 to-primary text-white flex items-center gap-2">
              <ListTree className="h-4 w-4" />
              <h2 className="font-bold text-sm">البيانات الوصفية</h2>
            </div>
            <div className="p-2">
              {metadataCategories.length ? (
                metadataCategories.map(category => (
                  <Link
                    key={category.id}
                    to={category.path ?? `/sections/${category.slug}`}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CategoryIcon slug={category.slug} icon={category.icon} size="sm" wrapperClassName="h-7 w-7 rounded-xl" className="h-3.5 w-3.5" />
                      <span>{category.name_ar}</span>
                    </span>
                    <ChevronLeft className="h-4 w-4 text-gray-400" />
                  </Link>
                ))
              ) : (
                <p className="px-3 py-4 text-sm text-gray-400">لا توجد تصنيفات بيانات وصفية حالياً.</p>
              )}
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-white bg-primary-50 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-gray-900">مقالات ذات صلة</h2>
            </div>
            <div className="p-2">
              {data.related.length ? (
                data.related.map(relatedArticle => (
                  <Link
                    key={relatedArticle.id}
                    to={`/news/${relatedArticle.id}`}
                    className="block px-3 py-3 rounded-lg hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary text-sm leading-6">
                      {relatedArticle.title_ar}
                    </h3>
                    {relatedArticle.published_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(relatedArticle.published_at).toLocaleDateString('ar-IQ')}
                      </p>
                    )}
                  </Link>
                ))
              ) : (
                <p className="px-3 py-4 text-sm text-gray-400">لا توجد مقالات ذات صلة حالياً.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
