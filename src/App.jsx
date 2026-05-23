import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Income from './pages/Income'
import Expense from './pages/Expense'
import Transactions from './pages/Transactions'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

export const AppContext = createContext(null)

/* ── localStorage hook ──────────────────────────────────────── */
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  const set = (val) => {
    try {
      const next = typeof val === 'function' ? val(value) : val
      setValue(next)
      window.localStorage.setItem(key, JSON.stringify(next))
    } catch (e) {
      console.error(e)
    }
  }

  return [value, set]
}

/* ── Protected route ────────────────────────────────────────── */
function ProtectedRoute({ children }) {
  const { currentUser } = useContext(AppContext)
  return currentUser ? children : <Navigate to="/login" replace />
}

/* ── App shell layout (sidebar + navbar) ────────────────────── */
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}

/* ── Root component ─────────────────────────────────────────── */
export default function App() {
  const [incomes,     setIncomes]     = useLocalStorage('et_incomes',   [])
  const [expenses,    setExpenses]    = useLocalStorage('et_expenses',  [])
  const [currentUser, setCurrentUser] = useLocalStorage('et_user',      null)
  const [theme,       setTheme]       = useLocalStorage('et_theme',     'dark')

  /* Sync theme attribute on <html> */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  /* Auth */
  const login  = (username) => setCurrentUser({ username })
  const logout = () => setCurrentUser(null)
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  /* ── Income CRUD ────────────────────────────────────────── */
  const addIncome = (income) =>
    setIncomes(prev => [{ ...income, id: Date.now().toString() }, ...prev])

  const updateIncome = (id, data) =>
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))

  const deleteIncome = (id) =>
    setIncomes(prev => prev.filter(i => i.id !== id))

  /* ── Expense CRUD ───────────────────────────────────────── */
  const addExpense = (expense) =>
    setExpenses(prev => [{ ...expense, id: Date.now().toString() }, ...prev])

  const updateExpense = (id, data) =>
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))

  const deleteExpense = (id) =>
    setExpenses(prev => prev.filter(e => e.id !== id))

  /* ── Derived totals ─────────────────────────────────────── */
  const totalIncome  = incomes.reduce((s, i) => s + parseFloat(i.amount  || 0), 0)
  const totalExpense = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
  const balance      = totalIncome - totalExpense

  const ctx = {
    incomes, addIncome, updateIncome, deleteIncome,
    expenses, addExpense, updateExpense, deleteExpense,
    currentUser, login, logout,
    theme, toggleTheme,
    totalIncome, totalExpense, balance,
  }

  return (
    <AppContext.Provider value={ctx}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }/>
          <Route path="/income" element={
            <ProtectedRoute>
              <AppLayout><Income /></AppLayout>
            </ProtectedRoute>
          }/>
          <Route path="/expense" element={
            <ProtectedRoute>
              <AppLayout><Expense /></AppLayout>
            </ProtectedRoute>
          }/>
          <Route path="/transactions" element={
            <ProtectedRoute>
              <AppLayout><Transactions /></AppLayout>
            </ProtectedRoute>
          }/>
          <Route
            path="*"
            element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </Router>
    </AppContext.Provider>
  )
}
  /* ── test1 ─────────────────────────────────────── */