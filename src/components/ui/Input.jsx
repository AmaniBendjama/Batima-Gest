export default function Input({ label, type = 'text', value, onChange, required = false, placeholder = '', disabled = false, icon = null }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-text-main mb-1.5 text-left group-focus-within:text-primary transition-colors">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-primary">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full py-3 bg-background-card border border-border-main rounded-xl text-text-main placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:bg-background-page disabled:text-text-secondary hover:border-primary/50 ${
            icon ? 'pl-11 pr-4' : 'px-4'
          }`}
        />
      </div>
    </div>
  )
}
