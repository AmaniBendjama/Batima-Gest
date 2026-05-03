import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Phone, Plus, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('announcements')
  const [announcements, setAnnouncements] = useState([])
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [submittingAnn, setSubmittingAnn] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [deletingAnnId, setDeletingAnnId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    const [ann, resi] = await Promise.all([
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('residents').select('*').order('full_name', { ascending: true })
    ])
    setAnnouncements(ann.data || [])
    setResidents(resi.data || [])
    setLoading(false)
  }

  const handlePostAnnouncement = async () => {
    if (!annTitle || !annContent) return
    setSubmittingAnn(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('announcements').insert([{ title: annTitle, content: annContent, created_by: user.id }])
      setShowAnnouncementModal(false)
      setAnnTitle('')
      setAnnContent('')
      fetchAllData()
    }
    setSubmittingAnn(false)
  }

  const handleDeleteUser = async (userId) => {
    if (userId === null || userId === undefined) return
    setIsDeleting(true)
    try {
      const { data, error } = await supabase
        .from('residents')
        .delete()
        .eq('id', userId)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('No record found or you do not have permission to delete it.')
      }
      
      setResidents(prev => prev.filter(r => r.id != userId))
      setDeletingUserId(null)
    } catch (error) {
      console.error('Error deleting user:', error.message)
      alert(error.message || 'Failed to delete user record.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteAnnouncement = async (annId) => {
    if (annId === null || annId === undefined) return
    setIsDeleting(true)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', annId)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('No announcement found or you do not have permission to delete it.')
      }
      
      setAnnouncements(prev => prev.filter(a => a.id != annId))
      setDeletingAnnId(null)
    } catch (error) {
      console.error('Error deleting announcement:', error.message)
      alert(error.message || 'Failed to delete announcement.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading && announcements.length === 0) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-left text-text-main">Admin Control Center</h1>
      
      <div className="flex gap-2 mb-6 border-b border-border-main overflow-x-auto">
        <button onClick={() => setActiveTab('announcements')} className={`px-4 py-2 whitespace-nowrap transition ${activeTab === 'announcements' ? 'border-b-2 border-primary text-primary font-bold' : 'text-text-secondary'}`}>Announcements</button>
        <button onClick={() => setActiveTab('residents')} className={`px-4 py-2 whitespace-nowrap transition ${activeTab === 'residents' ? 'border-b-2 border-primary text-primary font-bold' : 'text-text-secondary'}`}>Residents List</button>
      </div>

      {activeTab === 'announcements' && (
        <div className="text-left">
          <Button onClick={() => setShowAnnouncementModal(true)} className="mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Post Announcement
          </Button>
          <div className="space-y-4">
            {announcements.map(ann => (
              <Card key={ann.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-text-main mb-1">{ann.title}</h3>
                    <p className="text-text-secondary">{ann.content}</p>
                    <p className="text-xs text-text-secondary/40 mt-3">{new Date(ann.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => setDeletingAnnId(ann.id)}
                    className="p-2 text-text-secondary/40 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors ml-4"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'residents' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {residents.map(res => (
            <Card key={res.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-text-main">{res.full_name}</h3>
                  <p className="text-primary font-semibold text-sm">Apt {res.apartment_number}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {res.email}
                    </p>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {res.phone}
                    </p>
                  </div>

                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={res.role} />
                  {res.role !== 'admin' && (
                    <button 
                      onClick={() => setDeletingUserId(res.id)}
                      className="p-2 text-text-secondary/40 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      title="Delete Resident Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <Modal 
        isOpen={deletingUserId !== null} 
        onClose={() => setDeletingUserId(null)} 
        title="Delete Resident Record"
      >
        <div className="text-left">
          <p className="text-text-secondary mb-6">
            Are you sure you want to remove this resident from the database? This will delete their profile information, but note that their login account remains in the system.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeletingUserId(null)}>Cancel</Button>
            <Button 
              onClick={() => handleDeleteUser(deletingUserId)} 
              disabled={isDeleting}
              className="bg-danger border-danger hover:bg-danger-dark text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Record'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Announcement Confirmation Modal */}
      <Modal 
        isOpen={deletingAnnId !== null} 
        onClose={() => setDeletingAnnId(null)} 
        title="Delete Announcement"
      >
        <div className="text-left">
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete this announcement? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeletingAnnId(null)}>Cancel</Button>
            <Button 
              onClick={() => handleDeleteAnnouncement(deletingAnnId)} 
              disabled={isDeleting}
              className="bg-danger border-danger hover:bg-danger-dark text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Announcement'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAnnouncementModal} onClose={() => setShowAnnouncementModal(false)} title="New Announcement">
        <form onSubmit={(e) => { e.preventDefault(); handlePostAnnouncement(); }} className="text-left">
          <Input label="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-main mb-1">Content *</label>
            <textarea 
              value={annContent} 
              onChange={(e) => setAnnContent(e.target.value)} 
              rows="4" 
              className="w-full px-3 py-2 border border-border-main rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background-card" 
              required
            ></textarea>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submittingAnn}>
              {submittingAnn ? 'Posting...' : 'Post'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowAnnouncementModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
