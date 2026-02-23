import { Controller } from "@hotwired/stimulus"
import { PitchDetector } from "../lib/pitch_detection"
import {
  getNearestNote,
  getNearestGuitarString,
  isBlackKey,
  getCentsColor,
  midiToFreq,
  midiToNoteName,
  freqToMidi,
  GUITAR_STRINGS
} from "../lib/note_utils"

const FFT_SIZE = 4096
const NOISE_GATE_DEFAULT = 0.015
const VISIBLE_SECONDS = 8 // how many seconds visible on the grid
const MIDI_LOW = 36  // C2
const MIDI_HIGH = 84 // C6
const MIDI_RANGE = MIDI_HIGH - MIDI_LOW
const SMOOTHING_FACTOR = 0.35 // exponential smoothing (0=no smoothing, 1=frozen)
const MEDIAN_WINDOW = 5 // median filter window size

export default class extends Controller {
  static targets = [
    "startBtn", "status", "noteDisplay", "freqDisplay",
    "centsGauge", "centsValue", "centsNeedle",
    "gridCanvas", "pianoKeys",
    "levelMeter", "levelFill",
    "modeToggle", "modeLabel",
    "noiseGate", "noiseGateValue",
    "guitarInfo",
    "refFileInput", "refStatus", "refPlayBtn", "refStopBtn", "refName", "refClearBtn"
  ]

  connect() {
    this.audioCtx = null
    this.analyser = null
    this.detector = null
    this.source = null
    this.buffer = null
    this.running = false
    this.animFrameId = null
    this.mode = 'chromatic'
    this.noiseThreshold = NOISE_GATE_DEFAULT

    // Pitch history for the scrolling grid (live mic)
    this.liveHistory = [] // { time, midi }
    this.startTime = null

    // Smoothing state
    this.smoothedMidi = null
    this.recentPitches = []

    // Reference audio state
    this.refPitchData = null  // analyzed pitch data from reference
    this.refAudioBuffer = null
    this.refSourceNode = null
    this.refStartTime = null  // audioCtx.currentTime when playback started
    this.refPlaying = false
    this.refFileName = null

    // Reference tone
    this.referenceOsc = null
    this.referenceGain = null

    // Canvas sizing
    this._resizeObserver = new ResizeObserver(() => this._sizeCanvas())
    const canvasContainer = this.gridCanvasTarget.parentElement
    if (canvasContainer) this._resizeObserver.observe(canvasContainer)

    this._buildPianoKeys()
    this._sizeCanvas()
    this._drawGrid()
  }

  disconnect() {
    this._stop()
    if (this._resizeObserver) this._resizeObserver.disconnect()
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
      this.startTime = performance.now()
      this.liveHistory = []
      this.smoothedMidi = null
      this.recentPitches = []

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
    this._drawGrid()
  }

  updateNoiseGate(e) {
    this.noiseThreshold = parseFloat(e.target.value)
    this.noiseGateValueTarget.textContent = Math.round(this.noiseThreshold * 1000) / 10
  }

  // Play reference tone when clicking a piano key
  playReference(e) {
    const midi = parseInt(e.currentTarget.dataset.midi)
    if (isNaN(midi)) return
    this._playTone(midiToFreq(midi), 1.0)
  }

  // Play a guitar string reference
  playGuitarString(e) {
    const freq = parseFloat(e.currentTarget.dataset.freq)
    if (isNaN(freq)) return
    this._playTone(freq, 1.5)
  }

  // --- Reference audio ---

  loadReference() {
    this.refFileInputTarget.click()
  }

  async handleRefFile(e) {
    const file = e.target.files[0]
    if (!file) return

    this.refStatusTarget.textContent = 'Analyzing...'
    this.refStatusTarget.style.color = 'var(--warning-color)'
    this.refFileName = file.name

    try {
      const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)()
      if (!this.audioCtx) this.audioCtx = ctx

      const arrayBuffer = await file.arrayBuffer()
      this.refAudioBuffer = await ctx.decodeAudioData(arrayBuffer)

      // Analyze pitches offline
      const analyzerDetector = new PitchDetector(this.refAudioBuffer.sampleRate, FFT_SIZE)
      this.refPitchData = analyzerDetector.analyzeOffline(this.refAudioBuffer)

      this.refStatusTarget.textContent = ''
      this.refNameTarget.textContent = file.name
      this.refNameTarget.style.display = 'inline'
      this.refPlayBtnTarget.style.display = 'inline-flex'
      this.refStopBtnTarget.style.display = 'none'
      this.refClearBtnTarget.style.display = 'inline-flex'
    } catch (err) {
      this.refStatusTarget.textContent = 'Failed to load audio'
      this.refStatusTarget.style.color = 'var(--danger-color)'
    }

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  playRef() {
    if (!this.refAudioBuffer || !this.audioCtx) return

    this.stopRef()

    const source = this.audioCtx.createBufferSource()
    source.buffer = this.refAudioBuffer
    source.connect(this.audioCtx.destination)
    source.start()

    this.refSourceNode = source
    this.refStartTime = this.audioCtx.currentTime
    this.refPlaying = true

    // Also reset live history to sync
    this.startTime = performance.now()
    this.liveHistory = []
    this.smoothedMidi = null
    this.recentPitches = []

    this.refPlayBtnTarget.style.display = 'none'
    this.refStopBtnTarget.style.display = 'inline-flex'

    source.onended = () => {
      this.refPlaying = false
      this.refPlayBtnTarget.style.display = 'inline-flex'
      this.refStopBtnTarget.style.display = 'none'
    }
  }

