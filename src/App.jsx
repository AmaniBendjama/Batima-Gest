import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import ProtectedRoute from './components/layout/ProtectedRoute'
import PublicRoute from './components/layout/PublicRoute'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Announcements from './pages/Announcements'
import Expenses from './pages/Expenses'
import Requests from './pages/Requests'
import Reservations from './pages/Reservations'
import Messages from './pages/Messages'
import Documents from './pages/Documents'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function App() {
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('residents').select('role').eq('id', user.id).single()
        setUserRole(data?.role || 'resident')
      }
    }
    getUserRole()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserRole()
      } else {
        setUserRole(null)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={
            <>
              <Navbar userRole={userRole} />
              <div className="min-h-screen bg-background-page pb-12">
                <Outlet />
              </div>
            </>
          }>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/expenses"     element={<Expenses />} />
            <Route path="/requests"     element={<Requests />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/messages"     element={<Messages />} />
            <Route path="/documents"    element={<Documents />} />
            <Route path="/profile"      element={<Profile />} />
            <Route path="/admin"        element={<Admin />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
