import clsx from 'clsx'

const map: Record<string, string> = {
  published:  'bg-green-100 text-green-800',
  draft:      'bg-yellow-100 text-yellow-800',
  archived:   'bg-gray-100 text-gray-700',
  pending:    'bg-blue-100 text-blue-800',
  processing: 'bg-orange-100 text-orange-800',
  completed:  'bg-green-100 text-green-800',
  rejected:   'bg-red-100 text-red-800',
  scheduled:  'bg-blue-100 text-blue-800',
  released:   'bg-green-100 text-green-800',
  delayed:    'bg-orange-100 text-orange-800',
  cancelled:  'bg-red-100 text-red-800',
  active:     'bg-green-100 text-green-800',
  inactive:   'bg-gray-100 text-gray-700',
}

const labels: Record<string, string> = {
  published: 'منشور', draft: 'مسودة', archived: 'مؤرشف',
  pending: 'قيد الانتظار', processing: 'جارٍ المعالجة',
  completed: 'مكتمل', rejected: 'مرفوض',
  scheduled: 'مجدول', released: 'صدر', delayed: 'مؤجل', cancelled: 'ملغى',
  active: 'نشط', inactive: 'غير نشط',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx('badge', map[status] ?? 'bg-gray-100 text-gray-700')}>
      {labels[status] ?? status}
    </span>
  )
}
