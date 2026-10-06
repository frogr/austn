import React, { useRef, useEffect, useCallback } from 'react'
import { token, tokenAlpha, tokenMix } from '../../../lib/palette'

/**
 * Oscilloscope component - displays real-time waveform with dynamic scaling
 */
function Oscilloscope({ audioEngine, height = 80 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  // Store peak amplitude for auto-scaling with decay
  const peakRef = useRef(0.1)
  // Store audioEngine in ref for animation loop access
  const audioEngineRef = useRef(audioEngine)

  // Keep audioEngine ref updated
  useEffect(() => {
    audioEngineRef.current = audioEngine
  }, [audioEngine])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    // Read from ref to always get latest audioEngine
    const engine = audioEngineRef.current
    const waveform = engine?.waveformAnalyzer
    if (!canvas || !waveform) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const canvasHeight = canvas.height / dpr

    // Get waveform data
    const values = waveform.getValue()

    // Calculate current peak amplitude for dynamic scaling
    let currentPeak = 0
    for (let i = 0; i < values.length; i++) {
      const absVal = Math.abs(values[i])
      if (absVal > currentPeak) currentPeak = absVal
    }

    // Update peak with attack/decay envelope
    // Fast attack, slow decay for smooth visual
    if (currentPeak > peakRef.current) {
      peakRef.current = currentPeak
    } else {
      // Slow decay
      peakRef.current = peakRef.current * 0.995 + currentPeak * 0.005
    }

    // Minimum peak to avoid division by zero and over-amplification of silence
    const displayPeak = Math.max(0.05, peakRef.current)
    // Scale factor to normalize waveform (with headroom)
    const scaleFactor = 0.85 / displayPeak

    // Clear canvas with fade for trail effect
    ctx.fillStyle = tokenAlpha('sunken', 0.25)
    ctx.fillRect(0, 0, width, canvasHeight)

    // Draw grid lines
    ctx.strokeStyle = tokenAlpha('ink', 0.02)
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (canvasHeight / 4) * i)
      ctx.lineTo(width, (canvasHeight / 4) * i)
      ctx.stroke()
    }

    // Draw center line
    ctx.strokeStyle = tokenAlpha('ink', 0.04)
    ctx.beginPath()
    ctx.moveTo(0, canvasHeight / 2)
    ctx.lineTo(width, canvasHeight / 2)
    ctx.stroke()

    // Draw waveform, sliding from the brand hue to clay as the signal gets hot
    const intensity = Math.min(1, currentPeak * 3)
    const trace = tokenMix('brand', 'clay', intensity)
    ctx.strokeStyle = trace
    ctx.lineWidth = 2
    ctx.beginPath()

    const sliceWidth = width / values.length

    for (let i = 0; i < values.length; i++) {
      const x = i * sliceWidth
      // Apply scaling and clamp to canvas bounds
      const scaledValue = values[i] * scaleFactor
      const clampedValue = Math.max(-1, Math.min(1, scaledValue))
      const y = ((clampedValue + 1) / 2) * canvasHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Add glow effect - intensity based on signal level
    ctx.shadowColor = trace
    ctx.shadowBlur = 10 + intensity * 15
    ctx.stroke()
    ctx.shadowBlur = 0

    animationRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size for sharp rendering
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    // Reset back to CSS dimensions for drawing
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
  }, [height])

  useEffect(() => {
    // Start animation loop
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  return (
    <div style={{
      flex: 1,
      minWidth: '300px',
      background: 'var(--sunken)',
      borderRadius: '0.5rem',
      border: '1px solid var(--line)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.7rem',
        color: 'var(--ink-2)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--line)',
        background: 'var(--ground-2)',
      }}>
        Oscilloscope
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      />
    </div>
  )
}

/**
 * Generate logarithmically spaced frequency bands for spectrum analyzer
 * This matches human perception of sound (octave-based)
 * @param {number} numBands - Number of bands to create
 * @param {number} fftSize - Size of FFT (determines max bin index)
 * @param {number} sampleRate - Audio sample rate (typically 44100 or 48000)
 * @returns {Array} Array of {startBin, endBin, centerFreq} for each band
 */
function generateLogBands(numBands, fftSize, sampleRate = 44100) {
  const bands = []
  // Frequency range: 20Hz to 20kHz (human hearing range)
  const minFreq = 20
  const maxFreq = Math.min(20000, sampleRate / 2) // Nyquist limit

  // Calculate log-spaced frequency boundaries
  const logMin = Math.log10(minFreq)
  const logMax = Math.log10(maxFreq)
  const logStep = (logMax - logMin) / numBands

  // Frequency resolution per FFT bin
  const freqPerBin = sampleRate / fftSize

  for (let i = 0; i < numBands; i++) {
    const freqStart = Math.pow(10, logMin + logStep * i)
    const freqEnd = Math.pow(10, logMin + logStep * (i + 1))
    const centerFreq = Math.sqrt(freqStart * freqEnd) // Geometric mean

    // Convert frequencies to bin indices
    const startBin = Math.floor(freqStart / freqPerBin)
    const endBin = Math.ceil(freqEnd / freqPerBin)

    bands.push({
      startBin: Math.max(0, startBin),
      endBin: Math.min(fftSize / 2 - 1, endBin),
      centerFreq,
    })
  }

  return bands
}

/**
 * Spectrum Analyzer component - displays frequency bands with logarithmic scaling
 */
function SpectrumAnalyzer({ audioEngine, bands = 32, height = 80 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  // Store peak values for each band (for peak hold effect)
  const peaksRef = useRef(new Array(bands).fill(-100))
  // Store smoothed values for each band
  const smoothedRef = useRef(new Array(bands).fill(-100))
  // Pre-computed logarithmic band mappings
  const bandMappingsRef = useRef(null)
  // Store audioEngine in ref for animation loop access
  const audioEngineRef = useRef(audioEngine)

  // Keep audioEngine ref updated
  useEffect(() => {
    audioEngineRef.current = audioEngine
  }, [audioEngine])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    // Read from ref to always get latest audioEngine
    const engine = audioEngineRef.current
    const fft = engine?.fftAnalyzer
    if (!canvas || !fft) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const canvasHeight = canvas.height / dpr

    // Get FFT data (values are in dB, typically -100 to 0)
    const values = fft.getValue()

    // Generate band mappings if not already done
    if (!bandMappingsRef.current || bandMappingsRef.current.length !== bands) {
      // FFT returns full array, use values.length as fftSize
      bandMappingsRef.current = generateLogBands(bands, values.length, 44100)
    }

    // Clear canvas with slight fade for smoother visuals
    ctx.fillStyle = tokenAlpha('sunken', 0.35)
    ctx.fillRect(0, 0, width, canvasHeight)

    // Draw horizontal grid lines with dB markers
    ctx.strokeStyle = tokenAlpha('ink', 0.02)
    ctx.lineWidth = 1

    // Palette for this frame: bass bars sit on the brand hue, highs on sky,
    // and a bar warms through sun to clay as it nears the top
    const hot = token('clay')
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (canvasHeight / 4) * i)
      ctx.lineTo(width, (canvasHeight / 4) * i)
      ctx.stroke()
    }

    // Calculate bar dimensions
    const barWidth = (width / bands) - 2
    const barGap = 2

    // Process each logarithmic band
    for (let i = 0; i < bands; i++) {
      const band = bandMappingsRef.current[i]
      if (!band) continue

      // Get the maximum value in this frequency band (not average)
      // Using max shows the dominant frequency better
      let maxVal = -Infinity
      let sumVal = 0
      let count = 0

      for (let j = band.startBin; j <= band.endBin && j < values.length; j++) {
        const val = values[j]
        if (val > maxVal) maxVal = val
        sumVal += val
        count++
      }

      // Use a mix of max and average for more dynamic display
      // Weighted towards max for better pitch visibility
      // Clamp to -100 to avoid -Infinity issues
      const safeMax = maxVal === -Infinity ? -100 : Math.max(-100, maxVal)
      const avgVal = count > 0 ? sumVal / count : -100
      const safeAvg = !isFinite(avgVal) ? -100 : Math.max(-100, avgVal)
      const bandValue = safeMax * 0.7 + safeAvg * 0.3

      // Apply smoothing with faster attack than decay
      // Reset if current value is -Infinity
      let currentSmoothed = smoothedRef.current[i]
      if (!isFinite(currentSmoothed)) currentSmoothed = -100

      if (bandValue > currentSmoothed) {
        // Fast attack
        smoothedRef.current[i] = currentSmoothed * 0.3 + bandValue * 0.7
      } else {
        // Slower decay
        smoothedRef.current[i] = currentSmoothed * 0.85 + bandValue * 0.15
      }

      // Convert dB to normalized value (0-1)
      // dB range: -80dB (silence) to 0dB (max)
      // Using -80 instead of -100 for more visible low-level signals
      const dbMin = -80
      const dbMax = 0
      const normalizedValue = smoothedRef.current[i]
      const normalized = Math.max(0, Math.min(1, (normalizedValue - dbMin) / (dbMax - dbMin)))

      // Apply slight curve for more dynamic visual range
      const displayValue = Math.pow(normalized, 0.8)
      const barHeight = displayValue * canvasHeight * 0.95

      // Update peak hold with slow decay
      if (displayValue > peaksRef.current[i]) {
        peaksRef.current[i] = displayValue
      } else {
        // Slow peak decay
        peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 0.008)
      }

      const x = i * (barWidth + barGap) + barGap
      const peakY = canvasHeight - (peaksRef.current[i] * canvasHeight * 0.95)

      // Create gradient for bar based on level (a meter, so a gradient is fine)
      const gradient = ctx.createLinearGradient(x, canvasHeight, x, canvasHeight - barHeight)

      // Color based on frequency band (brand for bass, sky for highs)
      const freqRatio = i / bands
      const base = tokenMix('brand', 'sky', freqRatio)
      const baseDim = tokenMix('brand', 'sky', freqRatio, 0.55)
      if (displayValue > 0.8) {
        // Hot/clipping colors
        gradient.addColorStop(0, base)
        gradient.addColorStop(0.5, token('sun'))
        gradient.addColorStop(1, hot)
      } else if (displayValue > 0.5) {
        // Warm colors
        gradient.addColorStop(0, base)
        gradient.addColorStop(1, token('sun'))
      } else {
        // Normal colors
        gradient.addColorStop(0, baseDim)
        gradient.addColorStop(1, base)
      }

      // Draw the bar
      ctx.fillStyle = gradient
      ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight)

      // Draw peak indicator line
      if (peaksRef.current[i] > 0.02) {
        ctx.fillStyle = displayValue > 0.8 ? hot : base
        ctx.fillRect(x, peakY - 2, barWidth, 2)
      }

      // Add subtle glow for active bands
      if (displayValue > 0.3) {
        ctx.shadowColor = base
        ctx.shadowBlur = 6 + displayValue * 8
        ctx.fillRect(x, canvasHeight - 2, barWidth, 2)
        ctx.shadowBlur = 0
      }
    }

    animationRef.current = requestAnimationFrame(draw)
  }, [bands])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    // Reset back to CSS dimensions for drawing
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
  }, [height])

  useEffect(() => {
    // Reset peaks and smoothed values when bands change
    peaksRef.current = new Array(bands).fill(0)
    smoothedRef.current = new Array(bands).fill(-100)
    bandMappingsRef.current = null

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw, bands])

  return (
    <div style={{
      flex: 1,
      minWidth: '300px',
      background: 'var(--sunken)',
      borderRadius: '0.5rem',
      border: '1px solid var(--line)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.7rem',
        color: 'var(--ink-2)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--line)',
        background: 'var(--ground-2)',
      }}>
        Spectrum Analyzer
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block' }}
      />
    </div>
  )
}

/**
 * VisualizerPanel component - contains oscilloscope and spectrum analyzer
 * @param {Object} props
 * @param {Object} props.audioEngine - The audio engine instance
 * @param {boolean} props.large - If true, display larger visualizers
 */
export default function VisualizerPanel({ audioEngine, large = false }) {
  const visualizerHeight = large ? 150 : 80

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <Oscilloscope audioEngine={audioEngine} height={visualizerHeight} />
        <SpectrumAnalyzer audioEngine={audioEngine} bands={48} height={visualizerHeight} />
      </div>
    </div>
  )
}
