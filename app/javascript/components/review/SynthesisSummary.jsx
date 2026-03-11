import React from 'react'

const VERDICT_CONFIG = {
  approve: {
    label: 'Approved',
    color: '#34C759',
    bg: 'rgba(52, 199, 89, 0.08)',
    border: 'rgba(52, 199, 89, 0.3)',
    icon: '\u2713'
  },
  request_changes: {
    label: 'Changes Requested',
    color: '#FF3B30',
    bg: 'rgba(255, 59, 48, 0.08)',
    border: 'rgba(255, 59, 48, 0.3)',
    icon: '\u2717'
  },
  needs_discussion: {
    label: 'Needs Discussion',
    color: '#FF9500',
    bg: 'rgba(255, 149, 0, 0.08)',
    border: 'rgba(255, 149, 0, 0.3)',
    icon: '\u2026'
  }
}

const SynthesisSummary = ({ synthesis }) => {
  if (!synthesis || !synthesis.verdict) return null

  const v = VERDICT_CONFIG[synthesis.verdict] || VERDICT_CONFIG.needs_discussion

  return (
    <div style={{
      background: v.bg,
      border: `1px solid ${v.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: '-50%', right: '-20%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: v.color, opacity: 0.04, filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: 'var(--space-md)'
      }}>
        <span style={{
          fontSize: '1.2rem', width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${v.color}20`, borderRadius: '8px', color: v.color
        }}>
          {v.icon}
        </span>
        <div>
          <h3 style={{
            fontSize: '1rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0
          }}>
            AI Review Summary
          </h3>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            color: v.color, textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {v.label}
          </span>
        </div>
      </div>

      <p style={{
        fontSize: '0.875rem', color: 'var(--text-secondary)',
        lineHeight: 1.65, margin: '0 0 var(--space-md)'
      }}>
        {synthesis.summary}
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {synthesis.key_concerns?.length > 0 && (
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-danger)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              Concerns
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {synthesis.key_concerns.map((c, i) => (
                <li key={i} style={{
                  fontSize: '0.82rem', color: 'var(--text-muted)',
                  lineHeight: 1.5, marginBottom: '4px'
                }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {synthesis.praise?.length > 0 && (
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-success)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>
              Praise
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {synthesis.praise.map((p, i) => (
                <li key={i} style={{
                  fontSize: '0.82rem', color: 'var(--text-muted)',
                  lineHeight: 1.5, marginBottom: '4px'
                }}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default SynthesisSummary
