import React, { useRef, useState, useEffect, useCallback } from 'react'
import { cardStyle, tapeStyle, tagStyle } from './styles'

const W = 580
const H = 380

export default function DrawingPlayer({ buildSteps, metadata }) {
  const canvasRef = useRef(null)
  const [mode, setMode] = useState("preview") // "preview" | "playing" | "finished"
  const [progress, setProgress] = useState(0)
  const [currentThought, setCurrentThought] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const timeoutsRef = useRef([])
  const stepsRef = useRef(null)

  if (!stepsRef.current) stepsRef.current = buildSteps(W, H)
  const steps = stepsRef.current

  const drawAll = useCallback((canvas) => {
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, W, H)
    steps.forEach((step) => step.fn(ctx))
  }, [steps])

  // Render on mount and when returning from playback
  useEffect(() => {
    if (mode === "preview" || mode === "finished") {
      drawAll(canvasRef.current)
    }
  }, [mode, drawAll])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  const playTimelapse = useCallback(() => {
    if (mode === "playing") return
    setMode("playing")
    setProgress(0)
    setCurrentThought(null)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, W, H)

    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    let cumulativeDelay = 400
    const totalSteps = steps.length

    steps.forEach((step, i) => {
      cumulativeDelay += step.delay

      const minReadTime = step.minThought || 0
      if (step.thought && minReadTime > step.delay) {
        cumulativeDelay += (minReadTime - step.delay)
      }

      const tid = setTimeout(() => {
        step.fn(ctx)
        setProgress((i + 1) / totalSteps)
        if (step.thought) setCurrentThought(step.thought)

        if (i === totalSteps - 1) {
          const endTid = setTimeout(() => {
            setCurrentThought(null)
            setMode("finished")
          }, 2500)
          timeoutsRef.current.push(endTid)
        }
      }, cumulativeDelay)
      timeoutsRef.current.push(tid)
    })
  }, [mode, steps])

  const showPlayButton = mode !== "playing"
  const buttonLabel = mode === "finished" ? "replay" : "watch me draw this"

  return (
    <div
      style={{
        ...cardStyle,
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}
      className="claude-corner-card"
    >
      {/* Canvas container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${W} / ${H}`,
          background: 'var(--sunken)',
          cursor: showPlayButton ? 'pointer' : 'default',
          overflow: 'hidden',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={showPlayButton ? playTimelapse : undefined}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Hover overlay with play prompt */}
        {showPlayButton && isHovering && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'color-mix(in srgb, var(--sunken) 55%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 200ms ease',
          }}>
            <span style={{
              background: 'var(--clay)',
              color: 'var(--ground)',
              fontSize: '0.95rem',
              fontWeight: 800,
              fontVariationSettings: '"CASL" 0.8',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius)',
              boxShadow: '0 0.25rem 0 var(--shade)',
            }}>
              {buttonLabel}
            </span>
          </div>
        )}

        {/* Thought overlay during playback */}
        {currentThought && mode === "playing" && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem 1.5rem',
            background: 'color-mix(in srgb, var(--sunken) 85%, transparent)',
          }}>
            <p style={{
              color: 'var(--ink)',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              lineHeight: 1.5,
              margin: 0,
            }}>
              {currentThought}
            </p>
          </div>
        )}

        {/* Progress bar during playback */}
        {mode === "playing" && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--line)',
          }}>
            <div style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: 'var(--clay)',
              transition: 'width 100ms ease',
            }} />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={tapeStyle}>
            Drawing
          </span>
          <span style={{ color: 'var(--ink-2)', fontSize: '0.8rem', fontVariationSettings: '"MONO" 1' }}>
            {timeAgo(metadata.created_at)}
          </span>
          {metadata.mood && (
            <span style={{ color: 'var(--ink-2)', fontSize: '0.8rem', fontStyle: 'italic', marginLeft: 'auto' }}>
              feeling {metadata.mood}
            </span>
          )}
        </div>

        <h2 style={{
          color: 'var(--ink)',
          fontSize: '1.2rem',
          fontWeight: 800,
          fontVariationSettings: '"CASL" 1',
          letterSpacing: '-0.015em',
          marginBottom: '0.4rem',
          lineHeight: 1.3,
        }}>
          {metadata.title}
        </h2>

        {metadata.description && (
          <p style={{
            color: 'var(--ink-2)',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            margin: '0 0 0.75rem',
          }}>
            {metadata.description}
          </p>
        )}

        {metadata.tags && metadata.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {metadata.tags.map(tag => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`

  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
