import React, { useContext, useState } from 'react'
import { AppContext } from '../App'

const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Education', 'Bills', 'Entertainment']

const CAT_ICONS = {
  Food: '🍔', Shopping: '🛍️', Transport: '🚗',
  Education: '📚', Bills: '🧾', Entertainment: '🎬',
}

const CAT_COLORS = {
  Food: '#f97316', Shopping: '#ec4899', Transport: '#3b82f6',
  Education: '#8b5cf6', Bills: '#ef4444', Entertainment: '#f59e0b',
}

const EMPTY_FORM = { category: CATEGORIES[0], amount: '', date: '' }

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function ExpenseModal({ initial, onSave, onClose }) {
  const [form, setForm]     = useState(initial || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0)
      errs.amount = 'Enter a valid amount.'
    if (!form.date) errs.date = 'Date is required.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    onSave({ ...form, amount: parseFloat(form.amount) })
  }

  const isEditing = !!initial?.id

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEditing ? '✏️ Edit Expense' : '➕ Add Expense'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" className="form-select" value={form.category} onChange={onChange}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {CAT_ICONS[cat]} {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (INR) *</label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              className="form-input"
              placeholder="0.00"
              value={form.amount}
              onChange={onChange}
              autoFocus
            />
            {errors.amount && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.amount}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              name="date"
              type="date"
              className="form-input"
              value={form.date}
              onChange={onChange}
            />
            {errors.date && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.date}</div>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? '✓ Update Expense' : '+ Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Expense() {
  const { expenses, addExpense, updateExpense, deleteExpense, totalExpense } = useContext(AppContext)
  const [modal,  setModal]  = useState(null)
  const [filter, setFilter] = useState('All')

  const filtered = expenses.filter(e =>
    filter === 'All' || e.category === filter
  )

  /* Per-category totals */
  const catTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter(e => e.category === cat)
      .reduce((s, e) => s + parseFloat(e.amount || 0), 0)
    return acc
  }, {})

  const handleSave = (form) => {
    if (modal?.id) {
      updateExpense(modal.id, form)
    } else {
      addExpense(form)
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense?')) deleteExpense(id)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-heading">Expenses</div>
          <div className="page-subheading">Monitor and manage your spending.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          + Add Expense
        </button>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {CATEGORIES.map(cat => {
          const total = catTotals[cat]
          return (
            <div
              key={cat}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${filter === cat ? CAT_COLORS[cat] : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: 110,
              }}
              onClick={() => setFilter(filter === cat ? 'All' : cat)}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{CAT_ICONS[cat]}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 2 }}>{cat}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: total ? CAT_COLORS[cat] : 'var(--text-3)' }}>
                {fmt(total)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-pill">
          <div className="stat-pill-label">Total Expenses</div>
          <div className="stat-pill-val" style={{ color: 'var(--red)' }}>{fmt(totalExpense)}</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-label">Records</div>
          <div className="stat-pill-val">{expenses.length}</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-label">Average</div>
          <div className="stat-pill-val">
            {expenses.length ? fmt(totalExpense / expenses.length) : fmt(0)}
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="filters-row">
        <select
          className="filter-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>
        {filter !== 'All' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setFilter('All')}
          >
            × Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={5}>
                    {filter !== 'All'
                      ? `No expenses in "${filter}".`
                      : 'No expenses yet. Click "+ Add Expense" to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map((exp, idx) => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--text-3)', width: 40 }}>{idx + 1}</td>
                    <td>
                      <span
                        className="cat-badge"
                        style={{ color: CAT_COLORS[exp.category] || 'var(--text-2)' }}
                      >
                        {CAT_ICONS[exp.category] || '💡'} {exp.category}
                      </span>
                    </td>
                    <td>{formatDate(exp.date)}</td>
                    <td className="amount-expense">-{fmt(exp.amount)}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-icon edit"
                          title="Edit"
                          onClick={() => setModal({ ...exp })}
                        >✏️</button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => handleDelete(exp.id)}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ExpenseModal
          initial={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
