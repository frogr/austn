// Action types
export const ActionTypes = {
  SET_PLAYING: 'SET_PLAYING',
  SET_BPM: 'SET_BPM',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_LOOP: 'SET_LOOP',
  SET_LOOP_POINTS: 'SET_LOOP_POINTS',
  ADD_TRACK: 'ADD_TRACK',
  REMOVE_TRACK: 'REMOVE_TRACK',
  UPDATE_TRACK: 'UPDATE_TRACK',
  UPDATE_TRACK_EFFECTS: 'UPDATE_TRACK_EFFECTS',
  SELECT_TRACK: 'SELECT_TRACK',
  ADD_NOTE: 'ADD_NOTE',
  REMOVE_NOTE: 'REMOVE_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  CLEAR_PATTERN: 'CLEAR_PATTERN',
  FILL_PATTERN: 'FILL_PATTERN',
  DUPLICATE_PATTERN: 'DUPLICATE_PATTERN',
  SET_MASTER_VOLUME: 'SET_MASTER_VOLUME',
  LOAD_PROJECT: 'LOAD_PROJECT',
  NEW_PROJECT: 'NEW_PROJECT',
  SET_AUDIO_INITIALIZED: 'SET_AUDIO_INITIALIZED',
  SET_STEPS_PER_MEASURE: 'SET_STEPS_PER_MEASURE',
  SET_TOTAL_STEPS: 'SET_TOTAL_STEPS',
  SET_PROJECT_NAME: 'SET_PROJECT_NAME',
  SET_SELECTED_PITCH: 'SET_SELECTED_PITCH',
  LOAD_PATTERN: 'LOAD_PATTERN',
  SET_CURRENT_PATTERN_ID: 'SET_CURRENT_PATTERN_ID',
}

// Default effects settings for tracks
// Chain order: EQ -> Compressor -> Distortion -> Phaser -> Tremolo -> Chorus -> Delay -> Reverb
export const DEFAULT_TRACK_EFFECTS = {
  eq3: {
    enabled: false,
    low: 0,      // dB (-12 to 12)
    mid: 0,      // dB (-12 to 12)
    high: 0,     // dB (-12 to 12)
    lowFrequency: 400,   // Hz
    highFrequency: 2500, // Hz
  },
  compressor: {
    enabled: false,
    threshold: -24,  // dB
    ratio: 4,        // ratio
    attack: 0.003,   // seconds
    release: 0.25,   // seconds
  },
  distortion: {
    enabled: false,
    amount: 0.4,
    type: 'softclip',
  },
  phaser: {
    enabled: false,
    frequency: 0.5,  // Hz (LFO rate)
    octaves: 3,      // range of modulation
    baseFrequency: 1000, // Hz
    wet: 0.5,
  },
  tremolo: {
    enabled: false,
    frequency: 4,    // Hz (LFO rate)
    depth: 0.5,      // 0-1
    wet: 1,
  },
  chorus: {
    enabled: false,
    frequency: 1.5,
    depth: 0.7,
    wet: 0.3,
  },
  delay: {
    enabled: false,
    time: '8n',
    feedback: 0.3,
    wet: 0.3,
  },
  reverb: {
    enabled: false,
    roomSize: 0.5,
    wet: 0.3,
  },
}

// Generate unique IDs
let noteIdCounter = 0
export const generateNoteId = () => `note-${Date.now()}-${++noteIdCounter}`

let trackIdCounter = 0
export const generateTrackId = () => `track-${Date.now()}-${++trackIdCounter}`

// Track counters for instrument naming
let synthCounter = 1
let drumCounter = 1
let pluckCounter = 1
let fmCounter = 1
let amCounter = 1

// Initial state
export const initialState = {
  isPlaying: false,
  audioInitialized: false,
  currentStep: 0,
  bpm: 120,
  isLooping: true,
  loopStart: 0,
  loopEnd: 16,
  stepsPerMeasure: 16,
  totalSteps: 16,
  masterVolume: 0.8,
  projectName: '',
  selectedPitch: null, // For pattern fill - which row is selected
  currentPatternId: null, // For tracking loaded pattern from library
  tracks: [
    {
      id: 'track-1',
      name: 'Synth 1',
      type: 'synth',
      instrument: {
        oscillator: 'sawtooth',
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.3,
        filterFreq: 2000,
        filterRes: 1,
        lfo: {
          enabled: false,
          rate: '8n',      // Tempo-synced rate (1m, 2n, 4n, 8n, 16n, 32n, triplets)
          waveform: 'sine', // sine, square, sawtooth, triangle
          depth: 0.5,       // 0-1 (how much the filter moves)
        },
      },
      effects: { ...DEFAULT_TRACK_EFFECTS },
      muted: false,
      solo: false,
      volume: 0.8,
      pan: 0,
      notes: [],
    },
  ],
  selectedTrackId: 'track-1',
}

