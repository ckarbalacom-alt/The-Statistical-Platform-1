import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../../lib/axios'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import type { StatisticalRequest, PaginatedResponse } from '../../types'

const typeLabel: Record<string, string> = {
  data: 'طلب بيانات', report: 'طلب تقرير', consultation: 'استشارة إحصائية', partnership: 'شراكة بحثية',
}

const STATUS_FLOW: Record<string, { next: string; label: string; icon: React.ElementType; color: string }[]> = {
  pending:    [{ next: 'processing', label: 'بدء المعالجة', icon: Clock,        color: 'bg-blue-600 hover:bg-blue-700' }],
  processing: [
    { next: 'completed', label: 'إتمام الطلب',  icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
    { next: 'rejected',  label: 'رفض الطلب',   icon: XCircle,     color: 'bg-red-600 hover:bg-red-700' },
  ],
}

export default function AdminRequestsPage() {
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [notes, setNotes]       = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', { page, search, status }],
    queryFn: () => api.get<PaginatedResponse<StatisticalRequest>>('/admin/statistical-requests', {
      params: { page, search: search || undefined, status: status || undefined },
    }).then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus, adminNotes }: { id: number; newStatus: string; adminNotes: string }) =>
      api.patch(`/admin/statistical-requests/${id}/status`, { status: newStatus, admin_notes: adminNotes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-requests'] }); setExpanded(null); setNotes('') },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">الطلبات الإحصائية</h1>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="بحث باسم أو بريد أو رمز الطلب..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} className="input pr-9 w-full" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input w-auto">
          <option value="">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="processing">قيد المعالجة</option>
          <option value="completed">مكتملة</option>
          <option value="rejected">مرفوضة</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="space-y-2">
            {data?.data.map(req => (
              <div key={req.id} className="card p-0 overflow-hidden">
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                >
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{req.requester_name}</p>
                      <p className="text-xs text-gray-400">{req.request_code}</p>
                    </div>
                    <p className="text-gray-600">{typeLabel[req.request_type]}</p>
                    <p className="text-gray-400 text-xs">{new Date(req.created_at).toLocaleDateString('ar-IQ')}</p>
                    <StatusBadge status={req.status} />
                  </div>
                  {expanded === req.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>

                {/* Expanded detail */}
                {expanded === req.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
                        <p className="text-gray-800">{req.requester_email}</p>
                      </div>
                      {req.requester_phone && (
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">الهاتف</p>
                          <p className="text-gray-800">{req.requester_phone}</p>
                        </div>
                      )}
                      {req.requester_organization && (
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">الجهة</p>
                          <p className="text-gray-800">{req.requester_organization}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">تفاصيل الطلب</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{req.description}</p>
                    </div>
                    {req.admin_notes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">ملاحظات المسؤول</p>
                        <div className="rich-content text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: req.admin_notes }} />
                      </div>
                    )}

                    {/* Status actions */}
                    {STATUS_FLOW[req.status] && (
                      <div className="pt-2 space-y-2">
                        <div>
                          <label className="label">������ (�������)</label>
                          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                            className="input resize-none" placeholder="������ �������..." />
                        </div>
                        <div className="flex gap-2">
                          {STATUS_FLOW[req.status].map(({ next, label, icon: Icon, color }) => (
                            <button
                              key={next}
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: req.id, newStatus: next, adminNotes: notes })}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${color}`}
                            >
                              {statusMutation.isPending ? <Spinner size="sm" /> : <Icon className="h-4 w-4" />}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {!data?.data.length && (
              <div className="card text-center py-16 text-gray-400">لا توجد طلبات</div>
            )}
          </div>
          {data && <Pagination currentPage={data.current_page} lastPage={data.last_page} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}
