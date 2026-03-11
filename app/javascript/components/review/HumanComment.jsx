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
    <div className="mt-3 space-y-2">
      {existingComments.map((comment, i) => (
        <div key={i} className="bg-purple-50 border border-purple-200 rounded p-2 text-sm">
          <span className="font-medium text-purple-700">You:</span> {comment.text}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  )
}

export default HumanComment
