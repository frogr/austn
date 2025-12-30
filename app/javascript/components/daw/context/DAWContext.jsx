import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { dawReducer, initialState, ActionTypes, generateNoteId, createDefaultSynthTrack, createDefaultDrumTrack, createAudioTrack } from './DAWReducer'

const DAWContext = createContext(null)

export function DAWProvider({ children }) {
  const [state, dispatch] = useReducer(dawReducer, initialState)

  // Action creators
  const actions = {
    setPlaying: useCallback((isPlaying) => {
      dispatch({ type: ActionTypes.SET_PLAYING, payload: isPlaying })
    }, []),

    setAudioInitialized: useCallback((initialized) => {
      dispatch({ type: ActionTypes.SET_AUDIO_INITIALIZED, payload: initialized })
    }, []),

    setBPM: useCallback((bpm) => {
      dispatch({ type: ActionTypes.SET_BPM, payload: bpm })
    }, []),

    setCurrentStep: useCallback((step) => {
      dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step })
    }, []),

    setLoop: useCallback((enabled) => {
      dispatch({ type: ActionTypes.SET_LOOP, payload: enabled })
    }, []),

    setLoopPoints: useCallback((start, end) => {
      dispatch({ type: ActionTypes.SET_LOOP_POINTS, payload: { start, end } })
    }, []),

    setTotalSteps: useCallback((steps) => {
      dispatch({ type: ActionTypes.SET_TOTAL_STEPS, payload: steps })
    }, []),

    setMasterVolume: useCallback((volume) => {
      dispatch({ type: ActionTypes.SET_MASTER_VOLUME, payload: volume })
    }, []),

    addTrack: useCallback((type = 'synth') => {
      const track = type === 'drums' ? createDefaultDrumTrack() : createDefaultSynthTrack()
      dispatch({ type: ActionTypes.ADD_TRACK, payload: track })
      return track.id
    }, []),

    addAudioTrack: useCallback((name, audioData) => {
      const track = createAudioTrack(name, audioData)
      dispatch({ type: ActionTypes.ADD_TRACK, payload: track })
      return track.id
    }, []),

    removeTrack: useCallback((trackId) => {
      dispatch({ type: ActionTypes.REMOVE_TRACK, payload: trackId })
    }, []),

    updateTrack: useCallback((trackId, updates) => {
      dispatch({ type: ActionTypes.UPDATE_TRACK, payload: { id: trackId, updates } })
    }, []),

    selectTrack: useCallback((trackId) => {
      dispatch({ type: ActionTypes.SELECT_TRACK, payload: trackId })
    }, []),

    addNote: useCallback((trackId, note) => {
      dispatch({ type: ActionTypes.ADD_NOTE, payload: { trackId, note: { ...note, id: generateNoteId() } } })
    }, []),

    removeNote: useCallback((trackId, noteId) => {
      dispatch({ type: ActionTypes.REMOVE_NOTE, payload: { trackId, noteId } })
    }, []),

    updateNote: useCallback((trackId, noteId, updates) => {
      dispatch({ type: ActionTypes.UPDATE_NOTE, payload: { trackId, noteId, updates } })
    }, []),

    clearPattern: useCallback((trackId) => {
      dispatch({ type: ActionTypes.CLEAR_PATTERN, payload: { trackId } })
    }, []),

    fillPattern: useCallback((trackId, fillType, pitch = 60) => {
      dispatch({ type: ActionTypes.FILL_PATTERN, payload: { trackId, fillType, pitch } })
    }, []),

    duplicatePattern: useCallback((trackId) => {
      dispatch({ type: ActionTypes.DUPLICATE_PATTERN, payload: { trackId } })
    }, []),

    loadProject: useCallback((projectState) => {
      dispatch({ type: ActionTypes.LOAD_PROJECT, payload: projectState })
    }, []),

    newProject: useCallback(() => {
      dispatch({ type: ActionTypes.NEW_PROJECT })
    }, []),

    setProjectName: useCallback((name) => {
      dispatch({ type: ActionTypes.SET_PROJECT_NAME, payload: name })
    }, []),

    setSelectedPitch: useCallback((pitch) => {
      dispatch({ type: ActionTypes.SET_SELECTED_PITCH, payload: pitch })
    }, []),
  }

  // Get selected track helper
  const getSelectedTrack = useCallback(() => {
    return state.tracks.find(t => t.id === state.selectedTrackId) || state.tracks[0]
  }, [state.tracks, state.selectedTrackId])

  return (
    <DAWContext.Provider value={{ state, actions, getSelectedTrack }}>
      {children}
    </DAWContext.Provider>
  )
}

export function useDAW() {
  const context = useContext(DAWContext)
  if (!context) {
    throw new Error('useDAW must be used within a DAWProvider')
  }
  return context
}

export { ActionTypes }
