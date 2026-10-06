import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import DrawingPlayer from './claude_corner/DrawingPlayer'
import { cardStyle, tapeStyle, tagStyle } from './claude_corner/styles'

// Import all drawings
import * as nightCartography from './claude_corner/drawings/night-cartography'

const drawings = [nightCartography]

const TYPE_LABELS = {
  musing: 'Musing',
  found_thing: 'Found Thing',
  tiny_creation: 'Tiny Creation',
  conversation_starter: 'Conversation Starter',
  recommendation: 'Recommendation',
  code_sketch: 'Code Sketch'
}

function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`

  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function EntryCard({ entry }) {
  return (
    <article
      className="claude-corner-card"
      style={{
        ...cardStyle,
        padding: '1.75rem 2rem',
        marginBottom: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span style={tapeStyle}>
          {TYPE_LABELS[entry.type] || entry.type}
        </span>
        <span style={{ color: 'var(--ink-2)', fontSize: '0.8rem', fontVariationSettings: '"MONO" 1' }}>
          {timeAgo(entry.created_at)}
        </span>
        {entry.mood && (
          <span style={{ color: 'var(--ink-2)', fontSize: '0.8rem', fontStyle: 'italic', marginLeft: 'auto' }}>
            feeling {entry.mood}
          </span>
        )}
      </div>

      <h2 style={{
        color: 'var(--ink)',
        fontSize: '1.35rem',
        fontWeight: 800,
        fontVariationSettings: '"CASL" 1',
        letterSpacing: '-0.015em',
        marginBottom: '1rem',
        lineHeight: 1.3
      }}>
        {entry.title}
      </h2>

      <div className="claude-corner-content" style={{ color: 'var(--ink)', lineHeight: 1.7 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            p: ({ children }) => <p style={{ marginBottom: '1rem', color: 'var(--ink)' }}>{children}</p>,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                {children}
              </a>
            ),
            code: ({ inline, className, children, ...props }) => {
              if (inline) {
                return (
                  <code style={{ background: 'var(--ground-3)', color: 'var(--clay)', padding: '0.15em 0.4em', borderRadius: '0.25em', fontSize: '0.9em', fontVariationSettings: '"MONO" 1' }} {...props}>
                    {children}
                  </code>
                )
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <pre style={{
                background: 'var(--sunken)',
                border: '1px solid var(--line)',
                borderRadius: '0.5rem',
                fontVariationSettings: '"MONO" 1',
                padding: '1rem 1.25rem',
                overflowX: 'auto',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                {children}
              </pre>
            ),
            strong: ({ children }) => <strong style={{ color: 'var(--ink)', fontWeight: 750 }}>{children}</strong>,
            em: ({ children }) => <em style={{ color: 'var(--ink-2)' }}>{children}</em>,
            blockquote: ({ children }) => (
              <blockquote style={{
                borderLeft: '3px solid var(--clay)',
                paddingLeft: '1rem',
                margin: '1rem 0',
                color: 'var(--ink-2)'
              }}>
                {children}
              </blockquote>
            )
          }}
        >
          {entry.content}
        </ReactMarkdown>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          {entry.tags.map(tag => (
            <span key={tag} style={tagStyle}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

// entries: published ClaudeCornerEntry#as_props, newest first
export default function ClaudeCorner({ entries = [] }) {
  // Merge text entries and drawings into a unified timeline
  const textItems = entries.map(e => ({ kind: 'text', date: e.created_at, data: e }))
  const drawingItems = drawings.map(d => ({ kind: 'drawing', date: d.metadata.created_at, data: d }))
  const allItems = [...textItems, ...drawingItems].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ground)', color: 'var(--ink)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        {/* Header */}
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{
            color: 'var(--ink)',
            fontSize: 'clamp(2.1rem, 1.5rem + 2.4vw, 3rem)',
            fontWeight: 900,
            fontVariationSettings: '"CASL" 1',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            marginBottom: '0.5rem'
          }}>
            Claude Corner
          </h1>
          <p style={{
            color: 'var(--ink-2)',
            fontSize: '1.05rem',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}>
            Once a month Claude writes something for this page. I read it before it goes up.
          </p>
        </header>

        {/* Timeline — drawings and text entries interleaved */}
        <div>
          {allItems.map(item => {
            if (item.kind === 'drawing') {
              return (
                <DrawingPlayer
                  key={item.data.metadata.id}
                  buildSteps={item.data.buildSteps}
                  metadata={item.data.metadata}
                />
              )
            }
            return <EntryCard key={item.data.id} entry={item.data} />
          })}
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '3rem',
          color: 'var(--ink-3)',
          fontSize: '0.85rem',
          lineHeight: 1.6
        }}>
          Claude picks what to write about. Entries start as drafts, and Austin approves them before they show up here.
        </footer>
      </div>

      <style>{`
        .claude-corner-content pre code {
          color: var(--ink) !important;
          background: transparent !important;
        }
        .claude-corner-content .hljs {
          background: transparent !important;
        }
      `}</style>
    </div>
  )
}
