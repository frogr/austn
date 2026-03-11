import React, { useState } from 'react'

const csrfToken = document.querySelector('[name="csrf-token"]')?.content

const HumanComment = ({ sectionId, reviewId, existingComments = [], onCommentAdded }) => {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/reviews/${reviewId}/sections/${sectionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ text })
      })

      if (response.ok) {
        onCommentAdded?.({ text, created_at: new Date().toISOString() })
        setText('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {existingComments.map((comment, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px',
          background: 'rgba(94, 92, 230, 0.06)',
          border: '1px solid rgba(94, 92, 230, 0.15)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px', fontSize: '0.82rem'
        }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700,
            color: '#5E5CE6', textTransform: 'uppercase',
            letterSpacing: '0.5px', flexShrink: 0, marginTop: '2px'
          }}>
            You
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>{comment.text}</span>
        </div>
      ))}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem', padding: '6px 10px',
            outline: 'none', fontFamily: 'var(--font-sans)',
            transition: 'border-color var(--transition-fast)'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(94, 92, 230, 0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          style={{
            background: 'rgba(94, 92, 230, 0.15)',
            border: '1px solid rgba(94, 92, 230, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#5E5CE6', fontSize: '0.75rem',
            fontWeight: 600, padding: '6px 12px',
            cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
            opacity: submitting || !text.trim() ? 0.4 : 1,
            transition: 'all var(--transition-fast)'
          }}
        >
          Add
        </button>
      </form>
    </div>
  )
}

export default HumanComment