  stopRef() {
    if (this.refSourceNode) {
      try { this.refSourceNode.stop() } catch (e) { /* already stopped */ }
      this.refSourceNode = null
    }
    this.refPlaying = false
    this.refPlayBtnTarget.style.display = 'inline-flex'
    this.refStopBtnTarget.style.display = 'none'
  }

  clearRef() {
    this.stopRef()
    this.refPitchData = null
    this.refAudioBuffer = null
    this.refFileName = null
    this.refNameTarget.textContent = ''
    this.refNameTarget.style.display = 'none'
    this.refPlayBtnTarget.style.display = 'none'
    this.refStopBtnTarget.style.display = 'none'
    this.refClearBtnTarget.style.display = 'none'
    this.refStatusTarget.textContent = ''
    this._drawGrid()
  }

  // --- Private methods ---

  _loop() {
    if (!this.running) return

    this.analyser.getFloatTimeDomainData(this.buffer)

    const rms = PitchDetector.rms(this.buffer)
    this._updateLevelMeter(rms)

    const now = performance.now()
    const elapsed = (now - this.startTime) / 1000

    if (rms < this.noiseThreshold) {
      this._showSilence()
      // Add a gap point
      this.liveHistory.push({ time: elapsed, midi: null })
    } else {
      const result = this.detector.detect(this.buffer)
      if (result && result.confidence > 0.7) {
        const smoothed = this._smoothPitch(freqToMidi(result.freq))
        this.liveHistory.push({ time: elapsed, midi: smoothed })
        this._updateDisplay(result, smoothed)
      } else {
        this._showSilence()
        this.liveHistory.push({ time: elapsed, midi: null })
      }
    }

    // Trim old history
    const cutoff = elapsed - VISIBLE_SECONDS - 2
    while (this.liveHistory.length > 0 && this.liveHistory[0].time < cutoff) {
      this.liveHistory.shift()
    }

    this._drawGrid()
    this.animFrameId = requestAnimationFrame(() => this._loop())
  }

  _smoothPitch(rawMidi) {
    // Median filter to remove spikes
    this.recentPitches.push(rawMidi)
    if (this.recentPitches.length > MEDIAN_WINDOW) {
      this.recentPitches.shift()
    }

    // Get median
    const sorted = [...this.recentPitches].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]

    // Exponential smoothing on top of median
    if (this.smoothedMidi === null) {
      this.smoothedMidi = median
    } else {
      // Only smooth if within 2 semitones, otherwise snap
      if (Math.abs(median - this.smoothedMidi) > 2) {
        this.smoothedMidi = median
      } else {
        this.smoothedMidi = SMOOTHING_FACTOR * this.smoothedMidi + (1 - SMOOTHING_FACTOR) * median
      }
    }

