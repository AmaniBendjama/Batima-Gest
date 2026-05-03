import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ChevronDown, Plus, Trash2, ArrowUpDown, Clock, CheckCircle2, Search, MailOpen, Mail, User, ShieldCheck } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [role, setRole] = useState('resident')
  
  // Admin states
  const [expandedResidents, setExpandedResidents] = useState({})
  const [adminFilter, setAdminFilter] = useState('pending')
  const [allResidents, setAllResidents] = useState([])
  const [selectedResidentId, setSelectedResidentId] = useState('')
  
  // Resident states
  const [residentFilter, setResidentFilter] = useState('all') // 'all', 'pending', or 'replied'
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' = Newest, 'asc' = Oldest
  const [expandedMessageId, setExpandedMessageId] = useState(null)
  
  // Deletion states
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, []) // Remove sortOrder from dependency array

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('residents')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const userRole = profile?.role || 'resident'
      setRole(userRole)

      let query;
      if (userRole === 'admin') {
        query = supabase.from('messages')
          .select('*, residents!left(full_name, apartment_number)')
          .order('created_at', { ascending: false })
          
        const { data: residentsData } = await supabase.from('residents')
          .select('id, full_name, apartment_number')
          .eq('role', 'resident')
          .order('apartment_number')
        setAllResidents(residentsData || [])
      } else {
        query = supabase.from('messages')
          .select('*')
          .eq('resident_id', user.id)
          .order('created_at', { ascending: false })
      }

      const { data, error } = await query
      if (error) console.error('Fetch error:', error)
      setMessages(data || [])
    } catch (err) {
      console.error('System error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      if (role === 'admin') {
        if (!selectedResidentId) {
          alert('Please select a resident to message.')
          setSubmitting(false)
          return
        }
        await supabase.from('messages').insert([{
          resident_id: selectedResidentId,
          subject,
          message: '[MANAGEMENT NOTICE]',
          reply: content,
          is_read: false
        }])
      } else {
        await supabase.from('messages').insert([{
          resident_id: user.id,
          subject,
          message: content,
          is_read: false
        }])
      }
      setShowModal(false)
      setSubject('')
      setContent('')
      setSelectedResidentId('')
      fetchData()
    }
    setSubmitting(false)
  }

  const handleReplyMessage = async (id, reply) => {
    if (!reply) return
    await supabase.from('messages').update({ reply, is_read: true }).eq('id', id)
    fetchData()
  }

  const confirmUnsend = (id) => {
    setMessageToDelete(id)
  }

  const handleUnsendMessage = async () => {
    if (!messageToDelete) return
    setIsDeleting(true)
    
    try {
      await supabase.from('messages').delete().eq('id', messageToDelete)
      fetchData()
      setExpandedMessageId(null)
      setMessageToDelete(null)
    } catch (err) {
      console.error('Failed to unsend message:', err)
      alert('Failed to delete message.')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleResident = (id) => {
    setExpandedResidents(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (loading) return <LoadingSpinner />

  const adminFilteredMessages = messages.filter(msg => {
    if (adminFilter === 'pending') return !msg.reply
    if (adminFilter === 'replied') return msg.reply
    return true
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  const filteredMessages = messages.filter(msg => {
    if (residentFilter === 'pending') return !msg.reply && msg.message !== '[MANAGEMENT NOTICE]'
    if (residentFilter === 'replied') return msg.reply && msg.message !== '[MANAGEMENT NOTICE]'
    if (residentFilter === 'management') return msg.message === '[MANAGEMENT NOTICE]'
    return true
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {role === 'admin' ? (
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <h1 className="text-3xl font-bold text-text-main">Resident Communications</h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              
              {/* Sort Toggle */}
              <button 
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center justify-center gap-2 bg-background-page px-4 py-2 rounded-xl text-xs font-bold text-text-main border border-border-main hover:bg-background-card transition-colors w-full sm:w-auto shadow-sm"
              >
                <ArrowUpDown className="w-3.5 h-3.5" /> {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>

              <div className="flex bg-background-page p-1 rounded-2xl shadow-inner w-full sm:w-auto border border-border-main">
                <button 
                  onClick={() => setAdminFilter('pending')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminFilter === 'pending' ? 'bg-background-card text-primary shadow-sm border border-border-main' : 'text-text-secondary hover:text-text-main'}`}
                >
                  Pending
                  {messages.filter(m => !m.reply).length > 0 && (
                    <span className="ml-2 bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {messages.filter(m => !m.reply).length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setAdminFilter('replied')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${adminFilter === 'replied' ? 'bg-background-card text-primary shadow-sm border border-border-main' : 'text-text-secondary hover:text-text-main'}`}
                >
                  Replied
                </button>
              </div>
              <Button onClick={() => setShowModal(true)} className="rounded-2xl shadow-lg shadow-primary/10 w-full sm:w-auto px-6 flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> New Message
              </Button>
            </div>
          </div>

          <div className="bg-background-card border border-border-main rounded-3xl overflow-hidden shadow-sm">
            {adminFilteredMessages.length === 0 ? (
              <div className="text-center py-24 bg-background-card">
                <div className="w-16 h-16 bg-background-page rounded-full flex items-center justify-center mx-auto mb-4 border border-border-main text-text-secondary/50">
                  <MailOpen className="w-8 h-8" />
                </div>
                <p className="text-text-secondary font-bold text-lg mb-2">No {adminFilter} conversations found.</p>
                <p className="text-text-secondary/60 text-sm max-w-sm mx-auto mb-6">There are no messages matching this filter at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-main">
                {adminFilteredMessages.map(msg => {
                  const isExpanded = expandedMessageId === msg.id;
                  const isAdminMessage = msg.message === '[MANAGEMENT NOTICE]';
                  
                  return (
                    <div key={msg.id} className={`transition-colors duration-300 border-l-4 ${isAdminMessage ? 'border-l-secondary bg-secondary/[0.02]' : 'border-l-transparent'} ${isExpanded ? (isAdminMessage ? 'bg-secondary/10' : 'bg-primary/5') : 'hover:bg-background-page'}`}>
                      
                      {/* Email Row View */}
                      <div 
                        className="flex items-center justify-between p-4 sm:px-6 cursor-pointer"
                        onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          {/* Status Icon */}
                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${isAdminMessage ? 'bg-secondary/10 text-secondary border-secondary/20' : (msg.reply ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20')}`}>
                            {isAdminMessage ? <ShieldCheck className="w-5 h-5" /> : (msg.reply ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />)}
                          </div>
                          
                          {/* Content Snippet */}
                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-3 mb-0.5">
                              <span className="font-bold text-text-main truncate text-base">
                                {msg.residents?.full_name || 'Unknown'} <span className="text-text-secondary text-sm font-medium ml-1">(Apt {msg.residents?.apartment_number || 'N/A'})</span>
                              </span>
                              {isAdminMessage && <span className="shrink-0 text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-black uppercase tracking-widest hidden sm:inline-block border border-secondary/20">Sent by You</span>}
                              {!msg.reply && !isAdminMessage && <span className="shrink-0 text-[9px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-black uppercase tracking-widest hidden sm:inline-block border border-warning/20">Action Required</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-secondary truncate font-medium">
                              <span className="font-black text-text-main truncate">{msg.subject}</span>
                              <span className="text-text-secondary/30">-</span>
                              <span className="truncate">{isAdminMessage ? msg.reply : msg.message}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side (Date) */}
                        <div className="flex items-center gap-4 shrink-0 pl-4">
                          <span className="text-xs font-bold text-text-secondary/60 whitespace-nowrap">
                            {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Thread View */}
                      {isExpanded && (
                        <div className="p-6 border-t border-border-main bg-background-page/30 animate-[fadeInScale_0.2s_ease-out]">
                          <div className="max-w-4xl mx-auto">
                            
                            {/* Original Message (if not initiated by Admin) */}
                            {msg.message !== '[MANAGEMENT NOTICE]' && (
                              <div className="mb-6 relative">
                                <div className="absolute top-6 left-5 bottom-[-24px] w-0.5 bg-border-main z-0" />
                                <div className="relative z-10 flex gap-4">
                                  <div className="w-10 h-10 rounded-full bg-background-card border-2 border-border-main flex items-center justify-center text-text-main shadow-sm shrink-0">
                                    <User className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-bold text-text-main">{msg.residents?.full_name}</span>
                                      <span className="text-xs text-text-secondary/60 font-bold">{new Date(msg.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-background-card p-5 rounded-2xl border border-border-main shadow-sm text-left">
                                      <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Reply / Admin Message */}
                            {msg.reply ? (
                              <div className={`relative z-10 flex gap-4 mt-2 ${msg.message !== '[MANAGEMENT NOTICE]' ? 'ml-4 md:ml-8' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 border-2 ${isAdminMessage ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-primary/20 border-primary text-primary'}`}>
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-bold ${isAdminMessage ? 'text-secondary' : 'text-primary'}`}>You (Management)</span>
                                    <span className="text-xs text-text-secondary/60 font-bold">{msg.message === '[MANAGEMENT NOTICE]' ? 'Sent' : 'Responded'}</span>
                                  </div>
                                  <div className={`${isAdminMessage ? 'bg-secondary/10 border-secondary/20' : 'bg-primary/10 border-primary/20'} border p-5 rounded-2xl text-left shadow-sm`}>
                                    <p className="text-sm text-text-main font-medium leading-relaxed whitespace-pre-wrap">{msg.reply}</p>
                                  </div>
                                  
                                  {/* Allow Unsend for Admin too? Let's add it. */}
                                  <div className="flex justify-end mt-4 pt-4 border-t border-border-main/50 relative z-10">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); confirmUnsend(msg.id) }}
                                      className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-danger bg-danger/10 hover:bg-danger hover:text-white rounded-xl transition-all border border-danger/20 shadow-sm"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete Thread
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-4 ml-4 md:ml-8 mt-2 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-sm shrink-0">
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-background-card p-5 rounded-2xl border border-border-main shadow-sm">
                                    <textarea 
                                      placeholder={`Reply to ${msg.residents?.full_name}...`}
                                      className="w-full p-4 border border-border-main rounded-xl text-sm mb-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none min-h-[120px] transition-all bg-background-page shadow-inner"
                                      id={`reply-${msg.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex justify-end gap-3">
                                      <Button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          const replyText = document.getElementById(`reply-${msg.id}`).value;
                                          if (replyText) handleReplyMessage(msg.id, replyText);
                                        }}
                                        className="px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20"
                                      >
                                        Send Response
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <h1 className="text-3xl font-bold text-text-main">My Messages</h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              
              {/* Sort Toggle */}
              <button 
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center justify-center gap-2 bg-background-page px-4 py-2 rounded-xl text-xs font-bold text-text-main border border-border-main hover:bg-background-card transition-colors w-full sm:w-auto shadow-sm"
              >
                <ArrowUpDown className="w-3.5 h-3.5" /> {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>

              <div className="flex bg-background-page p-1 rounded-2xl shadow-inner w-full sm:w-auto border border-border-main overflow-x-auto hide-scrollbar">
                {['all', 'pending', 'replied', 'management'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setResidentFilter(f)}
                    className={`whitespace-nowrap flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${residentFilter === f ? 'bg-background-card text-primary shadow-sm border border-border-main' : 'text-text-secondary hover:text-text-main'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <Button onClick={() => setShowModal(true)} className="rounded-2xl shadow-lg shadow-primary/10 w-full sm:w-auto px-6 flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> New Message
              </Button>
            </div>
          </div>

          <div className="bg-background-card border border-border-main rounded-3xl overflow-hidden shadow-sm">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-24 bg-background-card">
                <div className="w-16 h-16 bg-background-page rounded-full flex items-center justify-center mx-auto mb-4 border border-border-main text-text-secondary/50">
                  <MailOpen className="w-8 h-8" />
                </div>
                <p className="text-text-secondary font-bold text-lg mb-2">No {residentFilter !== 'all' ? residentFilter : ''} messages found.</p>
                <p className="text-text-secondary/60 text-sm max-w-sm mx-auto mb-6">You don't have any messages matching this filter. Send a new message to the building management.</p>
                {residentFilter === 'all' && (
                  <Button variant="secondary" onClick={() => setShowModal(true)}>Compose Message</Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border-main">
                {filteredMessages.map(msg => {
                  const isExpanded = expandedMessageId === msg.id;
                  const isAdminMessage = msg.message === '[MANAGEMENT NOTICE]';
                  
                  return (
                    <div key={msg.id} className={`transition-colors duration-300 border-l-4 ${isAdminMessage ? 'border-l-secondary bg-secondary/[0.02]' : 'border-l-transparent'} ${isExpanded ? (isAdminMessage ? 'bg-secondary/10' : 'bg-primary/5') : 'hover:bg-background-page'}`}>
                      
                      {/* Email Row View */}
                      <div 
                        className="flex items-center justify-between p-4 sm:px-6 cursor-pointer"
                        onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          {/* Status Icon */}
                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${isAdminMessage ? 'bg-secondary/10 text-secondary border-secondary/20' : (msg.reply ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20')}`}>
                            {isAdminMessage ? <ShieldCheck className="w-5 h-5" /> : (msg.reply ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />)}
                          </div>
                          
                          {/* Content Snippet */}
                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-3 mb-0.5">
                              <span className="font-black text-text-main truncate text-base">{msg.subject}</span>
                              {isAdminMessage && <span className="shrink-0 text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-black uppercase tracking-widest hidden sm:inline-block border border-secondary/20">From Management</span>}
                              {!msg.reply && !isAdminMessage && <span className="shrink-0 text-[9px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-black uppercase tracking-widest hidden sm:inline-block border border-warning/20">Pending</span>}
                            </div>
                            <p className="text-sm text-text-secondary truncate font-medium flex items-center gap-2">
                              <span className="text-text-secondary/50"><Mail className="w-3.5 h-3.5 inline-block -mt-0.5" /></span>
                              {isAdminMessage ? msg.reply : msg.message}
                            </p>
                          </div>
                        </div>

                        {/* Right side (Date) */}
                        <div className="flex items-center gap-4 shrink-0 pl-4">
                          <span className="text-xs font-bold text-text-secondary/60 whitespace-nowrap">
                            {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Thread View */}
                      {isExpanded && (
                        <div className="p-6 border-t border-border-main bg-background-page/30 animate-[fadeInScale_0.2s_ease-out]">
                          <div className="max-w-4xl mx-auto">
                            
                            {/* Original Message */}
                            {msg.message !== '[MANAGEMENT NOTICE]' && (
                              <div className="mb-6 relative">
                                <div className="absolute top-6 left-5 bottom-[-24px] w-0.5 bg-border-main z-0" />
                                <div className="relative z-10 flex gap-4">
                                  <div className="w-10 h-10 rounded-full bg-background-card border-2 border-border-main flex items-center justify-center text-text-main shadow-sm shrink-0">
                                    <User className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-bold text-text-main">You</span>
                                      <span className="text-xs text-text-secondary/60 font-bold">{new Date(msg.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-background-card p-5 rounded-2xl border border-border-main shadow-sm text-left">
                                      <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Reply */}
                            {msg.reply ? (
                              <div className={`relative z-10 flex gap-4 mt-2 ${msg.message !== '[MANAGEMENT NOTICE]' ? 'ml-4 md:ml-8' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 border-2 ${isAdminMessage ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-primary/20 border-primary text-primary'}`}>
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-bold ${isAdminMessage ? 'text-secondary' : 'text-primary'}`}>Building Management</span>
                                    <span className="text-xs text-text-secondary/60 font-bold">{msg.message === '[MANAGEMENT NOTICE]' ? 'Sent' : 'Responded'}</span>
                                  </div>
                                  <div className={`${isAdminMessage ? 'bg-secondary/10 border-secondary/20' : 'bg-primary/10 border-primary/20'} border p-5 rounded-2xl text-left shadow-sm`}>
                                    <p className="text-sm text-text-main font-medium leading-relaxed whitespace-pre-wrap">{msg.reply}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end mt-4 pt-4 border-t border-border-main/50 relative z-10">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); confirmUnsend(msg.id) }}
                                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-danger bg-danger/10 hover:bg-danger hover:text-white rounded-xl transition-all border border-danger/20 shadow-sm"
                                >
                                  <Trash2 className="w-4 h-4" /> Unsend Message
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={role === 'admin' ? "New Message to Resident" : "New Message to Manager"}>
        <form onSubmit={handleSubmit}>
          {role === 'admin' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-main mb-2 text-left">Select Resident *</label>
              <select 
                value={selectedResidentId} 
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full px-4 py-3 border border-border-main rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm bg-background-card text-text-main appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Choose a resident...</option>
                {allResidents.map(r => (
                  <option key={r.id} value={r.id}>Apt {r.apartment_number || 'N/A'} - {r.full_name || 'Unknown'}</option>
                ))}
              </select>
            </div>
          )}
          <Input label="Subject" placeholder="e.g., Notice about parking" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text-main mb-2 text-left">Message Content *</label>
            <textarea 
              placeholder="Type your message here..."
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows="5" 
              className="w-full px-4 py-3 border border-border-main rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm bg-background-card text-text-main" 
              required
            ></textarea>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl">
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="px-6 rounded-xl">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={messageToDelete !== null} 
        onClose={() => setMessageToDelete(null)} 
        title="Delete Message Thread"
      >
        <div className="text-left">
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete this message? This action cannot be undone and will permanently remove the conversation.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setMessageToDelete(null)}>Cancel</Button>
            <Button 
              onClick={handleUnsendMessage} 
              disabled={isDeleting}
              className="bg-danger border-danger hover:bg-danger-dark text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Message'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
