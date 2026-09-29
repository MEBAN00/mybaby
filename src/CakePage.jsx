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

export default function CakePage({ microphone, onMicrophoneRequest, onMicrophoneStart }) {
  const [candles, setCandles] = useState(() => Array(CANDLE_COUNT).fill(true))
  const [micState, setMicState] = useState(microphone.status)
  const intervalRef = useRef(null)
  const litCount = candles.filter(Boolean).length

  const stopListening = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
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

  const startListening = () => {
    stopListening()
    if (!microphone.analyser) return
    onMicrophoneStart?.()
    const frequencies = new Uint8Array(microphone.analyser.frequencyBinCount)
    setMicState('listening')
    intervalRef.current = setInterval(() => {
      microphone.analyser.getByteFrequencyData(frequencies)
      if (isBlowing(frequencies)) {
        setCandles((current) => current.map((lit) => lit && Math.random() > 0.5 ? false : lit))
      }
    }, 200)
  }

  useEffect(() => {
    if (microphone.status === 'granted') startListening()
    else setMicState(microphone.status)
  }, [microphone])

  const relight = () => {
    stopListening()
    setCandles(Array(CANDLE_COUNT).fill(true))
    startListening()
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
          <button className="mic-button" onClick={onMicrophoneRequest} disabled={micState === 'requesting' || micState === 'listening'}>
            <MicrophoneIcon />{micState === 'listening' ? 'Microphone enabled' : micState === 'requesting' ? 'Waiting for permission' : 'Enable microphone'}
          </button>
        )}
        {litCount > 0 && <p className="tap-fallback">No microphone? Tap the cake · {litCount} remaining</p>}
      </div>
    </section>
  )
}
