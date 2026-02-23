import { Controller } from "@hotwired/stimulus"
import { PitchDetector } from "../lib/pitch_detection"
import {
  getNearestNote,
  getNearestGuitarString,
  getNoteRange,
  isBlackKey,
  getCentsColor,
  midiToFreq,
  midiToNoteName,
  GUITAR_STRINGS
} from "../lib/note_utils"

const FFT_SIZE = 4096
const NOISE_GATE_DEFAULT = 0.01
const HISTORY_DURATION = 2.5 // seconds of pitch history
const HISTORY_MAX_POINTS = 150
const PIANO_VISIBLE_NOTES = 25 // how many semitones visible at once

export default class extends Controller {
  static targets = [
    "startBtn", "status", "noteDisplay", "freqDisplay",
    "centsGauge", "centsValue", "centsNeedle",
    "pianoRoll", "pianoHighlight", "historyCanvas",
    "levelMeter", "levelFill",
    "modeToggle", "modeLabel",
    "noiseGate", "noiseGateValue",
    "guitarInfo"
  ]

  connect() {
    this.audioCtx = null
    this.analyser = null
    this.detector = null
    this.source = null
    this.buffer = null
    this.running = false
    this.animFrameId = null
    this.mode = 'chromatic' // or 'guitar'
    this.noiseThreshold = NOISE_GATE_DEFAULT
    this.pitchHistory = []
    this.lastDetectedMidi = null
    this.pianoOffset = 48 // C3 as default center area (MIDI 48)
    this.referenceOsc = null
    this.referenceGain = null

    // Build piano roll keys
    this._buildPianoRoll()
  }

  disconnect() {
    this._stop()
  }

