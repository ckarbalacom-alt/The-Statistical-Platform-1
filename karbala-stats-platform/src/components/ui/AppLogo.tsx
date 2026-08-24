import clsx from 'clsx'

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
}

export default function AppLogo({
  size = 'md',
  className,
  imageClassName,
}: {
  size?: keyof typeof sizeClasses
  className?: string
  imageClassName?: string
}) {
  return (
    <span className={clsx('inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white/90 ring-1 ring-white/70 shadow-sm shadow-primary-900/10', sizeClasses[size], className)}>
      <img
        src="/logo.png"
        alt="شعار مركز كربلاء للدراسات والبحوث"
        className={clsx('h-full w-full object-contain p-0.5', imageClassName)}
      />
    </span>
  )
}
