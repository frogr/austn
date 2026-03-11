import React, { useState } from 'react'
import FindingBadge from './FindingBadge'
import HumanComment from './HumanComment'

const SectionCard = ({ section, reviewId, onFindingClick }) => {
  const [expanded, setExpanded] = useState(true)

  const languageBadge = section.language && section.language !== 'text'
    ? <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded ml-2">{section.language}</span>
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center">
          <span className="font-mono text-sm font-medium text-gray-900">{section.filename}</span>
          {languageBadge}
        </div>
        <span className="text-gray-400">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {section.walkthrough && (
            <p className="text-sm text-gray-600 leading-relaxed">{section.walkthrough}</p>
          )}

          {(section.findings || []).map((finding, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => onFindingClick?.(finding)}
            >
              <div className="flex items-center gap-2 mb-1">
                <FindingBadge severity={finding.severity} />
                <span className="text-sm font-medium text-gray-900">{finding.title}</span>
                {finding.line_range && (
                  <span className="text-xs text-gray-400 ml-auto">{finding.line_range}</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{finding.explanation}</p>
            </div>
          ))}

          <HumanComment
            sectionId={section.id}
            reviewId={reviewId}
            existingComments={section.human_comments || []}
          />
        </div>
      )}
    </div>
  )
}

export default SectionCard
