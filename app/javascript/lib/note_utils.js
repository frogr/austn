/**
 * Note/frequency conversion utilities
 * A4 = 440Hz standard tuning
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const A4_FREQ = 440
const A4_MIDI = 69

// Guitar standard tuning frequencies (E2, A2, D3, G3, B3, E4)
export const GUITAR_STRINGS = [
  { note: 'E2', midi: 40, freq: 82.41 },
  { note: 'A2', midi: 45, freq: 110.00 },
  { note: 'D3', midi: 50, freq: 146.83 },
  { note: 'G3', midi: 55, freq: 196.00 },
  { note: 'B3', midi: 59, freq: 246.94 },
  { note: 'E4', midi: 64, freq: 329.63 }
]

/**
 * Convert frequency (Hz) to MIDI note number (fractional)
 * @param {number} freq - Frequency in Hz
 * @returns {number} MIDI note number (can be fractional)
 */
export function freqToMidi(freq) {
  return 12 * Math.log2(freq / A4_FREQ) + A4_MIDI
}

/**
 * Convert MIDI note number to frequency (Hz)
 * @param {number} midi - MIDI note number
 * @returns {number} Frequency in Hz
 */
export function midiToFreq(midi) {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
}

/**
 * Get note name and octave from MIDI note number
 * @param {number} midi - MIDI note number (integer)
 * @returns {{ name: string, octave: number, fullName: string }}
 */
export function midiToNoteName(midi) {
  const noteIndex = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[noteIndex]
  return { name, octave, fullName: `${name}${octave}` }
}

/**
 * Get the nearest note info for a given frequency
 * @param {number} freq - Frequency in Hz
 * @returns {{ midi: number, name: string, octave: number, fullName: string, freq: number, cents: number }}
 */
export function getNearestNote(freq) {
  const exactMidi = freqToMidi(freq)
  const roundedMidi = Math.round(exactMidi)
  const cents = (exactMidi - roundedMidi) * 100
  const noteInfo = midiToNoteName(roundedMidi)
  const noteFreq = midiToFreq(roundedMidi)

  return {
    midi: roundedMidi,
    name: noteInfo.name,
    octave: noteInfo.octave,
    fullName: noteInfo.fullName,
    freq: noteFreq,
    cents
  }
}

/**
 * Find the nearest guitar string for a given frequency
 * @param {number} freq - Frequency in Hz
 * @returns {{ string: object, cents: number }}
 */
export function getNearestGuitarString(freq) {
  let closest = GUITAR_STRINGS[0]
  let minCentsDiff = Infinity

  for (const gs of GUITAR_STRINGS) {
    const cents = 1200 * Math.log2(freq / gs.freq)
    const absCents = Math.abs(cents)
    if (absCents < minCentsDiff) {
      minCentsDiff = absCents
      closest = gs
    }
  }

  const cents = 1200 * Math.log2(freq / closest.freq)
  return { string: closest, cents }
}

/**
 * Get all note names with MIDI numbers for a range
 * @param {number} startMidi - Starting MIDI note
 * @param {number} endMidi - Ending MIDI note
 * @returns {Array<{ midi: number, name: string, octave: number, fullName: string, freq: number, isBlack: boolean }>}
 */
export function getNoteRange(startMidi, endMidi) {
  const notes = []
  for (let midi = startMidi; midi <= endMidi; midi++) {
    const info = midiToNoteName(midi)
    const isBlack = info.name.includes('#')
    notes.push({
      midi,
      name: info.name,
      octave: info.octave,
      fullName: info.fullName,
      freq: midiToFreq(midi),
      isBlack
    })
  }
  return notes
}

/**
 * Check if a MIDI note is a black key
 * @param {number} midi - MIDI note number
 * @returns {boolean}
 */
export function isBlackKey(midi) {
  const noteIndex = ((midi % 12) + 12) % 12
  return [1, 3, 6, 8, 10].includes(noteIndex)
}

/**
 * Get the cents color based on deviation
 * @param {number} cents - Cents deviation from perfect pitch
 * @returns {string} CSS color
 */
export function getCentsColor(cents) {
  const absCents = Math.abs(cents)
  if (absCents <= 5) return '#1DB954'   // green - on pitch
  if (absCents <= 15) return '#FFD700'  // yellow - close
  return '#FF6B35'                       // orange - off
}
