import React, { useCallback } from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    height: '100%',
    overflow: 'auto',
  },
  title: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  row: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.6)',
    width: '60px',
    flexShrink: 0,
  },
  select: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.75rem',
  },
  knobContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  knob: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  knobDial: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.2))',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    cursor: 'pointer',
  },
  knobIndicator: {
    position: 'absolute',
    width: '2px',
    height: '16px',
    background: 'var(--accent-color, #10b981)',
    left: '50%',
    top: '4px',
    transformOrigin: 'bottom center',
    borderRadius: '1px',
  },
  knobLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.5)',
  },
  knobValue: {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'monospace',
  },
  slider: {
    flex: 1,
    height: '4px',
  },
  drumPads: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  drumPad: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.7rem',
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
}

const OSCILLATOR_TYPES = [
  { value: 'sine', label: 'Sine' },
  { value: 'sawtooth', label: 'Sawtooth' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'fatsawtooth', label: 'Fat Saw' },
  { value: 'fatsquare', label: 'Fat Square' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'pwm', label: 'PWM' },
]

const SYNTH_PRESETS = {
  init: {
    name: 'Init',
    oscillator: 'sawtooth',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.3,
    filterFreq: 2000,
    filterRes: 1,
  },
  bass: {
    name: 'Bass',
    oscillator: 'square',
    attack: 0.005,
    decay: 0.2,
    sustain: 0.8,
    release: 0.1,
    filterFreq: 400,
    filterRes: 4,
  },
  lead: {
    name: 'Lead',
    oscillator: 'sawtooth',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
    filterFreq: 4000,
    filterRes: 2,
  },
  pad: {
    name: 'Pad',
    oscillator: 'triangle',
    attack: 0.5,
    decay: 0.3,
    sustain: 0.8,
    release: 1.5,
    filterFreq: 3000,
    filterRes: 0.5,
  },
  pluck: {
    name: 'Pluck',
    oscillator: 'triangle',
    attack: 0.001,
    decay: 0.3,
    sustain: 0,
    release: 0.2,
    filterFreq: 5000,
    filterRes: 3,
  },
  bell: {
    name: 'Bell',
    oscillator: 'sine',
    attack: 0.001,
    decay: 1.5,
    sustain: 0,
    release: 1,
    filterFreq: 8000,
    filterRes: 1,
  },
  strings: {
    name: 'Strings',
    oscillator: 'sawtooth',
    attack: 0.3,
    decay: 0.2,
    sustain: 0.9,
    release: 0.8,
    filterFreq: 2500,
    filterRes: 0.5,
  },
  organ: {
    name: 'Organ',
    oscillator: 'sine',
    attack: 0.01,
    decay: 0.01,
    sustain: 1,
    release: 0.1,
    filterFreq: 6000,
    filterRes: 0,
  },
  brass: {
    name: 'Brass',
    oscillator: 'square',
    attack: 0.1,
    decay: 0.2,
    sustain: 0.6,
    release: 0.3,
    filterFreq: 1500,
    filterRes: 3,
  },
  acid: {
    name: 'Acid',
    oscillator: 'sawtooth',
    attack: 0.001,
    decay: 0.15,
    sustain: 0.2,
    release: 0.1,
    filterFreq: 800,
    filterRes: 15,
  },
}

function Knob({ label, value, min, max, step, onChange }) {
  const rotation = ((value - min) / (max - min)) * 270 - 135

  const handleMouseDown = (e) => {
    const startY = e.clientY
    const startValue = value

    const handleMouseMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY
      const range = max - min
      const newValue = Math.max(min, Math.min(max, startValue + (delta / 100) * range))
      onChange(step < 1 ? newValue : Math.round(newValue / step) * step)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div style={styles.knob}>
      <div style={styles.knobDial} onMouseDown={handleMouseDown}>
        <div
          style={{
            ...styles.knobIndicator,
            transform: `translateX(-50%) rotate(${rotation}deg)`,
          }}
        />
      </div>
      <span style={styles.knobLabel}>{label}</span>
      <span style={styles.knobValue}>{value.toFixed(step < 1 ? 2 : 0)}</span>
    </div>
  )
}

