import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search } from 'lucide-react'
import { publicationsApi } from '../../api/publications'
import { homeApi } from '../../api/home'
import PublicationCard from '../../components/ui/PublicationCard'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import type { Category } from '../../types'

const FILE_TYPES = ['', 'pdf', 'xlsx', 'xls', 'csv']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i)

export default function PublicationsPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [year, setYear] = useState('')
  const [fileType, setFileType] = useState('')

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: homeApi.categories })

  const { data, isLoading } = useQuery({
    queryKey: ['publications', { page, q, categoryId, year, fileType }],
    queryFn: () => publicationsApi.list({ page, q: q || undefined, category_id: categoryId || undefined, year: year || undefined, type: fileType || undefined }),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="pastel-icon h-11 w-11 bg-pastel-lavender text-violet-700 ring-violet-100">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإصدارات الإحصائية</h1>
          <p className="text-sm text-gray-500">ابحث في الإصدارات والملفات حسب السنة والتصنيف.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في الإصدارات..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1) }}
              className="input pr-9"
            />
          </div>
          <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1) }} className="input w-auto">
            <option value="">كل التصنيفات</option>
            {cats?.data?.map((c: Category) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select>
          <select value={year} onChange={e => { setYear(e.target.value); setPage(1) }} className="input w-auto">
            <option value="">كل السنوات</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={fileType} onChange={e => { setFileType(e.target.value); setPage(1) }} className="input w-auto">
            <option value="">كل الأنواع</option>
            {FILE_TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {data?.total ?? 0} إصدار
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.data?.map(pub => <PublicationCard key={pub.id} pub={pub} />)}
          </div>
          {data && (
            <Pagination currentPage={data.current_page} lastPage={data.last_page} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}
