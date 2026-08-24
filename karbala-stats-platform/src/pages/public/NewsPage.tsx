import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Filter, Newspaper, Tag } from 'lucide-react'
import { newsApi } from '../../api/news'
import { categoriesApi } from '../../api/categories'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import type { NewsArticle } from '../../types'

const typeMap: Record<string, string> = { news: 'خبر', event: 'فعالية', announcement: 'إعلان' }

export default function NewsPage() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') ?? '')

  const { data, isLoading } = useQuery({
    queryKey: ['news', { page, type, categoryId }],
    queryFn: () => newsApi.list({ page, type: type || undefined, category_id: categoryId || undefined }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['site-map'],
    queryFn: categoriesApi.siteMap,
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="pastel-icon h-11 w-11 bg-pastel-blue text-primary ring-primary-100">
          <Newspaper className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأخبار والفعاليات</h1>
          <p className="text-sm text-gray-500">تابع آخر المنشورات حسب النوع والتصنيف.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'news', 'event', 'announcement'].map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setPage(1) }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === t ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'border border-primary-100 bg-white/70 hover:bg-primary-50'}`}
          >
            {t === '' ? <Filter className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />}
            {t === '' ? 'الكل' : typeMap[t]}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1) }} className="input w-full sm:w-72">
          <option value="">كل التصنيفات</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name_ar}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data?.map((article: NewsArticle) => (
              <Link key={article.id} to={`/news/${article.id}`} className="card flex gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
                {article.thumbnail_url && (
                  <img src={article.thumbnail_url} alt={article.title_ar} className="w-28 h-20 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="badge bg-primary-50 text-primary text-xs">{typeMap[article.article_type]}</span>
                    {article.category && <span className="badge bg-pastel-mint text-emerald-700 text-xs">{article.category.name_ar}</span>}
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {article.published_at ? new Date(article.published_at).toLocaleDateString('ar-IQ') : ''}
                    </span>
                  </div>
                  <h2 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors">{article.title_ar}</h2>
                </div>
              </Link>
            ))}
            {!data?.data?.length && (
              <div className="card text-center text-gray-400 py-12">لا توجد أخبار منشورة ضمن هذا الاختيار.</div>
            )}
          </div>
          {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}
