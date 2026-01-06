import React, { useCallback, useState } from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '0.375rem',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.15s',
  },
  sectionTitle: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  chevron: {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.4)',
    transition: 'transform 0.2s',
  },
  sectionContent: {
    padding: '0.4rem',
  },
  row: {
    display: 'flex',
    gap: '0.35rem',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  label: {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.5)',
    width: '50px',
    flexShrink: 0,
  },
  select: {
    flex: 1,
    minWidth: 0,
    padding: '0.25rem 0.35rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.6rem',
  },
  knobContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.35rem',
  },
  knob: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.1rem',
  },
  knobDial: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.2))',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    cursor: 'pointer',
  },
  knobIndicator: {
    position: 'absolute',
    width: '2px',
    height: '10px',
    background: 'var(--accent-color, #10b981)',
    left: '50%',
    top: '3px',
    transformOrigin: 'bottom center',
    borderRadius: '1px',
  },
  knobLabel: {
    fontSize: '0.55rem',
    color: 'rgba(255,255,255,0.5)',
  },
  knobValue: {
    fontSize: '0.5rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'monospace',
  },
  slider: {
    flex: 1,
    height: '4px',
  },
  drumPads: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.4rem',
  },
  drumPad: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.375rem',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.6rem',
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
  toggle: {
    width: '32px',
    height: '18px',
    borderRadius: '9px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  toggleActive: {
    background: 'rgba(139, 92, 246, 0.6)',
    borderColor: 'rgba(139, 92, 246, 0.8)',
  },
  toggleKnob: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: 'white',
    position: 'absolute',
    top: '1px',
    left: '1px',
    transition: 'transform 0.2s',
  },
  toggleKnobActive: {
    transform: 'translateX(14px)',
  },
  lfoSection: {
    background: 'rgba(139, 92, 246, 0.08)',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    marginTop: '0.5rem',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
}

const OSCILLATOR_TYPES = [
  { value: 'sine', label: 'Sine' },
  { value: 'sawtooth', label: 'Saw' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Tri' },
  { value: 'fatsawtooth', label: 'Fat Saw' },
  { value: 'fatsquare', label: 'Fat Sq' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'pwm', label: 'PWM' },
]

const LFO_RATES = [
  { value: '1m', label: '1 Bar' },
  { value: '2n', label: '1/2' },
  { value: '4n', label: '1/4' },
  { value: '8n', label: '1/8' },
  { value: '16n', label: '1/16' },
  { value: '32n', label: '1/32' },
]

const LFO_WAVEFORMS = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'sawtooth', label: 'Saw' },
  { value: 'triangle', label: 'Tri' },
]

const SYNTH_PRESETS = {
  init: { name: 'Init', oscillator: 'sawtooth', attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3, filterFreq: 2000, filterRes: 1 },
  bass: { name: 'Bass', oscillator: 'square', attack: 0.005, decay: 0.2, sustain: 0.8, release: 0.1, filterFreq: 400, filterRes: 4 },
  lead: { name: 'Lead', oscillator: 'sawtooth', attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2, filterFreq: 4000, filterRes: 2 },
  pad: { name: 'Pad', oscillator: 'triangle', attack: 0.5, decay: 0.3, sustain: 0.8, release: 1.5, filterFreq: 3000, filterRes: 0.5 },
  pluck: { name: 'Pluck', oscillator: 'triangle', attack: 0.001, decay: 0.3, sustain: 0, release: 0.2, filterFreq: 5000, filterRes: 3 },
  acid: { name: 'Acid', oscillator: 'sawtooth', attack: 0.001, decay: 0.15, sustain: 0.2, release: 0.1, filterFreq: 800, filterRes: 15 },
}

