import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { useDAW } from '../context/DAWContext'

const PIANO_KEYS = [
  { note: 'C', midi: 60, isBlack: false },
  { note: 'C#', midi: 61, isBlack: true },
  { note: 'D', midi: 62, isBlack: false },
  { note: 'D#', midi: 63, isBlack: true },
  { note: 'E', midi: 64, isBlack: false },
  { note: 'F', midi: 65, isBlack: false },
  { note: 'F#', midi: 66, isBlack: true },
  { note: 'G', midi: 67, isBlack: false },
  { note: 'G#', midi: 68, isBlack: true },
  { note: 'A', midi: 69, isBlack: false },
  { note: 'A#', midi: 70, isBlack: true },
  { note: 'B', midi: 71, isBlack: false },
]

// Generate 3 octaves of keys (C3 to B5), highest at top
const generateKeys = () => {
  const keys = []
  // Generate in ascending order first
  for (let octave = 3; octave <= 5; octave++) {
    PIANO_KEYS.forEach(key => {
      keys.push({
        ...key,
        midi: key.midi + (octave - 4) * 12,
        label: `${key.note}${octave}`,
      })
    })
  }
  // Reverse so highest notes are at top (displayed first)
  return keys.reverse()
}

const ALL_KEYS = generateKeys()
const ROW_HEIGHT = 24
const KEY_WIDTH = 48
const STEP_WIDTH = 24

