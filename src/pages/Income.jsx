import React, { useContext, useState } from 'react'
import { AppContext } from '../App'

const EMPTY_FORM = { source: '', amount: '', date: '' }

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function IncomeModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const onChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.source.trim()) errs.source = 'Source is required.'
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
          <div className="modal-title">{isEditing ? '✏️ Edit Income' : '➕ Add Income'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Income Source *</label>
            <input
              name="source"
              className="form-input"
              placeholder="e.g. Salary, Freelance, Rent…"
              value={form.source}
              onChange={onChange}
              autoFocus
            />
            {errors.source && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.source}</div>}
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
              {isEditing ? '✓ Update Income' : '+ Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Income() {
  const { incomes, addIncome, updateIncome, deleteIncome, totalIncome } = useContext(AppContext)
  const [modal, setModal]   = useState(null) // null | 'add' | {editing record}
  const [search, setSearch] = useState('')

  const filtered = incomes.filter(i =>
    i.source.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (form) => {
    if (modal?.id) {
      updateIncome(modal.id, form)
    } else {
      addIncome(form)
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this income record?')) deleteIncome(id)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-heading">Income</div>
          <div className="page-subheading">Track all your income sources.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          + Add Income
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-pill">
          <div className="stat-pill-label">Total Income</div>
          <div className="stat-pill-val" style={{ color: 'var(--green)' }}>{fmt(totalIncome)}</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-label">Records</div>
          <div className="stat-pill-val">{incomes.length}</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-label">Average</div>
          <div className="stat-pill-val">
            {incomes.length ? fmt(totalIncome / incomes.length) : fmt(0)}
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="filters-row">
        <input
          className="filter-input"
          placeholder="🔍 Search by source…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Source</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={5}>
                    {search
                      ? `No results for "${search}"`
                      : 'No income records yet. Click "+ Add Income" to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map((inc, idx) => (
                  <tr key={inc.id}>
                    <td style={{ color: 'var(--text-3)', width: 40 }}>{idx + 1}</td>
                    <td className="td-primary">💚 {inc.source}</td>
                    <td>{formatDate(inc.date)}</td>
                    <td className="amount-income">+{fmt(inc.amount)}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-icon edit"
                          title="Edit"
                          onClick={() => setModal({ ...inc })}
                        >✏️</button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => handleDelete(inc.id)}
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
        <IncomeModal
          initial={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
