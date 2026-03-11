import React, { useState } from 'react'

const PrInput = ({ onSubmit, disabled }) => {
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    onSubmit(url.trim())
  }

  const isValid = /github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(url)

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://github.com/owner/repo/pull/123"
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !isValid}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {disabled ? 'Reviewing...' : 'Start Review'}
      </button>
    </form>
  )
}

export default PrInput
