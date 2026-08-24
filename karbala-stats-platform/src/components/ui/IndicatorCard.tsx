import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'
import type { Indicator } from '../../types'

const trendConfig = {
  up:     { icon: TrendingUp,   color: 'text-emerald-700', bg: 'bg-pastel-mint' },
  down:   { icon: TrendingDown, color: 'text-rose-700',    bg: 'bg-pastel-rose' },
  stable: { icon: Minus,        color: 'text-primary-700', bg: 'bg-pastel-blue' },
}

export default function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const trend = trendConfig[indicator.trend]
  const TrendIcon = trend.icon

  return (
    <Link to={`/indicators/${indicator.id}`} className="card hover:-translate-y-0.5 hover:shadow-md transition-all block">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 line-clamp-1">{indicator.category?.name_ar}</p>
          <h3 className="font-semibold text-gray-900 mt-0.5 line-clamp-2 leading-snug">{indicator.name_ar}</h3>
        </div>
        <div className={clsx('p-2 rounded-2xl ring-1 ring-white', trend.bg)}>
          <TrendIcon className={clsx('h-5 w-5', trend.color)} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {indicator.latest_value != null ? indicator.latest_value.toLocaleString('ar-IQ') : '—'}
          </span>
          {indicator.unit_ar && <span className="text-sm text-gray-500">{indicator.unit_ar}</span>}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{indicator.latest_period ?? 'آخر فترة'}</span>
          {indicator.change_percentage != null && (
            <span className={clsx('text-sm font-medium', trend.color)}>
              {indicator.change_percentage > 0 ? '+' : ''}{indicator.change_percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
