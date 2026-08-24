import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Download, Eye } from 'lucide-react'
import { publicationsApi } from '../../api/publications'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import type { Publication } from '../../types'

export default function AdminPublicationsPage() {
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-publications', { page, search, status }],
    queryFn: () => publicationsApi.adminList({ page, search: search || undefined, status: status || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publicationsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-publications'] }),
  })

  const handleDelete = (pub: Publication) => {
    if (confirm(`هل تريد حذف "${pub.title_ar}"؟`)) deleteMutation.mutate(pub.id)
  }

  const fileTypeBadge = (type: string | null) => {
    const colors: Record<string, string> = { pdf: 'bg-red-100 text-red-700', xlsx: 'bg-green-100 text-green-700', xls: 'bg-green-100 text-green-700', csv: 'bg-blue-100 text-blue-700' }
    return type ? <span className={`badge text-xs ${colors[type] ?? 'bg-gray-100 text-gray-600'}`}>{type.toUpperCase()}</span> : null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">الإصدارات</h1>
        <Link to="/admin/publications/create" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> إضافة إصدار
        </Link>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pr-9 w-full"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input w-auto">
          <option value="">كل الحالات</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
          <option value="archived">مؤرشف</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">العنوان</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">التصنيف</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">السنة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    <Eye className="h-4 w-4 inline" />
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    <Download className="h-4 w-4 inline" />
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map(pub => (
                  <tr key={pub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {pub.cover_image_url && (
                          <img src={pub.cover_image_url} alt="" className="w-10 h-12 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{pub.title_ar}</p>
                          <p className="text-xs text-gray-400">{pub.file_size_formatted}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pub.category?.name_ar ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{pub.stat_year ?? '—'}</td>
                    <td className="px-4 py-3">{fileTypeBadge(pub.file_type)}</td>
                    <td className="px-4 py-3"><StatusBadge status={pub.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{pub.views_count}</td>
                    <td className="px-4 py-3 text-gray-500">{pub.downloads_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/admin/publications/${pub.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(pub)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.data.length && (
                  <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400">لا توجد نتائج</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}