    return this.smoothedMidi
  }

  _updateDisplay(result, smoothedMidi) {
    const note = getNearestNote(result.freq)

    this.noteDisplayTarget.textContent = note.fullName
    this.noteDisplayTarget.style.color = getCentsColor(note.cents)

    this.freqDisplayTarget.textContent = `${result.freq.toFixed(1)} Hz`

    this._updateCentsGauge(note.cents)

    if (this.mode === 'guitar') {
      const gs = getNearestGuitarString(result.freq)
      this._updateGuitarDisplay(gs)
    }
  }

  _showSilence() {
    this.noteDisplayTarget.style.color = 'var(--text-muted)'
  }

  _updateLevelMeter(rms) {
    const level = Math.min(1, rms * 8)
    const pct = (level * 100).toFixed(1)
    this.levelFillTarget.style.width = `${pct}%`
    this.levelFillTarget.style.background = rms >= this.noiseThreshold
      ? 'var(--accent-color)'
      : 'var(--text-muted)'
  }

  _updateCentsGauge(cents) {
    const clamped = Math.max(-50, Math.min(50, cents))
    const pct = ((clamped + 50) / 100) * 100
    this.centsNeedleTarget.style.left = `${pct}%`

    const color = getCentsColor(cents)
    this.centsNeedleTarget.style.background = color
    this.centsNeedleTarget.style.boxShadow = `0 0 8px ${color}`
    this.centsValueTarget.textContent = `${cents > 0 ? '+' : ''}${cents.toFixed(0)}c`
    this.centsValueTarget.style.color = color
  }

  _updateGuitarDisplay(gs) {
    const badge = this.guitarInfoTarget.querySelector('.guitar-string-badge')
    const centsEl = this.guitarInfoTarget.querySelector('.guitar-cents')
    if (badge) {
      badge.textContent = gs.string.note
      badge.style.borderColor = getCentsColor(gs.cents)
    }
    if (centsEl) {
      centsEl.textContent = `${gs.cents > 0 ? '+' : ''}${gs.cents.toFixed(0)}c from ${gs.string.note}`
      centsEl.style.color = getCentsColor(gs.cents)
    }
  }

  // --- Canvas drawing ---

  _sizeCanvas() {
    const canvas = this.gridCanvasTarget
    const container = canvas.parentElement
    if (!container) return
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
  }

  _drawGrid() {
    const canvas = this.gridCanvasTarget
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // Current time for scrolling
    const now = this.startTime ? (performance.now() - this.startTime) / 1000 : 0
    const timeRight = now
    const timeLeft = now - VISIBLE_SECONDS

    // Helper: midi to Y
    const midiToY = (midi) => {
      return h - ((midi - MIDI_LOW) / MIDI_RANGE) * h
    }

    // Helper: time to X
    const timeToX = (t) => {
      return ((t - timeLeft) / VISIBLE_SECONDS) * w
    }

    // Background grid lines for each note
    this._drawNoteGridLines(ctx, w, h, midiToY)

    // Vertical time markers
    this._drawTimeMarkers(ctx, w, h, timeLeft, timeRight, timeToX)

    // Guitar string horizontal highlights
    if (this.mode === 'guitar') {
      for (const gs of GUITAR_STRINGS) {
        const y = midiToY(gs.midi)
        ctx.fillStyle = 'rgba(29, 185, 84, 0.06)'
        ctx.fillRect(0, y - 3, w, 6)
      }
    }

    // Draw reference pitch overlay
    if (this.refPitchData && this.refPlaying && this.refStartTime !== null) {
      this._drawRefPitch(ctx, w, h, midiToY, timeToX, now)
    } else if (this.refPitchData && !this.refPlaying) {
      // Show static reference from time 0
      this._drawRefPitchStatic(ctx, w, h, midiToY, timeLeft, timeRight, timeToX)
    }

    // Draw live pitch trail
    this._drawLiveTrail(ctx, w, h, midiToY, timeToX, timeLeft, timeRight)

    // Playhead line (right edge)
    if (this.running) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(w - 1, 0)
      ctx.lineTo(w - 1, h)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  _drawNoteGridLines(ctx, w, h, midiToY) {
    for (let midi = MIDI_LOW; midi <= MIDI_HIGH; midi++) {
      const y = midiToY(midi)
      const black = isBlackKey(midi)
      const noteIdx = ((midi % 12) + 12) % 12

      // C notes get a slightly brighter line
      if (noteIdx === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.lineWidth = 1
      } else {
        ctx.strokeStyle = black
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(255, 255, 255, 0.05)'
        ctx.lineWidth = 0.5
      }

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
  }

  _drawTimeMarkers(ctx, w, h, timeLeft, timeRight, timeToX) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.font = '9px Inter, sans-serif'
    ctx.textAlign = 'center'

    const startSec = Math.ceil(timeLeft)
    for (let t = startSec; t <= Math.floor(timeRight); t++) {
      const x = timeToX(t)
      if (x < 0 || x > w) continue

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()

      if (t >= 0 && t % 2 === 0) {
        const mins = Math.floor(t / 60)
        const secs = t % 60
        ctx.fillText(`${mins}:${String(secs).padStart(2, '0')}`, x, h - 4)
      }
    }
  }

  _drawLiveTrail(ctx, w, h, midiToY, timeToX, timeLeft, timeRight) {
    if (this.liveHistory.length < 1) return

    // Draw dots and connecting lines for the live pitch
    let prevX = null
    let prevY = null

    for (const point of this.liveHistory) {
      if (point.midi === null) {
        prevX = null
        prevY = null
        continue
      }

      if (point.time < timeLeft || point.time > timeRight) {
        prevX = null
        prevY = null
        continue
      }

      const x = timeToX(point.time)
      const y = midiToY(point.midi)

      // Age-based opacity (newer = brighter)
      const age = (timeRight - point.time) / VISIBLE_SECONDS
      const alpha = Math.max(0.15, 1 - age * 0.8)

      // Connecting line
      if (prevX !== null && Math.abs(y - prevY) < h * 0.3) {
        ctx.strokeStyle = `rgba(29, 185, 84, ${alpha * 0.5})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      // Dot
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(29, 185, 84, ${alpha})`
      ctx.fill()

      // Glow on recent points
      if (age < 0.15) {
        ctx.beginPath()
        ctx.arc(x, y, 7, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(29, 185, 84, ${0.2 * (1 - age / 0.15)})`
        ctx.fill()
      }

      prevX = x
      prevY = y
    }
  }

  _drawRefPitch(ctx, w, h, midiToY, timeToX, currentElapsed) {
    if (!this.refPitchData || !this.audioCtx) return

    const refElapsed = this.audioCtx.currentTime - this.refStartTime
    // Map reference time to our elapsed time coordinate
    // Reference started at liveTime = (this.startTime offset when ref started)
    // We sync ref playback start to live time = 0 (since we reset on play)
    const refTimeOffset = 0 // ref time 0 maps to live time 0

    let prevX = null
    let prevY = null

    for (const point of this.refPitchData) {
      if (point.midi === null) {
        prevX = null
        prevY = null
        continue
      }

      // Map ref time to canvas time
      const canvasTime = point.time + refTimeOffset
      const elapsed = currentElapsed
      const timeLeft = elapsed - VISIBLE_SECONDS

      if (canvasTime < timeLeft || canvasTime > elapsed) {
        prevX = null
        prevY = null
        continue
      }

      const x = ((canvasTime - timeLeft) / VISIBLE_SECONDS) * w
      const y = midiToY(point.midi)

      const age = (elapsed - canvasTime) / VISIBLE_SECONDS
      const alpha = Math.max(0.15, 1 - age * 0.8)

      // Connecting line in purple
      if (prevX !== null && Math.abs(y - prevY) < h * 0.3) {
        ctx.strokeStyle = `rgba(191, 90, 242, ${alpha * 0.5})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      // Dot in purple
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(191, 90, 242, ${alpha})`
      ctx.fill()

      prevX = x
      prevY = y
    }
  }

  _drawRefPitchStatic(ctx, w, h, midiToY, timeLeft, timeRight, timeToX) {
    if (!this.refPitchData) return

    let prevX = null
    let prevY = null

    for (const point of this.refPitchData) {
      if (point.midi === null) {
        prevX = null
        prevY = null
        continue
      }

      if (point.time < timeLeft || point.time > timeRight) {
        prevX = null
        prevY = null
        continue
      }

      const x = timeToX(point.time)
      const y = midiToY(point.midi)

      if (prevX !== null && Math.abs(y - prevY) < h * 0.3) {
        ctx.strokeStyle = 'rgba(191, 90, 242, 0.35)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(x, y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(191, 90, 242, 0.5)'
      ctx.fill()

      prevX = x
      prevY = y
    }
  }

  // --- Piano keys (vertical, left side) ---

  _buildPianoKeys() {
    const container = this.pianoKeysTarget
    if (!container) return
    container.innerHTML = ''

    // Build from high to low (top to bottom)
    for (let midi = MIDI_HIGH; midi >= MIDI_LOW; midi--) {
      const info = midiToNoteName(midi)
      const black = isBlackKey(midi)

      const key = document.createElement('button')
      key.className = black ? 'vkey vkey-black' : 'vkey vkey-white'
      key.dataset.midi = midi
      key.dataset.action = 'click->pitch-detector#playReference'
      key.title = info.fullName

      const label = document.createElement('span')
      label.className = 'vkey-label'
      // Show label on C notes and guitar string notes
      const noteIdx = ((midi % 12) + 12) % 12
      const isC = noteIdx === 0
      const isGuitarString = GUITAR_STRINGS.some(gs => gs.midi === midi)
      if (isC || isGuitarString) {
        label.textContent = info.fullName
      }
      key.appendChild(label)

      container.appendChild(key)
    }
  }

  // --- Reference tone ---

  _playTone(freq, durationSec) {
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
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05)
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
    this.referenceGain = null
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
    this.stopRef()
    if (this.audioCtx) {
      this.audioCtx.close()
      this.audioCtx = null
    }
    this._stopTone()
  }
}
