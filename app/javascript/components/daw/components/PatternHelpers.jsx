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
    color: 'rgba(255,255,255,0.5)',
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
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dangerButton: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  successButton: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
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
        color: hasSelection ? 'var(--accent-color, #10b981)' : 'rgba(255,255,255,0.4)',
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
          onMouseOver={(e) => hasSelection && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
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
          onMouseOver={(e) => hasSelection && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
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
          onMouseOver={(e) => hasSelection && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          Fill 1/4
        </button>
      </div>

      <div style={styles.buttonGroup}>
        <button
          style={{ ...styles.button, ...styles.successButton }}
          onClick={() => actions.duplicatePattern(track.id)}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
        >
          Duplicate
        </button>
        <button
          style={{ ...styles.button, ...styles.dangerButton }}
          onClick={() => actions.clearPattern(track.id)}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
