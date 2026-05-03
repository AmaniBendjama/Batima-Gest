import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  return user ? <Outlet /> : <Navigate to="/" replace />
}
