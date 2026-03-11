import React, { useState, useEffect, useCallback } from 'react'
import { createConsumer } from '@rails/actioncable'
import PrInput from './PrInput'
import DiffPanel from './DiffPanel'
import ReviewPanel from './ReviewPanel'

const cable = createConsumer()

const csrfToken = () => document.querySelector('[name="csrf-token"]')?.content

const ReviewApp = () => {
  const [reviewId, setReviewId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [sections, setSections] = useState([])
  const [synthesis, setSynthesis] = useState(null)
  const [highlightFile, setHighlightFile] = useState(null)
  const [highlightRange, setHighlightRange] = useState(null)
  const [error, setError] = useState(null)

  // Subscribe to ActionCable when we have a review
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

  // Poll for status updates
  useEffect(() => {
    if (!reviewId || status === 'complete' || status === 'failed') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/reviews/${reviewId}`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.status)
          if (data.sections?.length > sections.length) {
            setSections(data.sections)
          }
          if (data.synthesis?.verdict) {
            setSynthesis(data.synthesis)
          }
        }
      } catch { /* ignore polling errors */ }
    }, 3000)

    return () => clearInterval(interval)
  }, [reviewId, status, sections.length])

  const handleSubmit = useCallback(async (prUrl) => {
    setError(null)
    setStatus('submitting')

    try {
      const res = await fetch('/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken()
        },
        body: JSON.stringify({ pr_url: prUrl })
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
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }, [])

  const handleSynthesize = useCallback(async () => {
    try {
      await fetch(`/reviews/${reviewId}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken()
        }
      })
    } catch (err) {
      setError(err.message)
    }
  }, [reviewId])

  const handleFindingClick = useCallback((finding) => {
    if (finding.file) {
      setHighlightFile(finding.file)
      setHighlightRange(finding.line_range)
    }
  }, [])

  const isReviewing = status === 'reviewing' || status === 'submitting'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Code Review</h1>

      <PrInput onSubmit={handleSubmit} disabled={isReviewing} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      {reviewId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Files</h2>
            <DiffPanel
              sections={sections}
              highlightFile={highlightFile}
              highlightRange={highlightRange}
            />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Review</h2>
            <ReviewPanel
              sections={sections}
              synthesis={synthesis}
              reviewId={reviewId}
              status={status}
              onSynthesize={handleSynthesize}
              onFindingClick={handleFindingClick}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewApp
