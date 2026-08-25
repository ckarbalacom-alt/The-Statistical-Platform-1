import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, Eye, Calendar, FileText } from 'lucide-react'
import { publicationsApi } from '../../api/publications'
import Spinner from '../../components/ui/Spinner'
import PublicationCard from '../../components/ui/PublicationCard'
import { sanitizeHtml } from '../../lib/sanitizeHtml'

export default function PublicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useQuery({
    queryKey: ['publication', id],
    queryFn: () => publicationsApi.get(Number(id)),
    enabled: !!id,
  })

  const handleDownload = async () => {
    const res = await publicationsApi.download(Number(id))
    window.open(res.url, '_blank')
  }

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (!data) return null

  const pub = data.data

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          {pub.category && (
            <span className="badge bg-primary/10 text-primary mb-3">{pub.category.name_ar}</span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">{pub.title_ar}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            {pub.stat_year && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {pub.stat_year}</span>}
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {pub.views_count} مشاهدة</span>
            <span className="flex items-center gap-1"><Download className="h-4 w-4" /> {pub.downloads_count} تحميل</span>
            {pub.release_date && <span>{pub.release_date}</span>}
          </div>

          {pub.description_ar && (
            <div
              className="rich-content prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.description_ar) }}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {pub.cover_image_url ? (
            <img src={pub.cover_image_url} alt={pub.title_ar} className="w-full rounded-xl shadow" />
          ) : (
            <div className="w-full h-48 rounded-xl bg-gray-100 flex items-center justify-center">
              <FileText className="h-16 w-16 text-gray-300" />
            </div>
          )}

          {pub.file_url && (
            <button onClick={handleDownload} className="btn-accent w-full flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              تحميل الملف ({pub.file_size_formatted})
            </button>
          )}

          <div className="card text-sm space-y-2">
            {pub.file_type && <div className="flex justify-between"><span className="text-gray-500">نوع الملف</span><span className="font-medium">{pub.file_type.toUpperCase()}</span></div>}
            {pub.stat_year && <div className="flex justify-between"><span className="text-gray-500">السنة</span><span className="font-medium">{pub.stat_year}</span></div>}
            {pub.creator && <div className="flex justify-between"><span className="text-gray-500">المُعِد</span><span className="font-medium">{pub.creator.name_ar}</span></div>}
          </div>
        </div>
      </div>

      {/* Related */}
      {data.related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">إصدارات ذات صلة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.related.map(pub => <PublicationCard key={pub.id} pub={pub} />)}
          </div>
        </div>
      )}
    </div>
  )
}
