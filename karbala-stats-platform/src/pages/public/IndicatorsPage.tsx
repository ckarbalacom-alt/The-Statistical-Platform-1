import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, TrendingUp } from 'lucide-react'
import { indicatorsApi } from '../../api/indicators'
import { homeApi } from '../../api/home'
import IndicatorCard from '../../components/ui/IndicatorCard'
import Spinner from '../../components/ui/Spinner'
import type { Category, Indicator } from '../../types'

export default function IndicatorsPage() {
  const [categoryId, setCategoryId] = useState('')
  const [q, setQ] = useState('')

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: homeApi.categories })
  const { data: indicators, isLoading } = useQuery({
    queryKey: ['indicators', { categoryId }],
    queryFn: () => indicatorsApi.list({ category_id: categoryId || undefined }),
  })

  const filtered = q
    ? indicators?.filter((i: Indicator) => i.name_ar.includes(q) || i.name_en?.includes(q))
    : indicators

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="pastel-icon h-11 w-11 bg-pastel-mint text-emerald-700 ring-emerald-100">
          <TrendingUp className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المؤشرات الإحصائية</h1>
          <p className="text-sm text-gray-500">استعرض المؤشرات حسب التصنيف وابحث بالاسم.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="بحث في المؤشرات..." value={q} onChange={e => setQ(e.target.value)} className="input pr-9" />
        </div>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input w-auto">
          <option value="">كل التصنيفات</option>
          {cats?.data?.map((c: Category) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered?.map((ind: Indicator) => <IndicatorCard key={ind.id} indicator={ind} />)}
        </div>
      )}
    </div>
  )
}
