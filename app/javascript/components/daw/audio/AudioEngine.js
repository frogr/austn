import * as Tone from 'tone'

class AudioEngine {
  constructor() {
    this.synths = new Map()
    this.drumSamplers = new Map()
    this.audioPlayers = new Map()
    this.channels = new Map()
    this.masterVolume = null
    this.isInitialized = false
    this.sequenceCallback = null
    this.currentStep = 0
  }

  async init() {
    if (this.isInitialized) return true

    try {
      await Tone.start()

      // Create master volume
      this.masterVolume = new Tone.Volume(0).toDestination()

      // Set default transport settings
      Tone.Transport.bpm.value = 120
      Tone.Transport.loop = true
      Tone.Transport.loopStart = 0
      Tone.Transport.loopEnd = '1m'

      this.isInitialized = true
      console.log('Audio engine initialized')
      return true
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
      return false
    }
  }

  // Create or update a synth for a track
  createSynth(trackId, settings = {}) {
    // Dispose existing synth if any
    this.disposeSynth(trackId)

    const {
      oscillator = 'sawtooth',
      attack = 0.01,
      decay = 0.1,
      sustain = 0.5,
      release = 0.3,
      filterFreq = 2000,
      filterRes = 1,
    } = settings

    // Create channel for volume/pan
    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create filter
    const filter = new Tone.Filter({
      frequency: filterFreq,
      type: 'lowpass',
      Q: filterRes,
    }).connect(channel)

    // Create synth
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: oscillator },
      envelope: { attack, decay, sustain, release },
    }).connect(filter)

    this.synths.set(trackId, { synth, filter, channel })
    return synth
  }

  // Create a drum sampler for a track
  createDrumSampler(trackId) {
    this.disposeDrumSampler(trackId)

    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create drum sounds using synths
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

    this.drumSamplers.set(trackId, { drums, channel })
    return drums
  }

  // Create an audio player for a track
  createAudioPlayer(trackId, audioBuffer) {
    this.disposeAudioPlayer(trackId)

    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create a Tone.js buffer from the AudioBuffer
    const toneBuffer = new Tone.ToneAudioBuffer(audioBuffer)
    const player = new Tone.Player(toneBuffer).connect(channel)
    player.loop = true

    this.audioPlayers.set(trackId, { player, channel })
    return player
  }

  // Start/stop audio player
  startAudioPlayer(trackId, time = '+0') {
    const playerData = this.audioPlayers.get(trackId)
    if (playerData && playerData.player.loaded) {
      playerData.player.start(time)
    }
  }

  stopAudioPlayer(trackId) {
    const playerData = this.audioPlayers.get(trackId)
    if (playerData) {
      playerData.player.stop()
    }
  }

  disposeAudioPlayer(trackId) {
    const playerData = this.audioPlayers.get(trackId)
    if (playerData) {
      playerData.player.dispose()
      playerData.channel.dispose()
      this.audioPlayers.delete(trackId)
    }
  }

  // Trigger a drum sound
  triggerDrum(trackId, drumType, time, velocity = 1) {
    const sampler = this.drumSamplers.get(trackId)
    if (!sampler) return

    const { drums } = sampler
    const drum = drums[drumType]
    if (!drum) return

    switch (drumType) {
      case 'kick':
        drum.triggerAttackRelease('C1', '8n', time, velocity)
        break
      case 'tom':
        drum.triggerAttackRelease('G1', '8n', time, velocity)
        break
      case 'hihat':
      case 'ride':
        drum.triggerAttackRelease('16n', time, velocity * 0.3)
        break
      case 'crash':
        drum.triggerAttackRelease('4n', time, velocity * 0.4)
        break
      case 'cowbell':
        drum.triggerAttackRelease('16n', time, velocity * 0.5)
        break
      default:
        drum.triggerAttackRelease('16n', time, velocity)
    }
  }

  // Trigger a synth note
  triggerNote(trackId, pitch, duration, time, velocity = 1) {
    const synthData = this.synths.get(trackId)
    if (!synthData) return

    const { synth } = synthData
    const note = Tone.Frequency(pitch, 'midi').toNote()
    synth.triggerAttackRelease(note, duration, time, velocity)
  }

  // Update synth settings - recreates synth for reliable envelope updates
  updateSynthSettings(trackId, settings) {
    const synthData = this.synths.get(trackId)
    if (!synthData) return

    const { synth, filter, channel } = synthData

    // Check if we need to recreate the synth (oscillator or envelope changes)
    const needsRecreate = settings.oscillator !== undefined ||
      settings.attack !== undefined ||
      settings.decay !== undefined ||
      settings.sustain !== undefined ||
      settings.release !== undefined

    if (needsRecreate) {
      // Get current settings from synth
      const currentOsc = synth.get().oscillator?.type || 'sawtooth'
      const currentEnv = synth.get().envelope || {}

      // Merge with new settings
      const newOsc = settings.oscillator || currentOsc
      const newEnv = {
        attack: settings.attack ?? currentEnv.attack ?? 0.01,
        decay: settings.decay ?? currentEnv.decay ?? 0.1,
        sustain: settings.sustain ?? currentEnv.sustain ?? 0.5,
        release: settings.release ?? currentEnv.release ?? 0.3,
      }

      // Dispose old synth and create new one
      synth.dispose()

      const newSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: newOsc },
        envelope: newEnv,
      }).connect(filter)

      this.synths.set(trackId, { synth: newSynth, filter, channel })
    }

    // Filter updates work directly
    if (settings.filterFreq !== undefined) {
      filter.frequency.rampTo(settings.filterFreq, 0.1)
    }
    if (settings.filterRes !== undefined) {
      filter.Q.rampTo(settings.filterRes, 0.1)
    }
  }

  // Set track volume
  setTrackVolume(trackId, volume) {
    const channel = this.channels.get(trackId)
    if (channel) {
      // Convert 0-1 to dB (-Infinity to 0)
      channel.volume.value = volume > 0 ? Tone.gainToDb(volume) : -Infinity
    }
  }

  // Set track pan
  setTrackPan(trackId, pan) {
    const channel = this.channels.get(trackId)
    if (channel) {
      channel.pan.value = pan
    }
  }

  // Set track mute
  setTrackMute(trackId, muted) {
    const channel = this.channels.get(trackId)
    if (channel) {
      channel.mute = muted
    }
  }

  // Set master volume
  setMasterVolume(volume) {
    if (this.masterVolume) {
      this.masterVolume.volume.value = volume > 0 ? Tone.gainToDb(volume) : -Infinity
    }
  }

  // Transport controls
  setBPM(bpm) {
    Tone.Transport.bpm.value = bpm
  }

  setLoop(enabled, start = 0, end = '1m') {
    Tone.Transport.loop = enabled
    Tone.Transport.loopStart = start
    Tone.Transport.loopEnd = end
  }

  setLoopPoints(startStep, endStep, stepsPerMeasure = 16) {
    const startBars = startStep / stepsPerMeasure
    const endBars = endStep / stepsPerMeasure
    Tone.Transport.loopStart = `${startBars}m`
    Tone.Transport.loopEnd = `${endBars}m`
  }

  // Schedule sequence playback
  scheduleSequence(tracks, totalSteps, stepsPerMeasure, onStep) {
    // Clear any existing sequence
    Tone.Transport.cancel()

    // Stop all audio players first
    this.audioPlayers.forEach(({ player }) => {
      if (player.state === 'started') {
        player.stop()
      }
    })

    // Calculate step duration in Tone.js notation
    const stepDuration = `${stepsPerMeasure}n`

    // Store tracks reference for audio player control
    this.scheduledTracks = tracks

    // Create a repeating sequence
    const seq = new Tone.Sequence(
      (time, step) => {
        this.currentStep = step

        // Start audio players at step 0
        if (step === 0) {
          tracks.forEach(track => {
            if (track.type === 'audio' && !track.muted) {
              const playerData = this.audioPlayers.get(track.id)
              if (playerData && playerData.player.loaded) {
                playerData.player.stop()
                playerData.player.start(time)
              }
            }
          })
        }

        // Callback for UI update
        if (onStep) {
          Tone.Draw.schedule(() => {
            onStep(step)
          }, time)
        }

        // Trigger notes for each track
        tracks.forEach(track => {
          if (track.muted) return

          const notesAtStep = track.notes.filter(n => n.step === step)

          notesAtStep.forEach(note => {
            if (track.type === 'drums') {
              // For drums, pitch represents drum type (0=kick, 1=snare, 2=hihat, 3=clap, etc)
              const drumTypes = ['kick', 'snare', 'hihat', 'clap', 'tom', 'crash', 'ride', 'cowbell']
              const drumType = drumTypes[note.pitch % drumTypes.length]
              this.triggerDrum(track.id, drumType, time, note.velocity / 127)
            } else if (track.type === 'synth') {
              // For synths, pitch is MIDI note number
              const duration = `${note.duration * stepsPerMeasure}n`
              this.triggerNote(track.id, note.pitch, duration, time, note.velocity / 127)
            }
            // Audio tracks don't use notes - they play continuously
          })
        })
      },
      [...Array(totalSteps).keys()],
      stepDuration
    )

    seq.start(0)
    return seq
  }

  play() {
    if (!this.isInitialized) return
    Tone.Transport.start()
  }

  pause() {
    Tone.Transport.pause()
    // Pause audio players
    this.audioPlayers.forEach(({ player }) => {
      if (player.state === 'started') {
        player.stop()
      }
    })
  }

  stop() {
    Tone.Transport.stop()
    Tone.Transport.position = 0
    this.currentStep = 0
    // Stop audio players
    this.audioPlayers.forEach(({ player }) => {
      if (player.state === 'started') {
        player.stop()
      }
    })
  }

  getPosition() {
    return Tone.Transport.position
  }

  getCurrentStep(stepsPerMeasure = 16) {
    const [bars, beats, sixteenths] = Tone.Transport.position.split(':').map(Number)
    return Math.floor((bars * stepsPerMeasure) + (beats * (stepsPerMeasure / 4)) + (sixteenths * (stepsPerMeasure / 16)))
  }

  // Cleanup
  disposeSynth(trackId) {
    const synthData = this.synths.get(trackId)
    if (synthData) {
      synthData.synth.dispose()
      synthData.filter.dispose()
      synthData.channel.dispose()
      this.synths.delete(trackId)
    }
  }

  disposeDrumSampler(trackId) {
    const sampler = this.drumSamplers.get(trackId)
    if (sampler) {
      Object.values(sampler.drums).forEach(drum => drum.dispose())
      sampler.channel.dispose()
      this.drumSamplers.delete(trackId)
    }
  }

  dispose() {
    Tone.Transport.stop()
    Tone.Transport.cancel()

    this.synths.forEach((_, trackId) => this.disposeSynth(trackId))
    this.drumSamplers.forEach((_, trackId) => this.disposeDrumSampler(trackId))
    this.audioPlayers.forEach((_, trackId) => this.disposeAudioPlayer(trackId))

    if (this.masterVolume) {
      this.masterVolume.dispose()
    }

    this.isInitialized = false
  }
}

// Singleton instance
let audioEngineInstance = null

export function getAudioEngine() {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine()
  }
  return audioEngineInstance
}

export default AudioEngine
