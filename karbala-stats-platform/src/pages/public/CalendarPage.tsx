import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar as CalendarIcon } from 'lucide-react'
import api from '../../lib/axios'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import type { CalendarEvent } from '../../types'

export default function CalendarPage() {
  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [year, setYear]   = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => api.get<CalendarEvent[]>('/calendar', { params: { year, month } }).then(r => r.data),
  })

  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">التقويم الإحصائي</h1>

      {/* Controls */}
      <div className="flex gap-3 mb-6 card">
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="input w-auto">
          {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input w-auto">
          {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data?.length ? (
        <div className="card text-center py-16 text-gray-400">
          <CalendarIcon className="h-12 w-12 mx-auto mb-3" />
          <p>لا توجد إصدارات مجدولة لهذا الشهر</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(event => (
            <div key={event.id} className="card flex items-start gap-4">
              <div className="bg-primary text-white rounded-lg px-3 py-2 text-center min-w-14 flex-shrink-0">
                <p className="text-lg font-bold">{new Date(event.release_date).getDate()}</p>
                <p className="text-xs">{months[new Date(event.release_date).getMonth()]}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={event.status} />
                  {event.indicator_category && <span className="badge bg-gray-100 text-gray-600 text-xs">{event.indicator_category}</span>}
                </div>
                <h3 className="font-semibold text-gray-900">{event.title_ar}</h3>
                {event.notes_ar && <p className="text-sm text-gray-500 mt-1">{event.notes_ar}</p>}
              </div>
              <span className="text-sm text-gray-400">{event.release_time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
