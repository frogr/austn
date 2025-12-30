import React from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  title: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  channelStrips: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
  },
  channel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '0.25rem',
    minWidth: '50px',
  },
  channelName: {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  fader: {
    width: '8px',
    height: '60px',
    appearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    writingMode: 'vertical-lr',
    direction: 'rtl',
  },
  volumeValue: {
    fontSize: '0.55rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'monospace',
  },
  panKnob: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.2))',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    cursor: 'pointer',
  },
  panIndicator: {
    position: 'absolute',
    width: '2px',
    height: '8px',
    background: 'var(--accent-color, #10b981)',
    left: '50%',
    top: '2px',
    transformOrigin: 'bottom center',
    borderRadius: '1px',
  },
  panLabel: {
    fontSize: '0.5rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'monospace',
  },
}

function ChannelStrip({ track, audioEngine, onUpdate }) {
  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value)
    onUpdate(track.id, { volume })
    if (audioEngine) {
      audioEngine.setTrackVolume(track.id, volume)
    }
  }

  const handlePanChange = (e) => {
    const startX = e.clientX
    const startPan = track.pan

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX
      const newPan = Math.max(-1, Math.min(1, startPan + delta / 50))
      onUpdate(track.id, { pan: newPan })
      if (audioEngine) {
        audioEngine.setTrackPan(track.id, newPan)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const panRotation = track.pan * 90

  const formatPan = (pan) => {
    if (Math.abs(pan) < 0.05) return 'C'
    return pan < 0 ? `L${Math.round(Math.abs(pan) * 100)}` : `R${Math.round(pan * 100)}`
  }

  return (
    <div style={styles.channel}>
      <span style={styles.channelName}>{track.name}</span>

      {/* Pan knob */}
      <div style={styles.panKnob} onMouseDown={handlePanChange}>
        <div
          style={{
            ...styles.panIndicator,
            transform: `translateX(-50%) rotate(${panRotation}deg)`,
          }}
        />
      </div>
      <span style={styles.panLabel}>{formatPan(track.pan)}</span>

      {/* Volume fader */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={track.volume}
        onChange={handleVolumeChange}
        style={styles.fader}
      />
      <span style={styles.volumeValue}>{Math.round(track.volume * 100)}</span>
    </div>
  )
}

export default function MixerPanel({ audioEngine }) {
  const { state, actions } = useDAW()

  return (
    <div style={styles.container}>
      <span style={styles.title}>Mixer</span>
      <div style={styles.channelStrips}>
        {state.tracks.map(track => (
          <ChannelStrip
            key={track.id}
            track={track}
            audioEngine={audioEngine}
            onUpdate={actions.updateTrack}
          />
        ))}
      </div>
    </div>
  )
}