  async start() {
    if (this.running) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      })

      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = FFT_SIZE
      this.source = this.audioCtx.createMediaStreamSource(stream)
      this.source.connect(this.analyser)

      this.buffer = new Float32Array(this.analyser.fftSize)
      this.detector = new PitchDetector(this.audioCtx.sampleRate, this.analyser.fftSize)

      this.running = true
      this.stream = stream

      this.startBtnTarget.style.display = 'none'
      this.statusTarget.textContent = 'Listening...'
      this.statusTarget.style.color = 'var(--accent-color)'

      this._loop()
    } catch (err) {
      this.statusTarget.textContent = 'Microphone access denied'
      this.statusTarget.style.color = 'var(--danger-color)'
    }
  }

  toggleMode() {
    this.mode = this.mode === 'chromatic' ? 'guitar' : 'chromatic'
    this.modeLabelTarget.textContent = this.mode === 'chromatic' ? 'Chromatic' : 'Guitar Tuning'
    this.modeToggleTarget.setAttribute('aria-checked', this.mode === 'guitar')
    this.guitarInfoTarget.style.display = this.mode === 'guitar' ? 'flex' : 'none'
    this._updateGuitarStringHighlights()
  }

  updateNoiseGate(e) {
    this.noiseThreshold = parseFloat(e.target.value)
    this.noiseGateValueTarget.textContent = Math.round(this.noiseThreshold * 1000) / 10
  }

  // Play a reference tone when clicking a piano key
  playReference(e) {
    const midi = parseInt(e.currentTarget.dataset.midi)
    if (isNaN(midi)) return
    const freq = midiToFreq(midi)
    this._playTone(freq, 1.0)
  }

  // Play a guitar string reference
  playGuitarString(e) {
    const freq = parseFloat(e.currentTarget.dataset.freq)
    if (isNaN(freq)) return
    this._playTone(freq, 1.5)
  }

  // --- Private methods ---

  _loop() {
    if (!this.running) return

    this.analyser.getFloatTimeDomainData(this.buffer)

    const rms = PitchDetector.rms(this.buffer)
    this._updateLevelMeter(rms)

    if (rms < this.noiseThreshold) {
      this._showSilence()
    } else {
      const result = this.detector.detect(this.buffer)
      if (result && result.confidence > 0.7) {
        this._updateDisplay(result)
      } else {
        this._showSilence()
      }
    }

    this.animFrameId = requestAnimationFrame(() => this._loop())
  }

  _updateDisplay(result) {
    const note = getNearestNote(result.freq)

    // Note name
    this.noteDisplayTarget.textContent = note.fullName
    this.noteDisplayTarget.style.color = getCentsColor(note.cents)

    // Frequency
    this.freqDisplayTarget.textContent = `${result.freq.toFixed(1)} Hz`

    // Cents gauge
    this._updateCentsGauge(note.cents)

    // Piano roll
    this._updatePianoHighlight(note.midi, note.cents)

    // Pitch history
    this._addHistoryPoint(note.midi + note.cents / 100)

    // Guitar mode
    if (this.mode === 'guitar') {
      const gs = getNearestGuitarString(result.freq)
      this._updateGuitarDisplay(gs)
    }

    this.lastDetectedMidi = note.midi
  }

  _showSilence() {
    this.noteDisplayTarget.style.color = 'var(--text-muted)'
    // Don't clear the note text, just dim it for visual continuity
  }

  _updateLevelMeter(rms) {
    // Convert RMS to dB-like scale for display (capped 0-100%)
    const level = Math.min(1, rms * 8) // amplify for visibility
    const pct = (level * 100).toFixed(1)
    this.levelFillTarget.style.width = `${pct}%`

    if (rms >= this.noiseThreshold) {
      this.levelFillTarget.style.background = 'var(--accent-color)'
    } else {
      this.levelFillTarget.style.background = 'var(--text-muted)'
    }
  }

  _updateCentsGauge(cents) {
    // Clamp cents to -50..50 for display
    const clamped = Math.max(-50, Math.min(50, cents))
    const pct = ((clamped + 50) / 100) * 100 // 0-100%
    this.centsNeedleTarget.style.left = `${pct}%`

    const color = getCentsColor(cents)
    this.centsNeedleTarget.style.background = color
    this.centsNeedleTarget.style.boxShadow = `0 0 8px ${color}`
    this.centsValueTarget.textContent = `${cents > 0 ? '+' : ''}${cents.toFixed(0)}c`
    this.centsValueTarget.style.color = color
  }

  _updatePianoHighlight(midi, cents) {
    // Auto-scroll the piano to keep detected note centered
    const targetOffset = midi - Math.floor(PIANO_VISIBLE_NOTES / 2)
    // Smooth scroll: lerp toward target
    this.pianoOffset += (targetOffset - this.pianoOffset) * 0.15

    const startMidi = Math.floor(this.pianoOffset)
    const endMidi = startMidi + PIANO_VISIBLE_NOTES

    // Update key visuals
    const keys = this.pianoRollTarget.querySelectorAll('[data-midi]')
    keys.forEach(key => {
      const keyMidi = parseInt(key.dataset.midi)
      const isVisible = keyMidi >= startMidi && keyMidi <= endMidi

      if (!isVisible) {
        key.style.display = 'none'
        return
      }
      key.style.display = ''

      if (keyMidi === midi) {
        const color = getCentsColor(cents)
        key.classList.add('pitch-active')
        key.style.setProperty('--highlight-color', color)
      } else {
        key.classList.remove('pitch-active')
        key.style.removeProperty('--highlight-color')
      }

      // Guitar mode: highlight string notes
      if (this.mode === 'guitar') {
        const isGuitarNote = GUITAR_STRINGS.some(gs => gs.midi === keyMidi)
        key.classList.toggle('guitar-string-note', isGuitarNote)
      } else {
        key.classList.remove('guitar-string-note')
      }
    })

    // Scroll transform
    const scrollOffset = (this.pianoOffset - Math.floor(this.pianoOffset)) * this._whiteKeyWidth()
    this.pianoRollTarget.style.transform = `translateX(-${scrollOffset}px)`
  }

  _whiteKeyWidth() {
    // Get width from first visible white key, fallback 40
    const wk = this.pianoRollTarget.querySelector('.piano-key-white')
    return wk ? wk.offsetWidth : 40
  }

  _addHistoryPoint(midiValue) {
    const now = performance.now()
    this.pitchHistory.push({ time: now, midi: midiValue })

    // Remove points older than HISTORY_DURATION seconds
    const cutoff = now - HISTORY_DURATION * 1000
    while (this.pitchHistory.length > 0 && this.pitchHistory[0].time < cutoff) {
      this.pitchHistory.shift()
    }

    // Cap total points
    if (this.pitchHistory.length > HISTORY_MAX_POINTS) {
      this.pitchHistory = this.pitchHistory.slice(-HISTORY_MAX_POINTS)
    }

    this._drawHistory()
  }

  _drawHistory() {
    const canvas = this.historyCanvasTarget
    const ctx = canvas.getContext('2d')
    const rect = canvas.parentElement.getBoundingClientRect()

    // Set canvas size to match parent
    canvas.width = rect.width * (window.devicePixelRatio || 1)
    canvas.height = rect.height * (window.devicePixelRatio || 1)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

    ctx.clearRect(0, 0, rect.width, rect.height)

    if (this.pitchHistory.length < 2) return

    const now = performance.now()
    const timeSpan = HISTORY_DURATION * 1000

    // Determine MIDI range from current view
    const startMidi = Math.floor(this.pianoOffset)
    const endMidi = startMidi + PIANO_VISIBLE_NOTES
    const midiRange = endMidi - startMidi

    ctx.beginPath()
    ctx.strokeStyle = 'rgba(29, 185, 84, 0.6)'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    let started = false
    for (const point of this.pitchHistory) {
      const x = ((point.time - (now - timeSpan)) / timeSpan) * rect.width
      // Invert Y: higher MIDI = higher on screen
      const yNorm = 1 - ((point.midi - startMidi) / midiRange)
      const y = yNorm * rect.height

      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw a glow version
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(29, 185, 84, 0.15)'
    ctx.lineWidth = 6
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    started = false
    for (const point of this.pitchHistory) {
      const x = ((point.time - (now - timeSpan)) / timeSpan) * rect.width
      const yNorm = 1 - ((point.midi - startMidi) / midiRange)
      const y = yNorm * rect.height

      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }

  _updateGuitarDisplay(gs) {
    const indicator = this.guitarInfoTarget
    const badge = indicator.querySelector('.guitar-string-badge')
    const centsEl = indicator.querySelector('.guitar-cents')
    if (badge) {
      badge.textContent = gs.string.note
      badge.style.borderColor = getCentsColor(gs.cents)
    }
    if (centsEl) {
      centsEl.textContent = `${gs.cents > 0 ? '+' : ''}${gs.cents.toFixed(0)}c from ${gs.string.note}`
      centsEl.style.color = getCentsColor(gs.cents)
    }
  }

  _updateGuitarStringHighlights() {
    const keys = this.pianoRollTarget.querySelectorAll('[data-midi]')
    keys.forEach(key => {
      const keyMidi = parseInt(key.dataset.midi)
      if (this.mode === 'guitar') {
        const isGuitarNote = GUITAR_STRINGS.some(gs => gs.midi === keyMidi)
        key.classList.toggle('guitar-string-note', isGuitarNote)
      } else {
        key.classList.remove('guitar-string-note')
      }
    })
  }

  _playTone(freq, durationSec) {
    // Stop any existing reference tone
    this._stopTone()

    const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    if (!this.audioCtx) this.audioCtx = ctx

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    // Fade in
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05)
    // Sustain, then fade out
    gain.gain.setValueAtTime(0.15, ctx.currentTime + durationSec - 0.1)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec)

    osc.stop(ctx.currentTime + durationSec)

    this.referenceOsc = osc
    this.referenceGain = gain
  }

  _stopTone() {
    if (this.referenceOsc) {
      try { this.referenceOsc.stop() } catch (e) { /* already stopped */ }
      this.referenceOsc = null
    }
    if (this.referenceGain) {
      this.referenceGain = null
    }
  }

  _buildPianoRoll() {
    const container = this.pianoRollTarget
    if (!container) return
    container.innerHTML = ''

    // Build a wide range of keys (MIDI 24/C1 to MIDI 96/C7)
    const startMidi = 24
    const endMidi = 96

    for (let midi = startMidi; midi <= endMidi; midi++) {
      const info = midiToNoteName(midi)
      const black = isBlackKey(midi)

      const key = document.createElement('button')
      key.className = black ? 'piano-key piano-key-black' : 'piano-key piano-key-white'
      key.dataset.midi = midi
      key.dataset.action = 'click->pitch-detector#playReference'
      key.setAttribute('aria-label', `${info.fullName} - ${midiToFreq(midi).toFixed(1)}Hz`)
      key.title = info.fullName

      // Note label on white keys only
      if (!black) {
        const label = document.createElement('span')
        label.className = 'piano-key-label'
        label.textContent = info.fullName
        key.appendChild(label)
      }

      container.appendChild(key)
    }
  }

  _stop() {
    this.running = false
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
    if (this.source) {
      this.source.disconnect()
      this.source = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop())
      this.stream = null
    }
    if (this.audioCtx) {
      this.audioCtx.close()
      this.audioCtx = null
    }
    this._stopTone()
  }
}
