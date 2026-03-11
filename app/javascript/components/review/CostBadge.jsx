import React from 'react'

const CostBadge = ({ cost }) => {
  if (!cost) return null

  const dollars = cost.total_cost || 0
  const tokens = cost.total_tokens || 0
  const requests = cost.request_count || 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '20px',
      padding: '3px 12px',
      fontSize: '0.7rem',
      fontFamily: 'var(--font-mono)'
    }}>
      <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
        ${dollars < 0.01 ? '<0.01' : dollars.toFixed(2)}
      </span>
      <span style={{
        width: 1, height: 12,
        background: 'var(--glass-border)'
      }} />
      <span style={{ color: 'var(--text-muted)' }}>
        {formatTokens(tokens)} tok
      </span>
      <span style={{
        width: 1, height: 12,
        background: 'var(--glass-border)'
      }} />
      <span style={{ color: 'var(--text-muted)' }}>
        {requests} call{requests !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

const formatTokens = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export default CostBadge
