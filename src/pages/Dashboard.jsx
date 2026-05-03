import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  CreditCard, CalendarDays, Wrench, Megaphone, MessageSquare, FileText,
  AlertTriangle, CheckCircle2, Mail, ArrowRight, User
} from 'lucide-react'

const quickLinks = [
  { to: '/expenses',      Icon: CreditCard,    label: 'My Fees',          desc: 'View and track your condo payments',      accent: true  },
  { to: '/reservations',  Icon: CalendarDays,  label: 'Book a Space',     desc: 'Reserve the gym, pool, or BBQ area',     accent: false },
  { to: '/requests',      Icon: Wrench,        label: 'Service Request',  desc: 'Report an issue or maintenance need',    accent: false },
  { to: '/messages',      Icon: MessageSquare, label: 'Messages',         desc: 'Communicate with building management',   accent: false },
  { to: '/announcements', Icon: Megaphone,     label: 'Announcements',    desc: 'Building news and updates',              accent: false },
  { to: '/documents',     Icon: FileText,      label: 'Documents',        desc: 'Access shared files and bylaws',         accent: false },
]

export default function Dashboard() {
  const [resident, setResident]               = useState(null)
  const [pendingRequests, setPendingRequests]  = useState(0)
  const [unreadMessages, setUnreadMessages]    = useState(0)
  const [pendingFees, setPendingFees]          = useState(0)
  const [loading, setLoading]                 = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: residentData } = await supabase.from('residents').select('*').eq('id', user.id).single()
        setResident(residentData)

        const { count: reqCount } = await supabase
          .from('service_requests').select('*', { count: 'exact', head: true })
          .eq('resident_id', user.id).neq('status', 'resolved')
        setPendingRequests(reqCount || 0)

        const { count: msgCount } = await supabase
          .from('messages').select('*', { count: 'exact', head: true })
          .eq('resident_id', user.id).eq('is_read', false)
        setUnreadMessages(msgCount || 0)

        const { count: feeCount } = await supabase
          .from('expenses').select('*', { count: 'exact', head: true })
          .eq('resident_id', user.id).eq('status', 'pending')
        setPendingFees(feeCount || 0)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />

  const firstName = resident?.full_name?.split(' ')[0] || 'Resident'

  const stats = [
    {
      label: 'Pending Fees',
      value: pendingFees,
      Icon: CreditCard,
      color:   pendingFees > 0 ? 'text-warning' : 'text-success',
      iconBg:  pendingFees > 0 ? 'bg-warning/10' : 'bg-success/10',
      iconClr: pendingFees > 0 ? 'text-warning'  : 'text-success',
      note:    pendingFees > 0 ? 'Requires attention' : 'All clear',
      StatusIcon: pendingFees > 0 ? AlertTriangle : CheckCircle2,
    },
    {
      label: 'Open Requests',
      value: pendingRequests,
      Icon: Wrench,
      color:   pendingRequests > 0 ? 'text-info' : 'text-success',
      iconBg:  pendingRequests > 0 ? 'bg-info/10' : 'bg-success/10',
      iconClr: pendingRequests > 0 ? 'text-info'  : 'text-success',
      note:    pendingRequests > 0 ? 'In progress' : 'No open issues',
      StatusIcon: pendingRequests > 0 ? Wrench : CheckCircle2,
    },
    {
      label: 'Unread Messages',
      value: unreadMessages,
      Icon: Mail,
      color:   unreadMessages > 0 ? 'text-primary' : 'text-success',
      iconBg:  unreadMessages > 0 ? 'bg-primary/10' : 'bg-success/10',
      iconClr: unreadMessages > 0 ? 'text-primary'  : 'text-success',
      note:    unreadMessages > 0 ? 'Check inbox' : 'Up to date',
      StatusIcon: unreadMessages > 0 ? Mail : CheckCircle2,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* Hero welcome strip */}
      <div className="bg-dark-bg rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="label-tag mb-3 inline-block text-xs">Welcome back</span>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">Hello, {firstName}!</h1>
            <p className="text-white/40 mt-2 text-sm">
              {resident?.apartment_number ? `Apartment ${resident.apartment_number}` : 'Your resident portal'}
            </p>
          </div>
          <Link to="/profile"
            className="shrink-0 flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 hover:bg-white/15 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              {resident?.avatar_url
                ? <img src={resident.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                : <User className="w-5 h-5 text-white" />
              }
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">{resident?.full_name}</p>
              <p className="text-white/40 text-xs capitalize">{resident?.role || 'Resident'}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, Icon, color, iconBg, iconClr, note, StatusIcon }) => (
          <div key={label} className="bg-background-card rounded-2xl border border-border-main p-5 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconClr}`} />
              </div>
              <span className={`text-3xl font-black ${color}`}>{value}</span>
            </div>
            <p className="font-bold text-text-main text-sm">{label}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusIcon className={`w-3 h-3 ${iconClr}`} />
              <p className="text-text-secondary text-xs">{note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <span className="label-tag mb-5 inline-block">Quick Actions</span>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ to, Icon, label, desc, accent }) => (
            <Link key={to} to={to}
              className={`group flex items-center gap-4 p-5 rounded-2xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                accent
                  ? 'bg-primary-light border-primary/30 hover:border-primary'
                  : 'bg-background-card border-border-main hover:border-primary/30'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-white/60' : 'bg-background-page'}`}>
                <Icon className={`w-5 h-5 ${accent ? 'text-primary-dark' : 'text-primary'}`} />
              </div>
              <div className="text-left min-w-0">
                <p className="font-bold text-text-main text-sm">{label}</p>
                <p className="text-text-secondary text-xs mt-0.5 truncate">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-secondary/30 ml-auto shrink-0 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
