import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Home, User, LogOut, Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/dashboard',     label: 'Dashboard' },
  { to: '/announcements', label: 'News' },
  { to: '/expenses',      label: 'Expenses' },
  { to: '/requests',      label: 'Requests' },
  { to: '/reservations',  label: 'Reservations' },
  { to: '/messages',      label: 'Messages' },
  { to: '/documents',     label: 'Docs' },
]

export default function Navbar({ userRole }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-background-card/90 backdrop-blur-md border-b border-border-main shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Home className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg text-text-main tracking-tight">Batima<span className="text-primary">-Gest</span></span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-main hover:bg-background-page'
                }`}
              >
                {label}
              </Link>
            ))}
            {userRole === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-main hover:bg-background-page'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-main hover:bg-background-page'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 bg-dark-bg text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-dark-card transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-background-page transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-border-main py-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-main hover:bg-background-page'
                }`}
              >
                {label}
              </Link>
            ))}
            {userRole === 'admin' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-main hover:bg-background-page">Admin</Link>
            )}
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-main hover:bg-background-page">Profile</Link>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors">Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}
