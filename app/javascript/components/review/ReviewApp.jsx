import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createConsumer } from '@rails/actioncable'
import PrInput from './PrInput'
import ReviewTimeline from './ReviewTimeline'
import SynthesisSummary from './SynthesisSummary'
import AuditDrawer from './AuditDrawer'
import DecisionBar from './DecisionBar'
import CostBadge from './CostBadge'
import StatusPill from './StatusPill'

const cable = createConsumer()
const csrfToken = document.querySelector('[name="csrf-token"]')?.content

const ReviewApp = () => {
  const [reviewId, setReviewId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [sections, setSections] = useState([])
  const [synthesis, setSynthesis] = useState(null)
  const [cost, setCost] = useState(null)
  const [decision, setDecision] = useState(null)
  const [activeFile, setActiveFile] = useState(null)
  const [activeRange, setActiveRange] = useState(null)
  const [auditOpen, setAuditOpen] = useState(false)
  const [error, setError] = useState(null)
  const [prUrl, setPrUrl] = useState('')

  useEffect(() => {
    if (!reviewId) return
    const subscription = cable.subscriptions.create(
      { channel: 'ReviewChannel', review_id: reviewId },
      {
        received(data) {
          if (data.type === 'section_complete') {
            setSections(prev => [...prev, data.section])
          } else if (data.type === 'synthesis_complete') {
            setSynthesis(data.synthesis)
          }
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [reviewId])

  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    if (!reviewId) return
    const interval = setInterval(async () => {
      if (statusRef.current === 'complete' || statusRef.current === 'failed') return
      try {
        const res = await fetch(`/reviews/${reviewId}`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status)
          if (data.sections) setSections(data.sections)
          if (data.synthesis?.verdict) setSynthesis(data.synthesis)
          if (data.cost) setCost(data.cost)
          if (data.decision) setDecision(data.decision)
        }
      } catch { /* ignore */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [reviewId])

  const handleSubmit = useCallback(async (url) => {
    setError(null)
    setStatus('submitting')
    setPrUrl(url)
    try {
      const res = await fetch('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ pr_url: url })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start review')
      }
      const data = await res.json()
      setReviewId(data.id)
      setStatus('reviewing')
      setSections([])
      setSynthesis(null)
      setCost(null)
      setDecision(null)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }, [])

  const handleSynthesize = useCallback(async () => {
    try {
      await fetch(`/reviews/${reviewId}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
      })
    } catch (err) {
      setError(err.message)
    }
  }, [reviewId])

  const handleDecision = useCallback(async (dec, comment) => {
    try {
      const res = await fetch(`/reviews/${reviewId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ decision: dec, comment })
      })
      if (res.ok) setDecision(dec)
    } catch (err) {
      setError(err.message)
    }
  }, [reviewId])

  const handleFindingClick = useCallback((finding) => {
    if (finding.file) {
      setActiveFile(finding.file)
      setActiveRange(finding.line_range)
    }
  }, [])

  const isReviewing = status === 'reviewing' || status === 'submitting'
  const hasSections = sections.length > 0
  const canSynthesize = status === 'complete' && hasSections && !synthesis?.verdict

  const findingCounts = sections.reduce((acc, s) => {
    (s.findings || []).forEach(f => {
      acc[f.severity] = (acc[f.severity] || 0) + 1
    })
    return acc
  }, {})

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            background: 'var(--gradient-cool)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Code Review
          </h1>
          {prUrl && reviewId && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
              {prUrl.replace('https://github.com/', '')}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          {reviewId && <StatusPill status={status} />}
          {cost && <CostBadge cost={cost} />}
          {reviewId && (
            <button
              onClick={() => setAuditOpen(true)}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Audit Log
            </button>
          )}
        </div>
      </div>

      <PrInput onSubmit={handleSubmit} disabled={isReviewing} />

      {error && (
        <div style={{
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-sm) var(--space-md)',
          color: 'var(--accent-danger)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-md)'
        }}>
          {error}
        </div>
      )}

      {status === 'failed' && !error && (
        <div style={{
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-sm) var(--space-md)',
          color: 'var(--accent-danger)',
          fontSize: '0.85rem',
          marginBottom: 'var(--space-md)'
        }}>
          Review failed. Could be a GitHub API issue or invalid PR URL.
        </div>
      )}

      {!reviewId && status === 'idle' && !error && (
        <EmptyState />
      )}

      {/* Stats bar */}
      {hasSections && (
        <div style={{
          display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)',
          flexWrap: 'wrap'
        }}>
          <StatChip label="Files" value={sections.length} color="var(--accent-primary)" />
          {findingCounts.red_flag > 0 && (
            <StatChip label="Red Flags" value={findingCounts.red_flag} color="var(--accent-danger)" />
          )}
          {findingCounts.warning > 0 && (
            <StatChip label="Warnings" value={findingCounts.warning} color="var(--accent-warning)" />
          )}
          {findingCounts.info > 0 && (
            <StatChip label="Info" value={findingCounts.info} color="#64D2FF" />
          )}
          {isReviewing && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--text-muted)', fontSize: '0.8rem'
            }}>
              <span className="review-pulse" />
              Analyzing...
            </div>
          )}
        </div>
      )}

      {/* Main layout: single column flow */}
      {reviewId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Synthesis at top when available */}
          <SynthesisSummary synthesis={synthesis} />

          {/* Decision bar */}
          {(synthesis?.verdict || decision) && (
            <DecisionBar
              decision={decision}
              reviewId={reviewId}
              onDecide={handleDecision}
            />
          )}

          {/* Finalize button */}
          {canSynthesize && (
            <button
              onClick={handleSynthesize}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
            >
              Finalize Review
            </button>
          )}

          {/* File-by-file review: diff + findings inline */}
          <ReviewTimeline
            sections={sections}
            status={status}
            reviewId={reviewId}
            activeFile={activeFile}
            activeRange={activeRange}
            onFindingClick={handleFindingClick}
          />
        </div>
      )}

      {/* Audit drawer */}
      <AuditDrawer
        reviewId={reviewId}
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
      />

      <style>{`
        .review-pulse {
          display: inline-block;
          width: 8px; height: 8px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: rpulse 1.5s ease-in-out infinite;
        }
        @keyframes rpulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const StatChip = ({ label, value, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)', padding: '4px 12px',
    fontSize: '0.8rem'
  }}>
    <span style={{
      fontWeight: 700, color, fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
    }}>{value}</span>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
  </div>
)

const EmptyState = () => (
  <div style={{
    textAlign: 'center', padding: '80px 20px',
    color: 'var(--text-muted)'
  }}>
    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', opacity: 0.3 }}>
      {'</>'}
    </div>
    <p style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
      Paste a public GitHub PR URL above to start an AI-powered code review.
      Each file is triaged, analyzed, and summarized with full cost transparency.
    </p>
  </div>
)

export default ReviewApp
