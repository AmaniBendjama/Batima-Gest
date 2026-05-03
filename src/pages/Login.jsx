import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'
import { Mail, Lock, Building2 } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background-page flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image & Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/building-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-dark-bg/85 backdrop-blur-[2px]" />
        
        {/* Decorative ambient glows */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Dot grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 mix-blend-overlay" 
          style={{backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'32px 32px'}} 
        />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-2 relative z-10 w-max bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Batima<span className="text-primary-light">-Gest</span></span>
          </Link>
        </motion.div>

        <motion.div 
          className="relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={fadeInUp} className="text-white text-4xl font-black leading-tight mb-4 flex flex-col gap-1">
            <span className="flex gap-2 flex-wrap">
              {"Welcome back".split(" ").map((word, i) => (
                <motion.span key={i} variants={fadeInUp} className="inline-block">{word}</motion.span>
              ))}
            </span>
            <span className="flex gap-2 flex-wrap">
              {"to your building.".split(" ").map((word, i) => (
                <motion.span key={i} variants={fadeInUp} className="inline-block">{word}</motion.span>
              ))}
            </span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-white/40 text-sm leading-relaxed mb-8">
            Manage fees, requests, and reservations — all in one place.
          </motion.p>

          {/* Mini stats */}
          <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-4">
            {[
              { val: '24/7', label: 'Support' },
              { val: '100%', label: 'Secure' },
              { val: '5.0', label: 'Rating' },
            ].map(({ val, label }) => (
              <motion.div key={label} variants={fadeInUp} whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center transition-colors hover:bg-white/10 backdrop-blur-sm shadow-xl shadow-black/10">
                <p className="text-primary-light font-black text-2xl">{val}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1 font-bold">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/20 text-xs relative z-10"
        >
          © {new Date().getFullYear()} Batima-Gest
        </motion.p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle background decoration for right panel */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div 
          className="w-full max-w-md relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile logo */}
          <motion.div variants={fadeInUp}>
            <Link to="/" className="flex items-center gap-2 lg:hidden mb-10 w-max">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-text-main text-xl tracking-tight">Batima<span className="text-primary">-Gest</span></span>
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-10">
            <h2 className="text-4xl font-black text-text-main tracking-tight">Sign in</h2>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">Enter your credentials to securely access your resident dashboard.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div variants={fadeInUp}>
              <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-secondary/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-background-card border-2 border-border-main rounded-2xl text-text-main placeholder:text-text-secondary/40 focus:outline-none focus:ring-0 focus:border-primary transition-all hover:border-border-main/80 shadow-sm"
                />
              </div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary/40" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-background-card border-2 border-border-main rounded-2xl text-text-main placeholder:text-text-secondary/40 focus:outline-none focus:ring-0 focus:border-primary transition-all hover:border-border-main/80 shadow-sm"
                />
              </div>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3"
              >
                <p className="text-danger text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <motion.button
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-60 mt-4 shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
            >
              {loading ? 'Signing in…' : 'Sign in securely'}
            </motion.button>
          </form>

          <motion.p variants={fadeInUp} className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">Create one</Link>
          </motion.p>

          <motion.p variants={fadeInUp} className="text-center mt-6">
            <Link to="/" className="text-xs text-text-secondary/50 hover:text-text-secondary transition-colors">
              ← Back to home
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
