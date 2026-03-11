import React from 'react'

const STATUS_CONFIG = {
  idle: { label: 'Ready', color: 'var(--text-muted)', bg: 'var(--glass-bg)' },
  submitting: { label: 'Starting...', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)' },
  reviewing: { label: 'Reviewing', color: '#5E5CE6', bg: 'rgba(94, 92, 230, 0.1)' },
  complete: { label: 'Complete', color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)' },
  failed: { label: 'Failed', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)' }
}

const StatusPill = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle
  const isAnimating = status === 'reviewing' || status === 'submitting'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '0.7rem', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      color: config.color, background: config.bg,
      border: `1px solid ${config.color}30`
    }}>
      {isAnimating && (
        <span style={{
          display: 'inline-block', width: 6, height: 6,
          borderRadius: '50%', background: config.color,
          animation: 'rpulse 1.5s ease-in-out infinite'
        }} />
      )}
      {config.label}
    </span>
  )
}

export default StatusPill
