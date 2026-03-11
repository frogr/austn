import React from 'react'

const VERDICT_STYLES = {
  approve: 'bg-green-100 text-green-800 border-green-300',
  request_changes: 'bg-red-100 text-red-800 border-red-300',
  needs_discussion: 'bg-yellow-100 text-yellow-800 border-yellow-300'
}

const VERDICT_LABELS = {
  approve: 'Approved',
  request_changes: 'Changes Requested',
  needs_discussion: 'Needs Discussion'
}

const SynthesisSummary = ({ synthesis }) => {
  if (!synthesis || !synthesis.verdict) return null

  const verdictStyle = VERDICT_STYLES[synthesis.verdict] || VERDICT_STYLES.needs_discussion
  const verdictLabel = VERDICT_LABELS[synthesis.verdict] || synthesis.verdict

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Review Summary</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${verdictStyle}`}>
          {verdictLabel}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4">{synthesis.summary}</p>

      {synthesis.key_concerns?.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-red-700 mb-1">Key Concerns</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {synthesis.key_concerns.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {synthesis.praise?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-1">Praise</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {synthesis.praise.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SynthesisSummary
