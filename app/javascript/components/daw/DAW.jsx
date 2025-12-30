import React, { useEffect, useRef, useCallback } from 'react'
import { DAWProvider, useDAW } from './context/DAWContext'
import { getAudioEngine } from './audio/AudioEngine'
import TransportControls from './components/TransportControls'
import TrackList from './components/TrackList'
import PianoRoll from './components/PianoRoll'
import PatternHelpers from './components/PatternHelpers'
import InstrumentPanel from './components/InstrumentPanel'
import MixerPanel from './components/MixerPanel'
import ProjectPanel from './components/ProjectPanel'
import ExportPanel from './components/ExportPanel'
import RecordingPanel from './components/RecordingPanel'
import MIDIPanel from './components/MIDIPanel'

const styles = {
  container: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  initOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.8)',
    zIndex: 50,
  },
  initButton: {
    padding: '1rem 2rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    background: 'linear-gradient(45deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '0.5rem',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  section: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr 320px',
    gap: '1px',
    background: 'rgba(255,255,255,0.05)',
    minHeight: '500px',
  },
  panel: {
    background: 'rgba(0,0,0,0.3)',
    padding: '1.25rem',
  },
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    background: 'rgba(255,255,255,0.05)',
  },
}

function DAWContent() {
  const { state, actions, getSelectedTrack } = useDAW()
  const audioEngineRef = useRef(null)
  const sequenceRef = useRef(null)

  // Initialize audio engine
  const initAudio = useCallback(async () => {
    const engine = getAudioEngine()
    const success = await engine.init()
    if (success) {
      audioEngineRef.current = engine
      actions.setAudioInitialized(true)

      // Create initial synths for existing tracks
      state.tracks.forEach(track => {
        if (track.type === 'synth') {
          engine.createSynth(track.id, track.instrument)
        } else if (track.type === 'drums') {
          engine.createDrumSampler(track.id)
        } else if (track.type === 'audio' && track.audioData?.buffer) {
          engine.createAudioPlayer(track.id, track.audioData.buffer)
        }
        engine.setTrackVolume(track.id, track.volume)
        engine.setTrackPan(track.id, track.pan)
        engine.setTrackMute(track.id, track.muted)
      })
    }
  }, [actions, state.tracks])

  // Sync BPM with audio engine
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setBPM(state.bpm)
    }
  }, [state.bpm])

  // Sync loop settings
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setLoop(state.isLooping, state.loopStart, state.loopEnd)
      audioEngineRef.current.setLoopPoints(state.loopStart, state.loopEnd, state.stepsPerMeasure)
    }
  }, [state.isLooping, state.loopStart, state.loopEnd, state.stepsPerMeasure])

  // Sync master volume
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setMasterVolume(state.masterVolume)
    }
  }, [state.masterVolume])

  // Handle play/stop
  useEffect(() => {
    if (!audioEngineRef.current || !state.audioInitialized) return

    if (state.isPlaying) {
      // Schedule the sequence
      sequenceRef.current = audioEngineRef.current.scheduleSequence(
        state.tracks,
        state.totalSteps,
        state.stepsPerMeasure,
        (step) => actions.setCurrentStep(step)
      )
      audioEngineRef.current.play()
    } else {
      audioEngineRef.current.pause()
    }

    return () => {
      if (!state.isPlaying && audioEngineRef.current) {
        // Don't cancel on pause, only on unmount
      }
    }
  }, [state.isPlaying, state.audioInitialized])

  // Re-schedule when tracks/notes change while playing
  useEffect(() => {
    if (!audioEngineRef.current || !state.isPlaying) return

    // Re-schedule the sequence with updated tracks
    sequenceRef.current = audioEngineRef.current.scheduleSequence(
      state.tracks,
      state.totalSteps,
      state.stepsPerMeasure,
      (step) => actions.setCurrentStep(step)
    )
  }, [state.tracks, state.totalSteps, state.stepsPerMeasure])

  // Create audio players for new audio tracks
  useEffect(() => {
    if (!audioEngineRef.current || !state.audioInitialized) return

    state.tracks.forEach(track => {
      if (track.type === 'audio' && track.audioData?.buffer) {
        // Check if player already exists
        if (!audioEngineRef.current.audioPlayers.has(track.id)) {
          audioEngineRef.current.createAudioPlayer(track.id, track.audioData.buffer)
          audioEngineRef.current.setTrackVolume(track.id, track.volume)
          audioEngineRef.current.setTrackPan(track.id, track.pan)
          audioEngineRef.current.setTrackMute(track.id, track.muted)
        }
      }
    })
  }, [state.tracks, state.audioInitialized])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose()
      }
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          actions.setPlaying(!state.isPlaying)
          break
        case 'Enter':
          e.preventDefault()
          if (audioEngineRef.current) {
            audioEngineRef.current.stop()
            actions.setPlaying(false)
            actions.setCurrentStep(0)
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.isPlaying, actions])

  // MIDI input handlers
  const handleMIDINoteOn = useCallback((note, velocity) => {
    const track = getSelectedTrack()
    if (!track || !audioEngineRef.current) return

    if (track.type === 'synth') {
      audioEngineRef.current.triggerNote(track.id, note, '8n', '+0', velocity / 127)
    } else if (track.type === 'drums') {
      const drumTypes = ['kick', 'snare', 'hihat', 'clap']
      const drumIndex = note % 4
      audioEngineRef.current.triggerDrum(track.id, drumTypes[drumIndex], '+0', velocity / 127)
    }
  }, [getSelectedTrack])

  const handleMIDINoteOff = useCallback(() => {
    // For now, notes have fixed duration, so we don't need to handle note off
  }, [])

  const selectedTrack = getSelectedTrack()

  return (
    <div style={{ ...styles.container, position: 'relative' }}>
      {/* Audio initialization overlay */}
      {!state.audioInitialized && (
        <div style={styles.initOverlay}>
          <button
            style={styles.initButton}
            onClick={initAudio}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Click to Start Audio
          </button>
        </div>
      )}

      {/* Transport Controls */}
      <div style={styles.section}>
        <TransportControls />
      </div>

      {/* Main Grid: Tracks | Piano Roll | Instrument Panel */}
      <div style={styles.mainGrid}>
        {/* Track List */}
        <div style={styles.panel}>
          <TrackList audioEngine={audioEngineRef.current} />
        </div>

        {/* Piano Roll / Sequencer */}
        <div style={{ ...styles.panel, padding: 0, overflow: 'hidden' }}>
          <PianoRoll track={selectedTrack} audioEngine={audioEngineRef.current} />
        </div>

        {/* Instrument Panel */}
        <div style={styles.panel}>
          <InstrumentPanel
            track={selectedTrack}
            audioEngine={audioEngineRef.current}
          />
        </div>
      </div>

      {/* Bottom Section: Pattern Helpers + Mixer | MIDI + Project + Export */}
      <div style={styles.bottomSection}>
        <div style={{ ...styles.panel, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <PatternHelpers track={selectedTrack} />
          <MixerPanel audioEngine={audioEngineRef.current} />
        </div>
        <div style={{ ...styles.panel, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <MIDIPanel onNoteOn={handleMIDINoteOn} onNoteOff={handleMIDINoteOff} />
          <ProjectPanel />
          <ExportPanel />
        </div>
      </div>

      {/* Recording Section */}
      <div style={{ ...styles.panel, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <RecordingPanel />
      </div>
    </div>
  )
}

export default function DAW() {
  return (
    <DAWProvider>
      <DAWContent />
    </DAWProvider>
  )
}
