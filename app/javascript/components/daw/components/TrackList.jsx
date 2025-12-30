import React, { useCallback, useEffect, useRef } from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  addButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.65rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  trackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
    overflow: 'auto',
  },
  track: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  trackSelected: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  trackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  trackName: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'white',
  },
  trackType: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  trackControls: {
    display: 'flex',
    gap: '0.25rem',
    alignItems: 'center',
  },
  controlButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6rem',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  muteActive: {
    background: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    color: 'white',
  },
  soloActive: {
    background: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    color: 'white',
  },
  volumeSlider: {
    width: '100%',
    height: '4px',
    marginTop: '0.25rem',
  },
  deleteButton: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'color 0.2s',
  },
}

function TrackItem({ track, isSelected, onSelect, onUpdate, onDelete, audioEngine }) {
  const handleMute = (e) => {
    e.stopPropagation()
    onUpdate(track.id, { muted: !track.muted })
    if (audioEngine) {
      audioEngine.setTrackMute(track.id, !track.muted)
    }
  }

  const handleSolo = (e) => {
    e.stopPropagation()
    onUpdate(track.id, { solo: !track.solo })
  }

  const handleVolumeChange = (e) => {
    e.stopPropagation()
    const volume = parseFloat(e.target.value)
    onUpdate(track.id, { volume })
    if (audioEngine) {
      audioEngine.setTrackVolume(track.id, volume)
    }
  }

  return (
    <div
      style={{
        ...styles.track,
        ...(isSelected ? styles.trackSelected : {}),
      }}
      onClick={onSelect}
    >
      <div style={styles.trackHeader}>
        <div>
          <div style={styles.trackName}>{track.name}</div>
          <div style={styles.trackType}>{track.type}</div>
        </div>
        <button
          style={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(track.id)
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          ×
        </button>
      </div>

      <div style={styles.trackControls}>
        <button
          style={{
            ...styles.controlButton,
            ...(track.muted ? styles.muteActive : {}),
          }}
          onClick={handleMute}
          title="Mute"
        >
          M
        </button>
        <button
          style={{
            ...styles.controlButton,
            ...(track.solo ? styles.soloActive : {}),
          }}
          onClick={handleSolo}
          title="Solo"
        >
          S
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={track.volume}
          onChange={handleVolumeChange}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, height: '4px' }}
          title={`Volume: ${Math.round(track.volume * 100)}%`}
        />
      </div>
    </div>
  )
}

export default function TrackList({ audioEngine }) {
  const { state, actions } = useDAW()
  const prevTracksRef = useRef(state.tracks)

  // Handle new tracks being added - create audio engine resources
  useEffect(() => {
    if (!audioEngine) return

    const prevTracks = prevTracksRef.current
    const currentTracks = state.tracks

    // Find newly added tracks
    currentTracks.forEach(track => {
      const wasPresent = prevTracks.some(t => t.id === track.id)
      if (!wasPresent) {
        // This is a new track, create its audio engine resources
        if (track.type === 'synth') {
          audioEngine.createSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'drums') {
          audioEngine.createDrumSampler(track.id, track.effects)
        } else if (track.type === 'pluck') {
          audioEngine.createPluckSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'fm') {
          audioEngine.createFMSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'am') {
          audioEngine.createAMSynth(track.id, track.instrument, track.effects)
        }
        audioEngine.setTrackVolume(track.id, track.volume)
        audioEngine.setTrackPan(track.id, track.pan)
        audioEngine.setTrackMute(track.id, track.muted)
      }
    })

    prevTracksRef.current = currentTracks
  }, [state.tracks, audioEngine])

  const handleAddSynth = useCallback(() => {
    actions.addTrack('synth')
  }, [actions])

  const handleAddDrums = useCallback(() => {
    actions.addTrack('drums')
  }, [actions])

  const handleAddPluck = useCallback(() => {
    actions.addTrack('pluck')
  }, [actions])

  const handleAddFM = useCallback(() => {
    actions.addTrack('fm')
  }, [actions])

  const handleAddAM = useCallback(() => {
    actions.addTrack('am')
  }, [actions])

  const handleDelete = useCallback((trackId) => {
    if (state.tracks.length <= 1) return
    if (audioEngine) {
      audioEngine.disposeSynth(trackId)
      audioEngine.disposeDrumSampler(trackId)
    }
    actions.removeTrack(trackId)
  }, [actions, audioEngine, state.tracks.length])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Tracks</span>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button
            style={styles.addButton}
            onClick={handleAddSynth}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            title="Basic oscillator synth"
          >
            + Synth
          </button>
          <button
            style={styles.addButton}
            onClick={handleAddDrums}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            title="Drum machine"
          >
            + Drums
          </button>
          <button
            style={styles.addButton}
            onClick={handleAddPluck}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            title="Plucked string (guitar-like)"
          >
            + Pluck
          </button>
          <button
            style={styles.addButton}
            onClick={handleAddFM}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            title="FM synthesis (rich, evolving sounds)"
          >
            + FM
          </button>
          <button
            style={styles.addButton}
            onClick={handleAddAM}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            title="AM synthesis (tremolo-like)"
          >
            + AM
          </button>
        </div>
      </div>

      <div style={styles.trackList}>
        {state.tracks.map(track => (
          <TrackItem
            key={track.id}
            track={track}
            isSelected={track.id === state.selectedTrackId}
            onSelect={() => actions.selectTrack(track.id)}
            onUpdate={actions.updateTrack}
            onDelete={handleDelete}
            audioEngine={audioEngine}
          />
        ))}
      </div>
    </div>
  )
}
