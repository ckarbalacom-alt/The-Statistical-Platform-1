export interface Category {
  id: number
  name_ar: string
  name_en: string | null
  slug: string
  path?: string
  description_ar?: string | null
  icon: string | null
  parent_id?: number | null
  display_order: number
  is_active?: boolean
  publications_count?: number
  indicators_count?: number
  news_articles_count?: number
  parent?: Category
  page?: CategoryPage | null
  children?: Category[]
}

export interface CategoryPage {
  id: number
  category_id: number
  title_ar: string
  title_en: string | null
  summary_ar: string | null
  body_ar: string | null
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  published_at: string | null
  category?: Category
  author?: { id: number; name_ar: string | null }
}

export interface Publication {
  id: number
  title_ar: string
  title_en: string | null
  slug: string
  description_ar: string | null
  cover_image_url: string | null
  file_url: string | null
  file_type: string | null
  file_size: number | null
  file_size_formatted: string
  stat_year: number | null
  stat_quarter: number | null
  release_date: string | null
  is_featured: boolean
  views_count: number
  downloads_count: number
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  category?: { id: number; name_ar: string; name_en: string | null; slug: string }
  creator?: { id: number; name_ar: string }
}

export interface Indicator {
  id: number
  name_ar: string
  name_en: string | null
  slug: string | null
  unit_ar: string | null
  unit_en: string | null
  source: string | null
  methodology_ar: string | null
  latest_value: number | null
  latest_period: string | null
  trend: 'up' | 'down' | 'stable'
  change_percentage: number | null
  is_featured: boolean
  category?: { id: number; name_ar: string }
  data_points?: DataPoint[]
}

export interface DataPoint {
  period_label: string
  period_type: 'yearly' | 'quarterly' | 'monthly'
  period_sort: number | null
  value: number
  notes: string | null
}

export interface NewsArticle {
  id: number
  title_ar: string
  title_en: string | null
  slug: string
  body_ar: string | null
  thumbnail_url: string | null
  article_type: 'news' | 'event' | 'announcement'
  category_id: number | null
  category?: { id: number; name_ar: string; slug: string; path?: string | null }
  tags: string[] | null
  is_featured: boolean
  views_count: number
  published_at: string | null
  author?: { id: number; name_ar: string }
}

export interface StatisticalRequest {
  id: number
  request_code: string | null
  requester_name: string
  requester_email: string
  requester_phone: string | null
  requester_organization: string | null
  request_type: 'data' | 'report' | 'consultation' | 'partnership'
  description: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  admin_notes: string | null
  rejection_reason: string | null
  completed_at: string | null
  created_at: string
  assigned_user?: { id: number; name_ar: string }
}

export interface CalendarEvent {
  id: number
  title_ar: string
  title_en: string | null
  release_date: string
  release_time: string
  indicator_category: string | null
  status: 'scheduled' | 'released' | 'delayed' | 'cancelled'
  notes_ar: string | null
}

export interface User {
  id: number
  name_ar: string
  name_en: string | null
  email: string
  role: 'superadmin' | 'admin' | 'editor' | 'viewer'
  is_active: boolean
  last_login_at: string | null
  created_at: string
  avatar_url: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}
