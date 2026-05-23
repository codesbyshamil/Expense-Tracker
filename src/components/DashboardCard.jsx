import React from 'react'

export default function DashboardCard({ type, label, amount, sub, icon, badge }) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

  return (
    <div className={`dash-card ${type}`}>
      <div className="card-top">
        <div className="card-icon-wrap">{icon}</div>
        {badge && <span className="card-badge">{badge}</span>}
      </div>
      <div className="card-label">{label}</div>
      <div className="card-amount">{fmt(amount)}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  )
}
