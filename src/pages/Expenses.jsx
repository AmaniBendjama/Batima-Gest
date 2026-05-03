import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Expenses() {
  const [expenses, setExpenses]             = useState([])
  const [residents, setResidents]           = useState([])
  const [loading, setLoading]               = useState(true)
  const [showModal, setShowModal]           = useState(false)
  const [role, setRole]                     = useState('resident')
  const [selectedResidents, setSelectedResidents] = useState([])
  const [amount, setAmount]                 = useState('')
  const [dueDate, setDueDate]               = useState('')
  const [submitting, setSubmitting]         = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [isDeleting, setIsDeleting]         = useState(false)

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

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
        query = supabase.from('expenses').select('*, residents!left(full_name, apartment_number)').order('due_date', { ascending: false })
      } else {
        query = supabase.from('expenses').select('*').eq('resident_id', user.id).order('due_date', { ascending: false })
      }

      const { data } = await query
      setExpenses(data || [])

      if (userRole === 'admin') {
        const { data: resiData } = await supabase.from('residents').select('id, full_name, apartment_number, role').neq('role', 'admin').order('full_name')
        setResidents(resiData || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleResidentSelection = (id) => setSelectedResidents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const selectAllResidents = () => setSelectedResidents(selectedResidents.length === residents.length ? [] : residents.map(r => r.id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedResidents.length === 0) return alert('Please select at least one resident.')
    setSubmitting(true)
    // Derive the period/month automatically from the due date
    const d = new Date(dueDate)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-01`
    
    try {
      const bulkData = selectedResidents.map(residentId => ({
        resident_id: residentId, amount: parseFloat(amount), month: monthStr, due_date: dueDate, status: 'pending'
      }))
      await supabase.from('expenses').insert(bulkData)
      setShowModal(false); setAmount(''); setSelectedResidents([])
      fetchData()
    } catch (err) {
      console.error('Error issuing fee:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    await supabase.from('expenses').update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null }).eq('id', id)
    fetchData()
  }

  const confirmDelete = (id) => {
    setExpenseToDelete(id)
  }

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return
    setIsDeleting(true)

    try {
      await supabase.from('expenses').delete().eq('id', expenseToDelete)
      fetchData()
      setExpenseToDelete(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete expense.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <span className="label-tag mb-2 inline-block">{role === 'admin' ? 'Admin' : 'Resident'}</span>
          <h1 className="text-3xl font-black text-text-main">{role === 'admin' ? 'Manage Condo Fees' : 'My Condo Fees'}</h1>
          <p className="text-text-secondary mt-1 text-sm">{role === 'admin' ? 'Issue and track all resident fees' : 'Track your monthly charges and payment status'}</p>
        </div>
        {role === 'admin' && (
          <Button onClick={() => { setShowModal(true); setSelectedResidents([]) }} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Issue Fee
          </Button>
        )}
      </div>

      {/* Fee list */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-16 bg-background-card rounded-2xl border border-border-main">
            <CreditCard className="w-12 h-12 text-text-secondary mx-auto mb-4" strokeWidth={1.5} />
            <p className="font-semibold text-text-main">No fees recorded</p>
            <p className="text-text-secondary text-sm mt-1">Fees issued by management will appear here</p>
          </div>
        ) : (
          expenses.map(exp => (
            <div key={exp.id} className="bg-background-card rounded-2xl border border-border-main p-5 hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-text-main">
                      {new Date(exp.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                    {role === 'admin' && (
                      <span className="text-xs bg-background-page text-text-secondary px-2 py-0.5 rounded-md border border-border-main font-medium">
                        {exp.residents?.full_name} · Apt {exp.residents?.apartment_number}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">Due: {new Date(exp.due_date).toLocaleDateString()}</p>
                  {exp.paid_at && <p className="text-xs text-success font-semibold mt-1">✓ Paid on {new Date(exp.paid_at).toLocaleDateString()}</p>}
                </div>

                <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">{Number(exp.amount).toLocaleString()} DA</p>
                    <StatusBadge status={exp.status} />
                  </div>
                  {role === 'admin' && (
                    <div className="flex gap-2 items-center">
                      {exp.status === 'pending'
                        ? <Button variant="primary" className="text-xs py-1.5 px-3" onClick={() => handleUpdateStatus(exp.id, 'paid')}>Mark Paid</Button>
                        : <Button variant="secondary" className="text-xs py-1.5 px-3" onClick={() => handleUpdateStatus(exp.id, 'pending')}>Revert</Button>
                      }
                      <button 
                        onClick={() => confirmDelete(exp.id)}
                        className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-1"
                        title="Delete Fee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Issue Fee Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Issue New Fee">
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-text-main">Select Residents</label>
              <button type="button" onClick={selectAllResidents} className="text-xs text-primary font-bold hover:underline">
                {selectedResidents.length === residents.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto border border-border-main rounded-xl p-2 bg-background-page space-y-1">
              {residents.map(r => (
                <label key={r.id} className="flex items-center gap-3 p-2.5 hover:bg-background-card rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedResidents.includes(r.id)}
                    onChange={() => toggleResidentSelection(r.id)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm font-medium text-text-main">
                    {r.full_name} <span className="text-text-secondary text-xs font-normal">· Apt {r.apartment_number}</span>
                  </span>
                </label>
              ))}
              {residents.length === 0 && <p className="text-xs text-text-secondary text-center py-4">No residents found.</p>}
            </div>
            <p className="text-xs text-text-secondary mt-1">{selectedResidents.length} selected</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Amount (DA)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting || selectedResidents.length === 0} className="flex-1 py-3 font-bold">
              {submitting ? 'Issuing…' : `Issue to ${selectedResidents.length} Resident${selectedResidents.length !== 1 ? 's' : ''}`}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="px-5">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={expenseToDelete !== null} 
        onClose={() => setExpenseToDelete(null)} 
        title="Delete Condo Fee"
      >
        <div className="text-left">
          <p className="text-text-secondary mb-6">
            Are you sure you want to permanently delete this condo fee? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setExpenseToDelete(null)}>Cancel</Button>
            <Button 
              onClick={handleDeleteExpense} 
              disabled={isDeleting}
              className="bg-danger border-danger hover:bg-danger-dark text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Fee'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
