import React, { useState, useCallback } from 'react'
import FindingBadge from './FindingBadge'
import HumanComment from './HumanComment'

const LANG_COLORS = {
  ruby: '#CC342D', javascript: '#F7DF1E', python: '#3776AB',
  typescript: '#3178C6', go: '#00ADD8', rust: '#DEA584',
  css: '#1572B6', html: '#E34F26', yaml: '#CB171E',
  json: '#292929', markdown: '#083FA1', shell: '#89E051',
  sql: '#e38c00'
}

const FileReviewCard = ({ section, reviewId, index, isActive, activeRange, onFindingClick }) => {
  const [showDiff, setShowDiff] = useState(false)
  const [comments, setComments] = useState(section.human_comments || [])

  const handleCommentAdded = useCallback((comment) => {
    setComments(prev => [...prev, comment])
  }, [])

  const langColor = LANG_COLORS[section.language] || '#888'
  const findings = section.findings || []
  const hasFindings = findings.length > 0
  const hasDanger = findings.some(f => f.severity === 'red_flag')
  const hasWarning = findings.some(f => f.severity === 'warning')

  const borderAccent = hasDanger ? 'rgba(255, 59, 48, 0.4)' :
    hasWarning ? 'rgba(255, 149, 0, 0.3)' : 'var(--glass-border)'

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: `1px solid ${borderAccent}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      transition: 'all var(--transition-base)',
      ...(isActive ? { boxShadow: '0 0 0 2px rgba(94, 92, 230, 0.5)' } : {})
    }}>
      {/* File header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: 3, height: 20, borderRadius: 2,
            background: langColor, flexShrink: 0
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
            color: 'var(--text-secondary)', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {section.filename}
          </span>
          {section.language && section.language !== 'text' && (
            <span style={{
              fontSize: '0.65rem', color: langColor, background: `${langColor}15`,
              padding: '2px 6px', borderRadius: '4px', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0
            }}>
              {section.language}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          {hasFindings && (
            <span style={{
              fontSize: '0.7rem', color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              {findings.length} finding{findings.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setShowDiff(!showDiff)}
            style={{
              background: showDiff ? 'rgba(29, 185, 84, 0.15)' : 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: showDiff ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.7rem', padding: '3px 8px', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', transition: 'all var(--transition-fast)'
            }}
          >
            {showDiff ? 'Hide Diff' : 'Show Diff'}
          </button>
        </div>
      </div>

      {/* Walkthrough */}
      {section.walkthrough && (
        <div style={{
          padding: '12px 16px', fontSize: '0.85rem',
          color: 'var(--text-secondary)', lineHeight: 1.65,
          borderBottom: (hasFindings || showDiff) ? '1px solid var(--glass-border)' : 'none'
        }}>
          {section.walkthrough}
        </div>
      )}

      {/* Diff viewer */}
      {showDiff && section.patch_text && (
        <div style={{
          borderBottom: hasFindings ? '1px solid var(--glass-border)' : 'none',
          maxHeight: '400px', overflowY: 'auto'
        }}>
          <DiffBlock
            patchText={section.patch_text}
            activeRange={activeRange}
          />
        </div>
      )}

      {/* Findings */}
      {hasFindings && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {findings.map((finding, i) => (
            <FindingRow
              key={i}
              finding={finding}
              onClick={() => {
                onFindingClick?.({ ...finding, file: section.filename })
                if (!showDiff) setShowDiff(true)
              }}
            />
          ))}
        </div>
      )}

      {/* Human comments */}
      <div style={{ padding: '0 16px 12px' }}>
        <HumanComment
          sectionId={section.id}
          reviewId={reviewId}
          existingComments={comments}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  )
}

const FindingRow = ({ finding, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '10px 12px', borderRadius: 'var(--radius-sm)',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.04)',
      cursor: 'pointer', transition: 'all var(--transition-fast)'
    }}
    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
  >
    <FindingBadge severity={finding.severity} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px', marginBottom: '2px'
      }}>
        <span style={{
          fontSize: '0.82rem', fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          {finding.title}
        </span>
        {finding.line_range && (
          <span style={{
            fontSize: '0.7rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', flexShrink: 0
          }}>
            {finding.line_range}
          </span>
        )}
      </div>
      <p style={{
        fontSize: '0.8rem', color: 'var(--text-muted)',
        lineHeight: 1.55, margin: 0
      }}>
        {finding.explanation}
      </p>
    </div>
  </div>
)

const DiffBlock = ({ patchText, activeRange }) => {
  const lines = patchText.split('\n')

  return (
    <pre style={{
      margin: 0, padding: 0, fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem', lineHeight: '1.6', overflowX: 'auto'
    }}>
      {lines.map((line, i) => {
        const lineNum = i + 1
        const isAdd = line.startsWith('+') && !line.startsWith('+++')
        const isDel = line.startsWith('-') && !line.startsWith('---')
        const isHunk = line.startsWith('@@')

        let bg = 'transparent'
        let color = 'var(--text-muted)'
        if (isAdd) { bg = 'rgba(29, 185, 84, 0.08)'; color = 'rgba(29, 185, 84, 0.9)' }
        if (isDel) { bg = 'rgba(255, 59, 48, 0.08)'; color = 'rgba(255, 59, 48, 0.85)' }
        if (isHunk) { bg = 'rgba(94, 92, 230, 0.06)'; color = 'rgba(94, 92, 230, 0.7)' }

        return (
          <div key={i} style={{
            display: 'flex', background: bg, minHeight: '1.6em'
          }}>
            <span style={{
              display: 'inline-block', width: '40px', textAlign: 'right',
              padding: '0 8px 0 0', color: 'rgba(255,255,255,0.15)',
              userSelect: 'none', flexShrink: 0, fontSize: '0.7rem'
            }}>
              {lineNum}
            </span>
            <span style={{
              display: 'inline-block', width: '16px', textAlign: 'center',
              color: isAdd ? 'rgba(29, 185, 84, 0.6)' : isDel ? 'rgba(255, 59, 48, 0.6)' : 'transparent',
              userSelect: 'none', flexShrink: 0
            }}>
              {isAdd ? '+' : isDel ? '-' : ' '}
            </span>
            <span style={{
              color, padding: '0 12px 0 4px', whiteSpace: 'pre'
            }}>
              {isAdd ? line.slice(1) : isDel ? line.slice(1) : isHunk ? line : line}
            </span>
          </div>
        )
      })}
    </pre>
  )
}

export default FileReviewCard