function SynthEditor({ track, audioEngine }) {
  const { actions } = useDAW()

  const updateInstrument = useCallback((key, value) => {
    const newInstrument = { ...track.instrument, [key]: value }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      audioEngine.updateSynthSettings(track.id, { [key]: value })
    }
  }, [track, actions, audioEngine])

  const loadPreset = useCallback((presetKey) => {
    const preset = SYNTH_PRESETS[presetKey]
    if (!preset) return

    const newInstrument = {
      oscillator: preset.oscillator,
      attack: preset.attack,
      decay: preset.decay,
      sustain: preset.sustain,
      release: preset.release,
      filterFreq: preset.filterFreq,
      filterRes: preset.filterRes,
    }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      audioEngine.updateSynthSettings(track.id, newInstrument)
    }
  }, [track, actions, audioEngine])

  return (
    <div style={styles.container}>
      <span style={styles.title}>Synthesizer</span>

      {/* Preset selector */}
      <div style={styles.section}>
        <div style={styles.row}>
          <span style={styles.label}>Preset</span>
          <select
            onChange={(e) => loadPreset(e.target.value)}
            style={styles.select}
            defaultValue=""
          >
            <option value="" disabled>Load preset...</option>
            {Object.entries(SYNTH_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.row}>
          <span style={styles.label}>Wave</span>
          <select
            value={track.instrument.oscillator}
            onChange={(e) => updateInstrument('oscillator', e.target.value)}
            style={styles.select}
          >
            {OSCILLATOR_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.title}>Envelope</span>
        <div style={styles.knobContainer}>
          <Knob
            label="Attack"
            value={track.instrument.attack}
            min={0.001}
            max={2}
            step={0.01}
            onChange={(v) => updateInstrument('attack', v)}
          />
          <Knob
            label="Decay"
            value={track.instrument.decay}
            min={0.001}
            max={2}
            step={0.01}
            onChange={(v) => updateInstrument('decay', v)}
          />
          <Knob
            label="Sustain"
            value={track.instrument.sustain}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updateInstrument('sustain', v)}
          />
          <Knob
            label="Release"
            value={track.instrument.release}
            min={0.001}
            max={4}
            step={0.01}
            onChange={(v) => updateInstrument('release', v)}
          />
        </div>
      </div>

      <div style={styles.section}>
        <span style={styles.title}>Filter</span>
        <div style={styles.row}>
          <span style={styles.label}>Cutoff</span>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={track.instrument.filterFreq}
            onChange={(e) => updateInstrument('filterFreq', parseInt(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '50px', textAlign: 'right' }}>
            {track.instrument.filterFreq}Hz
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Resonance</span>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={track.instrument.filterRes}
            onChange={(e) => updateInstrument('filterRes', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '50px', textAlign: 'right' }}>
            {track.instrument.filterRes.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}

function DrumEditor({ track, audioEngine }) {
  const DRUMS = [
    { name: 'Kick', index: 0, color: '#ef4444', type: 'kick' },
    { name: 'Snare', index: 1, color: '#f59e0b', type: 'snare' },
    { name: 'Hi-Hat', index: 2, color: '#10b981', type: 'hihat' },
    { name: 'Clap', index: 3, color: '#3b82f6', type: 'clap' },
    { name: 'Tom', index: 4, color: '#8b5cf6', type: 'tom' },
    { name: 'Crash', index: 5, color: '#ec4899', type: 'crash' },
    { name: 'Ride', index: 6, color: '#06b6d4', type: 'ride' },
    { name: 'Cowbell', index: 7, color: '#f97316', type: 'cowbell' },
  ]

  const playDrum = (drumType) => {
    if (audioEngine) {
      audioEngine.triggerDrum(track.id, drumType, '+0', 1)
    }
  }

  return (
    <div style={styles.container}>
      <span style={styles.title}>Drum Machine</span>

      <div style={{ ...styles.drumPads, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {DRUMS.map(drum => (
          <button
            key={drum.index}
            style={{
              ...styles.drumPad,
              borderColor: drum.color,
              fontSize: '0.65rem',
            }}
            onClick={() => playDrum(drum.type)}
            onMouseDown={(e) => {
              e.currentTarget.style.background = `${drum.color}40`
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {drum.name}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
        Click pads to preview. Add notes in the grid above.
      </p>
    </div>
  )
}

function AudioEditor({ track }) {
  return (
    <div style={styles.container}>
      <span style={styles.title}>Audio Track</span>

      <div style={styles.section}>
        <div style={styles.row}>
          <span style={styles.label}>Duration</span>
          <span style={{ ...styles.knobValue, flex: 1 }}>
            {track.audioData?.duration ? `${track.audioData.duration.toFixed(1)}s` : '-'}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
        Audio tracks play back recorded audio. Use the mixer to adjust volume and pan.
      </p>
    </div>
  )
}

export default function InstrumentPanel({ track, audioEngine }) {
  if (!track) return null

  if (track.type === 'drums') {
    return <DrumEditor track={track} audioEngine={audioEngine} />
  }

  if (track.type === 'audio') {
    return <AudioEditor track={track} />
  }

  return <SynthEditor track={track} audioEngine={audioEngine} />
}