const styles = {
  container: {
    display: 'flex',
    height: `${ALL_KEYS.length * ROW_HEIGHT}px`,
    maxHeight: '500px',
    overflow: 'auto',
    background: 'rgba(0,0,0,0.3)',
    position: 'relative',
  },
  keysContainer: {
    flexShrink: 0,
    width: `${KEY_WIDTH}px`,
    background: 'rgba(0,0,0,0.4)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    position: 'sticky',
    left: 0,
    zIndex: 10,
  },
  key: {
    height: `${ROW_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '10px',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  whiteKey: {
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.7)',
  },
  blackKey: {
    background: 'rgba(0,0,0,0.4)',
    color: 'rgba(255,255,255,0.5)',
  },
  gridContainer: {
    flex: 1,
    position: 'relative',
  },
  gridRow: {
    height: `${ROW_HEIGHT}px`,
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  gridCell: {
    width: `${STEP_WIDTH}px`,
    height: '100%',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  barLine: {
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  note: {
    position: 'absolute',
    height: `${ROW_HEIGHT - 4}px`,
    background: 'linear-gradient(135deg, var(--accent-color, #10b981), #059669)',
    borderRadius: '3px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    userSelect: 'none',
  },
  noteHover: {
    filter: 'brightness(1.1)',
  },
  noteResizing: {
    filter: 'brightness(1.2)',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.5)',
  },
  resizeHandle: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '8px',
    height: '100%',
    cursor: 'ew-resize',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '0 3px 3px 0',
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  resizeHandleVisible: {
    opacity: 1,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    width: '2px',
    background: '#ef4444',
    zIndex: 30,
    pointerEvents: 'none',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
  },
  drumRow: {
    height: `${ROW_HEIGHT}px`,
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  drumLabel: {
    width: `${KEY_WIDTH}px`,
    height: `${ROW_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    background: 'rgba(0,0,0,0.4)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    boxSizing: 'border-box',
  },
}

const DRUM_LABELS = ['Kick', 'Snare', 'Hi-Hat', 'Clap', 'Tom', 'Crash', 'Ride', 'Cowbell']
const DRUM_TYPES = ['kick', 'snare', 'hihat', 'clap', 'tom', 'crash', 'ride', 'cowbell']

function DrumGrid({ track, audioEngine }) {
  const { state, actions } = useDAW()

  const handleCellClick = useCallback((step, drumIndex) => {
    if (!track) return

    const existingNote = track.notes.find(n => n.step === step && n.pitch === drumIndex)
    if (existingNote) {
      actions.removeNote(track.id, existingNote.id)
    } else {
      // Play the drum sound as preview
      if (audioEngine) {
        audioEngine.triggerDrum(track.id, DRUM_TYPES[drumIndex], '+0', 0.8)
      }
      actions.addNote(track.id, {
        pitch: drumIndex,
        step,
        duration: 1,
        velocity: 100,
      })
    }
  }, [track, actions, audioEngine])

  const noteMap = useMemo(() => {
    const map = new Map()
    track?.notes.forEach(note => {
      const key = `${note.step}-${note.pitch}`
      map.set(key, note)
    })
    return map
  }, [track?.notes])

  const playheadLeft = KEY_WIDTH + (state.currentStep * STEP_WIDTH) + (STEP_WIDTH / 2)

  return (
    <div style={{ ...styles.container, height: `${DRUM_LABELS.length * ROW_HEIGHT}px` }}>
      {/* Playhead - at container level for full height */}
      {state.isPlaying && (
        <div
          style={{
            ...styles.playhead,
            left: `${playheadLeft}px`,
            height: `${DRUM_LABELS.length * ROW_HEIGHT}px`,
          }}
        />
      )}
      <div style={styles.keysContainer}>
        {DRUM_LABELS.map((label, idx) => {
          const isSelected = state.selectedPitch === idx
          return (
            <div
              key={idx}
              style={{
                ...styles.drumLabel,
                height: `${ROW_HEIGHT}px`,
                cursor: 'pointer',
                background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.4)',
                borderLeft: isSelected ? '3px solid var(--accent-color, #10b981)' : '3px solid transparent',
              }}
              onClick={() => {
                actions.setSelectedPitch(idx)
                if (audioEngine && track) {
                  audioEngine.triggerDrum(track.id, DRUM_TYPES[idx], '+0', 0.8)
                }
              }}
            >
              {label}
            </div>
          )
        })}
      </div>
      <div style={styles.gridContainer}>

        {DRUM_LABELS.map((_, drumIndex) => {
          const isSelected = state.selectedPitch === drumIndex
          return (
            <div
              key={drumIndex}
              style={{
                ...styles.drumRow,
                background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
              }}
            >
              {Array.from({ length: state.totalSteps }).map((_, step) => {
                const hasNote = noteMap.has(`${step}-${drumIndex}`)
                const isBarLine = (step + 1) % 4 === 0
                return (
                  <div
                    key={step}
                    style={{
                      ...styles.gridCell,
                      ...(isBarLine ? styles.barLine : {}),
                      background: hasNote
                        ? 'linear-gradient(135deg, var(--accent-color, #10b981), #059669)'
                        : state.currentStep === step
                        ? 'rgba(255,255,255,0.08)'
                        : 'transparent',
                    }}
                    onClick={() => handleCellClick(step, drumIndex)}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SynthGrid({ track, audioEngine }) {
  const { state, actions } = useDAW()
  const gridContainerRef = useRef(null)

  // State for resize operations
  const [resizingNote, setResizingNote] = useState(null)
  const [hoveredNoteId, setHoveredNoteId] = useState(null)

  // State for click-drag to create notes
  const [isCreating, setIsCreating] = useState(false)
  const [createStart, setCreateStart] = useState(null)
  const [createPreview, setCreatePreview] = useState(null)

  // Handle resize drag
  const handleResizeStart = useCallback((e, note) => {
    e.stopPropagation()
    e.preventDefault()
    setResizingNote({
      noteId: note.id,
      pitch: note.pitch,
      startStep: note.step,
      originalDuration: note.duration,
      startX: e.clientX,
    })
  }, [])

  // Handle mouse move for resizing
  useEffect(() => {
    if (!resizingNote) return

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizingNote.startX
      const stepDelta = Math.round(deltaX / STEP_WIDTH)
      const newDuration = Math.max(1, resizingNote.originalDuration + stepDelta)

      // Limit duration to not exceed total steps
      const maxDuration = state.totalSteps - resizingNote.startStep
      const clampedDuration = Math.min(newDuration, maxDuration)

      actions.updateNote(track.id, resizingNote.noteId, { duration: clampedDuration })
    }

    const handleMouseUp = () => {
      setResizingNote(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingNote, actions, track?.id, state.totalSteps])

  // Handle click-drag to create notes
  const handleGridMouseDown = useCallback((e, step, midi) => {
    if (!track) return

    // Check if clicking on an existing note
    const existingNote = track.notes.find(n =>
      n.pitch === midi && step >= n.step && step < n.step + (n.duration || 1)
    )

    if (existingNote) {
      // If clicking on note body (not resize handle), delete it
      actions.removeNote(track.id, existingNote.id)
      return
    }

    // Start creating a new note
    setIsCreating(true)
    setCreateStart({ step, midi })
    setCreatePreview({ step, midi, duration: 1 })

    // Play preview sound
    if (audioEngine) {
      audioEngine.triggerNote(track.id, midi, '16n', '+0', 0.8)
    }
  }, [track, actions, audioEngine])

  // Handle mouse move while creating note
  useEffect(() => {
    if (!isCreating || !createStart) return

    const handleMouseMove = (e) => {
      if (!gridContainerRef.current) return

      const rect = gridContainerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const currentStep = Math.floor(x / STEP_WIDTH)

      const newDuration = Math.max(1, currentStep - createStart.step + 1)
      const maxDuration = state.totalSteps - createStart.step
      const clampedDuration = Math.min(newDuration, maxDuration)

      setCreatePreview({
        step: createStart.step,
        midi: createStart.midi,
        duration: clampedDuration,
      })
    }

    const handleMouseUp = () => {
      if (createPreview && track) {
        actions.addNote(track.id, {
          pitch: createPreview.midi,
          step: createPreview.step,
          duration: createPreview.duration,
          velocity: 100,
        })
      }

      setIsCreating(false)
      setCreateStart(null)
      setCreatePreview(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isCreating, createStart, createPreview, actions, track?.id, state.totalSteps])

  const notesByRow = useMemo(() => {
    const map = new Map()
    track?.notes.forEach(note => {
      if (!map.has(note.pitch)) {
        map.set(note.pitch, [])
      }
      map.get(note.pitch).push(note)
    })
    return map
  }, [track?.notes])

  // Get row index for a midi value (for positioning notes)
  const getMidiRowIndex = useCallback((midi) => {
    return ALL_KEYS.findIndex(k => k.midi === midi)
  }, [])

  const playheadLeft = KEY_WIDTH + (state.currentStep * STEP_WIDTH) + (STEP_WIDTH / 2)

  return (
    <div style={styles.container}>
      {/* Playhead - at container level for full height */}
      {state.isPlaying && (
        <div
          style={{
            ...styles.playhead,
            left: `${playheadLeft}px`,
            height: `${ALL_KEYS.length * ROW_HEIGHT}px`,
          }}
        />
      )}

      {/* Piano keys */}
      <div style={styles.keysContainer}>
        {ALL_KEYS.map(key => {
          const isSelected = state.selectedPitch === key.midi
          return (
            <div
              key={key.midi}
              style={{
                ...styles.key,
                ...(key.isBlack ? styles.blackKey : styles.whiteKey),
                background: isSelected
                  ? 'rgba(16, 185, 129, 0.3)'
                  : key.isBlack
                  ? 'rgba(0,0,0,0.4)'
                  : 'rgba(255,255,255,0.08)',
                borderLeft: isSelected ? '3px solid var(--accent-color, #10b981)' : '3px solid transparent',
              }}
              onClick={() => {
                actions.setSelectedPitch(key.midi)
                if (audioEngine && track) {
                  // Match actual step duration so release/sustain is accurate
                  audioEngine.triggerNote(track.id, key.midi, '16n', '+0', 0.8)
                }
              }}
            >
              {key.label}
            </div>
          )
        })}
      </div>

      {/* Note grid */}
      <div style={styles.gridContainer} ref={gridContainerRef}>
        {/* Grid rows (background cells) */}
        {ALL_KEYS.map(key => {
          const isSelected = state.selectedPitch === key.midi
          return (
            <div
              key={key.midi}
              style={{
                ...styles.gridRow,
                background: isSelected
                  ? 'rgba(16, 185, 129, 0.08)'
                  : key.isBlack
                  ? 'rgba(0,0,0,0.2)'
                  : 'transparent',
              }}
            >
              {Array.from({ length: state.totalSteps }).map((_, step) => {
                const isBarLine = (step + 1) % 4 === 0
                return (
                  <div
                    key={step}
                    style={{
                      ...styles.gridCell,
                      ...(isBarLine ? styles.barLine : {}),
                      background: state.currentStep === step
                        ? 'rgba(255,255,255,0.05)'
                        : 'transparent',
                    }}
                    onMouseDown={(e) => handleGridMouseDown(e, step, key.midi)}
                  />
                )
              })}
            </div>
          )
        })}

        {/* Render notes as positioned rectangles */}
        {track?.notes.map(note => {
          const rowIndex = getMidiRowIndex(note.pitch)
          if (rowIndex === -1) return null

          const duration = note.duration || 1
          const isResizing = resizingNote?.noteId === note.id
          const isHovered = hoveredNoteId === note.id

          return (
            <div
              key={note.id}
              style={{
                ...styles.note,
                ...(isHovered ? styles.noteHover : {}),
                ...(isResizing ? styles.noteResizing : {}),
                top: `${rowIndex * ROW_HEIGHT + 2}px`,
                left: `${note.step * STEP_WIDTH + 1}px`,
                width: `${duration * STEP_WIDTH - 2}px`,
                zIndex: isResizing ? 20 : 5,
              }}
              onMouseEnter={() => setHoveredNoteId(note.id)}
              onMouseLeave={() => setHoveredNoteId(null)}
              onClick={(e) => {
                e.stopPropagation()
                actions.removeNote(track.id, note.id)
              }}
            >
              {/* Resize handle */}
              <div
                style={{
                  ...styles.resizeHandle,
                  ...(isHovered || isResizing ? styles.resizeHandleVisible : {}),
                }}
                onMouseDown={(e) => handleResizeStart(e, note)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )
        })}

        {/* Create preview */}
        {createPreview && (
          <div
            style={{
              ...styles.note,
              top: `${getMidiRowIndex(createPreview.midi) * ROW_HEIGHT + 2}px`,
              left: `${createPreview.step * STEP_WIDTH + 1}px`,
              width: `${createPreview.duration * STEP_WIDTH - 2}px`,
              opacity: 0.6,
              zIndex: 15,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}

function AudioWaveform({ track }) {
  const { state } = useDAW()
  const canvasRef = React.useRef(null)

  // Draw waveform when track loads
  React.useEffect(() => {
    if (!track.audioData?.buffer || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const buffer = track.audioData.buffer
    const data = buffer.getChannelData(0)

    // Set canvas size
    canvas.width = state.totalSteps * STEP_WIDTH
    canvas.height = 200

    // Clear
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw waveform
    ctx.strokeStyle = 'var(--accent-color, #10b981)'
    ctx.lineWidth = 1
    ctx.beginPath()

    const step = Math.ceil(data.length / canvas.width)
    const amp = canvas.height / 2

    for (let i = 0; i < canvas.width; i++) {
      const idx = Math.floor(i * step)
      const val = data[idx] || 0
      const y = amp + val * amp * 0.8

      if (i === 0) {
        ctx.moveTo(i, y)
      } else {
        ctx.lineTo(i, y)
      }
    }

    ctx.stroke()
  }, [track.audioData?.buffer, state.totalSteps])

  const playheadLeft = KEY_WIDTH + (state.currentStep * STEP_WIDTH) + (STEP_WIDTH / 2)

  return (
    <div style={{ ...styles.container, height: '200px' }}>
      {state.isPlaying && (
        <div
          style={{
            ...styles.playhead,
            left: `${playheadLeft}px`,
            height: '200px',
          }}
        />
      )}
      <div style={{ ...styles.keysContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          Audio Track
        </span>
      </div>
      <div style={styles.gridContainer}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

export default function PianoRoll({ track, audioEngine }) {
  if (!track) return null

  if (track.type === 'drums') {
    return <DrumGrid track={track} audioEngine={audioEngine} />
  }

  if (track.type === 'audio') {
    return <AudioWaveform track={track} />
  }

  return <SynthGrid track={track} audioEngine={audioEngine} />
}
