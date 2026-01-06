import React, { useState, useEffect, useCallback } from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'linear-gradient(180deg, rgba(20,20,25,1) 0%, rgba(12,12,16,1) 100%)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255,255,255,0.08)',
    width: '90%',
    maxWidth: '720px',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.02)',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  closeButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    lineHeight: 1,
    transition: 'all 0.15s',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(0,0,0,0.2)',
  },
  tab: {
    flex: 1,
    padding: '0.625rem 1rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    transition: 'all 0.15s',
  },
  activeTab: {
    color: '#10b981',
    borderBottomColor: '#10b981',
    background: 'rgba(16, 185, 129, 0.05)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.5rem',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  cardName: {
    fontWeight: 600,
    color: 'white',
    marginBottom: '0.375rem',
    fontSize: '0.8rem',
  },
  cardDescription: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.5rem',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '0.5rem',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  tag: {
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.5)',
    padding: '0.125rem 0.375rem',
    borderRadius: '0.2rem',
    fontSize: '0.55rem',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  templateBadge: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
  },
  cardActions: {
    display: 'flex',
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  actionButton: {
    flex: 1,
    padding: '0.3rem 0.4rem',
    fontSize: '0.6rem',
    fontWeight: 600,
    borderRadius: '0.25rem',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  loadButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    color: '#10b981',
  },
  mergeButton: {
    background: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    flex: 'none',
    width: '28px',
  },
  // Quick Import styles
  importSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    height: '100%',
  },
  importLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    fontWeight: 500,
  },
  importHint: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.35)',
  },
  textarea: {
    flex: 1,
    minHeight: '220px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.7rem',
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    resize: 'none',
    lineHeight: 1.5,
  },
  importActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  importButton: {
    flex: 1,
    padding: '0.625rem 1rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    borderRadius: '0.25rem',
    border: '1px solid transparent',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    transition: 'all 0.15s',
  },
  primaryButton: {
    background: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  secondaryButton: {
    background: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  },
  error: {
    color: '#f87171',
    fontSize: '0.65rem',
    padding: '0.5rem',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '0.25rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  success: {
    color: '#34d399',
    fontSize: '0.65rem',
    padding: '0.5rem',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '0.25rem',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  searchRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.75rem',
  },
  filterSelect: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.7rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.75rem',
  },
}

