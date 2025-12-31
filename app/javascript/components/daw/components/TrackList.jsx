import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  },
  title: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  addSelect: {
    padding: '0.3rem 0.5rem',
    fontSize: '0.65rem',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '0.25rem',
    color: '#10b981',
    cursor: 'pointer',
    fontWeight: 500,
  },
  trackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  track: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  trackSelected: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  trackTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginBottom: '0.375rem',
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackName: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  trackNameInput: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'white',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    borderRadius: '0.2rem',
    padding: '0.1rem 0.25rem',
    width: '100%',
    outline: 'none',
  },
  trackType: {
    fontSize: '0.55rem',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.25)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0',
    lineHeight: 1,
    transition: 'color 0.15s',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  msButton: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.55rem',
    fontWeight: 700,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.2rem',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  muteActive: {
    background: 'rgba(239, 68, 68, 0.25)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    color: '#ef4444',
  },
  soloActive: {
    background: 'rgba(59, 130, 246, 0.25)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    color: '#3b82f6',
  },
  volumeContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    minWidth: 0,
  },
  volumeSlider: {
    flex: 1,
    height: '3px',
    appearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  volumeLabel: {
    fontSize: '0.5rem',
    color: 'rgba(255,255,255,0.35)',
    width: '22px',
    textAlign: 'right',
  },
}

function TrackItem({ track, isSelected, onSelect, onUpdate, onDelete, audioEngine, allTracks }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(track.name)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setEditName(track.name)
    setIsEditing(true)
  }

  const handleNameSubmit = () => {
    if (editName.trim()) {
      onUpdate(track.id, { name: editName.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  const handleMute = (e) => {
    e.stopPropagation()
    const newMuted = !track.muted
    onUpdate(track.id, { muted: newMuted })
    if (audioEngine) {
      audioEngine.setTrackMute(track.id, newMuted)
    }
  }

  const handleSolo = (e) => {
    e.stopPropagation()
    const newSolo = !track.solo
    onUpdate(track.id, { solo: newSolo })

    // Solo logic: when a track is soloed, mute all other tracks that aren't soloed
    if (audioEngine) {
      const anyTrackSoloed = newSolo || allTracks.some(t => t.id !== track.id && t.solo)

      allTracks.forEach(t => {
        if (t.id === track.id) {
          // This track - unmute if soloing
          if (newSolo) {
            audioEngine.setTrackMute(t.id, false)
          }
        } else {
          // Other tracks - mute if any track is soloed and this one isn't
          const shouldMute = anyTrackSoloed && !t.solo && t.id !== track.id
          audioEngine.setTrackMute(t.id, shouldMute || t.muted)
        }
      })

      // If un-soloing and no other tracks are soloed, restore original mute states
      if (!newSolo && !allTracks.some(t => t.id !== track.id && t.solo)) {
        allTracks.forEach(t => {
          audioEngine.setTrackMute(t.id, t.muted)
        })
      }
    }
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
      <div style={styles.trackTop}>
        <div style={styles.trackInfo} onDoubleClick={handleDoubleClick}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={styles.trackNameInput}
            />
          ) : (
            <>
              <div style={styles.trackName} title="Double-click to rename">{track.name}</div>
              <div style={styles.trackType}>{track.type}</div>
            </>
          )}
        </div>
        <button
          style={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(track.id)
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
          title="Delete track"
        >
          ×
        </button>
      </div>

      <div style={styles.controls}>
        <button
          style={{
            ...styles.msButton,
            ...(track.muted ? styles.muteActive : {}),
          }}
          onClick={handleMute}
          title="Mute"
        >
          M
        </button>
        <button
          style={{
            ...styles.msButton,
            ...(track.solo ? styles.soloActive : {}),
          }}
          onClick={handleSolo}
          title="Solo"
        >
          S
        </button>
        <div style={styles.volumeContainer}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={track.volume}
            onChange={handleVolumeChange}
            onClick={(e) => e.stopPropagation()}
            style={styles.volumeSlider}
          />
          <span style={styles.volumeLabel}>{Math.round(track.volume * 100)}</span>
        </div>
      </div>
    </div>
  )
}

export default function TrackList({ audioEngine }) {
  const { state, actions } = useDAW()
  const prevTracksRef = useRef(state.tracks)

  useEffect(() => {
    if (!audioEngine) return

    const prevTracks = prevTracksRef.current
    const currentTracks = state.tracks

    currentTracks.forEach(track => {
      const wasPresent = prevTracks.some(t => t.id === track.id)
      if (!wasPresent) {
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

  const handleAddTrack = useCallback((e) => {
    const type = e.target.value
    if (type) {
      actions.addTrack(type)
      e.target.value = '' // Reset select
    }
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
        <select
          style={styles.addSelect}
          onChange={handleAddTrack}
          defaultValue=""
        >
          <option value="" disabled>+ Add</option>
          <option value="synth">Synth</option>
          <option value="drums">Drums</option>
          <option value="pluck">Pluck</option>
          <option value="fm">FM Synth</option>
          <option value="am">AM Synth</option>
        </select>
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
            allTracks={state.tracks}
          />
        ))}
      </div>
    </div>
  )
}
