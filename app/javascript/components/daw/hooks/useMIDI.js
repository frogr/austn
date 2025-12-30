import { useState, useEffect, useCallback, useRef } from 'react'

export function useMIDI(onNoteOn, onNoteOff, onCC) {
  const [midiAccess, setMidiAccess] = useState(null)
  const [midiInputs, setMidiInputs] = useState([])
  const [selectedInput, setSelectedInput] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState(null)

  const handlersRef = useRef({ onNoteOn, onNoteOff, onCC })

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = { onNoteOn, onNoteOff, onCC }
  }, [onNoteOn, onNoteOff, onCC])

  // Check MIDI support and request access
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false)
      setError('Web MIDI API not supported in this browser')
      return
    }

    setIsSupported(true)

    navigator.requestMIDIAccess()
      .then((access) => {
        setMidiAccess(access)
        updateInputs(access)

        // Listen for device changes
        access.onstatechange = () => {
          updateInputs(access)
        }
      })
      .catch((err) => {
        setError(`MIDI access denied: ${err.message}`)
      })
  }, [])

  // Update input list
  const updateInputs = useCallback((access) => {
    const inputs = []
    access.inputs.forEach((input) => {
      inputs.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer,
        state: input.state,
      })
    })
    setMidiInputs(inputs)

    // Auto-select first input if none selected
    if (inputs.length > 0 && !selectedInput) {
      setSelectedInput(inputs[0].id)
    }
  }, [selectedInput])

  // Handle MIDI messages
  const handleMIDIMessage = useCallback((event) => {
    const [status, data1, data2] = event.data

    const channel = status & 0x0F
    const messageType = status & 0xF0

    switch (messageType) {
      case 0x90: // Note On
        if (data2 > 0) {
          handlersRef.current.onNoteOn?.(data1, data2, channel)
        } else {
          // Note On with velocity 0 = Note Off
          handlersRef.current.onNoteOff?.(data1, channel)
        }
        break
      case 0x80: // Note Off
        handlersRef.current.onNoteOff?.(data1, channel)
        break
      case 0xB0: // Control Change
        handlersRef.current.onCC?.(data1, data2, channel)
        break
      default:
        break
    }
  }, [])

  // Connect to selected input
  useEffect(() => {
    if (!midiAccess || !selectedInput) return

    const input = midiAccess.inputs.get(selectedInput)
    if (!input) return

    input.onmidimessage = handleMIDIMessage

    return () => {
      input.onmidimessage = null
    }
  }, [midiAccess, selectedInput, handleMIDIMessage])

  // Select a MIDI input
  const selectInput = useCallback((inputId) => {
    setSelectedInput(inputId)
  }, [])

  return {
    isSupported,
    error,
    midiInputs,
    selectedInput,
    selectInput,
  }
}

export default useMIDI