export default function PatternLibrary({ isOpen, onClose }) {
  const { actions } = useDAW()
  const [activeTab, setActiveTab] = useState('library')
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTemplates, setFilterTemplates] = useState('all')
  const [hoveredCard, setHoveredCard] = useState(null)

  // Quick Import state
  const [jsonInput, setJsonInput] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

  const fetchPatterns = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (filterTemplates === 'templates') params.set('templates', 'true')
      if (filterTemplates === 'user') params.set('templates', 'false')

      const response = await fetch(`/daw/patterns?${params}`)
      const data = await response.json()
      setPatterns(data)
    } catch (err) {
      console.error('Failed to fetch patterns:', err)
    } finally {
      setLoading(false)
    }
  }, [search, filterTemplates])

  useEffect(() => {
    if (isOpen && activeTab === 'library') {
      fetchPatterns()
    }
  }, [isOpen, activeTab, fetchPatterns])

  const handleLoad = useCallback(async (pattern, mode = 'replace') => {
    // Stop playback first for clean state transition
    actions.preparePatternLoad()
    // Small delay to allow audio engine to stop
    await new Promise(resolve => setTimeout(resolve, 50))
    actions.loadPattern(pattern, mode)
    onClose()
  }, [actions, onClose])

  const handleDelete = useCallback(async (pattern) => {
    if (!confirm(`Delete "${pattern.name}"?`)) return

    try {
      await fetch(`/daw/patterns/${pattern.id}`, { method: 'DELETE' })
      fetchPatterns()
    } catch (err) {
      console.error('Failed to delete pattern:', err)
    }
  }, [fetchPatterns])

  const validateJson = (input) => {
    try {
      const parsed = JSON.parse(input)

      if (!parsed.name && !parsed.tracks) {
        return { valid: false, error: 'JSON must contain "name" or "tracks" field' }
      }

      if (parsed.tracks) {
        if (!Array.isArray(parsed.tracks)) {
          return { valid: false, error: '"tracks" must be an array' }
        }
        for (const track of parsed.tracks) {
          if (!track.type) {
            return { valid: false, error: 'Each track must have a "type" field' }
          }
          if (!['synth', 'drums', 'pluck', 'fm', 'am', 'audio'].includes(track.type)) {
            return { valid: false, error: `Invalid track type: "${track.type}"` }
          }
        }
      }

      return { valid: true, data: parsed }
    } catch (err) {
      return { valid: false, error: `Invalid JSON: ${err.message}` }
    }
  }

  const handleQuickLoad = useCallback(async () => {
    setImportError('')
    setImportSuccess('')

    const { valid, error, data } = validateJson(jsonInput)
    if (!valid) {
      setImportError(error)
      return
    }

    const pattern = {
      name: data.name || 'Imported Pattern',
      bpm: data.bpm,
      total_steps: data.totalSteps || data.total_steps,
      steps_per_measure: data.stepsPerMeasure || data.steps_per_measure,
      data: {
        tracks: data.tracks || [],
      },
    }

    // Stop playback first for clean state transition
    actions.preparePatternLoad()
    await new Promise(resolve => setTimeout(resolve, 50))
    actions.loadPattern(pattern, 'replace')
    setImportSuccess('Pattern loaded!')
    setTimeout(() => {
      onClose()
    }, 400)
  }, [jsonInput, actions, onClose])

  const handleSaveToLibrary = useCallback(async () => {
    setImportError('')
    setImportSuccess('')

    const { valid, error, data } = validateJson(jsonInput)
    if (!valid) {
      setImportError(error)
      return
    }

    try {
      const response = await fetch('/daw/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || 'Imported Pattern',
          description: data.description || '',
          bpm: data.bpm || 120,
          total_steps: data.totalSteps || data.total_steps || 16,
          steps_per_measure: data.stepsPerMeasure || data.steps_per_measure || 16,
          tags: data.tags || [],
          data: { tracks: data.tracks || [] },
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.errors?.join(', ') || 'Failed to save')
      }

      setImportSuccess('Saved to library!')
      setJsonInput('')
      fetchPatterns()
    } catch (err) {
      setImportError(err.message)
    }
  }, [jsonInput, fetchPatterns])

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>Pattern Library</span>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            ×
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'library' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('library')}
          >
            Browse
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'import' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('import')}
          >
            Import JSON
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === 'library' && (
            <>
              <div style={styles.searchRow}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
                <select
                  value={filterTemplates}
                  onChange={(e) => setFilterTemplates(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="templates">Templates</option>
                  <option value="user">My Patterns</option>
                </select>
              </div>

              {loading ? (
                <div style={styles.emptyState}>Loading...</div>
              ) : patterns.length === 0 ? (
                <div style={styles.emptyState}>
                  No patterns found
                </div>
              ) : (
                <div style={styles.grid}>
                  {patterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      style={{
                        ...styles.card,
                        ...(hoveredCard === pattern.id ? styles.cardHover : {}),
                      }}
                      onMouseEnter={() => setHoveredCard(pattern.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div style={styles.cardName}>{pattern.name}</div>
                      {pattern.description && (
                        <div style={styles.cardDescription}>{pattern.description}</div>
                      )}
                      <div style={styles.cardMeta}>
                        <span>{pattern.bpm} BPM</span>
                        <span>{pattern.trackCount || pattern.data?.tracks?.length || 0} trk</span>
                        <span>{pattern.total_steps} steps</span>
                      </div>
                      <div style={styles.tags}>
                        {pattern.is_template && (
                          <span style={{ ...styles.tag, ...styles.templateBadge }}>TEMPLATE</span>
                        )}
                        {(pattern.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag} style={styles.tag}>{tag}</span>
                        ))}
                      </div>
                      <div style={styles.cardActions}>
                        <button
                          style={{ ...styles.actionButton, ...styles.loadButton }}
                          onClick={() => handleLoad(pattern, 'replace')}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                        >
                          Load
                        </button>
                        <button
                          style={{ ...styles.actionButton, ...styles.mergeButton }}
                          onClick={() => handleLoad(pattern, 'merge')}
                          title="Add tracks to current project"
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        >
                          +
                        </button>
                        {!pattern.is_template && (
                          <button
                            style={{ ...styles.actionButton, ...styles.deleteButton }}
                            onClick={() => handleDelete(pattern)}
                            title="Delete"
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'import' && (
            <div style={styles.importSection}>
              <div>
                <div style={styles.importLabel}>Paste Pattern JSON</div>
                <div style={styles.importHint}>
                  From Claude or exported patterns. Must include "tracks" array.
                </div>
              </div>
              <textarea
                style={styles.textarea}
                placeholder={`{
  "name": "My Pattern",
  "bpm": 120,
  "totalSteps": 16,
  "tracks": [
    {
      "name": "Drums",
      "type": "drums",
      "notes": [
        { "pitch": 0, "step": 0, "duration": 1, "velocity": 100 }
      ]
    }
  ]
}`}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value)
                  setImportError('')
                  setImportSuccess('')
                }}
              />
              {importError && <div style={styles.error}>{importError}</div>}
              {importSuccess && <div style={styles.success}>{importSuccess}</div>}
              <div style={styles.importActions}>
                <button
                  style={{ ...styles.importButton, ...styles.primaryButton }}
                  onClick={handleQuickLoad}
                  disabled={!jsonInput.trim()}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.35)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                >
                  Load Now
                </button>
                <button
                  style={{ ...styles.importButton, ...styles.secondaryButton }}
                  onClick={handleSaveToLibrary}
                  disabled={!jsonInput.trim()}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  Save to Library
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
