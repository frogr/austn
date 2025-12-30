import * as Tone from 'tone'

// Default effects settings
// Chain order: EQ -> Compressor -> Distortion -> Phaser -> Tremolo -> Chorus -> Delay -> Reverb
export const DEFAULT_EFFECTS = {
  eq3: {
    enabled: false,
    low: 0,      // dB (-12 to 12)
    mid: 0,      // dB (-12 to 12)
    high: 0,     // dB (-12 to 12)
    lowFrequency: 400,   // Hz
    highFrequency: 2500, // Hz
  },
  compressor: {
    enabled: false,
    threshold: -24,  // dB
    ratio: 4,        // ratio
    attack: 0.003,   // seconds
    release: 0.25,   // seconds
  },
  distortion: {
    enabled: false,
    amount: 0.4,
    type: 'softclip', // 'softclip', 'hardclip', 'bitcrusher'
  },
  phaser: {
    enabled: false,
    frequency: 0.5,  // Hz (LFO rate)
    octaves: 3,      // range of modulation
    baseFrequency: 1000, // Hz
    wet: 0.5,
  },
  tremolo: {
    enabled: false,
    frequency: 4,    // Hz (LFO rate)
    depth: 0.5,      // 0-1
    wet: 1,
  },
  chorus: {
    enabled: false,
    frequency: 1.5,
    depth: 0.7,
    wet: 0.3,
  },
  delay: {
    enabled: false,
    time: '8n', // sync to BPM
    feedback: 0.3,
    wet: 0.3,
  },
  reverb: {
    enabled: false,
    roomSize: 0.5,
    wet: 0.3,
  },
}

// LFO rate options synced to tempo
const LFO_RATES = {
  '1m': '1m',      // 1 bar (whole note)
  '2n': '2n',      // half note
  '2n.': '2n.',    // dotted half
  '2t': '2t',      // half triplet
  '4n': '4n',      // quarter note
  '4n.': '4n.',    // dotted quarter
  '4t': '4t',      // quarter triplet
  '8n': '8n',      // eighth note
  '8n.': '8n.',    // dotted eighth
  '8t': '8t',      // eighth triplet
  '16n': '16n',    // sixteenth
  '16n.': '16n.',  // dotted sixteenth
  '16t': '16t',    // sixteenth triplet
  '32n': '32n',    // thirty-second
  '32t': '32t',    // thirty-second triplet
}

class AudioEngine {
  constructor() {
    this.synths = new Map()
    this.drumSamplers = new Map()
    this.audioPlayers = new Map()
    this.channels = new Map()
    this.trackMeters = new Map()
    this.effects = new Map()  // Store effects chains per track
    this.lfos = new Map()  // Store LFOs separately for each track
    this.masterVolume = null
    this.masterMeter = null
    this.waveformAnalyzer = null
    this.fftAnalyzer = null
    this.isInitialized = false
    this.sequenceCallback = null
    this.currentStep = 0
  }

  async init() {
    if (this.isInitialized) return true

    try {
      await Tone.start()

      // Create analyzers for visualizations (connected before master volume)
      // Use 2048 samples for waveform for smoother display
      this.waveformAnalyzer = new Tone.Waveform(2048)
      // Use 2048 bins for FFT for better frequency resolution (especially for bass)
      this.fftAnalyzer = new Tone.FFT(2048)
      this.masterMeter = new Tone.Meter({ smoothing: 0.8 })

      // Create master volume and connect analyzers
      this.masterVolume = new Tone.Volume(0)
      this.masterVolume.chain(
        this.waveformAnalyzer,
        this.fftAnalyzer,
        this.masterMeter,
        Tone.Destination
      )

      // Set default transport settings
      Tone.Transport.bpm.value = 120
      Tone.Transport.loop = true
      Tone.Transport.loopStart = 0
      Tone.Transport.loopEnd = '1m'

      this.isInitialized = true
      console.log('Audio engine initialized with analyzers')
      return true
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
      return false
    }
  }

  // Create a meter for a track channel
  createTrackMeter(trackId, channel) {
    // Dispose existing meter if any
    this.disposeTrackMeter(trackId)

    const meter = new Tone.Meter({ smoothing: 0.8 })
    channel.connect(meter)
    this.trackMeters.set(trackId, meter)
    return meter
  }

  // Dispose track meter
  disposeTrackMeter(trackId) {
    const meter = this.trackMeters.get(trackId)
    if (meter) {
      meter.dispose()
      this.trackMeters.delete(trackId)
    }
  }