function CollapsibleSection({ title, children, defaultOpen = true, color }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={styles.section}>
      <div
        style={styles.sectionHeader}
        onClick={() => setIsOpen(!isOpen)}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      >
        <span style={{ ...styles.sectionTitle, color: color || 'rgba(255,255,255,0.7)' }}>{title}</span>
        <span style={{ ...styles.chevron, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
      </div>
      {isOpen && <div style={styles.sectionContent}>{children}</div>}
    </div>
  )
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
        <div style={{ ...styles.knobIndicator, transform: `translateX(-50%) rotate(${rotation}deg)` }} />
      </div>
      <span style={styles.knobLabel}>{label}</span>
      <span style={styles.knobValue}>{value.toFixed(step < 1 ? 2 : 0)}</span>
    </div>
  )
}

function SynthEditor({ track, audioEngine }) {
  const { actions } = useDAW()

  const lfo = track.instrument.lfo || { enabled: false, rate: '8n', waveform: 'sine', depth: 0.5 }

  const updateInstrument = useCallback((key, value) => {
    const newInstrument = { ...track.instrument, [key]: value }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      try {
        audioEngine.updateSynthSettings(track.id, { [key]: value })
      } catch (err) {
        console.warn('[InstrumentPanel] Error updating synth:', err)
      }
    }
  }, [track, actions, audioEngine])

  const updateLFO = useCallback((lfoKey, lfoValue) => {
    const newLFO = { ...lfo, [lfoKey]: lfoValue }
    const newInstrument = { ...track.instrument, lfo: newLFO }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      try {
        audioEngine.updateSynthSettings(track.id, { lfo: newLFO })
      } catch (err) {
        console.warn('[InstrumentPanel] Error updating LFO:', err)
      }
    }
  }, [track, lfo, actions, audioEngine])

  const loadPreset = useCallback((presetKey) => {
    const preset = SYNTH_PRESETS[presetKey]
    if (!preset) return
    const newInstrument = { ...preset, lfo: track.instrument.lfo }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      try {
        audioEngine.updateSynthSettings(track.id, newInstrument)
      } catch (err) {
        console.warn('[InstrumentPanel] Error loading preset:', err)
      }
    }
  }, [track, actions, audioEngine])

  return (
    <div style={styles.container}>
      <CollapsibleSection title="Synthesizer" defaultOpen={true} color="#10b981">
        <div style={styles.row}>
          <span style={styles.label}>Preset</span>
          <select onChange={(e) => loadPreset(e.target.value)} style={styles.select} defaultValue="">
            <option value="" disabled>Load...</option>
            {Object.entries(SYNTH_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>{preset.name}</option>
            ))}
          </select>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Wave</span>
          <select
            value={track.instrument.oscillator}
            onChange={(e) => updateInstrument('oscillator', e.target.value)}
            style={styles.select}
          >
            {OSCILLATOR_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Envelope" defaultOpen={false} color="#3b82f6">
        <div style={styles.knobContainer}>
          <Knob label="Atk" value={track.instrument.attack} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('attack', v)} />
          <Knob label="Dec" value={track.instrument.decay} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('decay', v)} />
          <Knob label="Sus" value={track.instrument.sustain} min={0} max={1} step={0.01} onChange={(v) => updateInstrument('sustain', v)} />
          <Knob label="Rel" value={track.instrument.release} min={0.001} max={4} step={0.01} onChange={(v) => updateInstrument('release', v)} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Filter + LFO" defaultOpen={true} color="#8b5cf6">
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
          <span style={{ ...styles.knobValue, width: '45px', textAlign: 'right' }}>{track.instrument.filterFreq}Hz</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Reso</span>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={track.instrument.filterRes}
            onChange={(e) => updateInstrument('filterRes', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '45px', textAlign: 'right' }}>{track.instrument.filterRes.toFixed(1)}</span>
        </div>

        {/* LFO Wobble */}
        <div style={styles.lfoSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(139, 92, 246, 0.9)', fontWeight: 600 }}>LFO WOBBLE</span>
            <div
              style={{ ...styles.toggle, ...(lfo.enabled ? styles.toggleActive : {}) }}
              onClick={() => updateLFO('enabled', !lfo.enabled)}
            >
              <div style={{ ...styles.toggleKnob, ...(lfo.enabled ? styles.toggleKnobActive : {}) }} />
            </div>
          </div>

          {lfo.enabled && (
            <>
              <div style={styles.row}>
                <span style={styles.label}>Rate</span>
                <select value={lfo.rate} onChange={(e) => updateLFO('rate', e.target.value)} style={styles.select}>
                  {LFO_RATES.map(rate => <option key={rate.value} value={rate.value}>{rate.label}</option>)}
                </select>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Shape</span>
                <select value={lfo.waveform} onChange={(e) => updateLFO('waveform', e.target.value)} style={styles.select}>
                  {LFO_WAVEFORMS.map(wf => <option key={wf.value} value={wf.value}>{wf.label}</option>)}
                </select>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Depth</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={lfo.depth}
                  onChange={(e) => updateLFO('depth', parseFloat(e.target.value))}
                  style={styles.slider}
                />
                <span style={{ ...styles.knobValue, width: '35px', textAlign: 'right' }}>{Math.round(lfo.depth * 100)}%</span>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  )
}

function DrumEditor({ track, audioEngine }) {
  const DRUMS = [
    { name: 'Kick', type: 'kick', color: '#ef4444' },
    { name: 'Snare', type: 'snare', color: '#f59e0b' },
    { name: 'HiHat', type: 'hihat', color: '#10b981' },
    { name: 'Clap', type: 'clap', color: '#3b82f6' },
    { name: 'Tom', type: 'tom', color: '#8b5cf6' },
    { name: 'Crash', type: 'crash', color: '#ec4899' },
    { name: 'Ride', type: 'ride', color: '#06b6d4' },
    { name: 'Bell', type: 'cowbell', color: '#f97316' },
  ]

  const playDrum = (drumType) => {
    if (audioEngine) {
      try {
        audioEngine.triggerDrum(track.id, drumType, '+0', 1)
      } catch (err) {
        console.warn('[InstrumentPanel] Error playing drum:', err)
      }
    }
  }

  return (
    <div style={styles.container}>
      <CollapsibleSection title="Drum Machine" defaultOpen={true} color="#f59e0b">
        <div style={styles.drumPads}>
          {DRUMS.map((drum, idx) => (
            <button
              key={idx}
              style={{ ...styles.drumPad, borderColor: drum.color }}
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
      </CollapsibleSection>
    </div>
  )
}

function AudioEditor({ track }) {
  return (
    <div style={styles.container}>
      <CollapsibleSection title="Audio Track" defaultOpen={true} color="#06b6d4">
        <div style={styles.row}>
          <span style={styles.label}>Duration</span>
          <span style={styles.knobValue}>
            {track.audioData?.duration ? `${track.audioData.duration.toFixed(1)}s` : '-'}
          </span>
        </div>
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Use mixer to adjust volume/pan
        </p>
      </CollapsibleSection>
    </div>
  )
}

function PluckEditor({ track, audioEngine }) {
  const { actions } = useDAW()

  const updateInstrument = useCallback((key, value) => {
    const newInstrument = { ...track.instrument, [key]: value }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      try {
        audioEngine.updatePluckSettings(track.id, { [key]: value })
      } catch (err) {
        console.warn('[InstrumentPanel] Error updating pluck:', err)
      }
    }
  }, [track, actions, audioEngine])

  // Preview the sound
  const playPreview = useCallback(() => {
    if (audioEngine) {
      try {
        audioEngine.triggerNote(track.id, 60, '8n', '+0', 0.8)
      } catch (err) {
        console.warn('[InstrumentPanel] Error playing preview:', err)
      }
    }
  }, [track.id, audioEngine])

  return (
    <div style={styles.container}>
      <CollapsibleSection title="Pluck / Guitar" defaultOpen={true} color="#f59e0b">
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0' }}>
          Karplus-Strong string synthesis for guitar-like sounds
        </p>
        <button
          onClick={playPreview}
          style={{
            ...styles.select,
            cursor: 'pointer',
            textAlign: 'center',
            marginBottom: '0.5rem',
            background: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 0.4)',
          }}
        >
          Preview Sound
        </button>
        <div style={styles.row}>
          <span style={styles.label}>Attack</span>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={track.instrument.attackNoise}
            onChange={(e) => updateInstrument('attackNoise', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '35px', textAlign: 'right' }}>{track.instrument.attackNoise.toFixed(1)}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Dampen</span>
          <input
            type="range"
            min="500"
            max="10000"
            step="100"
            value={track.instrument.dampening}
            onChange={(e) => updateInstrument('dampening', parseInt(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '45px', textAlign: 'right' }}>{track.instrument.dampening}Hz</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Resonance</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={track.instrument.resonance}
            onChange={(e) => updateInstrument('resonance', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '35px', textAlign: 'right' }}>{Math.round(track.instrument.resonance * 100)}%</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Release</span>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            value={track.instrument.release}
            onChange={(e) => updateInstrument('release', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '35px', textAlign: 'right' }}>{track.instrument.release.toFixed(1)}s</span>
        </div>
      </CollapsibleSection>
    </div>
  )
}

function FMEditor({ track, audioEngine }) {
  const { actions } = useDAW()

  const updateInstrument = useCallback((key, value) => {
    const newInstrument = { ...track.instrument, [key]: value }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      try {
        audioEngine.updateFMSettings(track.id, { [key]: value })
      } catch (err) {
        console.warn('[InstrumentPanel] Error updating FM:', err)
      }
    }
  }, [track, actions, audioEngine])

  // Preview the sound
  const playPreview = useCallback(() => {
    if (audioEngine) {
      try {
        audioEngine.triggerNote(track.id, 60, '4n', '+0', 0.8)
      } catch (err) {
        console.warn('[InstrumentPanel] Error playing preview:', err)
      }
    }
  }, [track.id, audioEngine])

  return (
    <div style={styles.container}>
      <CollapsibleSection title="FM Synthesis" defaultOpen={true} color="#8b5cf6">
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0' }}>
          Frequency modulation for rich, evolving timbres
        </p>
        <button
          onClick={playPreview}
          style={{
            ...styles.select,
            cursor: 'pointer',
            textAlign: 'center',
            marginBottom: '0.5rem',
            background: 'rgba(139, 92, 246, 0.2)',
            borderColor: 'rgba(139, 92, 246, 0.4)',
          }}
        >
          Preview Sound
        </button>
        <div style={styles.row}>
          <span style={styles.label}>Harmonic</span>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={track.instrument.harmonicity}
            onChange={(e) => updateInstrument('harmonicity', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '35px', textAlign: 'right' }}>{track.instrument.harmonicity.toFixed(1)}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Mod Idx</span>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={track.instrument.modulationIndex}
            onChange={(e) => updateInstrument('modulationIndex', parseInt(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '35px', textAlign: 'right' }}>{track.instrument.modulationIndex}</span>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Carrier Envelope" defaultOpen={false} color="#3b82f6">
        <div style={styles.knobContainer}>
          <Knob label="Atk" value={track.instrument.attack} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('attack', v)} />
          <Knob label="Dec" value={track.instrument.decay} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('decay', v)} />
          <Knob label="Sus" value={track.instrument.sustain} min={0} max={1} step={0.01} onChange={(v) => updateInstrument('sustain', v)} />
          <Knob label="Rel" value={track.instrument.release} min={0.001} max={4} step={0.01} onChange={(v) => updateInstrument('release', v)} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Modulator Envelope" defaultOpen={false} color="#ec4899">
        <div style={styles.knobContainer}>
          <Knob label="Atk" value={track.instrument.modulationAttack} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('modulationAttack', v)} />
          <Knob label="Dec" value={track.instrument.modulationDecay} min={0} max={2} step={0.01} onChange={(v) => updateInstrument('modulationDecay', v)} />
          <Knob label="Sus" value={track.instrument.modulationSustain} min={0} max={1} step={0.01} onChange={(v) => updateInstrument('modulationSustain', v)} />
          <Knob label="Rel" value={track.instrument.modulationRelease} min={0.001} max={4} step={0.01} onChange={(v) => updateInstrument('modulationRelease', v)} />
        </div>
      </CollapsibleSection>
    </div>
  )
}

