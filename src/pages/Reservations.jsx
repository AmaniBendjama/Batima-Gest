import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Reservations() {
  const [allReservations, setAllReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState('BBQ Area')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlot, setTimeSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [role, setRole] = useState('resident')
  const [currentUser, setCurrentUser] = useState(null)
  
  const [reservationToDelete, setReservationToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const timeSlots = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "18:00 - 20:00",
    "20:00 - 22:00"
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUser(user)

      const { data: profile } = await supabase.from('residents')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const userRole = profile?.role || 'resident'
      setRole(userRole)

      let query = supabase.from('reservations').select(userRole === 'admin' ? '*, residents!left(full_name, apartment_number)' : '*').order('date', { ascending: true })
      
      const { data } = await query
      
      setAllReservations(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const { error } = await supabase.from('reservations').insert([{
      resident_id: currentUser.id,
      area_name: selectedArea,
      date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
      time_slot: timeSlot,
      status: 'pending'
    }])
    
    setSubmitting(false)

    if (error) {
      console.error("Insert error:", error)
      alert("Failed to submit reservation. Error: " + error.message)
      return
    }
    
    setShowModal(false)
    fetchData()
  }

  const handleUpdateStatus = async (id, status) => {
    await supabase.from('reservations').update({ status }).eq('id', id)
    fetchData()
  }

  const confirmDelete = (id) => {
    setReservationToDelete(id)
  }

  const handleDelete = async () => {
    if (!reservationToDelete) return
    setIsDeleting(true)

    try {
      await supabase.from('reservations').delete().eq('id', reservationToDelete)
      fetchData()
      setReservationToDelete(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete reservation.')
    } finally {
      setIsDeleting(false)
    }
  }

  // CALENDAR LOGIC
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date()
  today.setHours(0,0,0,0)
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth())
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth())
  
  const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const getDayReservations = (day) => {
    if (!day) return []
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return allReservations.filter(res => res.date === dateStr && res.area_name === selectedArea && res.status !== 'cancelled')
  }

  const isPast = (day) => {
    if (!day) return false
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    return d < today
  }

  const isToday = (day) => {
    if (!day) return false
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    return d.getTime() === today.getTime()
  }

  const getAvailableSlots = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    const takenSlots = allReservations
      .filter(res => res.date === dateStr && res.area_name === selectedArea && res.status !== 'cancelled')
      .map(res => res.time_slot)
    
    return timeSlots.filter(slot => !takenSlots.includes(slot))
  }

  const availableSlots = getAvailableSlots()

  useEffect(() => {
    if (showModal) {
      if (availableSlots.length > 0) {
        setTimeSlot(availableSlots[0])
      } else {
        setTimeSlot('')
      }
    }
  }, [showModal, selectedDate, selectedArea])

  if (loading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-left">
          <div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight">Availability Calendar</h1>
            <p className="text-text-secondary font-medium mt-1">Select an area and pick a date to book</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedArea} 
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-4 py-3 border border-border-main rounded-2xl bg-background-card font-bold text-sm outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all"
            >
              <option>BBQ Area</option>
              <option>Party Room</option>
              <option>Gym</option>
              <option>Swimming Pool</option>
              <option>Tennis Court</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-text-main tracking-tight italic">
                  {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} 
                    disabled={isCurrentMonth}
                    className={`p-2.5 bg-background-page hover:bg-border-main rounded-xl transition-colors ${isCurrentMonth ? 'opacity-20 cursor-not-allowed' : ''}`}
                  >
                    <ChevronLeft className="h-5 w-5 text-text-secondary" />
                  </button>
                  <button onClick={() => setViewDate(new Date())} className="px-4 py-2 text-xs font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all uppercase tracking-widest">Today</button>
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} 
                    className="p-2.5 bg-background-page hover:bg-border-main rounded-xl transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase text-text-secondary/40 tracking-[0.2em] mb-2">{d}</div>
                ))}
                {days.map((day, idx) => {
                  const dayReservations = getDayReservations(day)
                  const hasReservations = dayReservations.length > 0
                  const past = isPast(day)
                  const current = isToday(day)
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (day && !past && isCurrentMonth) {
                          setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
                          setShowModal(true)
                        }
                      }}
                      className={`h-32 p-3 border-2 rounded-3xl transition-all relative group overflow-hidden
                        ${!day ? 'border-transparent bg-transparent' : ''}
                        ${day && !past && isCurrentMonth ? 'border-border-main bg-background-card hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''}
                        ${(past || (day && !isCurrentMonth)) ? 'border-border-main bg-background-page/50 grayscale opacity-40 cursor-not-allowed' : ''}
                        ${current ? 'border-primary shadow-lg shadow-primary/10' : ''}
                      `}
                    >
                      {day && (
                        <div className="flex flex-col h-full text-left">
                          <span className={`text-sm font-black ${current ? 'text-primary' : 'text-text-main'}`}>
                            {day}
                          </span>
                          <div className="mt-2 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                            {dayReservations.map(res => (
                              <div key={res.id} className={`text-[7px] leading-tight p-1 rounded shadow-sm border font-black truncate
                                ${res.resident_id === currentUser?.id ? 'bg-primary text-white border-primary-dark' : 'bg-background-page text-text-secondary border-border-main'}
                              `}>
                                {res.time_slot.split(' - ')[0]} • {role === 'admin' ? res.residents?.full_name : (res.resident_id === currentUser?.id ? 'You' : 'Reserved')}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-8 text-left">
            <div>
              <h2 className="text-xs font-black text-text-secondary/60 uppercase tracking-[0.2em] mb-6">
                {role === 'admin' ? 'All Bookings' : 'My Bookings'}
              </h2>
              <div className="space-y-4">
                {(role === 'admin' ? allReservations : allReservations.filter(r => r.resident_id === currentUser.id)).slice(0, 15).map(res => (
                  <div key={res.id} className="bg-background-card p-5 rounded-2xl border border-border-main shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className={`absolute left-0 top-0 w-1 h-full ${res.status === 'approved' ? 'bg-success' : res.status === 'pending' ? 'bg-primary' : 'bg-danger'}`}></div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-text-main text-sm">{res.area_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{new Date(res.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={res.status} />
                        <button 
                          onClick={() => confirmDelete(res.id)} 
                          className="p-1.5 text-text-secondary/40 hover:text-danger transition-colors"
                          title="Delete Reservation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] font-black text-text-main bg-background-page px-2 py-1 rounded-md">{res.time_slot}</p>
                      {role === 'admin' && res.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdateStatus(res.id, 'approved')} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">✓</button>
                          <button onClick={() => handleUpdateStatus(res.id, 'cancelled')} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm">✕</button>
                        </div>
                      )}
                    </div>
                    {role === 'admin' && (
                      <p className="text-[9px] font-bold text-primary mt-3 truncate border-t border-border-main pt-3">
                         {res.residents?.full_name} • Apt {res.residents?.apartment_number}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Reservation" size="xl">
        <form onSubmit={handleSubmit} className="text-left p-2">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Left Column: Context & Area Selection */}
            <div className="flex flex-col gap-6">
              <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 flex-1">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-4 text-left">Selected Schedule</p>
                <div className="flex items-center gap-4 text-left mb-8">
                  <div className="bg-background-card p-4 rounded-2xl shadow-sm border border-primary/20">
                    <p className="text-sm font-black text-primary text-center uppercase tracking-tighter leading-none">
                      {selectedDate.toLocaleString('default', { month: 'short' })}<br/>
                      <span className="text-3xl tracking-normal leading-tight">{selectedDate.getDate()}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-primary font-bold uppercase tracking-widest">{selectedDate.toLocaleString('default', { weekday: 'long' })}</p>
                    <p className="text-sm font-medium text-text-main mt-1">Select the area and time</p>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary/80 mb-2">Area to Reserve</label>
                  <select 
                    value={selectedArea} 
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-primary/20 rounded-2xl bg-background-card font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all"
                  >
                    <option>BBQ Area</option>
                    <option>Party Room</option>
                    <option>Gym</option>
                    <option>Swimming Pool</option>
                    <option>Tennis Court</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Time Slots & Purpose */}
            <div className="flex flex-col gap-6">
              <div className="text-left">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-text-secondary/60 mb-3">Select Time Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map(slot => {
                    const isAvailable = availableSlots.includes(slot);
                    const isSelected = timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable || role === 'admin'}
                        onClick={() => setTimeSlot(slot)}
                        className={`relative p-3 rounded-2xl border-2 text-sm font-bold transition-all text-left overflow-hidden ${
                          !isAvailable 
                            ? 'bg-background-page/50 border-transparent text-text-secondary/30 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                              : 'bg-background-card border-border-main text-text-main hover:border-primary/40 hover:shadow-sm'
                        }`}
                      >
                        <span className="block">{slot}</span>
                        {!isAvailable ? (
                          <span className="block text-[9px] uppercase tracking-widest mt-0.5 text-danger font-black">Reserved</span>
                        ) : (
                          <span className={`block text-[9px] uppercase tracking-widest mt-0.5 font-black ${isSelected ? 'text-white/80' : 'text-success'}`}>Available</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-border-main">
            {role === 'admin' ? (
              <div className="flex-1 text-center py-4 rounded-2xl bg-warning/10 border border-warning/20">
                <p className="text-xs font-black text-warning uppercase tracking-widest">Admins Cannot Reserve</p>
              </div>
            ) : (
              <Button 
                type="submit" 
                disabled={submitting || availableSlots.length === 0} 
                className="flex-1 py-4 rounded-2xl shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-xs"
              >
                {submitting ? 'Processing...' : 'Confirm Request'}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="px-8 rounded-2xl font-bold text-xs">Close</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={reservationToDelete !== null} 
        onClose={() => setReservationToDelete(null)} 
        title="Delete Reservation"
      >
        <div className="text-left">
          <p className="text-text-secondary mb-6">
            Are you sure you want to permanently delete this reservation? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setReservationToDelete(null)}>Cancel</Button>
            <Button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-danger border-danger hover:bg-danger-dark text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Reservation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