// Create a default synth track
export function createDefaultSynthTrack() {
  const id = generateTrackId()
  return {
    id,
    name: `Synth ${synthCounter++}`,
    type: 'synth',
    instrument: {
      oscillator: 'sawtooth',
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.3,
      filterFreq: 2000,
      filterRes: 1,
      lfo: {
        enabled: false,
        rate: '8n',      // Tempo-synced rate (1m, 2n, 4n, 8n, 16n, 32n, triplets)
        waveform: 'sine', // sine, square, sawtooth, triangle
        depth: 0.5,       // 0-1 (how much the filter moves)
      },
    },
    effects: { ...DEFAULT_TRACK_EFFECTS },
    muted: false,
    solo: false,
    volume: 0.8,
    pan: 0,
    notes: [],
  }
}

// Create a default drum track
export function createDefaultDrumTrack() {
  const id = generateTrackId()
  return {
    id,
    name: `Drums ${drumCounter++}`,
    type: 'drums',
    instrument: {
      kit: 'default',
    },
    effects: { ...DEFAULT_TRACK_EFFECTS },
    muted: false,
    solo: false,
    volume: 0.8,
    pan: 0,
    notes: [],
  }
}

// Create an audio track (for recordings)
export function createAudioTrack(name, audioData) {
  const id = generateTrackId()
  return {
    id,
    name: name || `Audio ${id.split('-').pop()}`,
    type: 'audio',
    audioData, // { url, buffer, duration }
    effects: { ...DEFAULT_TRACK_EFFECTS },
    muted: false,
    solo: false,
    volume: 0.8,
    pan: 0,
    notes: [], // Not used for audio tracks
  }
}

// Create a pluck/guitar synth track
export function createPluckTrack() {
  const id = generateTrackId()
  return {
    id,
    name: `Pluck ${pluckCounter++}`,
    type: 'pluck',
    instrument: {
      attackNoise: 1,      // 0-10 (string attack noise)
      dampening: 4000,     // Hz (string dampening frequency)
      resonance: 0.7,      // 0-1 (string resonance)
      release: 1,          // seconds (release time)
    },
    effects: { ...DEFAULT_TRACK_EFFECTS },
    muted: false,
    solo: false,
    volume: 0.8,
    pan: 0,
    notes: [],
  }
}

// Create an FM synth track
export function createFMTrack() {
  const id = generateTrackId()
  return {
    id,
    name: `FM ${fmCounter++}`,
    type: 'fm',
    instrument: {
      harmonicity: 3,           // ratio between carrier and modulator
      modulationIndex: 10,      // modulation depth
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.5,
      modulationAttack: 0.5,
      modulationDecay: 0,
      modulationSustain: 1,
      modulationRelease: 0.5,
    },
    effects: { ...DEFAULT_TRACK_EFFECTS },
    muted: false,
    solo: false,
    volume: 0.8,
    pan: 0,
    notes: [],
  }
}

// Create an AM synth track
export function createAMTrack() {
  const id = generateTrackId()
  return {
    id,
    name: `AM ${amCounter++}`,
    type: 'am',
    instrument: {
      harmonicity: 3,           // ratio between carrier and modulator
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.5,
      modulationAttack: 0.5,
      modulationDecay: 0,
      modulationSustain: 1,
      modulationRelease: 0.5,
    },
    effects: { ...DEFAULT_TRACK_EFFECTS },
    muted: false,
    solo: false,
    volume: 0.8,
    pan: 0,
    notes: [],
  }
}

// Generate fill pattern notes
function generateFillNotes(fillType, pitch, totalSteps) {
  const notes = []
  let stepInterval

  switch (fillType) {
    case 'every':
      stepInterval = 1
      break
    case 'every2':
      stepInterval = 2
      break
    case 'every4':
      stepInterval = 4
      break
    case 'everyHalf':
      stepInterval = 0.5
      break
    default:
      return notes
  }

  for (let step = 0; step < totalSteps; step += stepInterval) {
    notes.push({
      id: generateNoteId(),
      pitch,
      step: Math.floor(step),
      duration: Math.min(stepInterval, 1),
      velocity: 100,
    })
  }

  return notes
}