function AMEditor({ track, audioEngine }) {
  const { actions } = useDAW()

  const updateInstrument = useCallback((key, value) => {
    const newInstrument = { ...track.instrument, [key]: value }
    actions.updateTrack(track.id, { instrument: newInstrument })
    if (audioEngine) {
      try {
        audioEngine.updateAMSettings(track.id, { [key]: value })
      } catch (err) {
        console.warn('[InstrumentPanel] Error updating AM:', err)
      }
    }
  }, [track, actions, audioEngine])

  // Preview the sound
  const playPreview = useCallback(() => {
    if (audioEngine) {
      try {
        audioEngine.triggerNote(track.id, 60, '4n', '+0', 0.8)
      } catch (err) {
        console.warn('[InstrumentPanel] Error playing preview:', err)
      }
    }
  }, [track.id, audioEngine])

  return (
    <div style={styles.container}>
      <CollapsibleSection title="AM Synthesis" defaultOpen={true} color="#06b6d4">
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0' }}>
          Amplitude modulation for tremolo-like effects
        </p>
        <button
          onClick={playPreview}
          style={{
            ...styles.select,
            cursor: 'pointer',
            textAlign: 'center',
            marginBottom: '0.5rem',
            background: 'rgba(6, 182, 212, 0.2)',
            borderColor: 'rgba(6, 182, 212, 0.4)',
          }}
        >
          Preview Sound
        </button>
        <div style={styles.row}>
          <span style={styles.label}>Harmonic</span>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={track.instrument.harmonicity}
            onChange={(e) => updateInstrument('harmonicity', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={{ ...styles.knobValue, width: '35px', textAlign: 'right' }}>{track.instrument.harmonicity.toFixed(1)}</span>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Carrier Envelope" defaultOpen={false} color="#3b82f6">
        <div style={styles.knobContainer}>
          <Knob label="Atk" value={track.instrument.attack} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('attack', v)} />
          <Knob label="Dec" value={track.instrument.decay} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('decay', v)} />
          <Knob label="Sus" value={track.instrument.sustain} min={0} max={1} step={0.01} onChange={(v) => updateInstrument('sustain', v)} />
          <Knob label="Rel" value={track.instrument.release} min={0.001} max={4} step={0.01} onChange={(v) => updateInstrument('release', v)} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Modulator Envelope" defaultOpen={false} color="#ec4899">
        <div style={styles.knobContainer}>
          <Knob label="Atk" value={track.instrument.modulationAttack} min={0.001} max={2} step={0.01} onChange={(v) => updateInstrument('modulationAttack', v)} />
          <Knob label="Dec" value={track.instrument.modulationDecay} min={0} max={2} step={0.01} onChange={(v) => updateInstrument('modulationDecay', v)} />
          <Knob label="Sus" value={track.instrument.modulationSustain} min={0} max={1} step={0.01} onChange={(v) => updateInstrument('modulationSustain', v)} />
          <Knob label="Rel" value={track.instrument.modulationRelease} min={0.001} max={4} step={0.01} onChange={(v) => updateInstrument('modulationRelease', v)} />
        </div>
      </CollapsibleSection>
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

  if (track.type === 'pluck') {
    return <PluckEditor track={track} audioEngine={audioEngine} />
  }

  if (track.type === 'fm') {
    return <FMEditor track={track} audioEngine={audioEngine} />
  }

  if (track.type === 'am') {
    return <AMEditor track={track} audioEngine={audioEngine} />
  }

  return <SynthEditor track={track} audioEngine={audioEngine} />
}
