import React from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(0,0,0,0.2)',
  },
  transportButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  button: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  playButton: {
    background: 'linear-gradient(45deg, #10b981, #059669)',
  },
  stopButton: {
    background: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '60px',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  select: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.875rem',
  },
  loopButton: {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s',
  },
  loopActive: {
    background: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  stepDisplay: {
    fontFamily: 'monospace',
    fontSize: '1.25rem',
    color: 'var(--accent-color)',
    minWidth: '80px',
    textAlign: 'center',
  },
  divider: {
    width: '1px',
    height: '24px',
    background: 'rgba(255,255,255,0.1)',
    margin: '0 0.5rem',
  },
}

export default function TransportControls() {
  const { state, actions } = useDAW()

  const handleStop = () => {
    actions.setPlaying(false)
    actions.setCurrentStep(0)
  }

  const formatStep = (step) => {
    const measure = Math.floor(step / state.stepsPerMeasure) + 1
    const beat = (step % state.stepsPerMeasure) + 1
    return `${measure}.${beat.toString().padStart(2, '0')}`
  }

  return (
    <div style={styles.container}>
      {/* Transport buttons */}
      <div style={styles.transportButtons}>
        <button
          style={{
            ...styles.button,
            ...(state.isPlaying ? styles.playButton : {}),
          }}
          onClick={() => actions.setPlaying(!state.isPlaying)}
          title={state.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {state.isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <button
          style={{ ...styles.button, ...styles.stopButton }}
          onClick={handleStop}
          title="Stop (Enter)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" />
          </svg>
        </button>
      </div>

      <div style={styles.divider} />

      {/* Step display */}
      <div style={styles.stepDisplay}>
        {formatStep(state.currentStep)}
      </div>

      <div style={styles.divider} />

      {/* BPM */}
      <div style={styles.controlGroup}>
        <span style={styles.label}>BPM</span>
        <input
          type="number"
          min="40"
          max="240"
          value={state.bpm}
          onChange={(e) => actions.setBPM(parseInt(e.target.value) || 120)}
          style={styles.input}
        />
      </div>

      <div style={styles.divider} />

      {/* Steps */}
      <div style={styles.controlGroup}>
        <span style={styles.label}>Steps</span>
        <select
          value={state.totalSteps}
          onChange={(e) => actions.setTotalSteps(parseInt(e.target.value))}
          style={styles.select}
        >
          <option value="8">8</option>
          <option value="16">16</option>
          <option value="32">32</option>
          <option value="64">64</option>
        </select>
      </div>

      <div style={styles.divider} />

      {/* Loop toggle */}
      <button
        style={{
          ...styles.loopButton,
          ...(state.isLooping ? styles.loopActive : {}),
        }}
        onClick={() => actions.setLoop(!state.isLooping)}
        title="Toggle Loop"
      >
        Loop
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Master volume */}
      <div style={styles.controlGroup}>
        <span style={styles.label}>Master</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.masterVolume}
          onChange={(e) => actions.setMasterVolume(parseFloat(e.target.value))}
          style={{ width: '80px' }}
        />
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', width: '36px' }}>
          {Math.round(state.masterVolume * 100)}%
        </span>
      </div>
    </div>
  )
}
