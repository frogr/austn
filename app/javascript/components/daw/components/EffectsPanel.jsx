import React, { useCallback, useState } from 'react'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
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
    padding: '0.5rem 0.75rem',
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  chevron: {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.4)',
    transition: 'transform 0.2s',
  },
  sectionContent: {
    padding: '0.75rem',
  },
  effectsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  },
  effectCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  effectHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  effectTitle: {
    fontSize: '0.6rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  toggleButton: {
    padding: '0.15rem 0.4rem',
    fontSize: '0.55rem',
    fontWeight: 600,
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleButtonOff: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.4)',
  },
  toggleButtonOn: {
    background: 'rgba(16, 185, 129, 0.4)',
    color: '#10b981',
  },
  row: {
    display: 'flex',
    gap: '0.4rem',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  label: {
    fontSize: '0.55rem',
    color: 'rgba(255,255,255,0.5)',
    width: '45px',
    flexShrink: 0,
  },
  slider: {
    flex: 1,
    height: '3px',
    appearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  select: {
    flex: 1,
    padding: '0.2rem 0.3rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.6rem',
    cursor: 'pointer',
  },
  valueDisplay: {
    fontSize: '0.5rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'monospace',
    width: '35px',
    textAlign: 'right',
  },
  disabled: {
    opacity: 0.4,
    pointerEvents: 'none',
  },
}

const DELAY_TIMES = [
  { value: '2n', label: '1/2' },
  { value: '4n', label: '1/4' },
  { value: '8n', label: '1/8' },
  { value: '16n', label: '1/16' },
]

const DISTORTION_TYPES = [
  { value: 'softclip', label: 'Soft' },
  { value: 'hardclip', label: 'Hard' },
  { value: 'bitcrusher', label: 'Crush' },
]

function CollapsibleSection({ title, children, defaultOpen = true, color, enabledCount = 0 }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={styles.section}>
      <div
        style={{
          ...styles.sectionHeader,
          borderLeft: color ? `3px solid ${color}` : 'none',
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      >
        <span style={{ ...styles.sectionTitle, color: color || 'rgba(255,255,255,0.7)' }}>
          {title}
          {enabledCount > 0 && (
            <span style={{
              background: 'rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.1rem 0.3rem',
              borderRadius: '0.25rem',
              fontSize: '0.5rem',
            }}>
              {enabledCount} ON
            </span>
          )}
        </span>
        <span style={{ ...styles.chevron, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
      </div>
      {isOpen && <div style={styles.sectionContent}>{children}</div>}
    </div>
  )
}

function EffectControl({ label, value, min, max, step, onChange, disabled }) {
  return (
    <div style={{ ...styles.row, ...(disabled ? styles.disabled : {}) }}>
      <span style={styles.label}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
        disabled={disabled}
      />
      <span style={styles.valueDisplay}>
        {typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}
      </span>
    </div>
  )
}

function ReverbCard({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.reverb || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('reverb', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { reverb: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>Reverb</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <EffectControl label="Size" value={effects.roomSize || 0.5} min={0.1} max={1} step={0.05} onChange={(v) => handleUpdate('roomSize', v)} disabled={!enabled} />
        <EffectControl label="Mix" value={effects.wet || 0.3} min={0} max={1} step={0.05} onChange={(v) => handleUpdate('wet', v)} disabled={!enabled} />
      </div>
    </div>
  )
}

function DelayCard({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.delay || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('delay', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { delay: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>Delay</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <div style={styles.row}>
          <span style={styles.label}>Time</span>
          <select style={styles.select} value={effects.time || '8n'} onChange={(e) => handleUpdate('time', e.target.value)} disabled={!enabled}>
            {DELAY_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <EffectControl label="Fdbk" value={effects.feedback || 0.3} min={0} max={0.9} step={0.05} onChange={(v) => handleUpdate('feedback', v)} disabled={!enabled} />
        <EffectControl label="Mix" value={effects.wet || 0.3} min={0} max={1} step={0.05} onChange={(v) => handleUpdate('wet', v)} disabled={!enabled} />
      </div>
    </div>
  )
}

function DistortionCard({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.distortion || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('distortion', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { distortion: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>Distort</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <div style={styles.row}>
          <span style={styles.label}>Type</span>
          <select style={styles.select} value={effects.type || 'softclip'} onChange={(e) => handleUpdate('type', e.target.value)} disabled={!enabled}>
            {DISTORTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <EffectControl label="Amt" value={effects.amount || 0.4} min={0} max={1} step={0.05} onChange={(v) => handleUpdate('amount', v)} disabled={!enabled} />
      </div>
    </div>
  )
}

function ChorusCard({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.chorus || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('chorus', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { chorus: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>Chorus</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <EffectControl label="Rate" value={effects.frequency || 1.5} min={0.1} max={10} step={0.1} onChange={(v) => handleUpdate('frequency', v)} disabled={!enabled} />
        <EffectControl label="Depth" value={effects.depth || 0.7} min={0} max={1} step={0.05} onChange={(v) => handleUpdate('depth', v)} disabled={!enabled} />
        <EffectControl label="Mix" value={effects.wet || 0.3} min={0} max={1} step={0.05} onChange={(v) => handleUpdate('wet', v)} disabled={!enabled} />
      </div>
    </div>
  )
}

export default function EffectsPanel({ track, audioEngine }) {
  const { actions } = useDAW()

  const handleUpdateEffect = useCallback((effectType, settings) => {
    if (!track) return
    actions.updateTrackEffects(track.id, effectType, settings)
  }, [track, actions])

  if (!track || !track.effects) {
    return null
  }

  // Count enabled effects
  const enabledCount = [
    track.effects.reverb?.enabled,
    track.effects.delay?.enabled,
    track.effects.distortion?.enabled,
    track.effects.chorus?.enabled,
  ].filter(Boolean).length

  return (
    <div style={styles.container}>
      <CollapsibleSection title="Effects" defaultOpen={false} color="#ec4899" enabledCount={enabledCount}>
        <div style={styles.effectsGrid}>
          <ReverbCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          <DelayCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          <DistortionCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          <ChorusCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
        </div>
      </CollapsibleSection>
    </div>
  )
}
