import clsx from 'clsx'
import {
  Activity,
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  Database,
  Factory,
  FileText,
  Globe2,
  GraduationCap,
  HardHat,
  HeartPulse,
  HelpCircle,
  Home,
  Image,
  Landmark,
  Layers,
  LinkIcon,
  ListOrdered,
  Mail,
  Map,
  Newspaper,
  PieChart,
  Plane,
  Sprout,
  Target,
  TrendingUp,
  Truck,
  Users,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  'press-releases': Newspaper,
  news: Newspaper,
  'latest-news': Newspaper,
  infographic: Image,
  publications: BookOpen,
  contracts: ClipboardList,
  indicators: TrendingUp,
  statistics: BarChart2,
  'statistics-by-years': CalendarDays,
  sdg: Target,
  'statistics-a-z': ListOrdered,
  about: Landmark,
  'about-us': Landmark,
  brochure: FileText,
  services: Mail,
  requests: ClipboardList,
  training: GraduationCap,
  research: GraduationCap,
  publishing: Newspaper,
  guides: BookOpen,
  standards: Layers,
  classifications: Layers,
  metadata: Database,
  agriculture: Sprout,
  industry: Factory,
  construction: HardHat,
  'foreign-trade': Globe2,
  'internal-trade': Building2,
  tourism: Plane,
  transport: Truck,
  'national-accounts': PieChart,
  education: GraduationCap,
  population: Users,
  housing: Home,
  technology: Wifi,
  communications: Wifi,
  living: HeartPulse,
  environment: Sprout,
  prices: TrendingUp,
  inflation: TrendingUp,
  development: Activity,
  gender: Users,
  welfare: HeartPulse,
  displaced: Map,
  surveys: ClipboardList,
  faq: HelpCircle,
  links: LinkIcon,
  mail: Mail,
  jobs: Briefcase,
}

const toneClasses = [
  'bg-pastel-blue text-primary-700 ring-sky-100',
  'bg-pastel-mint text-emerald-700 ring-emerald-100',
  'bg-pastel-peach text-orange-700 ring-orange-100',
  'bg-pastel-lavender text-violet-700 ring-violet-100',
  'bg-pastel-rose text-rose-700 ring-rose-100',
  'bg-pastel-butter text-amber-700 ring-amber-100',
]

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const svgSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

function normalize(value?: string | null) {
  return (value ?? '').trim().toLowerCase().replace(/_/g, '-')
}

function toneFor(key: string) {
  const total = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return toneClasses[total % toneClasses.length]
}

function getCategoryIcon(slug?: string | null, icon?: string | null) {
  const iconKey = normalize(icon)
  const slugKey = normalize(slug)
  return iconMap[iconKey] ?? iconMap[slugKey] ?? FileText
}

export default function CategoryIcon({
  slug,
  icon,
  size = 'md',
  className,
  wrapperClassName,
}: {
  slug?: string | null
  icon?: string | null
  size?: keyof typeof sizeClasses
  className?: string
  wrapperClassName?: string
}) {
  const key = normalize(icon) || normalize(slug) || 'default'
  const Icon = getCategoryIcon(slug, icon)

  return (
    <span className={clsx('pastel-icon', sizeClasses[size], toneFor(key), wrapperClassName)}>
      <Icon className={clsx(svgSizeClasses[size], className)} />
    </span>
  )
}
