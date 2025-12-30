import React, { useRef, useEffect, useCallback } from 'react'

/**
 * Oscilloscope component - displays real-time waveform
 */
function Oscilloscope({ audioEngine, height = 80 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const waveformRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const waveform = waveformRef.current
    if (!canvas || !waveform) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const canvasHeight = canvas.height

    // Get waveform data
    const values = waveform.getValue()

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, canvasHeight)

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (canvasHeight / 4) * i)
      ctx.lineTo(width, (canvasHeight / 4) * i)
      ctx.stroke()
    }

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.beginPath()
    ctx.moveTo(0, canvasHeight / 2)
    ctx.lineTo(width, canvasHeight / 2)
    ctx.stroke()

    // Draw waveform
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.beginPath()

    const sliceWidth = width / values.length

    for (let i = 0; i < values.length; i++) {
      const x = i * sliceWidth
      const y = ((values[i] + 1) / 2) * canvasHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Add glow effect
    ctx.shadowColor = '#10b981'
    ctx.shadowBlur = 15
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
    if (audioEngine && audioEngine.waveformAnalyzer) {
      waveformRef.current = audioEngine.waveformAnalyzer
    }

    // Start animation loop
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioEngine, draw])

  // Update waveform reference when audioEngine changes
  useEffect(() => {
    if (audioEngine && audioEngine.waveformAnalyzer) {
      waveformRef.current = audioEngine.waveformAnalyzer
    }
  }, [audioEngine?.waveformAnalyzer])

  return (
    <div style={{
      flex: 1,
      minWidth: '300px',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
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
 * Spectrum Analyzer component - displays frequency bands
 */
function SpectrumAnalyzer({ audioEngine, bands = 32, height = 80 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const fftRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const fft = fftRef.current
    if (!canvas || !fft) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const canvasHeight = canvas.height / dpr

    // Get FFT data
    const values = fft.getValue()

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, canvasHeight)

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (canvasHeight / 4) * i)
      ctx.lineTo(width, (canvasHeight / 4) * i)
      ctx.stroke()
    }

    // Calculate bar dimensions
    const barWidth = (width / bands) - 2
    const barGap = 2

    // Group FFT values into bands
    const bandSize = Math.floor(values.length / bands)

    for (let i = 0; i < bands; i++) {
      // Average values in this band
      let sum = 0
      for (let j = 0; j < bandSize; j++) {
        const idx = i * bandSize + j
        if (idx < values.length) {
          sum += values[idx]
        }
      }
      const avg = sum / bandSize

      // Convert dB to a 0-1 range
      const normalized = Math.max(0, Math.min(1, (avg + 100) / 100))
      const barHeight = normalized * canvasHeight * 0.9

      const x = i * (barWidth + barGap) + barGap

      // Create gradient for bar
      const gradient = ctx.createLinearGradient(x, canvasHeight, x, canvasHeight - barHeight)

      if (normalized > 0.8) {
        gradient.addColorStop(0, '#10b981')
        gradient.addColorStop(0.6, '#fbbf24')
        gradient.addColorStop(1, '#ef4444')
      } else if (normalized > 0.5) {
        gradient.addColorStop(0, '#10b981')
        gradient.addColorStop(1, '#fbbf24')
      } else {
        gradient.addColorStop(0, '#059669')
        gradient.addColorStop(1, '#10b981')
      }

      ctx.fillStyle = gradient
      ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight)

      // Add subtle glow
      ctx.shadowColor = '#10b981'
      ctx.shadowBlur = 8
      ctx.fillRect(x, canvasHeight - barHeight, barWidth, 2)
      ctx.shadowBlur = 0
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
  }, [height])

  useEffect(() => {
    if (audioEngine && audioEngine.fftAnalyzer) {
      fftRef.current = audioEngine.fftAnalyzer
    }

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioEngine, draw])

  useEffect(() => {
    if (audioEngine && audioEngine.fftAnalyzer) {
      fftRef.current = audioEngine.fftAnalyzer
    }
  }, [audioEngine?.fftAnalyzer])

  return (
    <div style={{
      flex: 1,
      minWidth: '300px',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
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
