import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, CreditCard, CalendarDays, Wrench, Megaphone, MessageSquare, FileText,
  ArrowRight, Plus, Star, Check, ChevronDown, Sparkles
} from 'lucide-react'

const features = [
  { icon: CreditCard,    title: 'Condo Fee Billing',   desc: 'Issue and track monthly charges. Mark payments as paid instantly.' },
  { icon: CalendarDays,  title: 'Space Reservations',  desc: 'Book shared areas like the gym, BBQ, or pool — no double-bookings.' },
  { icon: Wrench,        title: 'Service Requests',    desc: 'Submit maintenance requests and track their status in real time.' },
  { icon: Megaphone,     title: 'Announcements',       desc: 'Management broadcasts important news directly to all residents.' },
  { icon: MessageSquare, title: 'Direct Messaging',    desc: 'Residents send messages to management and get replies in-app.' },
  { icon: FileText,      title: 'Document Hub',        desc: 'Centralized storage for bylaws, insurance, and shared files.' },
]

const steps = [
  { num: '01', title: 'Sign up as a resident',       desc: 'Create your account with your apartment number and contact details.' },
  { num: '02', title: 'Explore your dashboard',      desc: 'View pending fees, open requests, and unread messages at a glance.' },
  { num: '03', title: 'Reserve shared spaces',       desc: 'Pick a date, select an area, and confirm your time slot instantly.' },
  { num: '04', title: 'Submit maintenance issues',   desc: 'Describe the problem, set priority, and track admin responses.' },
  { num: '05', title: 'Receive management replies',  desc: 'Get answers to your messages directly in the app.' },
]

const faqs = [
  { q: 'Who can use Batima-Gest?',        a: 'Any resident of a Batima condominium property. Management staff use the Admin role for full control.' },
  { q: 'Is my data secure?',              a: 'Yes. All data is stored securely on Supabase with row-level security policies per user.' },
  { q: 'Can I access it from my phone?',  a: 'Absolutely — the platform is fully responsive and works great on mobile browsers.' },
  { q: 'How do I pay my condo fee?',      a: 'Fees are issued digitally. Once paid offline, management marks them as paid in the system.' },
  { q: 'Can I cancel a reservation?',     a: 'Yes, you can delete any reservation you made directly from the Reservations page.' },
]

const LogoIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
    <Home className="w-4 h-4 text-white" strokeWidth={2.5} />
  </div>
)

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="bg-background-page overflow-x-hidden">

      {/* ─── HEADER ─── */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-background-card/90 backdrop-blur-md border-b border-border-main"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoIcon />
            <span className="font-bold text-xl text-text-main tracking-tight">Batima<span className="text-primary">-Gest</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <a href="#features"     className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
            <a href="#faq"          className="hover:text-primary transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-semibold text-text-main hover:text-primary transition-colors px-4 py-2 rounded-xl border border-border-main hover:border-primary/30 bg-background-card">
              Log in
            </Link>
            <Link to="/signup"
              className="text-sm font-semibold bg-dark-bg text-white px-4 py-2 rounded-xl hover:bg-dark-card transition-colors shadow-sm flex items-center gap-1.5">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ─── HERO ─── */}
      <section className="relative text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/building-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-dark-bg/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, #10B981 1px, transparent 1px)', backgroundSize:'32px 32px'}} />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            className="text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary-light text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Condo Management Platform
            </motion.div>
            <motion.h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6 flex flex-col gap-1">
              <span className="flex gap-3 flex-wrap">
                {"Managing your".split(" ").map((word, i) => (
                  <motion.span key={`w1-${i}`} variants={fadeInUp} className="inline-block">{word}</motion.span>
                ))}
              </span>
              <span className="flex gap-3 flex-wrap text-primary-light">
                {"building, simplified.".split(" ").map((word, i) => (
                  <motion.span key={`w2-${i}`} variants={fadeInUp} className="inline-block">{word}</motion.span>
                ))}
              </span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-white/60 text-lg leading-relaxed mb-8 max-w-md">
              Batima-Gest brings residents and management together — fees, reservations, requests, and messages in one clean platform.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
              <Link to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary-light text-text-main font-bold px-7 py-3.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/20">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all">
                I have an account
              </Link>
            </motion.div>
            <motion.p variants={fadeInUp} className="text-white/30 text-xs mt-5 font-medium">No credit card required · Setup in 2 minutes</motion.p>
          </motion.div>

          {/* Hero visual */}
          <div className="hidden md:block relative h-full min-h-[400px]">
            {/* Card 1: Payment */}
            <motion.div 
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="absolute top-4 right-0 w-72 bg-dark-card/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20 animate-float"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Payment Confirmed</p>
                  <p className="text-xs text-white/60">Monthly Condo Fee • 12,500 DA</p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Reservation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              className="absolute top-28 left-4 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-10 animate-float-delayed"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Reservation</span>
                </div>
                <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-1 rounded-md uppercase tracking-wider">Approved</span>
              </div>
              <h3 className="text-xl font-black text-white mb-1">Rooftop BBQ Area</h3>
              <p className="text-sm text-white/70 font-medium">Saturday • 14:00 - 18:00</p>
              
              <div className="mt-5 flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-dark-bg flex items-center justify-center text-[10px] font-bold text-white">AM</div>
                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-dark-bg flex items-center justify-center text-[10px] font-bold text-white">JS</div>
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-dark-bg flex items-center justify-center text-[10px] font-bold text-white">+3</div>
              </div>
            </motion.div>

            {/* Card 3: Maintenance */}
            <motion.div 
              initial={{ opacity: 0, x: 50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
              className="absolute bottom-10 right-8 w-64 bg-dark-bg/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 z-30 animate-float-slow"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Live Update</p>
              </div>
              <p className="text-sm font-bold text-white">Service Request Resolved</p>
              <p className="text-xs text-white/50 mt-1">Plumbing issue in Apt 4B fixed.</p>
            </motion.div>
            
            {/* Decorative glows */}
            <div className="absolute top-0 left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        <div className="h-12 bg-background-page rounded-t-[3rem] relative z-10" />
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-14"
        >
          <span className="label-tag mb-3 inline-block">Features</span>
          <h2 className="text-4xl font-black text-text-main mt-2">Everything your building needs</h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">One platform for residents and management — no extra tools needed.</p>
        </motion.div>

        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {features.map(({ icon: Icon, title, desc }, i) => {
            const isDark   = i === 1 || i === 4
            const isAccent = i === 2
            return (
              <motion.div 
                key={title} 
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className={`rounded-2xl border-2 p-6 transition-colors ${
                isDark   ? 'bg-dark-bg text-white border-dark-bg' :
                isAccent ? 'bg-primary-light border-primary-light text-text-main' :
                           'bg-background-card border-border-main hover:border-primary/30 hover:shadow-lg'
              }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/10' : 'bg-background-page'}`}>
                  <Icon className={`w-5 h-5 ${isDark ? 'text-primary-light' : isAccent ? 'text-primary-dark' : 'text-primary'}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-text-secondary'}`}>{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 bg-background-card border-y border-border-main">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-12"
          >
            <span className="label-tag mb-3 inline-block">Process</span>
            <h2 className="text-4xl font-black text-text-main mt-2">Getting started is easy</h2>
          </motion.div>

          <motion.div 
            className="space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {steps.map((step, i) => (
              <motion.div 
                key={step.num} 
                variants={fadeInUp}
                className={`flex items-start gap-6 p-5 rounded-2xl border-2 transition-colors cursor-default hover:border-primary/30 ${
                i === 0 ? 'bg-primary-light/30 border-primary/30' : 'bg-background-page border-border-main'
              }`}>
                <span className={`text-2xl font-black shrink-0 w-12 text-center ${i === 0 ? 'text-primary' : 'text-text-secondary/30'}`}>
                  {step.num}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-main mb-1">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.desc}</p>
                </div>
                <motion.div 
                  whileHover={{ rotate: 90 }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  i === 0 ? 'border-primary bg-primary text-white' : 'border-border-main'
                }`}>
                  {i === 0
                    ? <Check className="w-4 h-4" strokeWidth={2.5} />
                    : <Plus className="w-4 h-4 text-text-secondary/30" />
                  }
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="md:col-span-2"
          >
            <span className="label-tag mb-3 inline-block">FAQ</span>
            <h2 className="text-4xl font-black text-text-main mt-2 leading-tight">Common questions</h2>
            <p className="text-text-secondary mt-4 text-sm leading-relaxed">Still have questions? Drop us a message from your resident account.</p>
          </motion.div>

          <motion.div 
            className="md:col-span-3 space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {faqs.map((faq, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className={`rounded-2xl border-2 transition-colors overflow-hidden ${
                openFaq === i ? 'border-primary/30 bg-primary/5' : 'border-border-main bg-background-card hover:border-primary/20'
              }`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-bold text-text-main text-sm">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-4 h-4 shrink-0 ml-4 ${openFaq === i ? 'text-primary' : 'text-text-secondary'}`} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5"
                    >
                      <div className="pb-4">
                        <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden text-white shadow-xl"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/building-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-dark-bg/90 backdrop-blur-[2px]" />
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
          
          <div className="relative z-10 text-left max-w-xl">
            <motion.h2 
              className="text-3xl md:text-4xl font-black text-white mb-3 flex gap-2 flex-wrap"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {"Ready to modernize your building?".split(" ").map((word, i) => (
                <motion.span key={i} variants={fadeInUp} className="inline-block">{word}</motion.span>
              ))}
            </motion.h2>
            <p className="text-white/50 text-sm leading-relaxed">Join Batima-Gest today. Residents and management aligned, always.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary-light text-text-main font-bold px-7 py-3.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all">
              Log in
            </Link>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-6 -right-6"
          >
            <Star className="w-32 h-32 text-white/5" fill="currentColor" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-dark-bg text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">Batima<span className="text-primary-light">-Gest</span></span>
              </div>
              <p className="text-white/40 text-sm max-w-xs">Modern condo management for residents and administrators.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-white/50">
              <a href="#features"     className="hover:text-primary-light transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-primary-light transition-colors">How it works</a>
              <a href="#faq"          className="hover:text-primary-light transition-colors">FAQ</a>
              <Link to="/login"       className="hover:text-primary-light transition-colors">Login</Link>
              <Link to="/signup"      className="hover:text-primary-light transition-colors">Sign up</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-xs">© {new Date().getFullYear()} Batima-Gest. All rights reserved.</p>
            <p className="text-white/20 text-xs">Built for better communities</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
