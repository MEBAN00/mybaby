import { useEffect, useRef, useState } from 'react'
import { isBlowing } from './blowDetection.js'

const CANDLE_COUNT = 9

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" />
    </svg>
  )
}

export default function CakePage({ microphonePermission, onMicrophoneStart }) {
  const [candles, setCandles] = useState(() => Array(CANDLE_COUNT).fill(true))
  const [micState, setMicState] = useState(microphonePermission === 'requesting' ? 'requesting' : 'idle')
  const streamRef = useRef(null)
  const contextRef = useRef(null)
  const intervalRef = useRef(null)
  const litCount = candles.filter(Boolean).length

  const stopListening = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    contextRef.current?.close()
    intervalRef.current = null
    streamRef.current = null
    contextRef.current = null
  }

  useEffect(() => stopListening, [])

  const extinguish = (amount = 1) => {
    setCandles((current) => {
      const next = [...current]
      const lit = next.flatMap((on, index) => on ? [index] : [])
      lit.slice(0, amount).forEach((index) => { next[index] = false })
      return next
    })
  }

  useEffect(() => {
    if (litCount !== 0 || micState === 'complete') return
    stopListening()
    setMicState('complete')
  }, [litCount, micState])

  const startMicrophone = async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!navigator.mediaDevices?.getUserMedia || !AudioContext) {
      setMicState('unsupported')
      return
    }

    stopListening()
    setMicState('requesting')
    onMicrophoneStart?.()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      const source = context.createMediaStreamSource(stream)
      const frequencies = new Uint8Array(analyser.frequencyBinCount)

      analyser.fftSize = 256
      source.connect(analyser)
      streamRef.current = stream
      contextRef.current = context
      setMicState('listening')

      intervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(frequencies)
        if (isBlowing(frequencies)) {
          setCandles((current) => current.map((lit) => lit && Math.random() > 0.5 ? false : lit))
        }
      }, 200)
    } catch {
      stopListening()
      setMicState('denied')
    }
  }

  useEffect(() => {
    if (microphonePermission === 'granted' && micState !== 'listening' && micState !== 'complete') {
      startMicrophone()
    } else if (microphonePermission === 'denied') {
      setMicState('denied')
    } else if (microphonePermission === 'unsupported') {
      setMicState('unsupported')
    } else if (microphonePermission === 'requesting') {
      setMicState('requesting')
    }
  }, [microphonePermission])

  const relight = () => {
    stopListening()
    setCandles(Array(CANDLE_COUNT).fill(true))
    setMicState('idle')
  }

  const status = {
    idle: 'Enable your microphone, make a wish, then blow.',
    requesting: 'Waiting for microphone permission…',
    listening: 'Listening — blow toward your microphone.',
    denied: "The microphone wasn't enabled. You can allow it in your browser or tap the cake.",
    unsupported: "This browser can't use the microphone here. Tap the cake instead.",
    complete: 'All nine are out. Your wish is on its way.',
  }[micState]

  return (
    <section className="page-content wish-page" aria-labelledby="wish-title">
      <header className="page-heading compact">
        <p className="eyebrow">One last birthday ritual</p>
        <h2 id="wish-title">Make a wish</h2>
        <p className="intro">Nine little flames. One very important wish.</p>
      </header>

      <button className={`cake-stage ${micState === 'complete' ? 'is-complete' : ''}`} onClick={() => extinguish(1)} disabled={litCount === 0} aria-label={`Cake with ${litCount} of ${CANDLE_COUNT} candles still lit. Tap to blow one out.`}>
        <span className="wish-confetti" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} style={{ '--i': index }} />)}</span>
        <span className="cake-illustration" aria-hidden="true">
          <span className="cake-candles">
            {candles.map((lit, index) => (
              <i className={`wish-candle ${lit ? 'is-lit' : 'is-out'}`} key={index}>
                <b className="wish-flame" />
              </i>
            ))}
          </span>
          <span className="cake-top"><i /><i /><i /></span>
          <span className="cake-layer cake-layer-one" />
          <span className="cake-layer cake-layer-two" />
          <span className="cake-plate" />
        </span>
      </button>

      <div className="wish-controls">
        <p className={`mic-status is-${micState}`} role="status" aria-live="polite">
          <span className="status-dot" aria-hidden="true" />{status}
        </p>
        {micState === 'complete' ? (
          <button className="mic-button" onClick={relight}>Relight the candles</button>
        ) : (
          <button className="mic-button" onClick={startMicrophone} disabled={micState === 'requesting' || micState === 'listening'}>
            <MicrophoneIcon />{micState === 'listening' ? 'Microphone enabled' : micState === 'requesting' ? 'Waiting for permission' : 'Enable microphone'}
          </button>
        )}
        {litCount > 0 && <p className="tap-fallback">No microphone? Tap the cake · {litCount} remaining</p>}
      </div>
    </section>
  )
}
