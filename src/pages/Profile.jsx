import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Pencil, Camera, ShieldCheck, CalendarDays, KeyRound, User, Mail, Phone, Home, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Profile() {
  const [resident, setResident] = useState(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [apartment, setApartment] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('residents').select('*').eq('id', user.id).single()
      
      if (data) {
        setResident(data)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setApartment(data.apartment_number || '')
      } else {
        setFullName(user.user_metadata?.full_name || '')
        setPhone(user.user_metadata?.phone || '')
        setApartment(user.user_metadata?.apartment_number || '')
        setResident({
          id: user.id,
          email: user.email,
          created_at: user.created_at
        })
      }
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('residents').upsert({ 
      id: resident.id,
      email: resident.email,
      full_name: fullName, 
      phone: phone,
      apartment_number: apartment,
      role: resident.role || 'resident'
    })
    if (error) setMessage({ text: 'Error saving: ' + error.message, type: 'error' })
    else {
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
      fetchProfile()
    }
    setSaving(false)
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handlePasswordChange = async () => {
    if (!newPassword) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setMessage({ text: 'Error updating password: ' + error.message, type: 'error' })
    else {
      setMessage({ text: 'Password updated successfully!', type: 'success' })
      setNewPassword('')
    }
    setSaving(false)
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${resident.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const { error: updateError } = await supabase.from('residents').update({ avatar_url: publicUrl }).eq('id', resident.id)
      if (updateError) throw updateError

      setMessage({ text: 'Avatar updated successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
      await fetchProfile()
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ text: 'Upload failed.', type: 'error' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!resident?.avatar_url) return
    
    try {
      setUploading(true)
      
      const { error: updateError } = await supabase.from('residents')
        .update({ avatar_url: null })
        .eq('id', resident.id)

      if (updateError) throw updateError

      setMessage({ text: 'Profile picture removed.', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
      setShowDeleteModal(false)
      await fetchProfile()
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ text: 'Failed to remove picture.', type: 'error' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8 animate-[fadeInScale_0.4s_ease-out]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-left">
          <span className="label-tag mb-3">Settings</span>
          <h1 className="text-4xl font-black text-text-main tracking-tight">Your Profile</h1>
          <p className="text-text-secondary mt-2 font-medium">Manage your personal information and security preferences.</p>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-xl text-center font-bold shadow-sm animate-[fadeInScale_0.3s_ease-out] ${message.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
            {message.text}
          </div>
        )}

        {/* Top Profile Banner */}
        <div className="bg-background-card border border-border-main rounded-3xl overflow-hidden mb-8 shadow-sm">
          {/* Cover Photo Area */}
          <div className="h-32 bg-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle, var(--color-primary) 1px, transparent 1px)', backgroundSize:'16px 16px'}} />
          </div>
          
          <div className="px-6 md:px-10 pb-8 relative text-left">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
              
              {/* Avatar & Controls */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl scale-100 group-hover:scale-110 transition-transform duration-500" />
                  <div className="w-32 h-32 rounded-3xl bg-background-page border-4 border-background-card shadow-xl overflow-hidden relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                        <LoadingSpinner />
                      </div>
                    )}
                    {resident?.avatar_url ? (
                      <img src={resident.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary text-5xl font-black uppercase">
                        {fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons below Avatar */}
                <div className="flex gap-2 mt-1">
                  <label className={`bg-background-page border border-border-main text-text-main px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold shadow-sm ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-background-card hover:border-primary/50'}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    <Camera className="w-3.5 h-3.5" /> Upload
                  </label>
                  
                  {resident?.avatar_url && (
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      disabled={uploading}
                      className="bg-danger/10 text-danger border border-danger/20 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-danger hover:text-white transition-colors flex items-center gap-2 text-xs font-bold shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Name & Role */}
              <div className="flex-1 pb-1">
                <h2 className="text-3xl font-black text-text-main tracking-tight">{fullName || 'Resident'}</h2>
                <div className="flex items-center gap-2 mt-2 text-text-secondary font-bold">
                  <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-lg text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" /> {resident?.role === 'admin' ? 'Administrator' : 'Resident'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-background-page px-3 py-1 rounded-lg text-xs">
                    <Home className="w-3.5 h-3.5" /> Apt {apartment || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3 pb-1 w-full md:w-auto">
                <div className="bg-background-page border border-border-main px-5 py-3 rounded-2xl flex-1 md:flex-none text-center md:text-right">
                  <p className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest mb-1">Joined</p>
                  <p className="font-bold text-text-main text-sm flex items-center justify-center md:justify-end gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-primary" />
                    {new Date(resident?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 text-left">
          
          {/* Personal Information */}
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-main">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-text-main">Personal Information</h3>
                <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-wider">Update your details</p>
              </div>
            </div>

            <div className="space-y-5">
              <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} icon={<User className="w-4 h-4 text-text-secondary/50" />} />
              <div className="grid sm:grid-cols-2 gap-5">
                <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone className="w-4 h-4 text-text-secondary/50" />} />
                <Input label="Apartment Number" value={apartment} onChange={(e) => setApartment(e.target.value)} icon={<Home className="w-4 h-4 text-text-secondary/50" />} />
              </div>
              <Input label="Email Address" type="email" value={resident?.email} disabled icon={<Mail className="w-4 h-4 text-text-secondary/50" />} />
              
              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving} className="w-full shadow-md hover:shadow-lg py-3.5 rounded-2xl text-sm uppercase tracking-wider font-bold">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Security */}
          <div className="space-y-8">
            <Card>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-main">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-main">Security Settings</h3>
                  <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-wider">Manage your password</p>
                </div>
              </div>

              <div className="space-y-5">
                <Input 
                  label="New Password" 
                  type="password" 
                  placeholder="Leave blank to keep current" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  icon={<KeyRound className="w-4 h-4 text-text-secondary/50" />}
                />
                <div className="pt-4">
                  <Button variant="secondary" onClick={handlePasswordChange} disabled={saving || !newPassword} className="w-full py-3.5 rounded-2xl text-sm uppercase tracking-wider font-bold">
                    Update Password
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Help Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24 text-primary" />
              </div>
              <h4 className="font-black text-primary mb-2 relative z-10">Need Assistance?</h4>
              <p className="text-sm text-text-secondary font-medium relative z-10 leading-relaxed">
                If you need to change your registered email address or require administrative access, please contact the building management directly through the Messages tab.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeInScale_0.2s_ease-out]">
          <div className="bg-background-card border border-border-main p-6 rounded-3xl shadow-2xl max-w-sm w-full text-left">
            <h3 className="text-xl font-black text-text-main mb-2">Remove Picture?</h3>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">Are you sure you want to delete your profile picture? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleAvatarDelete} disabled={uploading} className="bg-danger text-white border-danger hover:bg-danger-dark shadow-md">
                {uploading ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
