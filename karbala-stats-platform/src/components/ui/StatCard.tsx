import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  sub?: string
}

export default function StatCard({ title, value, icon: Icon, color = 'text-primary', sub }: StatCardProps) {
  return (
    <div className="card flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className={`p-3 rounded-2xl bg-primary-50 ring-1 ring-primary-100 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value.toLocaleString('ar-IQ')}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
