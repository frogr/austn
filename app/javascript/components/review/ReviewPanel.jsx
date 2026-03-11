import React from 'react'
import SectionCard from './SectionCard'
import SynthesisSummary from './SynthesisSummary'

const ReviewPanel = ({ sections, synthesis, reviewId, status, onSynthesize, onFindingClick }) => {
  const hasSections = sections && sections.length > 0
  const canSynthesize = status === 'complete' && hasSections && !synthesis?.verdict

  return (
    <div className="space-y-4 overflow-y-auto">
      {!hasSections && status === 'reviewing' && (
        <div className="flex items-center gap-2 text-sm text-gray-500 p-4">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
          Reviewing pull request...
        </div>
      )}

      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          reviewId={reviewId}
          onFindingClick={onFindingClick}
        />
      ))}

      {canSynthesize && (
        <button
          onClick={onSynthesize}
          className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Finalize Review
        </button>
      )}

      <SynthesisSummary synthesis={synthesis} />
    </div>
  )
}

export default ReviewPanel
