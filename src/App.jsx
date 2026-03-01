import { useState, useEffect, useRef } from 'react'
import './App.css'

// ─── Breathing patterns ───────────────────────────────────────────────────────
const PATTERNS = {
  '4-7-8': { label: '4-7-8 Breathing', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  'box':   { label: 'Box Breathing',   inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  'relaxed': { label: 'Relaxed', inhale: 4, holdIn: 2, exhale: 6, holdOut: 0 },
}

const PHASES = ['inhale', 'holdIn', 'exhale', 'holdOut']
const PHASE_LABELS = { inhale: 'Inhale', holdIn: 'Hold', exhale: 'Exhale', holdOut: 'Hold' }

// ─── Lung geometry helpers ────────────────────────────────────────────────────
// Each lung is described as a list of circle offsets relative to a centre point.
// Coordinates are normalised – multiply by lungRadius to get canvas pixels.
const LUNG_CIRCLES = [
  { ox: 0,    oy: 0,    r: 1.0  },   // main body
  { ox: -0.4, oy: -0.6, r: 0.65 },   // upper lobe
  { ox:  0.4, oy: -0.5, r: 0.60 },
  { ox: -0.55,oy:  0.3, r: 0.55 },   // lower lobe
  { ox:  0.45,oy:  0.4, r: 0.50 },
]

// Ball rest positions (normalised, relative to lung centre)
const BALL_POSITIONS = [
  { ox:  0,    oy: -0.25 },
  { ox: -0.3,  oy:  0.1  },
  { ox:  0.3,  oy:  0.0  },
  { ox: -0.15, oy:  0.4  },
  { ox:  0.2,  oy:  0.4  },
  { ox:  0,    oy: -0.6  },
]

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function lerp(a, b, t) { return a + (b - a) * t }

// ─── Canvas renderer ──────────────────────────────────────────────────────────
function drawScene(ctx, W, H, breathProgress, phase, time) {
  // Background gradient
  ctx.clearRect(0, 0, W, H)
  const bg = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, Math.max(W, H) * 0.8)
  bg.addColorStop(0,   '#0d1b3e')
  bg.addColorStop(0.5, '#0b0b2a')
  bg.addColorStop(1,   '#050510')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Scale factor: 0.78 (exhale) → 1.0 (inhale)
  let scale
  if (phase === 'inhale')  scale = lerp(0.78, 1.0, easeInOut(breathProgress))
  else if (phase === 'exhale') scale = lerp(1.0, 0.78, easeInOut(breathProgress))
  else scale = phase === 'holdIn' ? 1.0 : 0.78

  // Glow intensity
  let glow
  if (phase === 'inhale')  glow = lerp(0.45, 1.0, easeInOut(breathProgress))
  else if (phase === 'exhale') glow = lerp(1.0, 0.45, easeInOut(breathProgress))
  else glow = phase === 'holdIn' ? 1.0 : 0.45

  const baseRadius = Math.min(W, H) * 0.115
  const lungRadius = baseRadius * scale
  const lungY = H * 0.37
  const lungSep = W * 0.22

  const leftX  = W / 2 - lungSep
  const rightX = W / 2 + lungSep

  drawLung(ctx, leftX,  lungY, lungRadius, scale, glow, time, phase, breathProgress, -1)
  drawLung(ctx, rightX, lungY, lungRadius, scale, glow, time, phase, breathProgress,  1)
}

function drawLung(ctx, cx, cy, lungRadius, scale, glow, time, phase, progress, side) {
  const teal   = `rgba(32,200,200,`
  const cyan   = `rgba(100,220,240,`
  const lavender = `rgba(160,130,255,`

  // Draw each circle of the lung cluster
  LUNG_CIRCLES.forEach(({ ox, oy, r }, i) => {
    const x = cx + ox * lungRadius
    const y = cy + oy * lungRadius
    const radius = r * lungRadius

    // Alternating teal/lavender per circle
    const baseColor = i % 2 === 0 ? teal : lavender
    const alpha = 0.12 + glow * 0.1

    // Outer glow
    const glowGrad = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 1.5)
    glowGrad.addColorStop(0, `${baseColor}${(alpha * 0.7).toFixed(2)})`)
    glowGrad.addColorStop(1, `${baseColor}0)`)
    ctx.beginPath()
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = glowGrad
    ctx.fill()

    // Circle body
    const bodyGrad = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.25, 0, x, y, radius)
    bodyGrad.addColorStop(0, `${cyan}${(alpha * 1.2 + glow * 0.08).toFixed(2)})`)
    bodyGrad.addColorStop(0.5, `${baseColor}${(alpha + glow * 0.06).toFixed(2)})`)
    bodyGrad.addColorStop(1, `${baseColor}${(alpha * 0.5).toFixed(2)})`)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = bodyGrad
    ctx.fill()

    // Rim highlight
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `${cyan}${(glow * 0.35).toFixed(2)})`
    ctx.lineWidth = 1.2
    ctx.stroke()
  })

  // Draw floating balls
  BALL_POSITIONS.forEach(({ ox, oy }, i) => {
    const ballPhaseOffset = (i * 0.15)
    const drift = Math.sin(time * 0.6 + ballPhaseOffset * Math.PI * 2) * 0.04

    let targetOX = ox
    let targetOY = oy

    if (phase === 'inhale') {
      // Balls move inward and upward as lungs fill
      targetOX = ox * (1 - progress * 0.18)
      targetOY = oy - progress * 0.15
    } else if (phase === 'exhale') {
      // Balls spread outward and downward
      targetOX = ox * (1 + progress * 0.18)
      targetOY = oy + progress * 0.15
    } else if (phase === 'holdIn') {
      // Gentle pulse
      const pulse = Math.sin(time * 1.2 + i * 0.8) * 0.03
      targetOX = ox * (1 - 0.18 + pulse)
      targetOY = oy - 0.15 + pulse
    }

    const bx = cx + (targetOX + drift * side) * lungRadius
    const by = cy + targetOY * lungRadius
    const br = lungRadius * 0.085

    // Ball glow
    const ballGlow = ctx.createRadialGradient(bx, by, 0, bx, by, br * 3)
    ballGlow.addColorStop(0, `rgba(100,240,240,${(glow * 0.5).toFixed(2)})`)
    ballGlow.addColorStop(1, 'rgba(100,240,240,0)')
    ctx.beginPath()
    ctx.arc(bx, by, br * 3, 0, Math.PI * 2)
    ctx.fillStyle = ballGlow
    ctx.fill()

    // Ball body
    const ballBody = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, 0, bx, by, br)
    ballBody.addColorStop(0, `rgba(200,255,255,${(glow * 0.95).toFixed(2)})`)
    ballBody.addColorStop(0.5, `rgba(80,220,230,${(glow * 0.85).toFixed(2)})`)
    ballBody.addColorStop(1, `rgba(60,160,200,${(glow * 0.5).toFixed(2)})`)
    ctx.beginPath()
    ctx.arc(bx, by, br, 0, Math.PI * 2)
    ctx.fillStyle = ballBody
    ctx.fill()
  })
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const stateRef  = useRef({
    playing: false,
    patternKey: '4-7-8',
    phaseIndex: 0,
    phaseElapsed: 0,
    lastTimestamp: null,
    time: 0,
  })

  const [displayState, setDisplayState] = useState({
    playing: false,
    patternKey: '4-7-8',
    phase: 'inhale',
    phaseTimeLeft: PATTERNS['4-7-8'].inhale,
    totalTime: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      const container = canvas.parentElement
      canvas.width  = container ? container.clientWidth  : Math.min(window.innerWidth,  430)
      canvas.height = container ? container.clientHeight : window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function animate(timestamp) {
      animRef.current = requestAnimationFrame(animate)
      const s = stateRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height

      const dt = s.lastTimestamp ? Math.min((timestamp - s.lastTimestamp) / 1000, 0.1) : 0
      s.lastTimestamp = timestamp
      s.time += dt

      const pattern = PATTERNS[s.patternKey]
      const phaseOrder = PHASES.filter(p => pattern[p] > 0)
      const phaseDuration = pattern[phaseOrder[s.phaseIndex % phaseOrder.length]]

      if (s.playing) {
        s.phaseElapsed += dt
        if (s.phaseElapsed >= phaseDuration) {
          s.phaseElapsed -= phaseDuration
          s.phaseIndex = (s.phaseIndex + 1) % phaseOrder.length
        }
      }

      const breathProgress = s.playing ? Math.min(s.phaseElapsed / phaseDuration, 1) : 0
      const phase = phaseOrder[s.phaseIndex % phaseOrder.length]
      const timeLeft = Math.ceil(phaseDuration - s.phaseElapsed)

      drawScene(ctx, W, H, breathProgress, phase, s.time)

      setDisplayState({
        playing: s.playing,
        patternKey: s.patternKey,
        phase,
        phaseTimeLeft: timeLeft,
        totalTime: Math.floor(s.time),
      })
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  const togglePlay = () => {
    stateRef.current.playing = !stateRef.current.playing
    if (stateRef.current.playing) {
      stateRef.current.phaseElapsed = 0
      stateRef.current.phaseIndex   = 0
    }
    setDisplayState(d => ({ ...d, playing: stateRef.current.playing }))
  }

  const selectPattern = (key) => {
    stateRef.current.patternKey   = key
    stateRef.current.phaseElapsed = 0
    stateRef.current.phaseIndex   = 0
    stateRef.current.playing      = false
    setDisplayState(d => ({ ...d, patternKey: key, playing: false }))
  }

  const { playing, patternKey, phase, phaseTimeLeft } = displayState
  const pattern = PATTERNS[patternKey]
  const activePhaseDuration = pattern[phase] || 0
  const phaseProgress = activePhaseDuration > 0
    ? 1 - (phaseTimeLeft / activePhaseDuration)
    : 0

  return (
    <div className="app">
      <canvas ref={canvasRef} className="bg-canvas" />

      {/* Header */}
      <div className="header">
        <h1 className="app-title">Breathe</h1>
      </div>

      {/* Phase label */}
      <div className="phase-display">
        {playing ? (
          <>
            <div className="phase-name">{PHASE_LABELS[phase]}</div>
            <div className="phase-timer">{phaseTimeLeft}s</div>
            <div className="phase-bar-wrap">
              <div className="phase-bar" style={{ width: `${phaseProgress * 100}%` }} />
            </div>
          </>
        ) : (
          <div className="phase-idle">Press play to begin</div>
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        {/* Pattern selector */}
        <div className="pattern-row">
          {Object.entries(PATTERNS).map(([key, pat]) => (
            <button
              key={key}
              className={`pattern-btn ${patternKey === key ? 'active' : ''}`}
              onClick={() => selectPattern(key)}
            >
              {pat.label}
            </button>
          ))}
        </div>

        {/* Pattern description */}
        <div className="pattern-desc">
          {PHASES.filter(p => pattern[p] > 0).map((p, i, arr) => (
            <span key={p} className={phase === p && playing ? 'active-phase' : ''}>
              {PHASE_LABELS[p]}&nbsp;{pattern[p]}s
              {i < arr.length - 1 ? <span className="sep"> – </span> : null}
            </span>
          ))}
        </div>

        {/* Play / Pause */}
        <button className="play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1.5"/>
              <rect x="14" y="5" width="4" height="14" rx="1.5"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <polygon points="6,4 20,12 6,20"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
