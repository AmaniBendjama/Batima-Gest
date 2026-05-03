import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Download, Plus, Edit2, Trash2, X, File, Search, 
  AlertCircle, Loader2, FileText, Image as ImageIcon, 
  FileCode, FileArchive, Filter, MoreVertical, Building2, CheckCircle2, Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

// Helper for file icons
const getFileIcon = (type) => {
  const t = type?.toLowerCase() || ''
  if (t.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />
  if (t.includes('doc')) return <FileText className="w-6 h-6 text-blue-500" />
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].some(ext => t.includes(ext))) return <ImageIcon className="w-6 h-6 text-emerald-500" />
  if (['zip', 'rar', '7z'].some(ext => t.includes(ext))) return <FileArchive className="w-6 h-6 text-amber-500" />
  return <File className="w-6 h-6 text-primary" />
}

const RESIDENT_CATEGORIES = [
  'Property Deed (Acte de propriété)',
  'Residence Certificate (Certificat de résidence)',
  'Payment Receipt (Quittance de loyer/charges)',
  'Home Insurance (Assurance Habitation)',
  'Others (Autres)'
]

const MANAGER_CATEGORIES = [
  'Building Rules (Règlement de copropriété)',
  'Technical Documents (Documents Techniques)',
  'Financial Reports (Rapports Financiers)',
  'Building Insurance (Assurance Immeuble)',
  'Others (Autres)'
]

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('resident')
  const [userRole, setUserRole] = useState('resident')
  const [currentUserId, setCurrentUserId] = useState(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  
  // Delete Modal states
  const [docToDelete, setDocToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [docRole, setDocRole] = useState('resident')
  const [category, setCategory] = useState(RESIDENT_CATEGORIES[0])
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchUserRole()
  }, [])

  // Derive preview URL from selected file with automatic cleanup
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
      const { data } = await supabase
        .from('residents')
        .select('role')
        .eq('id', user.id)
        .single()
      if (data) {
        const role = data.role.toLowerCase()
        setUserRole(role)
        fetchDocuments(user.id, role)
      }
    }
  }

  const fetchDocuments = async (userId, role) => {
    setLoading(true)
    // Admins see all docs; residents see their own + manager docs (via RLS)
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching documents:', error)
    } else {
      setDocuments(data || [])
    }
    setLoading(false)
  }

  const openModal = (doc = null) => {
    setEditingDoc(doc)
    setTitle(doc ? doc.title : '')
    
    // Drive docRole from the active tab so uploads land in the correct section
    const initialRole = doc ? doc.doc_role : activeTab
    setDocRole(initialRole)
    
    setCategory(doc ? doc.category : (initialRole === 'manager' ? MANAGER_CATEGORIES[0] : RESIDENT_CATEGORIES[0]))
    setFile(null)
    setError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDoc(null)
    setTitle('')
    setDocRole(userRole === 'admin' ? 'manager' : 'resident')
    setCategory(userRole === 'admin' ? MANAGER_CATEGORIES[0] : RESIDENT_CATEGORIES[0])
    setFile(null) // triggers the useEffect to clear previewUrl
    setError(null)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]) // useEffect will handle previewUrl
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let fileUrl = editingDoc?.file_url
      let fileType = editingDoc?.file_type

      // 1. Upload file if selected
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`
        fileType = fileExt.toUpperCase()

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)
        
        fileUrl = publicUrl
        
        // Auto-set title to filename if not already set (e.g. from removing the input)
        if (!title) setTitle(file.name)
      }

      if (!fileUrl && !editingDoc) {
        throw new Error('Please select a file to upload.')
      }

      // 2. Update or Insert database record
    if (editingDoc) {
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          title: title || file?.name || editingDoc.title, 
          category,
          doc_role: docRole,
          file_url: fileUrl,
          file_type: fileType 
        })
        .eq('id', editingDoc.id)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from('documents')
        .insert([{ 
          title: title || file?.name || 'Untitled', 
          category,
          doc_role: docRole,
          file_url: fileUrl, 
          file_type: fileType,
          resident_id: currentUserId
        }])

      if (insertError) throw insertError
    }

      await fetchDocuments(currentUserId, userRole)
      closeModal()
    } catch (err) {
      console.error('Submission error:', err)
      setError(err.message || 'An error occurred during submission.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (id) => {
    setDocToDelete(id)
  }

  const handleDeleteDoc = async () => {
    if (!docToDelete) return
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docToDelete)

      if (error) throw error
      setDocuments(prev => prev.filter(doc => doc.id !== docToDelete))
      setDocToDelete(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete document.')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab   = doc.doc_role === activeTab

    if (activeTab === 'resident') {
      // Everyone only sees their own resident docs — private to each user
      return matchesSearch && matchesTab && doc.resident_id === currentUserId
    }

    return matchesSearch && matchesTab
  })

  if (loading && documents.length === 0) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-background-page relative overflow-hidden pb-20">
      {/* Decorative ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 pt-10 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
              Digital Vault
            </div>
            <h1 className="text-5xl font-black text-text-main tracking-tighter leading-none">
              Documents
            </h1>
            <p className="text-text-secondary mt-3 text-lg font-medium opacity-70 max-w-md">
              Securely access and manage residency files and official building management records.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Tabs - Glassmorphism style */}
            <div className="flex bg-background-card/50 backdrop-blur-md border border-border-main p-1.5 rounded-2xl shadow-sm">
              <button
                onClick={() => setActiveTab('resident')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'resident' 
                    ? 'bg-dark-bg text-white shadow-xl' 
                    : 'text-text-secondary hover:text-text-main hover:bg-background-page'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'resident' ? 'text-primary-light' : ''}`} />
                Resident Files
              </button>
              {(userRole === 'admin' || userRole === 'super_admin') && (
                <button
                  onClick={() => setActiveTab('manager')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'manager' 
                      ? 'bg-dark-bg text-white shadow-xl' 
                      : 'text-text-secondary hover:text-text-main hover:bg-background-page'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === 'manager' ? 'text-primary-light' : ''}`} />
                  Building Manager
                </button>
              )}
            </div>

            {/* Residents can only add docs to their own tab */}
            {(activeTab === 'resident' || userRole === 'admin' || userRole === 'super_admin') && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal()}
                className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
              >
                <Plus className="w-5 h-5" />
                Add New
              </motion.button>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder={`Search in ${activeTab === 'resident' ? 'Resident Files' : 'Building Manager'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background-card/50 backdrop-blur-sm border-2 border-border-main rounded-2xl text-sm text-text-main focus:outline-none focus:border-primary/50 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary/60 uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" />
            Showing {filteredDocuments.length} documents
          </div>
        </div>

        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredDocuments.map((doc, idx) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="group relative bg-background-card/40 backdrop-blur-md border border-border-main rounded-[2rem] p-7 h-full flex flex-col justify-between transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-border-main flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                        {getFileIcon(doc.file_type)}
                      </div>
                      {/* Only show edit/delete if the user owns this doc or is an admin */}
                      {(doc.resident_id === currentUserId || userRole === 'admin' || userRole === 'super_admin') && (
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => openModal(doc)}
                            className="p-2.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(doc.id)}
                            className="p-2.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                        {doc.category || 'General'}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl text-text-main leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                      {doc.title}
                    </h3>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary/40 uppercase tracking-tighter">
                        <FileCode className="w-3.5 h-3.5" />
                        {doc.file_type || 'UNKN'}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-border-main" />
                      <div className="text-xs font-bold text-text-secondary/40 uppercase tracking-tighter">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-primary/20"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </a>
                      <a 
                        href={doc.file_url} 
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-background-page border border-border-main rounded-2xl text-text-main font-bold text-sm transition-all hover:bg-background-card hover:shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredDocuments.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full py-20"
            >
              <div className="relative max-w-2xl mx-auto p-12 bg-background-card/30 backdrop-blur-xl border-2 border-dashed border-border-main rounded-[3rem] text-center overflow-hidden group">
                {/* Background decorative orbs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-700" />

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex w-24 h-24 rounded-[2rem] bg-background-page shadow-inner items-center justify-center mb-8 relative z-10"
                >
                  <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <FileText className="w-10 h-10 text-text-secondary/30 relative z-10" />
                </motion.div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-text-main mb-3 tracking-tight">
                    Empty Vault
                  </h3>
                  <p className="text-text-secondary font-medium max-w-sm mx-auto mb-10 leading-relaxed text-sm">
                    {searchTerm 
                      ? `We couldn't find any documents matching "${searchTerm}" in the ${activeTab === 'resident' ? 'Resident Files' : 'Building Manager'} section.`
                      : `Your digital vault for ${activeTab === 'resident' ? 'Resident Files' : 'Building Management'} is currently empty.`}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="px-8 py-3.5 bg-background-page border border-border-main rounded-2xl font-black text-xs uppercase tracking-widest text-text-main hover:bg-background-card transition-all"
                      >
                        Clear Search
                      </button>
                    )}
                    <button 
                      onClick={() => openModal()}
                      className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Upload First Document
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal - Redesigned with glassmorphism */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-dark-bg/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-xl bg-background-card border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col"
            >
              <div className="px-10 py-8 border-b border-border-main flex justify-between items-center bg-background-card/50 backdrop-blur-sm">
                <div>
                  <h2 className="text-3xl font-black text-text-main tracking-tight">
                    {editingDoc ? 'Edit Document' : 'Add New Document'}
                  </h2>
                  <p className="text-text-secondary text-sm mt-1">
                    {editingDoc ? 'Update the details below' : 'Upload a new file to the vault'}
                  </p>
                </div>
                <button onClick={closeModal} className="p-3 hover:bg-background-page rounded-2xl transition-colors text-text-secondary hover:text-text-main">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 rounded-b-[2.5rem]">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-danger/10 border border-danger/20 rounded-2xl p-4 flex gap-4 items-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-danger" />
                    </div>
                    <p className="text-danger text-sm font-bold leading-tight">{error}</p>
                  </motion.div>
                )}
                
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                    Document Name *
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document name"
                    className="w-full px-5 py-4 bg-background-page border-2 border-border-main rounded-2xl text-text-main font-bold focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                      Document Type
                    </label>
                    <div className="relative">
                      <select 
                        value={docRole}
                        disabled={userRole === 'resident'}
                        onChange={(e) => {
                          const newRole = e.target.value
                          setDocRole(newRole)
                          setCategory(newRole === 'manager' ? MANAGER_CATEGORIES[0] : RESIDENT_CATEGORIES[0])
                        }}
                        className="w-full px-5 py-4 bg-background-page border-2 border-border-main rounded-2xl text-text-main font-bold appearance-none focus:outline-none focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="resident">Resident Related</option>
                        <option value="manager">Building Manager</option>
                      </select>
                      <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                      Category
                    </label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-4 bg-background-page border-2 border-border-main rounded-2xl text-text-main font-bold appearance-none focus:outline-none focus:border-primary transition-all"
                      >
                        {(docRole === 'manager' ? MANAGER_CATEGORIES : RESIDENT_CATEGORIES).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                    </div>
                  </div>
                </div>


                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                    {editingDoc ? 'Replace File (Optional)' : 'Select File'}
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`group cursor-pointer border-2 border-dashed border-border-main hover:border-primary/50 hover:bg-primary/5 rounded-3xl p-6 text-center transition-all flex flex-col items-center gap-3 ${file ? 'border-primary/50 bg-primary/5' : ''}`}
                  >
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-sm ${file ? 'bg-primary text-white scale-110 shadow-primary/30' : 'bg-background-page text-text-secondary/30 group-hover:text-primary group-hover:scale-110'}`}>
                      {file ? <CheckCircle2 className="w-8 h-8" /> : <Download className="w-8 h-8 rotate-180" />}
                    </div>
                    <div>
                      <p className="font-black text-text-main text-lg">
                        {file ? file.name : 'Click to select file'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1 font-medium">
                        PDF, DOCX, Images, and more
                      </p>
                    </div>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preview button */}
                {file && previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-background-page border-2 border-primary/20 text-primary font-bold text-sm rounded-2xl hover:bg-primary/5 transition-all"
                  >
                    <FileCode className="w-4 h-4" />
                    Preview: {file.name}
                  </a>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-8 py-4 bg-background-page border-2 border-border-main rounded-2xl font-black text-text-main hover:bg-background-card transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {editingDoc ? 'SAVING...' : 'UPLOADING...'}
                      </>
                    ) : (
                      editingDoc ? 'SAVE CHANGES' : 'UPLOAD DOCUMENT'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={docToDelete !== null} 
        onClose={() => setDocToDelete(null)} 
        title="Delete Document"
      >
        <div className="text-left">
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete this document? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDocToDelete(null)}>Cancel</Button>
            <Button 
              onClick={handleDeleteDoc} 
              disabled={isDeleting}
              className="bg-danger border-danger hover:bg-danger-dark text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Document'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
