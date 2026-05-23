import React, { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AppContext } from '../App'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/income':       'Income',
  '/expense':      'Expenses',
  '/transactions': 'Transactions',
}

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useContext(AppContext)
  const { pathname } = useLocation()

  const title = PAGE_TITLES[pathname] ?? 'ExpenseTracker'

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <header className="navbar">
      <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        ☰
      </button>

      <div className="navbar-title">{title}</div>

      <div className="navbar-right">
        <span className="navbar-date">{today}</span>
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
