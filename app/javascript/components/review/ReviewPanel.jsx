import React from 'react'
import SectionCard from './SectionCard'
import SynthesisSummary from './SynthesisSummary'

const ReviewPanel = ({ sections, synthesis, reviewId, status, onSynthesize, onFindingClick }) => {
  const hasSections = sections && sections.length > 0
  const canSynthesize = status === 'complete' && hasSections && !synthesis?.verdict

  return (
    <div className="space-y-4 overflow-y-auto max-h-[80vh]">
      {!hasSections && status === 'reviewing' && (
        <div className="flex items-center gap-2 text-sm text-gray-500 p-4">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
          Triaging files and starting review...
        </div>
      )}

      {hasSections && status === 'reviewing' && (
        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <span className="animate-spin inline-block w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full" />
          Reviewing more files...
        </div>
      )}

      {status === 'complete' && !hasSections && (
        <div className="text-sm text-gray-400 p-4 text-center">
          No files were flagged for review.
        </div>
      )}

      {sections.map((section) => (
        <SectionCard
          key={section.id || section.filename}
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
