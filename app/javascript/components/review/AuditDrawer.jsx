import React, { useState, useEffect } from 'react'

const AuditDrawer = ({ reviewId, open, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!open || !reviewId) return
    setLoading(true)
    fetch(`/reviews/${reviewId}/audit`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [open, reviewId])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(600px, 90vw)', zIndex: 1000,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--glass-border)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <div>
            <h2 style={{
              fontSize: '1rem', fontWeight: 700,
              color: 'var(--text-primary)', margin: 0
            }}>
              Audit Log
            </h2>
            {data && (
              <p style={{
                fontSize: '0.75rem', color: 'var(--text-muted)',
                margin: '2px 0 0', fontFamily: 'var(--font-mono)'
              }}>
                {data.pr_url?.replace('https://github.com/', '')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px', color: 'var(--text-muted)',
              width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Summary stats */}
        {data && (
          <div style={{
            display: 'flex', gap: '16px', padding: '12px 20px',
            borderBottom: '1px solid var(--glass-border)',
            flexWrap: 'wrap'
          }}>
            <MiniStat label="Total Cost" value={`$${(data.total_cost || 0).toFixed(4)}`} color="var(--accent-primary)" />
            <MiniStat label="Total Tokens" value={formatTokens(data.total_tokens || 0)} color="#64D2FF" />
            <MiniStat label="API Calls" value={data.requests?.length || 0} color="#FF9500" />
          </div>
        )}

        {/* Request list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p>
          )}

          {data?.requests?.map((req) => (
            <RequestRow
              key={req.id}
              req={req}
              expanded={expandedId === req.id}
              onToggle={() => setExpandedId(expandedId === req.id ? null : req.id)}
            />
          ))}

          {data && (!data.requests || data.requests.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
              No API requests recorded yet.
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

const RequestRow = ({ req, expanded, onToggle }) => {
  const typeColors = {
    triage: '#5E5CE6',
    section_review: '#FF9500',
    synthesis: '#34C759'
  }
  const color = typeColors[req.request_type] || '#888'

  return (
    <div style={{
      marginBottom: '8px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '8px',
          padding: '10px 12px', cursor: 'pointer',
          background: 'transparent', border: 'none',
          textAlign: 'left', color: 'var(--text-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.5px',
            color, background: `${color}15`,
            padding: '2px 6px', borderRadius: '4px',
            whiteSpace: 'nowrap'
          }}>
            {req.request_type}
          </span>
          <span style={{
            fontSize: '0.75rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {req.model}
          </span>
          {req.status === 'error' && (
            <span style={{
              fontSize: '0.6rem', color: 'var(--accent-danger)',
              fontWeight: 700
            }}>
              ERROR
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{
            fontSize: '0.7rem', color: 'var(--accent-primary)',
            fontFamily: 'var(--font-mono)', fontWeight: 600
          }}>
            ${(req.estimated_cost || 0).toFixed(4)}
          </span>
          <span style={{
            fontSize: '0.7rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {req.duration_seconds ? `${req.duration_seconds}s` : '-'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            {expanded ? '\u25BE' : '\u25B8'}
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{
          padding: '0 12px 12px',
          borderTop: '1px solid var(--glass-border)',
          fontSize: '0.75rem'
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px', padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
          }}>
            <DetailCell label="Input Tokens" value={req.input_tokens} />
            <DetailCell label="Output Tokens" value={req.output_tokens} />
            <DetailCell label="Provider" value={req.provider} />
            <DetailCell label="Status" value={req.status} />
            <DetailCell label="Time" value={new Date(req.created_at).toLocaleTimeString()} />
          </div>

          {req.error_message && (
            <PromptBlock label="Error" content={req.error_message} color="var(--accent-danger)" />
          )}

          <PromptBlock label="System Prompt" content={req.system_prompt} />
          <PromptBlock label="User Prompt" content={req.user_prompt} />
          <PromptBlock label="Raw Response" content={req.raw_response} />
        </div>
      )}
    </div>
  )
}

const DetailCell = ({ label, value }) => (
  <div>
    <div style={{
      fontSize: '0.6rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      color: 'var(--text-muted)', marginBottom: '2px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '0.8rem', color: 'var(--text-primary)',
      fontFamily: 'var(--font-mono)'
    }}>
      {value || '-'}
    </div>
  </div>
)

const PromptBlock = ({ label, content, color }) => {
  const [expanded, setExpanded] = useState(false)
  if (!content) return null

  const preview = content.length > 200 && !expanded
    ? content.slice(0, 200) + '...'
    : content

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '4px'
      }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.5px',
          color: color || 'var(--text-muted)'
        }}>
          {label}
        </span>
        {content.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--accent-primary)', fontSize: '0.65rem',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
      <pre style={{
        margin: 0, padding: '8px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.7rem', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        maxHeight: expanded ? 'none' : '120px',
        overflow: expanded ? 'visible' : 'hidden',
        lineHeight: 1.5
      }}>
        {preview}
      </pre>
    </div>
  )
}

const MiniStat = ({ label, value, color }) => (
  <div>
    <div style={{
      fontSize: '0.6rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      color: 'var(--text-muted)', marginBottom: '2px'
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '1rem', fontWeight: 700,
      color, fontFamily: 'var(--font-mono)'
    }}>
      {value}
    </div>
  </div>
)

const formatTokens = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export default AuditDrawer