// Reducer function
export function dawReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_PLAYING:
      return { ...state, isPlaying: action.payload }

    case ActionTypes.SET_AUDIO_INITIALIZED:
      return { ...state, audioInitialized: action.payload }

    case ActionTypes.SET_BPM:
      return { ...state, bpm: Math.max(40, Math.min(240, action.payload)) }

    case ActionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload }

    case ActionTypes.SET_LOOP:
      return { ...state, isLooping: action.payload }

    case ActionTypes.SET_LOOP_POINTS:
      return {
        ...state,
        loopStart: action.payload.start ?? state.loopStart,
        loopEnd: action.payload.end ?? state.loopEnd,
      }

    case ActionTypes.SET_STEPS_PER_MEASURE:
      return { ...state, stepsPerMeasure: action.payload }

    case ActionTypes.SET_TOTAL_STEPS:
      return {
        ...state,
        totalSteps: action.payload,
        loopEnd: Math.min(state.loopEnd, action.payload),
      }

    case ActionTypes.SET_MASTER_VOLUME:
      return { ...state, masterVolume: Math.max(0, Math.min(1, action.payload)) }

    case ActionTypes.ADD_TRACK:
      return {
        ...state,
        tracks: [...state.tracks, action.payload],
        selectedTrackId: action.payload.id,
      }

    case ActionTypes.REMOVE_TRACK:
      if (state.tracks.length <= 1) return state
      const newTracks = state.tracks.filter(t => t.id !== action.payload)
      return {
        ...state,
        tracks: newTracks,
        selectedTrackId: state.selectedTrackId === action.payload
          ? newTracks[0]?.id
          : state.selectedTrackId,
      }

    case ActionTypes.UPDATE_TRACK:
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      }

    case ActionTypes.UPDATE_TRACK_EFFECTS: {
      const { trackId, effectType, settings } = action.payload
      return {
        ...state,
        tracks: state.tracks.map(t => {
          if (t.id !== trackId) return t
          return {
            ...t,
            effects: {
              ...t.effects,
              [effectType]: {
                ...t.effects[effectType],
                ...settings,
              },
            },
          }
        }),
      }
    }

    case ActionTypes.SELECT_TRACK:
      return { ...state, selectedTrackId: action.payload }

    case ActionTypes.ADD_NOTE: {
      const { trackId, note } = action.payload
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === trackId
            ? { ...t, notes: [...t.notes, { ...note, id: note.id || generateNoteId() }] }
            : t
        ),
      }
    }

    case ActionTypes.REMOVE_NOTE: {
      const { trackId, noteId } = action.payload
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === trackId
            ? { ...t, notes: t.notes.filter(n => n.id !== noteId) }
            : t
        ),
      }
    }

    case ActionTypes.UPDATE_NOTE: {
      const { trackId, noteId, updates } = action.payload
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === trackId
            ? {
                ...t,
                notes: t.notes.map(n => n.id === noteId ? { ...n, ...updates } : n)
              }
            : t
        ),
      }
    }

    case ActionTypes.CLEAR_PATTERN: {
      const { trackId } = action.payload
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === trackId ? { ...t, notes: [] } : t
        ),
      }
    }

    case ActionTypes.FILL_PATTERN: {
      const { trackId, fillType, pitch } = action.payload
      const newNotes = generateFillNotes(fillType, pitch, state.totalSteps)
      return {
        ...state,
        tracks: state.tracks.map(t => {
          if (t.id !== trackId) return t
          // Remove existing notes at this pitch, then add new ones
          const existingNotes = t.notes.filter(n => n.pitch !== pitch)
          return { ...t, notes: [...existingNotes, ...newNotes] }
        }),
      }
    }

    case ActionTypes.DUPLICATE_PATTERN: {
      const { trackId } = action.payload
      return {
        ...state,
        tracks: state.tracks.map(t => {
          if (t.id !== trackId) return t
          const offset = state.totalSteps
          const duplicatedNotes = t.notes.map(note => ({
            ...note,
            id: generateNoteId(),
            step: note.step + offset,
          }))
          return {
            ...t,
            notes: [...t.notes, ...duplicatedNotes],
          }
        }),
        totalSteps: state.totalSteps * 2,
        loopEnd: state.loopEnd * 2,
      }
    }

    case ActionTypes.LOAD_PROJECT:
      return { ...action.payload, audioInitialized: state.audioInitialized }

    case ActionTypes.NEW_PROJECT:
      return { ...initialState, audioInitialized: state.audioInitialized }

    case ActionTypes.SET_PROJECT_NAME:
      return { ...state, projectName: action.payload }

    case ActionTypes.SET_SELECTED_PITCH:
      return { ...state, selectedPitch: action.payload }

    case ActionTypes.LOAD_PATTERN: {
      // Load a pattern from the library, merging its tracks and settings
      const { pattern, mode = 'replace' } = action.payload

      // Generate new unique IDs for tracks and notes to avoid conflicts
      const processedTracks = (pattern.data?.tracks || []).map(track => {
        const newTrackId = generateTrackId()
        return {
          ...track,
          id: newTrackId,
          notes: track.notes.map(note => ({
            ...note,
            id: generateNoteId(),
          })),
        }
      })

      if (mode === 'merge') {
        // Merge mode: add pattern tracks to existing tracks
        return {
          ...state,
          tracks: [...state.tracks, ...processedTracks],
          currentPatternId: pattern.id,
        }
      }

      // Replace mode: replace all state with pattern
      return {
        ...state,
        bpm: pattern.bpm || state.bpm,
        totalSteps: pattern.total_steps || pattern.totalSteps || state.totalSteps,
        stepsPerMeasure: pattern.steps_per_measure || pattern.stepsPerMeasure || state.stepsPerMeasure,
        loopEnd: pattern.total_steps || pattern.totalSteps || state.loopEnd,
        tracks: processedTracks.length > 0 ? processedTracks : state.tracks,
        selectedTrackId: processedTracks[0]?.id || state.selectedTrackId,
        currentPatternId: pattern.id || null,
        projectName: pattern.name || state.projectName,
      }
    }

    case ActionTypes.SET_CURRENT_PATTERN_ID:
      return { ...state, currentPatternId: action.payload }

    default:
      return state
  }
}
