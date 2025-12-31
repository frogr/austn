import React, { useEffect, useRef, useCallback } from 'react'
import { DAWProvider, useDAW } from './context/DAWContext'
import { getAudioEngine } from './audio/AudioEngine'
import TransportControls from './components/TransportControls'
import TrackList from './components/TrackList'
import PianoRoll from './components/PianoRoll'
import PatternHelpers from './components/PatternHelpers'
import InstrumentPanel from './components/InstrumentPanel'
import EffectsPanel from './components/EffectsPanel'
import MixerPanel from './components/MixerPanel'
import VisualizerPanel from './components/VisualizerPanel'
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
  visualizerSection: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr 360px',
    gap: '1px',
    background: 'rgba(255,255,255,0.05)',
  },
  panel: {
    background: 'rgba(0,0,0,0.3)',
    padding: '1rem',
  },
  bottomSection: {
    display: 'flex',
    gap: '1px',
    background: 'rgba(255,255,255,0.05)',
  },
  bottomPanel: {
    background: 'rgba(0,0,0,0.3)',
    padding: '1rem',
    flex: 1,
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
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
          engine.createSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'drums') {
          engine.createDrumSampler(track.id, track.effects)
        } else if (track.type === 'pluck') {
          engine.createPluckSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'fm') {
          engine.createFMSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'am') {
          engine.createAMSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'audio' && track.audioData?.buffer) {
          engine.createAudioPlayer(track.id, track.audioData.buffer, track.effects)
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

    sequenceRef.current = audioEngineRef.current.scheduleSequence(
      state.tracks,
      state.totalSteps,
      state.stepsPerMeasure,
      (step) => actions.setCurrentStep(step)
    )
  }, [state.tracks, state.totalSteps, state.stepsPerMeasure])

  // Create instruments for new tracks (handles pattern loading)
  useEffect(() => {
    if (!audioEngineRef.current || !state.audioInitialized) return

    const engine = audioEngineRef.current

    state.tracks.forEach(track => {
      // Check if this track already has an instrument in the engine
      const hasSynth = engine.synths?.has(track.id)
      const hasDrums = engine.drumSamplers?.has(track.id)
      const hasAudio = engine.audioPlayers?.has(track.id)
      const hasInstrument = hasSynth || hasDrums || hasAudio

      if (!hasInstrument) {
        // Create the appropriate instrument for this track
        if (track.type === 'synth') {
          engine.createSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'drums') {
          engine.createDrumSampler(track.id, track.effects)
        } else if (track.type === 'pluck') {
          engine.createPluckSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'fm') {
          engine.createFMSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'am') {
          engine.createAMSynth(track.id, track.instrument, track.effects)
        } else if (track.type === 'audio' && track.audioData?.buffer) {
          engine.createAudioPlayer(track.id, track.audioData.buffer, track.effects)
        }

        // Set initial volume, pan, mute
        engine.setTrackVolume(track.id, track.volume)
        engine.setTrackPan(track.id, track.pan)
        engine.setTrackMute(track.id, track.muted)
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

    if (track.type === 'synth' || track.type === 'pluck' || track.type === 'fm' || track.type === 'am') {
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
    <div className="daw-scrollbar" style={{ ...styles.container, position: 'relative' }}>
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

      {/* Visualizers at top - large format */}
      <div style={styles.visualizerSection}>
        <VisualizerPanel audioEngine={audioEngineRef.current} large={true} />
      </div>

      {/* Transport Controls */}
      <div style={styles.section}>
        <TransportControls />
      </div>

      {/* Main Grid: Tracks | Piano Roll | Instrument/Effects Panel */}
      <div style={styles.mainGrid}>
        {/* Track List */}
        <div style={styles.panel}>
          <TrackList audioEngine={audioEngineRef.current} />
        </div>

        {/* Piano Roll / Sequencer - fills available space */}
        <div style={{ ...styles.panel, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <PianoRoll track={selectedTrack} audioEngine={audioEngineRef.current} />
          </div>
        </div>

        {/* Instrument + Effects Panels - collapsible */}
        <div style={{ ...styles.panel, overflow: 'auto', maxHeight: '500px', minWidth: 0, padding: '0.75rem' }}>
          <InstrumentPanel
            track={selectedTrack}
            audioEngine={audioEngineRef.current}
          />
          <EffectsPanel
            track={selectedTrack}
            audioEngine={audioEngineRef.current}
          />
        </div>
      </div>

      {/* Bottom Section: Pattern Helpers + Mixer | MIDI + Project + Export */}
      <div style={styles.bottomSection}>
        <div style={styles.bottomPanel}>
          <PatternHelpers track={selectedTrack} />
          <MixerPanel audioEngine={audioEngineRef.current} />
        </div>
        <div style={styles.bottomPanel}>
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
