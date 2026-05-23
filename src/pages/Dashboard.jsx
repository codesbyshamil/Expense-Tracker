import React, { useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { AppContext } from '../App'
import DashboardCard from '../components/DashboardCard'

const CATEGORY_COLORS = {
  Food:          '#f97316',
  Shopping:      '#ec4899',
  Transport:     '#3b82f6',
  Education:     '#8b5cf6',
  Bills:         '#ef4444',
  Entertainment: '#f59e0b',
  Other:         '#6b7280',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtFull(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function Dashboard() {
  const { incomes, expenses, totalIncome, totalExpense, balance, theme } = useContext(AppContext)
  const navigate = useNavigate()

  /* Pie chart data: expenses grouped by category */
  const pieData = useMemo(() => {
    const map = {}
    expenses.forEach(e => {
      const cat = e.category || 'Other'
      map[cat] = (map[cat] || 0) + parseFloat(e.amount || 0)
    })
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value: +value.toFixed(2) }))
  }, [expenses])

  /* Bar chart data: monthly income vs expenses for current year */
  const barData = useMemo(() => {
    const year = new Date().getFullYear()
    const data = MONTHS.map(m => ({ month: m, Income: 0, Expenses: 0 }))

    incomes.forEach(i => {
      const d = new Date(i.date)
      if (d.getFullYear() === year) data[d.getMonth()].Income += parseFloat(i.amount || 0)
    })
    expenses.forEach(e => {
      const d = new Date(e.date)
      if (d.getFullYear() === year) data[d.getMonth()].Expenses += parseFloat(e.amount || 0)
    })

    return data.map(d => ({
      ...d,
      Income: +d.Income.toFixed(2),
      Expenses: +d.Expenses.toFixed(2),
    }))
  }, [incomes, expenses])

  /* Recent 5 transactions merged */
  const recentTxns = useMemo(() => {
    const all = [
      ...incomes.map(i => ({ ...i, type: 'income',  label: i.source })),
      ...expenses.map(e => ({ ...e, type: 'expense', label: e.category })),
    ]
    return all
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
  }, [incomes, expenses])

  const axisColor  = theme === 'dark' ? '#526070' : '#94a3b8'
  const gridColor  = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const tooltipBg  = theme === 'dark' ? '#1e2433' : '#fff'
  const tooltipBorder = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: tooltipBg, border: `1px solid ${tooltipBorder}`,
          borderRadius: 10, padding: '10px 14px', fontSize: 13,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-1)' }}>{label}</div>
          {payload.map(p => (
            <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
              {p.name}: <strong>{fmt(p.value)}</strong>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0]
      return (
        <div style={{
          background: tooltipBg, border: `1px solid ${tooltipBorder}`,
          borderRadius: 10, padding: '8px 12px', fontSize: 13,
        }}>
          <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{name}: </span>
          <span style={{ color: CATEGORY_COLORS[name] || '#888' }}>{fmtFull(value)}</span>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="cards-grid">
        <DashboardCard
          type="income"
          label="Total Income"
          amount={totalIncome}
          icon="💚"
          badge={`${incomes.length} entries`}
          sub="All recorded income sources"
        />
        <DashboardCard
          type="expense"
          label="Total Expenses"
          amount={totalExpense}
          icon="🔴"
          badge={`${expenses.length} entries`}
          sub="All recorded expenses"
        />
        <DashboardCard
          type="balance"
          label="Current Balance"
          amount={balance}
          icon="💜"
          badge={balance >= 0 ? 'Surplus' : 'Deficit'}
          sub="Income minus expenses"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Pie chart */}
        <div className="chart-card">
          <div className="chart-title">🥧 Expenses by Category</div>
          {pieData.length === 0 ? (
            <div className="chart-empty">
              <div className="empty-icon">🥧</div>
              <div>No expense data yet</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/expense')}>
                Add Expenses
              </button>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || '#6b7280'}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map(d => (
                  <div key={d.name} className="legend-item">
                    <div className="legend-dot" style={{ background: CATEGORY_COLORS[d.name] || '#6b7280' }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar chart */}
        <div className="chart-card">
          <div className="chart-title">📊 Monthly Overview ({new Date().getFullYear()})</div>
          {(totalIncome + totalExpense) === 0 ? (
            <div className="chart-empty">
              <div className="empty-icon">📊</div>
              <div>No transactions yet</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/income')}>
                Add Income
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} barSize={10} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: axisColor, paddingTop: 8 }} />
                <Bar dataKey="Income"   fill="#0ecb81" radius={[4,4,0,0]} />
                <Bar dataKey="Expenses" fill="#ff4d6a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="table-card">
        <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="section-title">Recent Transactions</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')}>
            View All →
          </button>
        </div>

        {recentTxns.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
            No transactions yet. Start by adding income or expenses.
          </div>
        ) : (
          <div className="recent-list" style={{ marginTop: 12 }}>
            {recentTxns.map(txn => (
              <div key={txn.id} className="recent-item">
                <div className={`recent-icon ${txn.type}`}>
                  {txn.type === 'income' ? '💚' : getCatIcon(txn.category)}
                </div>
                <div className="recent-info">
                  <div className="recent-name">{txn.label}</div>
                  <div className="recent-date">{formatDate(txn.date)}</div>
                </div>
                <div className={`recent-amount ${txn.type}`}>
                  {txn.type === 'income' ? '+' : '-'}{fmtFull(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function getCatIcon(cat) {
  const icons = {
    Food: '🍔', Shopping: '🛍️', Transport: '🚗',
    Education: '📚', Bills: '🧾', Entertainment: '🎬', Other: '💡',
  }
  return icons[cat] || '💡'
}
