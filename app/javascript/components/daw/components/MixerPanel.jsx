import React, { useRef, useEffect, useState, useCallback } from 'react'
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
  faderMeterContainer: {
    display: 'flex',
    gap: '3px',
    alignItems: 'stretch',
    height: '60px',
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
  meterContainer: {
    width: '6px',
    height: '60px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative',
  },
  meterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: '3px',
    transition: 'height 0.05s ease-out',
  },
  meterSegments: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    padding: '1px',
    pointerEvents: 'none',
  },
}

/**
 * LevelMeter component - displays current audio level for a track
 * @param {Object} props
 * @param {string} props.trackId - The track ID to monitor
 * @param {Object} props.audioEngine - The audio engine instance
 */
function LevelMeter({ trackId, audioEngine }) {
  const [level, setLevel] = useState(0)
  const animationRef = useRef(null)

  const updateLevel = useCallback(() => {
    if (audioEngine) {
      // Get level in dB (typically -100 to 0)
      const dbLevel = audioEngine.getTrackLevel(trackId)
      // Convert dB to 0-1 range for display
      // Map -60dB to 0dB range to 0-1
      const normalizedLevel = Math.max(0, Math.min(1, (dbLevel + 60) / 60))
      setLevel(normalizedLevel)
    }
    animationRef.current = requestAnimationFrame(updateLevel)
  }, [audioEngine, trackId])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateLevel)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updateLevel])

  // Calculate color based on level
  const getGradient = () => {
    if (level > 0.9) {
      return 'linear-gradient(to top, #10b981 0%, #fbbf24 70%, #ef4444 90%)'
    } else if (level > 0.6) {
      return 'linear-gradient(to top, #10b981 0%, #fbbf24 100%)'
    }
    return 'linear-gradient(to top, #059669, #10b981)'
  }

  return (
    <div style={styles.meterContainer}>
      <div
        style={{
          ...styles.meterFill,
          height: `${level * 100}%`,
          background: getGradient(),
          boxShadow: level > 0.1 ? '0 0 4px rgba(16, 185, 129, 0.5)' : 'none',
        }}
      />
    </div>
  )
}

/**
 * MasterMeter component - displays master output level
 * @param {Object} props
 * @param {Object} props.audioEngine - The audio engine instance
 */
function MasterMeter({ audioEngine }) {
  const [level, setLevel] = useState(0)
  const animationRef = useRef(null)

  const updateLevel = useCallback(() => {
    if (audioEngine) {
      const dbLevel = audioEngine.getMasterLevel()
      const normalizedLevel = Math.max(0, Math.min(1, (dbLevel + 60) / 60))
      setLevel(normalizedLevel)
    }
    animationRef.current = requestAnimationFrame(updateLevel)
  }, [audioEngine])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateLevel)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [updateLevel])

  const getGradient = () => {
    if (level > 0.9) {
      return 'linear-gradient(to top, #10b981 0%, #fbbf24 70%, #ef4444 90%)'
    } else if (level > 0.6) {
      return 'linear-gradient(to top, #10b981 0%, #fbbf24 100%)'
    }
    return 'linear-gradient(to top, #059669, #10b981)'
  }

  return (
    <div style={{ ...styles.channel, minWidth: '40px', background: 'rgba(255,255,255,0.05)' }}>
      <span style={styles.channelName}>MST</span>
      <div style={{ ...styles.meterContainer, width: '10px', height: '60px' }}>
        <div
          style={{
            ...styles.meterFill,
            height: `${level * 100}%`,
            background: getGradient(),
            boxShadow: level > 0.1 ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
          }}
        />
      </div>
      <span style={styles.volumeValue}>{level > 0 ? Math.round((level * 60) - 60) : '-inf'}</span>
    </div>
  )
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

      {/* Volume fader with level meter */}
      <div style={styles.faderMeterContainer}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={track.volume}
          onChange={handleVolumeChange}
          style={styles.fader}
        />
        <LevelMeter trackId={track.id} audioEngine={audioEngine} />
      </div>
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
        {/* Master meter */}
        <MasterMeter audioEngine={audioEngine} />
      </div>
    </div>
  )
}
