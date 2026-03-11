import React, { useState } from 'react'

const csrfToken = document.querySelector('[name="csrf-token"]')?.content

const DECISIONS = [
  {
    key: 'approve',
    label: 'Approve',
    icon: '\u2713',
    color: '#34C759',
    bg: 'rgba(52, 199, 89, 0.1)',
    border: 'rgba(52, 199, 89, 0.3)'
  },
  {
    key: 'request_changes',
    label: 'Request Changes',
    icon: '\u270E',
    color: '#FF9500',
    bg: 'rgba(255, 149, 0, 0.1)',
    border: 'rgba(255, 149, 0, 0.3)'
  },
  {
    key: 'reject',
    label: 'Reject',
    icon: '\u2717',
    color: '#FF3B30',
    bg: 'rgba(255, 59, 48, 0.1)',
    border: 'rgba(255, 59, 48, 0.3)'
  }
]

const DecisionBar = ({ decision, reviewId, onDecide }) => {
  const [showCommentFor, setShowCommentFor] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleDecide = async (dec) => {
    if (dec === decision) return
    if (dec !== 'approve' && !showCommentFor) {
      setShowCommentFor(dec)
      return
    }
    setSubmitting(true)
    try {
      await onDecide(dec, comment)
      setShowCommentFor(null)
      setComment('')
    } finally {
      setSubmitting(false)
    }
  }

  if (decision) {
    const d = DECISIONS.find(d => d.key === decision) || DECISIONS[0]
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: d.bg,
        border: `1px solid ${d.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px'
      }}>
        <span style={{ fontSize: '1rem' }}>{d.icon}</span>
        <span style={{
          fontSize: '0.85rem', fontWeight: 600, color: d.color
        }}>
          {d.label}
        </span>
        <span style={{
          fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px'
        }}>
          — Your decision has been recorded
        </span>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-md)'
    }}>
      <p style={{
        fontSize: '0.75rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.5px',
        color: 'var(--text-muted)', margin: '0 0 10px'
      }}>
        Your Decision
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {DECISIONS.map((d) => (
          <button
            key={d.key}
            onClick={() => handleDecide(d.key)}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: showCommentFor === d.key ? d.bg : 'transparent',
              border: `1px solid ${showCommentFor === d.key ? d.border : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              color: d.color, fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              opacity: submitting ? 0.5 : 1
            }}
            onMouseOver={e => {
              if (showCommentFor !== d.key) {
                e.currentTarget.style.background = d.bg
                e.currentTarget.style.borderColor = d.border
              }
            }}
            onMouseOut={e => {
              if (showCommentFor !== d.key) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--glass-border)'
              }
            }}
          >
            <span>{d.icon}</span>
            {d.label}
          </button>
        ))}
      </div>

      {showCommentFor && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)..."
            style={{
              flex: 1, background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem', padding: '8px 12px',
              outline: 'none'
            }}
            autoFocus
          />
          <button
            onClick={() => handleDecide(showCommentFor)}
            disabled={submitting}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
          >
            Submit
          </button>
          <button
            onClick={() => { setShowCommentFor(null); setComment('') }}
            style={{
              background: 'transparent', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)', fontSize: '0.8rem',
              padding: '8px 12px', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default DecisionBar
