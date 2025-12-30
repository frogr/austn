import React, { useState, useEffect, useRef, useCallback } from 'react'

const EndlessStory = ({
  storyTitle = 'The Long Road',
  initialParagraphs = [],
  initialPage = 1,
  totalPages: initialTotalPages = 1,
  totalParagraphs: initialTotalParagraphs = 0,
  secondsUntilNext: initialSeconds = 1800,
  nextGenerationAt: initialNextGen
}) => {
  const [paragraphs, setParagraphs] = useState(initialParagraphs)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [totalParagraphs, setTotalParagraphs] = useState(initialTotalParagraphs)
  const [countdown, setCountdown] = useState(initialSeconds)
  const [loading, setLoading] = useState(false)
  const countdownRef = useRef(null)

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setTimeout(() => refreshData(), 3000)
          return 1800
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [])

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch(`/endless/paragraphs?page=${page}`)
      const data = await response.json()

      setParagraphs(data.paragraphs)
      setTotalPages(data.total_pages)
      setTotalParagraphs(data.total_paragraphs)
      setCountdown(data.seconds_until_next)
    } catch (error) {
      console.error('Failed to refresh:', error)
    }
  }, [page])

  const fetchPage = async (newPage) => {
    setLoading(true)
    try {
      const response = await fetch(`/endless/paragraphs?page=${newPage}`)
      const data = await response.json()

      setParagraphs(data.paragraphs)
      setPage(newPage)
      setTotalPages(data.total_pages)
      setTotalParagraphs(data.total_paragraphs)
      setCountdown(data.seconds_until_next)

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Failed to fetch page:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const showPages = 5
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, start + showPages - 1)

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1)
    }

    if (start > 1) {
      pages.push(
        <button key={1} onClick={() => fetchPage(1)} className="pagination-btn">1</button>
      )
      if (start > 2) pages.push(<span key="dots1" className="pagination-dots">...</span>)
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => fetchPage(i)}
          className={`pagination-btn ${i === page ? 'active' : ''}`}
          disabled={i === page}
        >
          {i}
        </button>
      )
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="dots2" className="pagination-dots">...</span>)
      pages.push(
        <button key={totalPages} onClick={() => fetchPage(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      )
    }

    return (
      <div className="pagination-container">
        <button
          onClick={() => fetchPage(page - 1)}
          disabled={page === 1}
          className="pagination-btn nav-btn"
        >
          Previous
        </button>
        <div className="page-numbers">{pages}</div>
        <button
          onClick={() => fetchPage(page + 1)}
          disabled={page === totalPages}
          className="pagination-btn nav-btn"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="endless-story-container">
      <style>{`
        .endless-story-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .story-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .story-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin: 0 0 0.75rem 0;
        }

        .story-subtitle {
          color: rgba(255,255,255,0.6);
          font-size: 1.15rem;
          margin: 0;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: saturate(200%) blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .cooldown-timer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .timer-content {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .timer-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.2rem;
        }

        .timer-value {
          font-size: 2.25rem;
          font-weight: 700;
          font-family: monospace;
          color: var(--accent-color, #4ade80);
        }

        .paragraph-count {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.1rem;
        }

        .story-container {
          min-height: 400px;
        }

        .story-text {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 1.4rem;
          line-height: 2;
          color: rgba(255, 255, 255, 0.9);
        }

        .paragraph-block {
          margin-bottom: 2.5rem;
          position: relative;
          padding-left: 4rem;
        }

        .paragraph-number {
          position: absolute;
          left: 0;
          top: 0.3rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--accent-color, #4ade80);
          font-family: 'Inter', sans-serif;
          opacity: 0.8;
          min-width: 3rem;
        }

        .paragraph-content {
          margin: 0;
          text-indent: 2em;
        }

        .paragraph-timestamp {
          display: block;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.35);
          font-family: 'Inter', sans-serif;
          margin-top: 0.75rem;
          font-style: italic;
        }

        .empty-state, .loading-state {
          text-align: center;
          padding: 4rem 1rem;
        }

        .empty-title {
          font-size: 1.75rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.75rem;
          font-family: 'Georgia', serif;
          font-style: italic;
        }

        .empty-subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.2rem;
        }

        .loading-spinner {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.2rem;
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }

        .page-numbers {
          display: flex;
          gap: 0.35rem;
        }

        .pagination-btn {
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.1rem;
          font-family: 'Inter', sans-serif;
        }

        .pagination-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .pagination-btn.active {
          background: var(--accent-color, #4ade80);
          color: #000;
          font-weight: 600;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-dots {
          color: rgba(255, 255, 255, 0.4);
          padding: 0 0.5rem;
        }

        .page-indicator {
          text-align: center;
          margin-top: 1.5rem;
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.05rem;
        }
      `}</style>

      <div className="story-header">
        <h1 className="story-title">{storyTitle || 'Endless Story'}</h1>
        <p className="story-subtitle">An AI-generated thriller, one paragraph every 30 minutes</p>
      </div>

      <div className="cooldown-timer glass-card">
        <div className="timer-content">
          <span className="timer-label">Next paragraph in</span>
          <span className="timer-value">{formatCountdown(countdown)}</span>
        </div>
        <div className="paragraph-count">
          {totalParagraphs} paragraph{totalParagraphs !== 1 ? 's' : ''} written
        </div>
      </div>

      <div className="story-container glass-card">
        {loading ? (
          <div className="loading-state">
            <span className="loading-spinner">Loading...</span>
          </div>
        ) : paragraphs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">The story has not yet begun...</p>
            <p className="empty-subtitle">Check back soon. A new paragraph is generated every 30 minutes.</p>
          </div>
        ) : (
          <div className="story-text">
            {paragraphs.map((paragraph) => (
              <div key={paragraph.id} className="paragraph-block">
                <span className="paragraph-number">{paragraph.number}</span>
                <p className="paragraph-content">{paragraph.content}</p>
                <span className="paragraph-timestamp">{paragraph.formatted_time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {renderPagination()}

      {totalPages > 1 && (
        <div className="page-indicator">
          Page {page} of {totalPages}
        </div>
      )}
    </div>
  )
}

export default EndlessStory
