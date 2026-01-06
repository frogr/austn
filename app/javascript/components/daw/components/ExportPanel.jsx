import React, { useState, useCallback } from 'react'
import * as Tone from 'tone'
import { useDAW } from '../context/DAWContext'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '160px',
  },
  title: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  row: {
    display: 'flex',
    gap: '0.25rem',
  },
  button: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  exportButton: {
    background: 'linear-gradient(45deg, #10b981, #059669)',
    borderColor: 'transparent',
    color: 'white',
    fontWeight: 500,
  },
  progress: {
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'var(--accent-color, #10b981)',
    transition: 'width 0.1s',
  },
  status: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  select: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.7rem',
  },
}

// Convert AudioBuffer to WAV
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = buffer.length * blockAlign

  const wavBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(wavBuffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // Interleave samples
  const offset = 44
  const channels = []
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  let pos = offset
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(pos, intSample, true)
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

export default function ExportPanel() {
  const { state } = useDAW()
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  // Check if there's any content to export (notes or audio tracks)
  const hasContent = state.tracks.some(track =>
    track.notes.length > 0 || (track.type === 'audio' && track.audioData?.buffer)
  )

  const handleExportWav = useCallback(async () => {
    if (isExporting) return

    if (!hasContent) {
      setStatus('No content to export!')
      setTimeout(() => setStatus(''), 2000)
      return
    }

    setIsExporting(true)
    setProgress(0)
    setStatus('Rendering audio...')

    try {
      // Calculate duration in seconds
      const durationInMeasures = state.totalSteps / state.stepsPerMeasure
      const beatsPerMeasure = 4
      const secondsPerBeat = 60 / state.bpm
      let duration = durationInMeasures * beatsPerMeasure * secondsPerBeat

      // Extend duration for audio tracks if needed
      state.tracks.forEach(track => {
        if (track.type === 'audio' && track.audioData?.duration) {
          duration = Math.max(duration, track.audioData.duration)
        }
      })

      // Add a small buffer to ensure all notes complete
      duration += 0.5

      console.log('Exporting with duration:', duration, 'seconds')

      // Render offline
      const buffer = await Tone.Offline(({ transport }) => {
        transport.bpm.value = state.bpm

        // Recreate instruments for offline context
        const masterVol = new Tone.Volume(
          state.masterVolume > 0 ? Tone.gainToDb(state.masterVolume) : -Infinity
        ).toDestination()

        state.tracks.forEach(track => {
          if (track.muted) return

          const channel = new Tone.Channel({
            volume: track.volume > 0 ? Tone.gainToDb(track.volume) : -Infinity,
            pan: track.pan,
          }).connect(masterVol)

          if (track.type === 'synth') {
            const filter = new Tone.Filter({
              frequency: track.instrument?.filterFreq || 2000,
              type: 'lowpass',
              Q: track.instrument?.filterRes || 1,
            }).connect(channel)

            const synth = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: track.instrument?.oscillator || 'sawtooth' },
              envelope: {
                attack: track.instrument?.attack || 0.01,
                decay: track.instrument?.decay || 0.1,
                sustain: track.instrument?.sustain || 0.5,
                release: track.instrument?.release || 0.3,
              },
            }).connect(filter)

            // Use transport.schedule for proper timing
            track.notes.forEach(note => {
              const time = (note.step / state.stepsPerMeasure) * beatsPerMeasure * secondsPerBeat
              const noteDuration = (note.duration / state.stepsPerMeasure) * beatsPerMeasure * secondsPerBeat
              const pitch = Tone.Frequency(note.pitch, 'midi').toNote()
              transport.schedule((t) => {
                synth.triggerAttackRelease(pitch, noteDuration, t, note.velocity / 127)
              }, time)
            })
          } else if (track.type === 'drums') {
            // Create all drum sounds using PolySynth wrappers to avoid timing issues
            const drums = {
              kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 4,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
              }).connect(channel),
              snare: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
              }).connect(channel),
              hihat: new Tone.MetalSynth({
                frequency: 200,
                envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5,
              }).connect(channel),
              clap: new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
              }).connect(channel),
              tom: new Tone.MembraneSynth({
                pitchDecay: 0.08,
                octaves: 2,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
              }).connect(channel),
              crash: new Tone.MetalSynth({
                frequency: 300,
                envelope: { attack: 0.001, decay: 1, sustain: 0, release: 1 },
                harmonicity: 5.1,
                modulationIndex: 40,
                resonance: 5000,
                octaves: 1.5,
              }).connect(channel),
              ride: new Tone.MetalSynth({
                frequency: 400,
                envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.4 },
                harmonicity: 7,
                modulationIndex: 20,
                resonance: 6000,
                octaves: 1,
              }).connect(channel),
              cowbell: new Tone.MetalSynth({
                frequency: 560,
                envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
                harmonicity: 0.5,
                modulationIndex: 2,
                resonance: 800,
                octaves: 0,
              }).connect(channel),
            }

            const drumTypes = ['kick', 'snare', 'hihat', 'clap', 'tom', 'crash', 'ride', 'cowbell']

            // Use transport.schedule for each note - this handles timing properly
            track.notes.forEach(note => {
              const time = (note.step / state.stepsPerMeasure) * beatsPerMeasure * secondsPerBeat
              const drumType = drumTypes[note.pitch % drumTypes.length]
              const drum = drums[drumType]
              const velocity = note.velocity / 127

              transport.schedule((t) => {
                if (drumType === 'kick') {
                  drum.triggerAttackRelease('C1', '8n', t, velocity)
                } else if (drumType === 'tom') {
                  drum.triggerAttackRelease('G1', '8n', t, velocity)
                } else if (drumType === 'hihat' || drumType === 'ride') {
                  drum.triggerAttackRelease('16n', t, velocity * 0.3)
                } else if (drumType === 'crash') {
                  drum.triggerAttackRelease('4n', t, velocity * 0.4)
                } else if (drumType === 'cowbell') {
                  drum.triggerAttackRelease('16n', t, velocity * 0.5)
                } else {
                  drum.triggerAttackRelease('16n', t, velocity)
                }
              }, time)
            })
          } else if (track.type === 'audio' && track.audioData?.buffer) {
            // Create player for audio track
            const toneBuffer = new Tone.ToneAudioBuffer(track.audioData.buffer)
            const player = new Tone.Player(toneBuffer).connect(channel)
            player.start(0)
          }
        })

        transport.start()
      }, duration)

      setProgress(50)
      setStatus('Encoding WAV...')

      // Convert to WAV
      const wavBlob = audioBufferToWav(buffer)

      setProgress(100)
      setStatus('Download starting...')

      // Download
      const url = URL.createObjectURL(wavBlob)
      const a = document.createElement('a')
      a.href = url
      const filename = state.projectName?.trim()
        ? `${state.projectName.trim().replace(/[^a-zA-Z0-9-_]/g, '-')}.wav`
        : 'austnnet-midi.wav'
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStatus('Export complete!')
      setTimeout(() => {
        setStatus('')
        setProgress(0)
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
      setStatus(`Export failed: ${error.message}`)
      setTimeout(() => {
        setStatus('')
        setProgress(0)
      }, 3000)
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, hasContent, state])

  return (
    <div style={styles.container}>
      <span style={styles.title}>Export</span>

      <button
        style={{
          ...styles.button,
          ...styles.exportButton,
          opacity: isExporting || !state.audioInitialized ? 0.6 : 1,
          cursor: isExporting ? 'wait' : 'pointer',
        }}
        onClick={handleExportWav}
        disabled={isExporting || !state.audioInitialized}
      >
        {isExporting ? 'Exporting...' : 'Export WAV'}
      </button>

      {!hasContent && !isExporting && (
        <span style={{ ...styles.status, color: 'rgba(255,255,255,0.4)' }}>
          Add notes to export
        </span>
      )}

      {(isExporting || progress > 0) && (
        <>
          <div style={styles.progress}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>
          <span style={styles.status}>{status}</span>
        </>
      )}
    </div>
  )
}
