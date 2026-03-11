import React, { useState } from 'react'

const PrInput = ({ onSubmit, disabled }) => {
  const [url, setUrl] = useState('')
  const isValid = /github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(url)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim() || !isValid) return
    onSubmit(url.trim())
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex', gap: 'var(--space-sm)',
      marginBottom: 'var(--space-lg)'
    }}>
      <div style={{
        flex: 1, position: 'relative',
        background: 'var(--glass-bg)',
        border: `1px solid ${url && !isValid ? 'rgba(255, 59, 48, 0.4)' : 'var(--glass-border)'}`,
        borderRadius: 'var(--radius-md)',
        transition: 'border-color var(--transition-fast)',
        display: 'flex', alignItems: 'center'
      }}>
        <span style={{
          padding: '0 0 0 12px', color: 'var(--text-muted)', fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', userSelect: 'none'
        }}>PR</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="github.com/owner/repo/pull/123"
          disabled={disabled}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text-primary)', padding: '10px 12px',
            fontSize: '0.875rem', fontFamily: 'var(--font-mono)',
            outline: 'none', width: '100%'
          }}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !isValid}
        className="btn btn-primary"
        style={{
          opacity: disabled || !isValid ? 0.4 : 1,
          cursor: disabled || !isValid ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        {disabled ? 'Reviewing...' : 'Start Review'}
      </button>
    </form>
  )
}

export default PrInput
