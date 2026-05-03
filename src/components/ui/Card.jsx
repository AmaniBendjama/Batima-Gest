export default function Card({ children, title = null, variant = 'default', className = '' }) {
  const variants = {
    default:  'bg-background-card rounded-2xl border border-border-main shadow-sm p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-primary/30',
    outlined: 'bg-background-card rounded-2xl border-2 border-text-main p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
    dark:     'bg-dark-bg text-white rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-dark-card',
    accent:   'bg-primary-light text-text-main rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
    ghost:    'bg-background-page rounded-2xl border border-border-main p-6 transition-all duration-300 hover:bg-background-card hover:shadow-md',
  }

  const titleColors = {
    default:  'text-text-main',
    outlined: 'text-text-main',
    dark:     'text-white',
    accent:   'text-text-main',
    ghost:    'text-text-main',
  }

  return (
    <div className={`${variants[variant] || variants.default} ${className}`}>
      {title && (
        <h2 className={`text-xl font-bold mb-4 text-left ${titleColors[variant]}`}>{title}</h2>
      )}
      <div className="text-left">
        {children}
      </div>
    </div>
  )
}
