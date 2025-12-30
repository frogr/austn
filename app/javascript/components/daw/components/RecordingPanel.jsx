import React, { useState, useRef, useCallback, useEffect } from 'react'
import { PitchDetector } from 'pitchy'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500,
  },
  waveformContainer: {
    height: '80px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '0.375rem',
    position: 'relative',
    overflow: 'hidden',
  },
  waveformCanvas: {
    width: '100%',
    height: '100%',
  },
  pitchDisplay: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 8px',
    background: 'rgba(0,0,0,0.6)',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    color: 'var(--accent-color, #10b981)',
  },
  controls: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  recordButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid rgba(239, 68, 68, 0.5)',
    background: 'rgba(239, 68, 68, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  recordButtonActive: {
    background: 'rgba(239, 68, 68, 0.6)',
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
  },
  recordIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ef4444',
  },
  stopIcon: {
    width: '18px',
    height: '18px',
    background: '#ef4444',
    borderRadius: '3px',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },
  label: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  toggleButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.375rem',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleActive: {
    background: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    color: '#10b981',
  },
  status: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  audioPlayer: {
    width: '100%',
    height: '36px',
  },
  processButton: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(45deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '0.375rem',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function frequencyToNote(freq) {
  if (freq <= 0) return { note: '-', octave: 0, cents: 0 }
  const midiNote = 12 * Math.log2(freq / 440) + 69
  const roundedNote = Math.round(midiNote)
  const cents = Math.round((midiNote - roundedNote) * 100)
  const noteName = NOTE_NAMES[roundedNote % 12]
  const octave = Math.floor(roundedNote / 12) - 1
  return { note: noteName, octave, cents, midi: roundedNote }
}

function nearestNoteFrequency(freq) {
  const midiNote = Math.round(12 * Math.log2(freq / 440) + 69)
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

export default function RecordingPanel() {
  const { actions } = useDAW()
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [processedUrl, setProcessedUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)
  const [autotuneEnabled, setAutotuneEnabled] = useState(true)
  const [currentPitch, setCurrentPitch] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [addedToTrack, setAddedToTrack] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const analyserRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  const audioContextRef = useRef(null)
  const pitchDetectorRef = useRef(null)
  const rawAudioBufferRef = useRef(null)

  // Draw waveform and detect pitch
  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.fftSize
    const dataArray = new Float32Array(bufferLength)

    const draw = () => {
      if (!isRecording) return

      animationRef.current = requestAnimationFrame(draw)
      analyser.getFloatTimeDomainData(dataArray)

      // Pitch detection
      if (pitchDetectorRef.current) {
        const [pitch, clarity] = pitchDetectorRef.current.findPitch(
          dataArray,
          audioContextRef.current.sampleRate
        )
        if (clarity > 0.9 && pitch > 60 && pitch < 2000) {
          const noteInfo = frequencyToNote(pitch)
          setCurrentPitch(noteInfo)
        }
      }

      // Draw waveform
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = '#ef4444'
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i]
        const y = (v + 1) * canvas.height / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.stroke()

      // Update duration
      if (startTimeRef.current) {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }

    draw()
  }, [isRecording])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setCurrentPitch(null)
      chunksRef.current = []
      setProcessedUrl(null)
      setAddedToTrack(false)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create audio context for visualization and pitch detection
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)

      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      source.connect(analyserRef.current)

      // Initialize pitch detector
      pitchDetectorRef.current = PitchDetector.forFloat32Array(analyserRef.current.fftSize)

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setHasRecording(true)

        // Store raw audio for processing
        const arrayBuffer = await blob.arrayBuffer()
        const audioContext = new AudioContext()
        rawAudioBufferRef.current = await audioContext.decodeAudioData(arrayBuffer)
      }

      mediaRecorder.start()
      startTimeRef.current = Date.now()
      setIsRecording(true)
      setDuration(0)

      // Start visualization
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = canvas.offsetWidth * 2
        canvas.height = canvas.offsetHeight * 2
        canvas.getContext('2d').scale(2, 2)
      }
    } catch (err) {
      setError('Microphone access denied')
      console.error('Recording error:', err)
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setCurrentPitch(null)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [isRecording])

  // Apply autotune to recorded audio using PSOLA-like approach
  const applyAutotune = useCallback(async () => {
    if (!rawAudioBufferRef.current) return

    setIsProcessing(true)

    try {
      const inputBuffer = rawAudioBufferRef.current
      const sampleRate = inputBuffer.sampleRate
      const channelData = inputBuffer.getChannelData(0)

      // PSOLA-like pitch correction
      const outputData = new Float32Array(channelData.length)
      const windowSize = 2048
      const hopSize = 256 // Smaller hop for smoother output
      const detector = PitchDetector.forFloat32Array(windowSize)

      // Hann window for smooth overlap-add
      const hannWindow = new Float32Array(windowSize)
      for (let i = 0; i < windowSize; i++) {
        hannWindow[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / windowSize))
      }

      // Accumulator for overlap-add
      const accumulator = new Float32Array(channelData.length)
      const windowSum = new Float32Array(channelData.length)

      for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
        const window = channelData.slice(i, i + windowSize)
        const [pitch, clarity] = detector.findPitch(window, sampleRate)

        let processedWindow = new Float32Array(windowSize)

        if (clarity > 0.85 && pitch > 80 && pitch < 1000) {
          // Calculate pitch shift needed
          const targetPitch = nearestNoteFrequency(pitch)
          const shiftRatio = targetPitch / pitch

          // Resample the window to shift pitch
          for (let j = 0; j < windowSize; j++) {
            const srcPos = j / shiftRatio
            const srcIndex = Math.floor(srcPos)
            const frac = srcPos - srcIndex

            if (srcIndex + 1 < windowSize) {
              // Linear interpolation for smoother resampling
              processedWindow[j] = window[srcIndex] * (1 - frac) + window[srcIndex + 1] * frac
            } else if (srcIndex < windowSize) {
              processedWindow[j] = window[srcIndex]
            }
          }

          // Apply window
          for (let j = 0; j < windowSize; j++) {
            processedWindow[j] *= hannWindow[j]
          }
        } else {
          // Keep original with window applied
          for (let j = 0; j < windowSize; j++) {
            processedWindow[j] = window[j] * hannWindow[j]
          }
        }

        // Overlap-add
        for (let j = 0; j < windowSize && i + j < accumulator.length; j++) {
          accumulator[i + j] += processedWindow[j]
          windowSum[i + j] += hannWindow[j]
        }
      }

      // Normalize by window sum to get final output
      for (let i = 0; i < outputData.length; i++) {
        if (windowSum[i] > 0.001) {
          outputData[i] = accumulator[i] / windowSum[i]
        } else {
          outputData[i] = channelData[i]
        }
      }

      // Create audio buffer from processed data
      const offlineContext = new OfflineAudioContext(1, outputData.length, sampleRate)
      const processedBuffer = offlineContext.createBuffer(1, outputData.length, sampleRate)
      processedBuffer.getChannelData(0).set(outputData)

      // Convert to WAV for playback
      const wavBlob = audioBufferToWav(processedBuffer)
      const url = URL.createObjectURL(wavBlob)
      setProcessedUrl(url)

    } catch (err) {
      console.error('Autotune processing error:', err)
      setError('Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Add recording to a new audio track
  const addToTrack = useCallback(() => {
    if (!rawAudioBufferRef.current) return

    const urlToUse = processedUrl || audioUrl
    const audioData = {
      url: urlToUse,
      buffer: rawAudioBufferRef.current,
      duration: rawAudioBufferRef.current.duration,
    }

    const trackName = processedUrl ? 'Recording (Tuned)' : 'Recording'
    actions.addAudioTrack(trackName, audioData)
    setAddedToTrack(true)
  }, [processedUrl, audioUrl, actions])

  // Convert AudioBuffer to WAV
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const bytesPerSample = 2
    const blockAlign = numChannels * bytesPerSample
    const dataSize = buffer.length * blockAlign

    const wavBuffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(wavBuffer)

    // RIFF header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    const channels = []
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    let pos = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]))
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        pos += 2
      }
    }

    return new Blob([wavBuffer], { type: 'audio/wav' })
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  // Start visualization when recording starts
  useEffect(() => {
    if (isRecording) {
      drawWaveform()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording, drawWaveform])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (processedUrl) URL.revokeObjectURL(processedUrl)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Recording</span>
        <button
          style={{
            ...styles.toggleButton,
            ...(autotuneEnabled ? styles.toggleActive : {}),
          }}
          onClick={() => setAutotuneEnabled(!autotuneEnabled)}
        >
          Autotune {autotuneEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Waveform visualization */}
      <div style={styles.waveformContainer}>
        <canvas ref={canvasRef} style={styles.waveformCanvas} />
        {currentPitch && isRecording && (
          <div style={styles.pitchDisplay}>
            {currentPitch.note}{currentPitch.octave}
            <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.7 }}>
              {currentPitch.cents > 0 ? '+' : ''}{currentPitch.cents}¢
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          style={{
            ...styles.recordButton,
            ...(isRecording ? styles.recordButtonActive : {}),
          }}
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <div style={styles.stopIcon} />
          ) : (
            <div style={styles.recordIcon} />
          )}
        </button>

        <div style={styles.controlGroup}>
          <span style={styles.status}>
            {error ? (
              <span style={{ color: '#ef4444' }}>{error}</span>
            ) : isRecording ? (
              `Recording: ${formatDuration(duration)}`
            ) : hasRecording ? (
              `Recorded: ${formatDuration(duration)}`
            ) : (
              'Click to record'
            )}
          </span>
        </div>

        {hasRecording && autotuneEnabled && !processedUrl && (
          <button
            style={{
              ...styles.processButton,
              opacity: isProcessing ? 0.6 : 1,
            }}
            onClick={applyAutotune}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Apply Autotune'}
          </button>
        )}
      </div>

      {/* Audio playback */}
      {hasRecording && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {audioUrl && (
            <div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Original:</span>
              <audio controls src={audioUrl} style={styles.audioPlayer} />
            </div>
          )}
          {processedUrl && (
            <div>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Autotuned:</span>
              <audio controls src={processedUrl} style={styles.audioPlayer} />
            </div>
          )}
          <button
            style={{
              ...styles.processButton,
              opacity: addedToTrack ? 0.6 : 1,
              background: addedToTrack ? 'rgba(255,255,255,0.1)' : 'linear-gradient(45deg, #3b82f6, #2563eb)',
            }}
            onClick={addToTrack}
            disabled={addedToTrack}
          >
            {addedToTrack ? 'Added to Track' : 'Add to Track'}
          </button>
        </div>
      )}
    </div>
  )
}
