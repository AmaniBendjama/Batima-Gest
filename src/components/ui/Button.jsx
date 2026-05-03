export default function Button({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-primary text-white hover:bg-primary-dark focus:ring-primary rounded-xl px-5 py-2.5 shadow-sm',
    secondary: 'bg-background-card text-text-main border border-border-main hover:bg-background-page focus:ring-primary rounded-xl px-5 py-2.5',
    danger:    'bg-danger text-white hover:opacity-90 focus:ring-danger rounded-xl px-5 py-2.5',
    dark:      'bg-dark-bg text-white hover:bg-dark-card focus:ring-dark-bg rounded-xl px-5 py-2.5',
    outline:   'bg-transparent text-text-main border-2 border-text-main hover:bg-text-main hover:text-white focus:ring-text-main rounded-xl px-5 py-2.5',
    ghost:     'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary rounded-xl px-5 py-2.5',
    pill:      'bg-dark-bg text-white hover:bg-dark-card focus:ring-dark-bg rounded-full px-6 py-2.5',
    'pill-outline': 'bg-transparent text-text-main border-2 border-text-main hover:bg-text-main hover:text-white focus:ring-text-main rounded-full px-6 py-2.5',
    'pill-primary': 'bg-primary text-white hover:bg-primary-dark focus:ring-primary rounded-full px-6 py-2.5 shadow-sm',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
