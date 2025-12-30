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
    padding: '0.35rem',
  },
  effectsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.25rem',
  },
  effectCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '0.25rem',
    padding: '0.3rem',
    border: '1px solid rgba(255,255,255,0.05)',
    minWidth: 0,
    overflow: 'hidden',
  },
  effectHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
  },
  effectTitle: {
    fontSize: '0.55rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  toggleButton: {
    padding: '0.1rem 0.3rem',
    fontSize: '0.5rem',
    fontWeight: 600,
    borderRadius: '0.2rem',
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
    gap: '0.15rem',
    alignItems: 'center',
    marginBottom: '0.15rem',
  },
  label: {
    fontSize: '0.5rem',
    color: 'rgba(255,255,255,0.5)',
    width: '26px',
    flexShrink: 0,
  },
  slider: {
    flex: 1,
    minWidth: 0,
    height: '3px',
    appearance: 'none',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  select: {
    flex: 1,
    minWidth: 0,
    padding: '0.1rem 0.15rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.2rem',
    color: 'white',
    fontSize: '0.5rem',
    cursor: 'pointer',
  },
  valueDisplay: {
    fontSize: '0.45rem',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'monospace',
    width: '22px',
    textAlign: 'right',
    flexShrink: 0,
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

const COMPRESSOR_RATIOS = [
  { value: 2, label: '2:1' },
  { value: 4, label: '4:1' },
  { value: 8, label: '8:1' },
  { value: 12, label: '12:1' },
  { value: 20, label: '20:1' },
]

function CollapsibleSection({ title, children, defaultOpen = true, color, enabledCount = 0 }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={styles.section}>
      <div
        style={styles.sectionHeader}
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

function PhaserCard({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.phaser || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('phaser', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { phaser: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>Phaser</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <EffectControl label="Rate" value={effects.frequency || 0.5} min={0.1} max={8} step={0.1} onChange={(v) => handleUpdate('frequency', v)} disabled={!enabled} />
        <EffectControl label="Oct" value={effects.octaves || 3} min={1} max={6} step={1} onChange={(v) => handleUpdate('octaves', v)} disabled={!enabled} />
        <EffectControl label="Mix" value={effects.wet || 0.5} min={0} max={1} step={0.05} onChange={(v) => handleUpdate('wet', v)} disabled={!enabled} />
      </div>
    </div>
  )
}

function TremoloCard({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.tremolo || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('tremolo', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { tremolo: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>Tremolo</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <EffectControl label="Rate" value={effects.frequency || 4} min={0.5} max={20} step={0.5} onChange={(v) => handleUpdate('frequency', v)} disabled={!enabled} />
        <EffectControl label="Depth" value={effects.depth || 0.5} min={0} max={1} step={0.05} onChange={(v) => handleUpdate('depth', v)} disabled={!enabled} />
      </div>
    </div>
  )
}

function EQ3Card({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.eq3 || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('eq3', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { eq3: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>EQ3</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <EffectControl label="Low" value={effects.low || 0} min={-12} max={12} step={1} onChange={(v) => handleUpdate('low', v)} disabled={!enabled} />
        <EffectControl label="Mid" value={effects.mid || 0} min={-12} max={12} step={1} onChange={(v) => handleUpdate('mid', v)} disabled={!enabled} />
        <EffectControl label="High" value={effects.high || 0} min={-12} max={12} step={1} onChange={(v) => handleUpdate('high', v)} disabled={!enabled} />
      </div>
    </div>
  )
}

function CompressorCard({ track, audioEngine, onUpdate }) {
  const effects = track.effects?.compressor || {}
  const enabled = effects.enabled || false

  const handleUpdate = useCallback((key, value) => {
    onUpdate('compressor', { [key]: value })
    if (audioEngine) {
      audioEngine.updateEffects(track.id, { compressor: { [key]: value } })
    }
  }, [track.id, audioEngine, onUpdate])

  return (
    <div style={{ ...styles.effectCard, borderColor: enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
      <div style={styles.effectHeader}>
        <span style={styles.effectTitle}>Comp</span>
        <button
          style={{ ...styles.toggleButton, ...(enabled ? styles.toggleButtonOn : styles.toggleButtonOff) }}
          onClick={() => handleUpdate('enabled', !enabled)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div style={enabled ? {} : styles.disabled}>
        <EffectControl label="Thrs" value={effects.threshold || -24} min={-60} max={0} step={1} onChange={(v) => handleUpdate('threshold', v)} disabled={!enabled} />
        <div style={styles.row}>
          <span style={styles.label}>Ratio</span>
          <select style={styles.select} value={effects.ratio || 4} onChange={(e) => handleUpdate('ratio', parseFloat(e.target.value))} disabled={!enabled}>
            {COMPRESSOR_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <EffectControl label="Atk" value={(effects.attack || 0.003) * 1000} min={0} max={100} step={1} onChange={(v) => handleUpdate('attack', v / 1000)} disabled={!enabled} />
        <EffectControl label="Rel" value={(effects.release || 0.25) * 1000} min={10} max={1000} step={10} onChange={(v) => handleUpdate('release', v / 1000)} disabled={!enabled} />
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
    track.effects.eq3?.enabled,
    track.effects.compressor?.enabled,
    track.effects.distortion?.enabled,
    track.effects.phaser?.enabled,
    track.effects.tremolo?.enabled,
    track.effects.chorus?.enabled,
    track.effects.delay?.enabled,
    track.effects.reverb?.enabled,
  ].filter(Boolean).length

  return (
    <div style={styles.container}>
      <CollapsibleSection title="Effects" defaultOpen={false} color="#ec4899" enabledCount={enabledCount}>
        <div style={styles.effectsGrid}>
          {/* Row 1: EQ & Compressor (processing effects) */}
          <EQ3Card track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          <CompressorCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          {/* Row 2: Distortion & Phaser */}
          <DistortionCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          <PhaserCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          {/* Row 3: Tremolo & Chorus (modulation effects) */}
          <TremoloCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          <ChorusCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          {/* Row 4: Delay & Reverb (time-based effects) */}
          <DelayCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
          <ReverbCard track={track} audioEngine={audioEngine} onUpdate={handleUpdateEffect} />
        </div>
      </CollapsibleSection>
    </div>
  )
}
