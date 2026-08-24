import { Link } from 'react-router-dom'
import { Download, Eye, Calendar, FileText } from 'lucide-react'
import type { Publication } from '../../types'
import { publicationsApi } from '../../api/publications'

const typeColors: Record<string, string> = {
  pdf: 'bg-pastel-rose text-rose-700',
  xlsx: 'bg-pastel-mint text-emerald-700',
  xls: 'bg-pastel-mint text-emerald-700',
  csv: 'bg-pastel-blue text-primary-700',
}

export default function PublicationCard({ pub }: { pub: Publication }) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    const res = await publicationsApi.download(pub.id)
    window.open(res.url, '_blank')
  }

  return (
    <div className="card hover:-translate-y-0.5 hover:shadow-md transition-all group">
      {/* Cover image or placeholder */}
      <div className="w-full h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-pastel-lavender mb-4">
        {pub.cover_image_url ? (
          <img src={pub.cover_image_url} alt={pub.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-200">
            <FileText className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Category chip */}
      {pub.category && (
        <span className="badge bg-primary-50 text-primary mb-2">{pub.category.name_ar}</span>
      )}

      {/* Title */}
      <Link to={`/publications/${pub.id}`}>
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-primary transition-colors">
          {pub.title_ar}
        </h3>
      </Link>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
        {pub.stat_year && (
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{pub.stat_year}</span>
        )}
        {pub.file_type && (
          <span className={`badge text-xs ${typeColors[pub.file_type] ?? 'bg-gray-100 text-gray-600'}`}>
            {pub.file_type.toUpperCase()}
          </span>
        )}
        <span className="flex items-center gap-1 mr-auto"><Eye className="h-3 w-3" />{pub.views_count}</span>
      </div>

      {/* Download button */}
      {pub.file_url && (
        <button
          onClick={handleDownload}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-accent-50 text-accent-700 hover:bg-accent hover:text-white text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          تحميل ({pub.file_size_formatted})
        </button>
      )}
    </div>
  )
}
