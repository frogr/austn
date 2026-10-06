import React from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '200px',
  },
  title: {
    fontSize: '0.75rem',
    color: 'var(--ink-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  button: {
    padding: '0.375rem 0.625rem',
    fontSize: '0.7rem',
    background: 'var(--ground-3)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dangerButton: {
    background: 'color-mix(in srgb, var(--clay) 10%, transparent)',
    borderColor: 'color-mix(in srgb, var(--clay) 20%, transparent)',
  },
  successButton: {
    background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
    borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)',
  },
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const DRUM_NAMES = ['Kick', 'Snare', 'Hi-Hat', 'Clap', 'Tom', 'Crash', 'Ride', 'Cowbell']

function getPitchLabel(pitch, trackType) {
  if (trackType === 'drums') {
    return DRUM_NAMES[pitch] || `Drum ${pitch}`
  }
  const note = NOTE_NAMES[pitch % 12]
  const octave = Math.floor(pitch / 12) - 1
  return `${note}${octave}`
}

export default function PatternHelpers({ track }) {
  const { state, actions } = useDAW()

  if (!track) return null

  const selectedPitch = state.selectedPitch
  const hasSelection = selectedPitch !== null

  const handleFill = (fillType) => {
    if (!hasSelection) return
    actions.fillPattern(track.id, fillType, selectedPitch)
  }

  const selectionLabel = hasSelection
    ? getPitchLabel(selectedPitch, track.type)
    : 'Click a row to select'

  return (
    <div style={styles.container}>
      <span style={styles.title}>Pattern</span>

      <div style={{
        fontSize: '0.7rem',
        color: hasSelection ? 'var(--brand)' : 'var(--ink-3)',
        marginBottom: '0.25rem',
        fontStyle: hasSelection ? 'normal' : 'italic',
      }}>
        {hasSelection ? `Selected: ${selectionLabel}` : selectionLabel}
      </div>

      <div style={styles.buttonGroup}>
        <button
          style={{
            ...styles.button,
            opacity: hasSelection ? 1 : 0.5,
            cursor: hasSelection ? 'pointer' : 'not-allowed',
          }}
          onClick={() => handleFill('every')}
          disabled={!hasSelection}
          onMouseOver={(e) => hasSelection && (e.currentTarget.style.background = 'var(--line)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--ground-3)'}
        >
          Fill 1/1
        </button>
        <button
          style={{
            ...styles.button,
            opacity: hasSelection ? 1 : 0.5,
            cursor: hasSelection ? 'pointer' : 'not-allowed',
          }}
          onClick={() => handleFill('every2')}
          disabled={!hasSelection}
          onMouseOver={(e) => hasSelection && (e.currentTarget.style.background = 'var(--line)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--ground-3)'}
        >
          Fill 1/2
        </button>
        <button
          style={{
            ...styles.button,
            opacity: hasSelection ? 1 : 0.5,
            cursor: hasSelection ? 'pointer' : 'not-allowed',
          }}
          onClick={() => handleFill('every4')}
          disabled={!hasSelection}
          onMouseOver={(e) => hasSelection && (e.currentTarget.style.background = 'var(--line)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--ground-3)'}
        >
          Fill 1/4
        </button>
      </div>

      <div style={styles.buttonGroup}>
        <button
          style={{ ...styles.button, ...styles.successButton }}
          onClick={() => actions.duplicatePattern(track.id)}
          onMouseOver={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 20%, transparent)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 10%, transparent)'}
        >
          Duplicate
        </button>
        <button
          style={{ ...styles.button, ...styles.dangerButton }}
          onClick={() => actions.clearPattern(track.id)}
          onMouseOver={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--clay) 20%, transparent)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--clay) 10%, transparent)'}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
