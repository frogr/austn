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
}

// Generate unique IDs
let noteIdCounter = 0
export const generateNoteId = () => `note-${Date.now()}-${++noteIdCounter}`

let trackIdCounter = 0
export const generateTrackId = () => `track-${Date.now()}-${++trackIdCounter}`

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
      },
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
    name: `Synth ${id.split('-').pop()}`,
    type: 'synth',
    instrument: {
      oscillator: 'sawtooth',
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.3,
      filterFreq: 2000,
      filterRes: 1,
    },
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
    name: `Drums ${id.split('-').pop()}`,
    type: 'drums',
    instrument: {
      kit: 'default',
    },
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
    muted: false,
    solo: false,
    volume: 0.8,
    pan: 0,
    notes: [], // Not used for audio tracks
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

    default:
      return state
  }
}
