import React, { useState, useCallback } from 'react'
import { useDAW } from '../context/DAWContext'

const AVAILABLE_TAGS = [
  'drums', 'bass', 'synth', 'arp', 'chords', 'melody',
  'ambient', 'techno', 'house', 'dubstep', 'chill', 'loop'
]

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'color-mix(in srgb, var(--sunken) 80%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--ground-2)',
    borderRadius: '0.5rem',
    border: '1px solid var(--line)',
    width: '90%',
    maxWidth: '420px',
    overflow: 'hidden',
    boxShadow: '0 0.4rem 0 var(--shade)',
  },
  header: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--line)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--ground-2)',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--ink-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  closeButton: {
    background: 'var(--ground-3)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    color: 'var(--ink-2)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    lineHeight: 1,
    transition: 'all 0.15s',
  },
  content: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.65rem',
    color: 'var(--ink-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    fontWeight: 500,
  },
  input: {
    padding: '0.5rem 0.625rem',
    background: 'var(--sunken)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    color: 'var(--ink)',
    fontSize: '0.8rem',
  },
  textarea: {
    padding: '0.5rem 0.625rem',
    background: 'var(--sunken)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    color: 'var(--ink)',
    fontSize: '0.75rem',
    minHeight: '60px',
    resize: 'vertical',
    lineHeight: 1.4,
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  tagButton: {
    padding: '0.2rem 0.5rem',
    background: 'var(--ground-3)',
    border: '1px solid var(--line)',
    borderRadius: '0.2rem',
    color: 'var(--ink-2)',
    fontSize: '0.6rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  tagSelected: {
    background: 'color-mix(in srgb, var(--brand) 20%, transparent)',
    borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)',
    color: 'var(--brand)',
  },
  meta: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem 0.625rem',
    background: 'var(--sunken)',
    borderRadius: '0.25rem',
    fontSize: '0.65rem',
    color: 'var(--ink-3)',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  button: {
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
    background: 'color-mix(in srgb, var(--brand) 20%, transparent)',
    borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)',
    color: 'var(--brand)',
  },
  secondaryButton: {
    background: 'var(--ground-3)',
    borderColor: 'var(--line)',
    color: 'var(--ink-2)',
  },
  error: {
    color: 'var(--clay)',
    fontSize: '0.65rem',
    padding: '0.5rem',
    background: 'color-mix(in srgb, var(--clay) 10%, transparent)',
    borderRadius: '0.25rem',
    border: '1px solid color-mix(in srgb, var(--clay) 20%, transparent)',
  },
  success: {
    color: 'var(--brand)',
    fontSize: '0.65rem',
    padding: '0.5rem',
    background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
    borderRadius: '0.25rem',
    border: '1px solid color-mix(in srgb, var(--brand) 20%, transparent)',
  },
}

export default function SavePatternModal({ isOpen, onClose }) {
  const { state } = useDAW()
  const [name, setName] = useState(state.projectName || '')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Enter a pattern name')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const patternData = {
        name: name.trim(),
        description: description.trim(),
        bpm: state.bpm,
        total_steps: state.totalSteps,
        steps_per_measure: state.stepsPerMeasure,
        tags: selectedTags,
        is_template: false,
        data: {
          tracks: state.tracks.map(track => ({
            name: track.name,
            type: track.type,
            instrument: track.instrument,
            effects: track.effects,
            muted: track.muted,
            solo: track.solo,
            volume: track.volume,
            pan: track.pan,
            notes: track.notes.map(note => ({
              pitch: note.pitch,
              step: note.step,
              duration: note.duration,
              velocity: note.velocity,
            })),
          })),
        },
      }

      const response = await fetch('/daw/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify(patternData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.errors?.join(', ') || 'Failed to save')
      }

      setSuccess('Saved!')
      setTimeout(() => {
        onClose()
      }, 600)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [name, description, selectedTags, state, onClose])

  if (!isOpen) return null

  const trackCount = state.tracks.length
  const noteCount = state.tracks.reduce((sum, t) => sum + t.notes.length, 0)

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>Save to Library</span>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--line)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--ground-3)'
              e.currentTarget.style.color = 'var(--ink-2)'
            }}
          >
            ×
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              style={styles.input}
              placeholder="My Pattern"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Tags</label>
            <div style={styles.tagsContainer}>
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  style={{
                    ...styles.tagButton,
                    ...(selectedTags.includes(tag) ? styles.tagSelected : {}),
                  }}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.meta}>
            <span>{state.bpm} BPM</span>
            <span>{trackCount} track{trackCount !== 1 ? 's' : ''}</span>
            <span>{noteCount} note{noteCount !== 1 ? 's' : ''}</span>
            <span>{state.totalSteps} steps</span>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.actions}>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={onClose}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--line)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--ground-3)'}
            >
              Cancel
            </button>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={handleSave}
              disabled={saving}
              onMouseOver={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 35%, transparent)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 20%, transparent)'}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
