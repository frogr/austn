import React from 'react'
import { useMIDI } from '../hooks/useMIDI'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  title: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '0.375rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.7rem',
  },
  status: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
  },
  noSupport: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },
  indicator: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '0.5rem',
  },
  connected: {
    background: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  disconnected: {
    background: 'rgba(255,255,255,0.2)',
  },
}

export default function MIDIPanel({ onNoteOn, onNoteOff }) {
  const { isSupported, error, midiInputs, selectedInput, selectInput } = useMIDI(
    onNoteOn,
    onNoteOff,
    null // We don't need CC for now
  )

  if (!isSupported) {
    return (
      <div style={styles.container}>
        <span style={styles.title}>MIDI Input</span>
        <span style={styles.noSupport}>
          Web MIDI not supported in this browser
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <span style={styles.title}>MIDI Input</span>
        <span style={{ ...styles.noSupport, color: '#ef4444' }}>
          {error}
        </span>
      </div>
    )
  }

  const selectedDevice = midiInputs.find(d => d.id === selectedInput)

  return (
    <div style={styles.container}>
      <span style={styles.title}>MIDI Input</span>

      {midiInputs.length === 0 ? (
        <span style={styles.noSupport}>No MIDI devices detected</span>
      ) : (
        <>
          <select
            value={selectedInput || ''}
            onChange={(e) => selectInput(e.target.value)}
            style={styles.select}
          >
            <option value="">Select MIDI device...</option>
            {midiInputs.map(input => (
              <option key={input.id} value={input.id}>
                {input.name}
              </option>
            ))}
          </select>

          {selectedDevice && (
            <span style={styles.status}>
              <span
                style={{
                  ...styles.indicator,
                  ...(selectedDevice.state === 'connected' ? styles.connected : styles.disconnected),
                }}
              />
              {selectedDevice.state === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          )}
        </>
      )}
    </div>
  )
}
