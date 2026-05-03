import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Wrench, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const selectClass = "w-full px-4 py-2.5 border border-border-main rounded-xl text-sm bg-background-card text-text-main outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
const textareaClass = "w-full px-4 py-3 border border-border-main rounded-xl text-sm bg-background-card text-text-main outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"

export default function Requests() {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle]         = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority]   = useState('medium')
  const [submitting, setSubmitting] = useState(false)
  const [role, setRole]           = useState('resident')
  const [requestToDelete, setRequestToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('residents').select('role').eq('id', user.id).maybeSingle()
      const userRole = profile?.role || 'resident'
      setRole(userRole)

      let query
      if (userRole === 'admin') {
        query = supabase.from('service_requests').select('*, residents!left(full_name, apartment_number)').order('created_at', { ascending: false })
      } else {
        query = supabase.from('service_requests').select('*').eq('resident_id', user.id).order('created_at', { ascending: false })
      }
      const { data } = await query
      setRequests(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('service_requests').insert([{ resident_id: user.id, title, description, priority, status: 'open' }])
      setShowModal(false); setTitle(''); setDescription('')
      fetchData()
    }
    setSubmitting(false)
  }

  const handleUpdateStatus = async (id, status) => {
    await supabase.from('service_requests').update({ status }).eq('id', id)
    fetchData()
  }

  const confirmDeleteRequest = (id) => {
    setRequestToDelete(id)
  }

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    
    try {
      const { error } = await supabase.from('service_requests').delete().eq('id', requestToDelete);
      if (error) throw error;
      setRequests(prev => prev.filter(req => req.id !== requestToDelete));
      setRequestToDelete(null);
    } catch (err) {
      console.error('Error deleting request:', err);
      alert('Failed to delete request.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <span className="label-tag mb-2 inline-block">{role === 'admin' ? 'Admin' : 'Resident'}</span>
          <h1 className="text-3xl font-black text-text-main">{role === 'admin' ? 'Service Requests' : 'My Requests'}</h1>
          <p className="text-text-secondary mt-1 text-sm">Submit and track building maintenance issues</p>
        </div>
        {role === 'resident' && (
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Request
          </Button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-background-card rounded-2xl border border-border-main">
            <Wrench className="w-12 h-12 text-text-secondary mx-auto mb-4" strokeWidth={1.5} />
            <p className="font-semibold text-text-main">No service requests</p>
            <p className="text-text-secondary text-sm mt-1">
              {role === 'resident' ? 'Submit a request when you need help' : 'No pending requests from residents'}
            </p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-background-card rounded-2xl border border-border-main p-5 hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-text-main">{req.title}</h3>
                    <StatusBadge status={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                  {role === 'admin' && (
                    <p className="text-xs text-primary font-semibold mb-2">
                      {req.residents?.full_name} · Apt {req.residents?.apartment_number}
                    </p>
                  )}
                  <p className="text-text-secondary text-sm leading-relaxed">{req.description}</p>
                  <p className="text-xs text-text-secondary/50 mt-2 font-medium uppercase tracking-wider">
                    Submitted: {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-end sm:items-center">
                  {role === 'admin' && (
                    <>
                      {req.status === 'open' && (
                        <Button variant="secondary" className="text-xs py-1.5 px-3" onClick={() => handleUpdateStatus(req.id, 'in_progress')}>
                          Start
                        </Button>
                      )}
                      {(req.status === 'open' || req.status === 'in_progress') && (
                        <Button variant="primary" className="text-xs py-1.5 px-3" onClick={() => handleUpdateStatus(req.id, 'resolved')}>
                          Resolve
                        </Button>
                      )}
                    </>
                  )}
                  {(role === 'admin' || (role === 'resident' && req.status === 'open')) && (
                    <button 
                      onClick={() => confirmDeleteRequest(req.id)}
                      className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-2"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Service Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" placeholder="e.g., Leaky faucet in kitchen" value={title} onChange={e => setTitle(e.target.value)} required />
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Description <span className="text-danger">*</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="4"
              placeholder="Describe the issue in detail…" className={textareaClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className={selectClass}>
              <option value="low">Low — General inquiry</option>
              <option value="medium">Medium — Normal maintenance</option>
              <option value="high">High — Urgent repair</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting} className="flex-1 py-3">
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="px-5">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={requestToDelete !== null} 
        onClose={() => setRequestToDelete(null)} 
        title="Delete Service Request"
      >
        <div className="text-left">
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete this service request? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setRequestToDelete(null)}>Cancel</Button>
            <Button 
              onClick={handleDeleteRequest} 
              disabled={isDeleting}
              className="bg-danger border-danger hover:bg-danger-dark text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