  // Get meter level for a track (returns dB value, typically -100 to 0)
  getTrackLevel(trackId) {
    const meter = this.trackMeters.get(trackId)
    if (meter) {
      return meter.getValue()
    }
    return -100
  }

  // Get master level
  getMasterLevel() {
    if (this.masterMeter) {
      return this.masterMeter.getValue()
    }
    return -100
  }

  // Create or update a synth for a track
  createSynth(trackId, settings = {}, effectsSettings = null) {
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
      lfo = null,
    } = settings

    // Create channel for volume/pan
    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create meter for this track
    this.createTrackMeter(trackId, channel)

    // Create effects chain (order: distortion -> chorus -> delay -> reverb -> channel)
    const effectsChain = this.createEffectsChain(trackId, effectsSettings)
    effectsChain.output.connect(channel)

    // Create filter
    const filter = new Tone.Filter({
      frequency: filterFreq,
      type: 'lowpass',
      Q: filterRes,
    }).connect(effectsChain.input)

    // Create synth
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: oscillator },
      envelope: { attack, decay, sustain, release },
    }).connect(filter)

    this.synths.set(trackId, { synth, filter, channel, baseFilterFreq: filterFreq })

    // Create LFO if settings provided
    if (lfo && lfo.enabled) {
      this.createLFO(trackId, lfo, filterFreq)
    }

    return synth
  }

  // Create effects chain for a track
  // Chain order: EQ -> Compressor -> Distortion -> Phaser -> Tremolo -> Chorus -> Delay -> Reverb
  createEffectsChain(trackId, effectsSettings = null) {
    // Dispose existing effects if any
    this.disposeEffects(trackId)

    // Use default settings if none provided
    const settings = effectsSettings || { ...DEFAULT_EFFECTS }

    // Create all effects in chain order

    // 1. EQ3 - 3-band equalizer
    const eq3 = new Tone.EQ3({
      low: settings.eq3?.enabled ? (settings.eq3?.low || 0) : 0,
      mid: settings.eq3?.enabled ? (settings.eq3?.mid || 0) : 0,
      high: settings.eq3?.enabled ? (settings.eq3?.high || 0) : 0,
      lowFrequency: settings.eq3?.lowFrequency || 400,
      highFrequency: settings.eq3?.highFrequency || 2500,
    })

    // 2. Compressor
    const compressor = new Tone.Compressor({
      threshold: settings.compressor?.threshold || -24,
      ratio: settings.compressor?.ratio || 4,
      attack: settings.compressor?.attack || 0.003,
      release: settings.compressor?.release || 0.25,
    })
    // Compressor doesn't have wet/dry, we'll bypass by connecting around it when disabled

    // 3. Distortion - choose type based on settings
    let distortion
    const distType = settings.distortion?.type || 'softclip'
    if (distType === 'bitcrusher') {
      distortion = new Tone.BitCrusher({
        bits: Math.floor(4 + (1 - (settings.distortion?.amount || 0.4)) * 12),
      })
      distortion.wet.value = settings.distortion?.enabled ? 1 : 0
    } else {
      // softclip or hardclip
      distortion = new Tone.Distortion({
        distortion: settings.distortion?.amount || 0.4,
        oversample: distType === 'hardclip' ? 'none' : '4x',
      })
      distortion.wet.value = settings.distortion?.enabled ? 1 : 0
    }

    // 4. Phaser
    const phaser = new Tone.Phaser({
      frequency: settings.phaser?.frequency || 0.5,
      octaves: settings.phaser?.octaves || 3,
      baseFrequency: settings.phaser?.baseFrequency || 1000,
      wet: settings.phaser?.enabled ? (settings.phaser?.wet || 0.5) : 0,
    })

    // 5. Tremolo
    const tremolo = new Tone.Tremolo({
      frequency: settings.tremolo?.frequency || 4,
      depth: settings.tremolo?.depth || 0.5,
      wet: settings.tremolo?.enabled ? (settings.tremolo?.wet || 1) : 0,
    }).start()

    // 6. Chorus
    const chorus = new Tone.Chorus({
      frequency: settings.chorus?.frequency || 1.5,
      depth: settings.chorus?.depth || 0.7,
      wet: settings.chorus?.enabled ? settings.chorus.wet : 0,
    }).start()

    // 7. Delay
    const delay = new Tone.FeedbackDelay({
      delayTime: settings.delay?.time || '8n',
      feedback: settings.delay?.feedback || 0.3,
      wet: settings.delay?.enabled ? settings.delay.wet : 0,
    })

    // 8. Reverb
    const reverb = new Tone.Reverb({
      decay: settings.reverb?.roomSize ? settings.reverb.roomSize * 10 : 5,
      wet: settings.reverb?.enabled ? settings.reverb.wet : 0,
    })

    // Chain: EQ -> Compressor -> Distortion -> Phaser -> Tremolo -> Chorus -> Delay -> Reverb
    eq3.connect(compressor)
    compressor.connect(distortion)
    distortion.connect(phaser)
    phaser.connect(tremolo)
    tremolo.connect(chorus)
    chorus.connect(delay)
    delay.connect(reverb)

    // Store effects for later updates
    this.effects.set(trackId, {
      eq3,
      compressor,
      distortion,
      phaser,
      tremolo,
      chorus,
      delay,
      reverb,
      distortionType: distType,
      settings: { ...DEFAULT_EFFECTS, ...settings },
    })

    return {
      input: eq3,
      output: reverb,
    }
  }

  // Update effects for a track
  updateEffects(trackId, effectsSettings) {
    const effectsData = this.effects.get(trackId)
    if (!effectsData) return

    const { eq3, compressor, distortion, phaser, tremolo, chorus, delay, reverb } = effectsData

    // Update EQ3
    if (effectsSettings.eq3 !== undefined) {
      const eqSettings = effectsSettings.eq3
      if (eqSettings.enabled !== undefined) {
        effectsData.settings.eq3.enabled = eqSettings.enabled
        // When enabling/disabling, set bands to their values or to 0
        const isEnabled = eqSettings.enabled
        eq3.low.rampTo(isEnabled ? (effectsData.settings.eq3.low || 0) : 0, 0.1)
        eq3.mid.rampTo(isEnabled ? (effectsData.settings.eq3.mid || 0) : 0, 0.1)
        eq3.high.rampTo(isEnabled ? (effectsData.settings.eq3.high || 0) : 0, 0.1)
      }
      if (eqSettings.low !== undefined && effectsData.settings.eq3.enabled) {
        eq3.low.rampTo(eqSettings.low, 0.1)
      }
      if (eqSettings.mid !== undefined && effectsData.settings.eq3.enabled) {
        eq3.mid.rampTo(eqSettings.mid, 0.1)
      }
      if (eqSettings.high !== undefined && effectsData.settings.eq3.enabled) {
        eq3.high.rampTo(eqSettings.high, 0.1)
      }
      if (eqSettings.lowFrequency !== undefined) {
        eq3.lowFrequency.rampTo(eqSettings.lowFrequency, 0.1)
      }
      if (eqSettings.highFrequency !== undefined) {
        eq3.highFrequency.rampTo(eqSettings.highFrequency, 0.1)
      }
      effectsData.settings.eq3 = { ...effectsData.settings.eq3, ...eqSettings }
    }

    // Update Compressor
    if (effectsSettings.compressor !== undefined) {
      const compSettings = effectsSettings.compressor
      if (compSettings.enabled !== undefined) {
        effectsData.settings.compressor.enabled = compSettings.enabled
        // Compressor doesn't have wet/dry - we adjust threshold to bypass
        // When disabled, set threshold to 0 (no compression)
        // When enabled, restore to saved threshold
        if (!compSettings.enabled) {
          compressor.threshold.rampTo(0, 0.1) // No compression when disabled
        } else {
          compressor.threshold.rampTo(effectsData.settings.compressor.threshold || -24, 0.1)
        }
      }
      if (compSettings.threshold !== undefined && effectsData.settings.compressor.enabled) {
        compressor.threshold.rampTo(compSettings.threshold, 0.1)
      }
      if (compSettings.ratio !== undefined) {
        compressor.ratio.rampTo(compSettings.ratio, 0.1)
      }
      if (compSettings.attack !== undefined) {
        compressor.attack.rampTo(compSettings.attack, 0.1)
      }
      if (compSettings.release !== undefined) {
        compressor.release.rampTo(compSettings.release, 0.1)
      }
      effectsData.settings.compressor = { ...effectsData.settings.compressor, ...compSettings }
    }

    // Update distortion
    if (effectsSettings.distortion !== undefined) {
      const distSettings = effectsSettings.distortion

      // Check if we need to recreate the distortion (type change)
      if (distSettings.type !== undefined && distSettings.type !== effectsData.distortionType) {
        // Need to recreate the effects chain with new distortion type
        this.recreateEffectsChain(trackId, { ...effectsData.settings, distortion: { ...effectsData.settings.distortion, ...distSettings } })
        return
      }

      // Update enabled state first
      if (distSettings.enabled !== undefined) {
        effectsData.settings.distortion.enabled = distSettings.enabled
      }

      // Update wet based on current enabled state
      const isEnabled = effectsData.settings.distortion.enabled
      if (distSettings.enabled !== undefined) {
        distortion.wet.rampTo(isEnabled ? 1 : 0, 0.1)
      }

      if (distSettings.amount !== undefined) {
        if (effectsData.distortionType !== 'bitcrusher') {
          distortion.distortion = distSettings.amount
        } else {
          distortion.bits = Math.floor(4 + (1 - distSettings.amount) * 12)
        }
      }
      effectsData.settings.distortion = { ...effectsData.settings.distortion, ...distSettings }
    }

    // Update Phaser
    if (effectsSettings.phaser !== undefined) {
      const phaserSettings = effectsSettings.phaser
      if (phaserSettings.enabled !== undefined) {
        phaser.wet.rampTo(phaserSettings.enabled ? (phaserSettings.wet ?? effectsData.settings.phaser.wet) : 0, 0.1)
      }
      if (phaserSettings.wet !== undefined && effectsData.settings.phaser.enabled) {
        phaser.wet.rampTo(phaserSettings.wet, 0.1)
      }
      if (phaserSettings.frequency !== undefined) {
        phaser.frequency.rampTo(phaserSettings.frequency, 0.1)
      }
      if (phaserSettings.octaves !== undefined) {
        phaser.octaves = phaserSettings.octaves
      }
      if (phaserSettings.baseFrequency !== undefined) {
        phaser.baseFrequency = phaserSettings.baseFrequency
      }
      effectsData.settings.phaser = { ...effectsData.settings.phaser, ...phaserSettings }
    }

    // Update Tremolo
    if (effectsSettings.tremolo !== undefined) {
      const tremoloSettings = effectsSettings.tremolo
      if (tremoloSettings.enabled !== undefined) {
        tremolo.wet.rampTo(tremoloSettings.enabled ? (tremoloSettings.wet ?? effectsData.settings.tremolo.wet) : 0, 0.1)
      }
      if (tremoloSettings.wet !== undefined && effectsData.settings.tremolo.enabled) {
        tremolo.wet.rampTo(tremoloSettings.wet, 0.1)
      }
      if (tremoloSettings.frequency !== undefined) {
        tremolo.frequency.rampTo(tremoloSettings.frequency, 0.1)
      }
      if (tremoloSettings.depth !== undefined) {
        tremolo.depth.rampTo(tremoloSettings.depth, 0.1)
      }
      effectsData.settings.tremolo = { ...effectsData.settings.tremolo, ...tremoloSettings }
    }

    // Update chorus
    if (effectsSettings.chorus !== undefined) {
      const chorusSettings = effectsSettings.chorus
      if (chorusSettings.enabled !== undefined) {
        chorus.wet.rampTo(chorusSettings.enabled ? (chorusSettings.wet ?? effectsData.settings.chorus.wet) : 0, 0.1)
      }
      if (chorusSettings.wet !== undefined && effectsData.settings.chorus.enabled) {
        chorus.wet.rampTo(chorusSettings.wet, 0.1)
      }
      if (chorusSettings.frequency !== undefined) {
        chorus.frequency.rampTo(chorusSettings.frequency, 0.1)
      }
      if (chorusSettings.depth !== undefined) {
        chorus.depth = chorusSettings.depth
      }
      effectsData.settings.chorus = { ...effectsData.settings.chorus, ...chorusSettings }
    }

    // Update delay
    if (effectsSettings.delay !== undefined) {
      const delaySettings = effectsSettings.delay
      if (delaySettings.enabled !== undefined) {
        delay.wet.rampTo(delaySettings.enabled ? (delaySettings.wet ?? effectsData.settings.delay.wet) : 0, 0.1)
      }
      if (delaySettings.wet !== undefined && effectsData.settings.delay.enabled) {
        delay.wet.rampTo(delaySettings.wet, 0.1)
      }
      if (delaySettings.time !== undefined) {
        delay.delayTime.rampTo(delaySettings.time, 0.1)
      }
      if (delaySettings.feedback !== undefined) {
        delay.feedback.rampTo(delaySettings.feedback, 0.1)
      }
      effectsData.settings.delay = { ...effectsData.settings.delay, ...delaySettings }
    }

    // Update reverb
    if (effectsSettings.reverb !== undefined) {
      const reverbSettings = effectsSettings.reverb
      if (reverbSettings.enabled !== undefined) {
        reverb.wet.rampTo(reverbSettings.enabled ? (reverbSettings.wet ?? effectsData.settings.reverb.wet) : 0, 0.1)
      }
      if (reverbSettings.wet !== undefined && effectsData.settings.reverb.enabled) {
        reverb.wet.rampTo(reverbSettings.wet, 0.1)
      }
      if (reverbSettings.roomSize !== undefined) {
        // Reverb decay is linked to room size (0.5 -> 5 seconds)
        reverb.decay = reverbSettings.roomSize * 10
      }
      effectsData.settings.reverb = { ...effectsData.settings.reverb, ...reverbSettings }
    }

    this.effects.set(trackId, effectsData)
  }

  // Recreate effects chain (used when distortion type changes)
  recreateEffectsChain(trackId, newSettings) {
    const synthData = this.synths.get(trackId)
    const drumData = this.drumSamplers.get(trackId)
    const audioData = this.audioPlayers.get(trackId)
    const effectsData = this.effects.get(trackId)

    if (!effectsData) return

    // Dispose old effects
    effectsData.eq3.dispose()
    effectsData.compressor.dispose()
    effectsData.distortion.dispose()
    effectsData.phaser.dispose()
    effectsData.tremolo.dispose()
    effectsData.chorus.dispose()
    effectsData.delay.dispose()
    effectsData.reverb.dispose()
    this.effects.delete(trackId)

    // Create new effects chain
    const newChain = this.createEffectsChain(trackId, newSettings)
    const channel = this.channels.get(trackId)

    if (channel) {
      newChain.output.connect(channel)
    }

    // Reconnect synth/drums/player
    if (synthData) {
      synthData.filter.disconnect()
      synthData.filter.connect(newChain.input)
    } else if (drumData) {
      Object.values(drumData.drums).forEach(drum => {
        drum.disconnect()
        drum.connect(newChain.input)
      })
    } else if (audioData) {
      audioData.player.disconnect()
      audioData.player.connect(newChain.input)
    }
  }

  // Dispose effects chain for a track
  disposeEffects(trackId) {
    const effectsData = this.effects.get(trackId)
    if (effectsData) {
      effectsData.eq3.dispose()
      effectsData.compressor.dispose()
      effectsData.distortion.dispose()
      effectsData.phaser.dispose()
      effectsData.tremolo.dispose()
      effectsData.chorus.dispose()
      effectsData.delay.dispose()
      effectsData.reverb.dispose()
      this.effects.delete(trackId)
    }
  }

  // Create an LFO for wobble bass effect
  createLFO(trackId, lfoSettings, baseFilterFreq) {
    // Dispose existing LFO if any
    this.disposeLFO(trackId)

    const synthData = this.synths.get(trackId)
    if (!synthData) return null

    const {
      rate = '8n',
      waveform = 'sine',
      depth = 0.5,
      enabled = true,
    } = lfoSettings

    if (!enabled) return null

    // Calculate the frequency range based on depth
    // LFO will modulate between a low frequency and the base filter frequency
    const minFreq = 100  // Minimum filter frequency
    const maxFreq = baseFilterFreq || synthData.baseFilterFreq || 2000
    const range = (maxFreq - minFreq) * depth

    // Create the LFO - sync to transport for tempo-synced wobble
    const lfo = new Tone.LFO({
      frequency: rate,
      type: waveform,
      min: minFreq,
      max: minFreq + range,
    }).sync().start(0)

    // Connect LFO to filter frequency
    lfo.connect(synthData.filter.frequency)

    this.lfos.set(trackId, { lfo, settings: lfoSettings, baseFilterFreq: maxFreq })

    return lfo
  }

  // Update LFO settings
  updateLFO(trackId, lfoSettings) {
    const synthData = this.synths.get(trackId)
    if (!synthData) return

    const lfoData = this.lfos.get(trackId)
    // Use synthData.baseFilterFreq as primary source of truth
    const baseFilterFreq = synthData.baseFilterFreq || lfoData?.baseFilterFreq || 2000

    // If LFO is being disabled, dispose it and reset filter
    if (!lfoSettings.enabled) {
      this.disposeLFO(trackId)
      // Reset filter to base frequency using rampTo to avoid clicks
      synthData.filter.frequency.cancelScheduledValues(0)
      synthData.filter.frequency.rampTo(baseFilterFreq, 0.1)
      return
    }

    // If we have an existing LFO, update its parameters
    if (lfoData && lfoData.lfo) {
      const { lfo } = lfoData
      const {
        rate = lfoData.settings.rate,
        waveform = lfoData.settings.waveform,
        depth = lfoData.settings.depth,
      } = lfoSettings

      // Update waveform
      if (waveform !== undefined) {
        lfo.type = waveform
      }

      // Update rate
      if (rate !== undefined) {
        lfo.frequency.value = rate
      }

      // Update depth (requires recalculating min/max)
      if (depth !== undefined) {
        const minFreq = 100
        const range = (baseFilterFreq - minFreq) * depth
        lfo.min = minFreq
        lfo.max = minFreq + range
      }

      // Update stored settings
      this.lfos.set(trackId, {
        lfo,
        settings: { ...lfoData.settings, ...lfoSettings },
        baseFilterFreq,
      })
    } else {
      // Create new LFO
      this.createLFO(trackId, lfoSettings, baseFilterFreq)
    }
  }

  // Dispose LFO for a track
  disposeLFO(trackId) {
    const lfoData = this.lfos.get(trackId)
    if (lfoData && lfoData.lfo) {
      lfoData.lfo.stop()
      lfoData.lfo.dispose()
      this.lfos.delete(trackId)
    }
  }

  // Create a drum sampler for a track
  createDrumSampler(trackId, effectsSettings = null) {
    this.disposeDrumSampler(trackId)

    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create meter for this track
    this.createTrackMeter(trackId, channel)

    // Create effects chain
    const effectsChain = this.createEffectsChain(trackId, effectsSettings)
    effectsChain.output.connect(channel)

    // Create drum sounds using synths - connect to effects chain input
    const drums = {
      kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
      }).connect(effectsChain.input),
      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
      }).connect(effectsChain.input),
      hihat: new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).connect(effectsChain.input),
      clap: new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
      }).connect(effectsChain.input),
      tom: new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
      }).connect(effectsChain.input),
      crash: new Tone.MetalSynth({
        frequency: 300,
        envelope: { attack: 0.001, decay: 1, sustain: 0, release: 1 },
        harmonicity: 5.1,
        modulationIndex: 40,
        resonance: 5000,
        octaves: 1.5,
      }).connect(effectsChain.input),
      ride: new Tone.MetalSynth({
        frequency: 400,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.4 },
        harmonicity: 7,
        modulationIndex: 20,
        resonance: 6000,
        octaves: 1,
      }).connect(effectsChain.input),
      cowbell: new Tone.MetalSynth({
        frequency: 560,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
        harmonicity: 0.5,
        modulationIndex: 2,
        resonance: 800,
        octaves: 0,
      }).connect(effectsChain.input),
    }

    this.drumSamplers.set(trackId, { drums, channel })
    return drums
  }

  // Create a PluckSynth for guitar-like sounds
  createPluckSynth(trackId, settings = {}, effectsSettings = null) {
    // Dispose existing synth if any
    this.disposeSynth(trackId)

    const {
      attackNoise = 1,
      dampening = 4000,
      resonance = 0.7,
      release = 1,
    } = settings

    // Create channel for volume/pan
    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create meter for this track
    this.createTrackMeter(trackId, channel)

    // Create effects chain
    const effectsChain = this.createEffectsChain(trackId, effectsSettings)
    effectsChain.output.connect(channel)

    // Create pluck synth (use PolySynth for polyphony)
    const synth = new Tone.PolySynth(Tone.PluckSynth, {
      attackNoise,
      dampening,
      resonance,
      release,
    }).connect(effectsChain.input)

    this.synths.set(trackId, { synth, channel, synthType: 'pluck', settings: { attackNoise, dampening, resonance, release } })

    return synth
  }

  // Create an FMSynth for rich, evolving timbres
  createFMSynth(trackId, settings = {}, effectsSettings = null) {
    // Dispose existing synth if any
    this.disposeSynth(trackId)

    const {
      harmonicity = 3,
      modulationIndex = 10,
      attack = 0.01,
      decay = 0.1,
      sustain = 0.5,
      release = 0.5,
      modulationAttack = 0.5,
      modulationDecay = 0,
      modulationSustain = 1,
      modulationRelease = 0.5,
    } = settings

    // Create channel for volume/pan
    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create meter for this track
    this.createTrackMeter(trackId, channel)

    // Create effects chain
    const effectsChain = this.createEffectsChain(trackId, effectsSettings)
    effectsChain.output.connect(channel)

    // Create FM synth
    const synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity,
      modulationIndex,
      envelope: { attack, decay, sustain, release },
      modulation: { type: 'sine' },
      modulationEnvelope: {
        attack: modulationAttack,
        decay: modulationDecay,
        sustain: modulationSustain,
        release: modulationRelease,
      },
    }).connect(effectsChain.input)

    this.synths.set(trackId, { synth, channel, synthType: 'fm', settings: { harmonicity, modulationIndex, attack, decay, sustain, release, modulationAttack, modulationDecay, modulationSustain, modulationRelease } })

    return synth
  }

  // Create an AMSynth for amplitude modulation sounds
  createAMSynth(trackId, settings = {}, effectsSettings = null) {
    // Dispose existing synth if any
    this.disposeSynth(trackId)

    const {
      harmonicity = 3,
      attack = 0.01,
      decay = 0.1,
      sustain = 0.5,
      release = 0.5,
      modulationAttack = 0.5,
      modulationDecay = 0,
      modulationSustain = 1,
      modulationRelease = 0.5,
    } = settings

    // Create channel for volume/pan
    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create meter for this track
    this.createTrackMeter(trackId, channel)

    // Create effects chain
    const effectsChain = this.createEffectsChain(trackId, effectsSettings)
    effectsChain.output.connect(channel)

    // Create AM synth
    const synth = new Tone.PolySynth(Tone.AMSynth, {
      harmonicity,
      envelope: { attack, decay, sustain, release },
      modulation: { type: 'sine' },
      modulationEnvelope: {
        attack: modulationAttack,
        decay: modulationDecay,
        sustain: modulationSustain,
        release: modulationRelease,
      },
    }).connect(effectsChain.input)

    this.synths.set(trackId, { synth, channel, synthType: 'am', settings: { harmonicity, attack, decay, sustain, release, modulationAttack, modulationDecay, modulationSustain, modulationRelease } })

    return synth
  }

  // Update Pluck synth settings
  updatePluckSettings(trackId, settings) {
    const synthData = this.synths.get(trackId)
    if (!synthData || synthData.synthType !== 'pluck') return

    // PluckSynth parameters can't be changed after creation, so we need to recreate
    const newSettings = { ...synthData.settings, ...settings }
    const effectsData = this.effects.get(trackId)
    this.createPluckSynth(trackId, newSettings, effectsData?.settings)
  }

  // Update FM synth settings
  updateFMSettings(trackId, settings) {
    const synthData = this.synths.get(trackId)
    if (!synthData || synthData.synthType !== 'fm') return

    const { synth } = synthData
    const newSettings = { ...synthData.settings, ...settings }

    // Update synth parameters
    if (settings.harmonicity !== undefined) {
      synth.set({ harmonicity: settings.harmonicity })
    }
    if (settings.modulationIndex !== undefined) {
      synth.set({ modulationIndex: settings.modulationIndex })
    }
    if (settings.attack !== undefined || settings.decay !== undefined ||
        settings.sustain !== undefined || settings.release !== undefined) {
      synth.set({
        envelope: {
          attack: newSettings.attack,
          decay: newSettings.decay,
          sustain: newSettings.sustain,
          release: newSettings.release,
        }
      })
    }
    if (settings.modulationAttack !== undefined || settings.modulationDecay !== undefined ||
        settings.modulationSustain !== undefined || settings.modulationRelease !== undefined) {
      synth.set({
        modulationEnvelope: {
          attack: newSettings.modulationAttack,
          decay: newSettings.modulationDecay,
          sustain: newSettings.modulationSustain,
          release: newSettings.modulationRelease,
        }
      })
    }

    synthData.settings = newSettings
    this.synths.set(trackId, synthData)
  }

  // Update AM synth settings
  updateAMSettings(trackId, settings) {
    const synthData = this.synths.get(trackId)
    if (!synthData || synthData.synthType !== 'am') return

    const { synth } = synthData
    const newSettings = { ...synthData.settings, ...settings }

    // Update synth parameters
    if (settings.harmonicity !== undefined) {
      synth.set({ harmonicity: settings.harmonicity })
    }
    if (settings.attack !== undefined || settings.decay !== undefined ||
        settings.sustain !== undefined || settings.release !== undefined) {
      synth.set({
        envelope: {
          attack: newSettings.attack,
          decay: newSettings.decay,
          sustain: newSettings.sustain,
          release: newSettings.release,
        }
      })
    }
    if (settings.modulationAttack !== undefined || settings.modulationDecay !== undefined ||
        settings.modulationSustain !== undefined || settings.modulationRelease !== undefined) {
      synth.set({
        modulationEnvelope: {
          attack: newSettings.modulationAttack,
          decay: newSettings.modulationDecay,
          sustain: newSettings.modulationSustain,
          release: newSettings.modulationRelease,
        }
      })
    }

    synthData.settings = newSettings
    this.synths.set(trackId, synthData)
  }

  // Create an audio player for a track
  createAudioPlayer(trackId, audioBuffer, effectsSettings = null) {
    this.disposeAudioPlayer(trackId)

    const channel = new Tone.Channel().connect(this.masterVolume)
    this.channels.set(trackId, channel)

    // Create meter for this track
    this.createTrackMeter(trackId, channel)

    // Create effects chain
    const effectsChain = this.createEffectsChain(trackId, effectsSettings)
    effectsChain.output.connect(channel)

    // Create a Tone.js buffer from the AudioBuffer
    const toneBuffer = new Tone.ToneAudioBuffer(audioBuffer)
    const player = new Tone.Player(toneBuffer).connect(effectsChain.input)
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

    const { synth, filter, channel, baseFilterFreq } = synthData

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

      this.synths.set(trackId, { synth: newSynth, filter, channel, baseFilterFreq })
    }

    // Filter updates - handle differently if LFO is active
    const lfoData = this.lfos.get(trackId)
    if (settings.filterFreq !== undefined) {
      // Update the base filter frequency
      const currentSynthData = this.synths.get(trackId)
      if (currentSynthData) {
        currentSynthData.baseFilterFreq = settings.filterFreq
      }

      // If LFO is active, update its range based on new filter frequency
      if (lfoData && lfoData.lfo) {
        const depth = lfoData.settings.depth || 0.5
        const minFreq = 100
        const range = (settings.filterFreq - minFreq) * depth
        lfoData.lfo.min = minFreq
        lfoData.lfo.max = minFreq + range
        // Update stored base frequency
        this.lfos.set(trackId, { ...lfoData, baseFilterFreq: settings.filterFreq })
      } else {
        // No LFO, directly set filter frequency
        filter.frequency.rampTo(settings.filterFreq, 0.1)
      }
    }
    if (settings.filterRes !== undefined) {
      filter.Q.rampTo(settings.filterRes, 0.1)
    }

    // Handle LFO updates
    if (settings.lfo !== undefined) {
      this.updateLFO(trackId, settings.lfo)
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
            } else if (track.type === 'synth' || track.type === 'pluck' || track.type === 'fm' || track.type === 'am') {
              // For all synth types (synth, pluck, fm, am), pitch is MIDI note number
              // Calculate duration: each step is 1/stepsPerMeasure of a measure
              // So note.duration steps = note.duration / stepsPerMeasure measures
              // Use seconds for precise timing
              const stepDurationSec = Tone.Time(`${stepsPerMeasure}n`).toSeconds()
              const noteDurationSec = stepDurationSec * note.duration
              this.triggerNote(track.id, note.pitch, noteDurationSec, time, note.velocity / 127)
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
    // Dispose LFO first if exists
    this.disposeLFO(trackId)
    // Dispose effects
    this.disposeEffects(trackId)

    const synthData = this.synths.get(trackId)
    if (synthData) {
      synthData.synth.dispose()
      // Filter may not exist for pluck, FM, and AM synths
      if (synthData.filter) {
        synthData.filter.dispose()
      }
      synthData.channel.dispose()
      this.synths.delete(trackId)
    }
  }

  disposeDrumSampler(trackId) {
    // Dispose effects
    this.disposeEffects(trackId)

    const sampler = this.drumSamplers.get(trackId)
    if (sampler) {
      Object.values(sampler.drums).forEach(drum => drum.dispose())
      sampler.channel.dispose()
      this.drumSamplers.delete(trackId)
    }
  }

  disposeAudioPlayer(trackId) {
    // Dispose effects
    this.disposeEffects(trackId)

    const playerData = this.audioPlayers.get(trackId)
    if (playerData) {
      playerData.player.dispose()
      playerData.channel.dispose()
      this.audioPlayers.delete(trackId)
    }
  }

  dispose() {
    Tone.Transport.stop()
    Tone.Transport.cancel()

    this.synths.forEach((_, trackId) => this.disposeSynth(trackId))
    this.drumSamplers.forEach((_, trackId) => this.disposeDrumSampler(trackId))
    this.audioPlayers.forEach((_, trackId) => this.disposeAudioPlayer(trackId))
    this.trackMeters.forEach((_, trackId) => this.disposeTrackMeter(trackId))
    this.effects.forEach((_, trackId) => this.disposeEffects(trackId))

    // Dispose analyzers
    if (this.waveformAnalyzer) {
      this.waveformAnalyzer.dispose()
      this.waveformAnalyzer = null
    }
    if (this.fftAnalyzer) {
      this.fftAnalyzer.dispose()
      this.fftAnalyzer = null
    }
    if (this.masterMeter) {
      this.masterMeter.dispose()
      this.masterMeter = null
    }

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
