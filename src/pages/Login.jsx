import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../App'

const DEMO = { username: 'admin', password: 'admin123' }

export default function Login() {
  const { login } = useContext(AppContext)
  const navigate = useNavigate()

  const [form,  setForm]  = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { username, password } = form

    if (!username.trim())  return setError('Please enter a username.')
    if (!password.trim())  return setError('Please enter a password.')
    if (password.length < 4) return setError('Password must be at least 4 characters.')

    setLoading(true)
    setTimeout(() => {
      /* Accept demo creds OR any username with 4+ char password */
      const valid =
        (username === DEMO.username && password === DEMO.password) ||
        password.length >= 4

      if (valid) {
        login(username.trim())
        navigate('/dashboard', { replace: true })
      } else {
        setError('Invalid credentials. Please try again.')
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div className="login-page">
      <div className="login-bg-blob b1" />
      <div className="login-bg-blob b2" />

      <div className="login-card">
        {/* Brand */}
        <div className="login-logo">
          <div className="login-logo-icon">💰</div>
          <div className="login-logo-name">
            Expense<span>Tracker</span>
          </div>
        </div>

        <div className="login-title">Welcome back</div>
        <div className="login-subtitle">Sign in to manage your finances.</div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? '⏳ Signing in…' : '→ Sign In'}
          </button>
        </form>

        <div className="login-hint">
          <strong>Demo credentials</strong><br />
          Username: <code>admin</code> &nbsp;|&nbsp; Password: <code>admin123</code><br />
          <em style={{ fontSize: '11px', opacity: 0.8 }}>Or use any username with a 4+ character password.</em>
        </div>
      </div>
    </div>
  )
}
