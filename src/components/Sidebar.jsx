import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../App'

const LINKS = [
  { to: '/dashboard',    icon: '⊞',  label: 'Dashboard'   },
  { to: '/income',       icon: '↑',  label: 'Income'      },
  { to: '/expense',      icon: '↓',  label: 'Expenses'    },
  { to: '/transactions', icon: '≡',  label: 'Transactions'},
]

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useContext(AppContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : 'U'

  return (
    <nav className={`sidebar${isOpen ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💰</div>
        <div className="sidebar-logo-text">
          Expense<span>Tracker</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>

        {LINKS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-username">{currentUser?.username}</div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </div>
    </nav>
  )
}
