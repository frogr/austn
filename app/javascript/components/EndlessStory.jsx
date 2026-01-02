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
  const [loading, setLoading] = useState(false)

  // Use absolute time as source of truth to avoid drift
  const [nextGenTime, setNextGenTime] = useState(() => {
    if (initialNextGen) return new Date(initialNextGen).getTime()
    return Date.now() + (initialSeconds * 1000)
  })
  const [countdown, setCountdown] = useState(initialSeconds)
  const refreshScheduled = useRef(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((nextGenTime - now) / 1000))
      setCountdown(remaining)

      // When countdown hits 0, schedule one refresh
      if (remaining === 0 && !refreshScheduled.current) {
        refreshScheduled.current = true
        setTimeout(() => {
          refreshData()
          refreshScheduled.current = false
        }, 3000)
      }
    }

    // Reset the scheduled flag when nextGenTime changes
    refreshScheduled.current = false

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [nextGenTime])

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch(`/endless/paragraphs?page=${page}`)
      const data = await response.json()

      setParagraphs(data.paragraphs)
      setTotalPages(data.total_pages)
      setTotalParagraphs(data.total_paragraphs)

      // Update the absolute time source of truth
      if (data.next_generation_at) {
        setNextGenTime(new Date(data.next_generation_at).getTime())
      }
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

      if (data.next_generation_at) {
        setNextGenTime(new Date(data.next_generation_at).getTime())
      }

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
          padding: 0 0.75rem;
        }

        @media (min-width: 640px) {
          .endless-story-container {
            padding: 0 1.5rem;
          }
        }

        .story-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .story-header {
            margin-bottom: 2rem;
          }
        }

        .story-title {
          font-size: clamp(1.75rem, 4vw, 3rem);
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin: 0 0 0.5rem 0;
        }

        @media (min-width: 640px) {
          .story-title {
            margin: 0 0 0.75rem 0;
          }
        }

        .story-subtitle {
          color: rgba(255,255,255,0.6);
          font-size: 0.95rem;
          margin: 0;
        }

        @media (min-width: 640px) {
          .story-subtitle {
            font-size: 1.15rem;
          }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: saturate(200%) blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.25rem;
        }

        @media (min-width: 640px) {
          .glass-card {
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
          }
        }

        .cooldown-timer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        @media (min-width: 640px) {
          .cooldown-timer {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            text-align: left;
            gap: 1rem;
          }
        }

        .timer-content {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        @media (min-width: 640px) {
          .timer-content {
            gap: 0.75rem;
          }
        }

        .timer-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        @media (min-width: 640px) {
          .timer-label {
            font-size: 1.2rem;
          }
        }

        .timer-value {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: monospace;
          color: var(--accent-color, #4ade80);
        }

        @media (min-width: 640px) {
          .timer-value {
            font-size: 2.25rem;
          }
        }

        .paragraph-count {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        @media (min-width: 640px) {
          .paragraph-count {
            font-size: 1.1rem;
          }
        }

        .story-container {
          min-height: 300px;
        }

        @media (min-width: 640px) {
          .story-container {
            min-height: 400px;
          }
        }

        .story-text {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 1.1rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.9);
        }

        @media (min-width: 640px) {
          .story-text {
            font-size: 1.4rem;
            line-height: 2;
          }
        }

        .paragraph-block {
          margin-bottom: 1.75rem;
          position: relative;
          padding-left: 2.5rem;
        }

        @media (min-width: 640px) {
          .paragraph-block {
            margin-bottom: 2.5rem;
            padding-left: 4rem;
          }
        }

        .paragraph-number {
          position: absolute;
          left: 0;
          top: 0.2rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent-color, #4ade80);
          font-family: 'Inter', sans-serif;
          opacity: 0.8;
          min-width: 2rem;
        }

        @media (min-width: 640px) {
          .paragraph-number {
            top: 0.3rem;
            font-size: 1rem;
            min-width: 3rem;
          }
        }

        .paragraph-content {
          margin: 0;
          text-indent: 1.5em;
        }

        @media (min-width: 640px) {
          .paragraph-content {
            text-indent: 2em;
          }
        }

        .paragraph-timestamp {
          display: block;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.35);
          font-family: 'Inter', sans-serif;
          margin-top: 0.5rem;
          font-style: italic;
        }

        @media (min-width: 640px) {
          .paragraph-timestamp {
            font-size: 0.9rem;
            margin-top: 0.75rem;
          }
        }

        .empty-state, .loading-state {
          text-align: center;
          padding: 2.5rem 1rem;
        }

        @media (min-width: 640px) {
          .empty-state, .loading-state {
            padding: 4rem 1rem;
          }
        }

        .empty-title {
          font-size: 1.35rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.5rem;
          font-family: 'Georgia', serif;
          font-style: italic;
        }

        @media (min-width: 640px) {
          .empty-title {
            font-size: 1.75rem;
            margin-bottom: 0.75rem;
          }
        }

        .empty-subtitle {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1rem;
        }

        @media (min-width: 640px) {
          .empty-subtitle {
            font-size: 1.2rem;
          }
        }

        .loading-spinner {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        @media (min-width: 640px) {
          .loading-spinner {
            font-size: 1.2rem;
          }
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        @media (min-width: 640px) {
          .pagination-container {
            gap: 0.75rem;
            margin-top: 1.5rem;
          }
        }

        .page-numbers {
          display: flex;
          gap: 0.25rem;
        }

        @media (min-width: 640px) {
          .page-numbers {
            gap: 0.35rem;
          }
        }

        .pagination-btn {
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.375rem;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
        }

        @media (min-width: 640px) {
          .pagination-btn {
            padding: 0.75rem 1.25rem;
            border-radius: 0.5rem;
            font-size: 1.1rem;
          }
        }

        .pagination-btn.nav-btn {
          padding: 0.5rem 0.625rem;
          font-size: 0.8rem;
        }

        @media (min-width: 640px) {
          .pagination-btn.nav-btn {
            padding: 0.75rem 1.25rem;
            font-size: 1.1rem;
          }
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
          padding: 0 0.25rem;
        }

        @media (min-width: 640px) {
          .pagination-dots {
            padding: 0 0.5rem;
          }
        }

        .page-indicator {
          text-align: center;
          margin-top: 1rem;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
        }

        @media (min-width: 640px) {
          .page-indicator {
            margin-top: 1.5rem;
            font-size: 1.05rem;
          }
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
