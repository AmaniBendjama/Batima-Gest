import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [fullName, setFullName]   = useState('')
  const [apartment, setApartment] = useState('')
  const [phone, setPhone]         = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // 1. Sign up the user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName, 
          apartment_number: apartment, 
          phone 
        } 
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // 2. If Auth signup is successful, create a record in the 'residents' table
    if (data.user) {
      const { error: dbError } = await supabase.from('residents').insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        apartment_number: apartment,
        phone: phone,
        role: 'resident' // Default role
      })

      if (dbError) {
        console.error('Error creating resident record:', dbError)
        // Note: We don't block the UI here since the account IS created in Auth,
        // but we should probably alert the user or handle it.
      }
    }

    navigate('/login')
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-3 bg-background-card border border-border-main rounded-xl text-text-main placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"

  return (
    <div className="min-h-screen bg-background-page flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-dark-bg flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'28px 28px'}} />

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">Batima<span className="text-primary-light">-Gest</span></span>
        </Link>

        <div className="relative z-10">
          <h1 className="text-white text-4xl font-black leading-tight mb-4">
            Join your<br />community today.
          </h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Create your resident account and get instant access to all building services.
          </p>

          <div className="space-y-3">
            {[
              { icon: '💳', text: 'Track your monthly fees' },
              { icon: '📅', text: 'Reserve shared spaces' },
              { icon: '🔧', text: 'Submit maintenance requests' },
              { icon: '💬', text: 'Message management directly' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm shrink-0">{icon}</div>
                <span className="text-white/60 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs relative z-10">© {new Date().getFullYear()} Batima-Gest</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-text-main">Batima<span className="text-primary">-Gest</span></span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-text-main">Create account</h2>
            <p className="text-text-secondary mt-1 text-sm">Fill in your details to register as a resident</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Full name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">Apartment No.</label>
                <input type="text" value={apartment} onChange={e => setApartment(e.target.value)} placeholder="A-12" required className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Phone number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+213 555 00 00 00" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required className={inputClass} />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                <p className="text-danger text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark-bg text-white font-bold py-3.5 rounded-xl hover:bg-dark-card transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>

          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-text-secondary/50 hover:text-text-secondary transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
