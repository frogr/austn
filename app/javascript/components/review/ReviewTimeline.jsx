import React, { useRef, useEffect } from 'react'
import FileReviewCard from './FileReviewCard'

const ReviewTimeline = ({ sections, status, reviewId, activeFile, activeRange, onFindingClick }) => {
  const fileRefs = useRef({})

  useEffect(() => {
    if (activeFile && fileRefs.current[activeFile]) {
      fileRefs.current[activeFile].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeFile, activeRange])

  if (!sections || sections.length === 0) {
    if (status === 'reviewing' || status === 'submitting') {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          color: 'var(--text-muted)', padding: '40px 0'
        }}>
          <Spinner />
          <span style={{ fontSize: '0.9rem' }}>Fetching diff and triaging files...</span>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {sections.map((section, i) => (
        <div
          key={section.id || section.filename}
          ref={el => fileRefs.current[section.filename] = el}
        >
          <FileReviewCard
            section={section}
            reviewId={reviewId}
            index={i}
            isActive={activeFile === section.filename}
            activeRange={activeFile === section.filename ? activeRange : null}
            onFindingClick={onFindingClick}
          />
        </div>
      ))}
    </div>
  )
}

const Spinner = () => (
  <span style={{
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid var(--glass-border)',
    borderTopColor: 'var(--accent-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }} />
)

export default ReviewTimeline
