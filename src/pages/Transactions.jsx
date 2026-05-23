import React, { useContext, useState, useMemo } from 'react'
import { AppContext } from '../App'

const CAT_ICONS = {
  Food: '🍔', Shopping: '🛍️', Transport: '🚗',
  Education: '📚', Bills: '🧾', Entertainment: '🎬',
}

const CAT_COLORS = {
  Food: '#f97316', Shopping: '#ec4899', Transport: '#3b82f6',
  Education: '#8b5cf6', Bills: '#ef4444', Entertainment: '#f59e0b',
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(n))
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const PAGE_SIZE = 15

export default function Transactions() {
  const { incomes, expenses, totalIncome, totalExpense, balance } = useContext(AppContext)

  const [typeFilter, setTypeFilter]   = useState('All')
  const [catFilter,  setCatFilter]    = useState('All')
  const [search,     setSearch]       = useState('')
  const [sort,       setSort]         = useState('date-desc')
  const [page,       setPage]         = useState(1)

  /* Merge all transactions */
  const allTxns = useMemo(() => [
    ...incomes.map(i => ({
      ...i,
      type:  'income',
      label: i.source,
      cat:   'Income',
    })),
    ...expenses.map(e => ({
      ...e,
      type:  'expense',
      label: e.category,
      cat:   e.category,
    })),
  ], [incomes, expenses])

  const categories = useMemo(() => {
    const cats = [...new Set(allTxns.map(t => t.cat))].sort()
    return cats
  }, [allTxns])

  /* Filter + sort */
  const filtered = useMemo(() => {
    let list = allTxns

    if (typeFilter !== 'All') list = list.filter(t => t.type === typeFilter)
    if (catFilter  !== 'All') list = list.filter(t => t.cat  === catFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.label.toLowerCase().includes(q) ||
        (t.source && t.source.toLowerCase().includes(q))
      )
    }

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'date-desc':   return new Date(b.date) - new Date(a.date)
        case 'date-asc':    return new Date(a.date) - new Date(b.date)
        case 'amount-desc': return parseFloat(b.amount) - parseFloat(a.amount)
        case 'amount-asc':  return parseFloat(a.amount) - parseFloat(b.amount)
        default: return 0
      }
    })

    return list
  }, [allTxns, typeFilter, catFilter, search, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetPage = () => setPage(1)

  const totalFiltered = filtered.reduce((s, t) => {
    return t.type === 'income'
      ? s + parseFloat(t.amount || 0)
      : s - parseFloat(t.amount || 0)
  }, 0)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-heading">Transaction History</div>
          <div className="page-subheading">All income and expense records.</div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-pill">
          <div className="stat-pill-label">Total Income</div>
          <div className="stat-pill-val" style={{ color: 'var(--green)' }}>{fmt(totalIncome)}</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-label">Total Expenses</div>
          <div className="stat-pill-val" style={{ color: 'var(--red)' }}>{fmt(totalExpense)}</div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-label">Balance</div>
          <div className="stat-pill-val" style={{ color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {balance >= 0 ? '+' : '-'}{fmt(balance)}
          </div>
        </div>
        <div className="stat-pill">
          <div className="stat-pill-label">Records</div>
          <div className="stat-pill-val">{allTxns.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          className="filter-input"
          placeholder="🔍 Search…"
          value={search}
          onChange={e => { setSearch(e.target.value); resetPage() }}
        />
        <select
          className="filter-select"
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); resetPage() }}
        >
          <option value="All">All Types</option>
          <option value="income">💚 Income</option>
          <option value="expense">🔴 Expense</option>
        </select>
        <select
          className="filter-select"
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); resetPage() }}
        >
          <option value="All">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={sort}
          onChange={e => { setSort(e.target.value); resetPage() }}
        >
          <option value="date-desc">Date ↓ Newest</option>
          <option value="date-asc">Date ↑ Oldest</option>
          <option value="amount-desc">Amount ↓ High</option>
          <option value="amount-asc">Amount ↑ Low</option>
        </select>
        {(typeFilter !== 'All' || catFilter !== 'All' || search) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setTypeFilter('All'); setCatFilter('All'); setSearch(''); resetPage() }}
          >
            × Clear
          </button>
        )}
      </div>

      {/* Filtered result count */}
      {filtered.length !== allTxns.length && (
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 10 }}>
          Showing {filtered.length} of {allTxns.length} records
          {filtered.length > 0 && (
            <> &nbsp;·&nbsp; Net: <strong style={{ color: totalFiltered >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {totalFiltered >= 0 ? '+' : '-'}{fmt(totalFiltered)}
            </strong></>
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Type</th>
                <th>Category / Source</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={5}>
                    {allTxns.length === 0
                      ? 'No transactions yet. Add some income or expenses!'
                      : 'No results match your filters.'}
                  </td>
                </tr>
              ) : (
                paginated.map((txn, idx) => (
                  <tr key={txn.id}>
                    <td style={{ color: 'var(--text-3)', width: 48 }}>
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>{formatDate(txn.date)}</td>
                    <td>
                      <span className={`type-badge ${txn.type}`}>
                        {txn.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </span>
                    </td>
                    <td>
                      {txn.type === 'expense' ? (
                        <span
                          className="cat-badge"
                          style={{ color: CAT_COLORS[txn.cat] || 'var(--text-2)' }}
                        >
                          {CAT_ICONS[txn.cat] || '💡'} {txn.label}
                        </span>
                      ) : (
                        <span className="td-primary">💚 {txn.label}</span>
                      )}
                    </td>
                    <td className={txn.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {txn.type === 'income' ? '+' : '-'}{fmt(txn.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderTop: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text-3)',
          }}>
            <span>
              Page {page} of {totalPages} &nbsp;·&nbsp; {filtered.length} records
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ opacity: page === totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
