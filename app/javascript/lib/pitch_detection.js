/**
 * YIN-based pitch detection with parabolic interpolation
 *
 * Implements the YIN algorithm (de Cheveigné & Kawahara, 2002) for
 * fundamental frequency estimation. Uses cumulative mean normalized
 * difference function with parabolic interpolation for sub-sample accuracy.
 */

const YIN_THRESHOLD = 0.15
const MIN_FREQ = 60    // B1
const MAX_FREQ = 2000  // B6

export class PitchDetector {
  /**
   * @param {number} sampleRate - Audio sample rate (e.g. 44100, 48000)
   * @param {number} bufferSize - Analysis buffer size (e.g. 4096)
   */
  constructor(sampleRate, bufferSize) {
    this.sampleRate = sampleRate
    this.bufferSize = bufferSize
    // YIN uses half the buffer for the difference function
    this.halfSize = Math.floor(bufferSize / 2)
    this.yinBuffer = new Float32Array(this.halfSize)

    // Precompute lag bounds from freq range
    this.minLag = Math.floor(sampleRate / MAX_FREQ)
    this.maxLag = Math.min(Math.ceil(sampleRate / MIN_FREQ), this.halfSize - 1)
  }

  /**
   * Detect pitch from a time-domain audio buffer
   * @param {Float32Array} buffer - Time-domain audio samples
   * @returns {{ freq: number, confidence: number } | null}
   */
  detect(buffer) {
    // Step 1: Compute the difference function d(tau)
    this._difference(buffer)

    // Step 2: Cumulative mean normalized difference function d'(tau)
    this._cumulativeMeanNormalize()

    // Step 3: Absolute threshold - find first valley below threshold
    const tauEstimate = this._absoluteThreshold()
    if (tauEstimate === -1) return null

    // Step 4: Parabolic interpolation for sub-sample accuracy
    const betterTau = this._parabolicInterpolation(tauEstimate)

    // Convert lag to frequency
    const freq = this.sampleRate / betterTau

    // Sanity check
    if (freq < MIN_FREQ || freq > MAX_FREQ) return null

    // Confidence is 1 - d'(tau) (lower d' = higher confidence)
    const confidence = 1 - this.yinBuffer[tauEstimate]

    return { freq, confidence }
  }

  /**
   * Compute RMS amplitude of the buffer
   * @param {Float32Array} buffer
   * @returns {number} RMS value (0-1 range for normalized audio)
   */
  static rms(buffer) {
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i]
    }
    return Math.sqrt(sum / buffer.length)
  }

  /**
   * Step 1: Difference function
   * d(tau) = sum of (x[j] - x[j+tau])^2 for j = 0..W-1
   */
  _difference(buffer) {
    for (let tau = 0; tau < this.halfSize; tau++) {
      this.yinBuffer[tau] = 0
      for (let j = 0; j < this.halfSize; j++) {
        const delta = buffer[j] - buffer[j + tau]
        this.yinBuffer[tau] += delta * delta
      }
    }
  }

  /**
   * Step 2: Cumulative mean normalized difference function
   * d'(tau) = d(tau) / ((1/tau) * sum(d(j) for j=1..tau))
   * d'(0) = 1
   */
  _cumulativeMeanNormalize() {
    this.yinBuffer[0] = 1
    let runningSum = 0

    for (let tau = 1; tau < this.halfSize; tau++) {
      runningSum += this.yinBuffer[tau]
      this.yinBuffer[tau] *= tau / runningSum
    }
  }

  /**
   * Step 3: Absolute threshold
   * Find the first tau below the threshold, then find the local minimum
   * in that valley.
   * @returns {number} Best tau estimate, or -1 if not found
   */
  _absoluteThreshold() {
    let tau = this.minLag

    // Find first dip below threshold within valid lag range
    while (tau < this.maxLag) {
      if (this.yinBuffer[tau] < YIN_THRESHOLD) {
        // Walk to the bottom of this valley
        while (tau + 1 < this.maxLag && this.yinBuffer[tau + 1] < this.yinBuffer[tau]) {
          tau++
        }
        return tau
      }
      tau++
    }

    return -1
  }

  /**
   * Step 4: Parabolic interpolation around the estimated tau
   * Fits a parabola through (tau-1, tau, tau+1) and returns the
   * x-coordinate of the minimum.
   * @param {number} tau - Integer lag estimate
   * @returns {number} Refined tau with sub-sample accuracy
   */
  _parabolicInterpolation(tau) {
    if (tau < 1 || tau >= this.halfSize - 1) return tau

    const s0 = this.yinBuffer[tau - 1]
    const s1 = this.yinBuffer[tau]
    const s2 = this.yinBuffer[tau + 1]

    // Parabolic fit: x = tau + (s0 - s2) / (2 * (s0 - 2*s1 + s2))
    const denominator = 2 * (s0 - 2 * s1 + s2)
    if (denominator === 0) return tau

    const adjustment = (s0 - s2) / denominator
    return tau + adjustment
  }

  /**
   * Analyze an entire AudioBuffer offline, returning timestamped pitch data.
   * Runs the YIN detector in overlapping windows across the full buffer.
   * @param {AudioBuffer} audioBuffer - Decoded audio buffer
   * @param {number} [hopSize] - Samples between analysis windows (default bufferSize/2)
   * @returns {Array<{ time: number, midi: number|null, freq: number|null, confidence: number }>}
   */
  analyzeOffline(audioBuffer, hopSize) {
    const channelData = audioBuffer.getChannelData(0) // mono or first channel
    const sampleRate = audioBuffer.sampleRate
    const bufSize = this.bufferSize
    const hop = hopSize || Math.floor(bufSize / 2)
    const results = []
    const frame = new Float32Array(bufSize)

    for (let offset = 0; offset + bufSize <= channelData.length; offset += hop) {
      frame.set(channelData.subarray(offset, offset + bufSize))

      const rms = PitchDetector.rms(frame)
      const time = offset / sampleRate

      if (rms < 0.005) {
        results.push({ time, midi: null, freq: null, confidence: 0 })
        continue
      }

      const result = this.detect(frame)
      if (result && result.confidence > 0.6) {
        const midi = 12 * Math.log2(result.freq / 440) + 69
        results.push({ time, midi, freq: result.freq, confidence: result.confidence })
      } else {
        results.push({ time, midi: null, freq: null, confidence: 0 })
      }
    }

    return results
  }
}
