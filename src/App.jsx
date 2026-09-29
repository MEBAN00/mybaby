import { useEffect, useRef, useState } from 'react'
import { keepsake } from './data.js'
import CakePage from './CakePage.jsx'
import { movePage } from './navigation.js'

const pageNames = ['Cover', 'Playlist', 'Photos', 'Letter', 'Wish']
let microphonePermissionRequest

function requestMicrophonePermission() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!navigator.mediaDevices?.getUserMedia || !AudioContext) return Promise.resolve({ status: 'unsupported' })
  microphonePermissionRequest ??= navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      const source = context.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      return { status: 'granted', analyser, context, source, stream }
    })
    .catch(() => ({ status: 'denied' }))
  return microphonePermissionRequest
}

function PlayIcon({ paused = false }) {
  return paused ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6v12M16 6v12" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 9 6-9 6Z" /></svg>
  )
}

function Arrow({ direction }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>
}

function Cover() {
  return (
    <section className="cover page-content" aria-labelledby="cover-title">
      <p className="eyebrow">Volume {keepsake.age}</p>
      <div className="portrait-wrap">
        <div className="portrait-stitch" aria-hidden="true" />
        <img src={keepsake.portrait.src} alt={keepsake.portrait.alt} width="760" height="760" fetchPriority="high" />
      </div>
      <div className="cover-copy">
        <p className="tiny-script" aria-hidden="true">a little book about you</p>
        <h1 id="cover-title">{keepsake.name}</h1>
        <p>twenty-five years, collected by {keepsake.from}</p>
      </div>
      <span className="pressed-sprig" aria-hidden="true">❧</span>
    </section>
  )
}

function Playlist({ activeTrack, isPlaying, onTrack }) {
  return (
    <section className="page-content playlist" aria-labelledby="playlist-title">
      <header className="page-heading">
        <p className="eyebrow">Side A · {keepsake.songs.length} songs</p>
        <h2 id="playlist-title">Songs pressed<br />between pages</h2>
        <p className="intro">Press play, then turn the page. The music will follow.</p>
      </header>
      <ol className="track-list">
        {keepsake.songs.map((song, index) => {
          const current = activeTrack === index
          return (
            <li key={song.title}>
              <button className={`track ${current ? 'is-active' : ''}`} onClick={() => onTrack(index)} aria-label={`${current && isPlaying ? 'Pause' : 'Play'} ${song.title}`} aria-pressed={current && isPlaying}>
                <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="track-copy"><strong>{song.title}</strong><small>{song.artist ? `${song.artist} · ` : ''}{song.length}</small></span>
                <span className="play-button"><PlayIcon paused={current && isPlaying} /></span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Photos({ onOpen }) {
  const [folded, setFolded] = useState(true)

  return (
    <section className="page-content photos-page" aria-labelledby="photos-title">
      <header className="page-heading compact">
        <p className="eyebrow">A paper accordion</p>
        <h2 id="photos-title">Pressed memories</h2>
      </header>
      <div className={`photo-accordion ${folded ? 'is-folded' : ''}`}>
        {keepsake.photos.map((photo, index) => (
          <button className="photo-panel" key={`${photo.caption}-${photo.year}`} onClick={() => onOpen(photo)} style={{ '--i': index }} aria-label={`Open photo: ${photo.caption}, ${photo.year}`}>
            <img src={photo.src} alt="" width="900" height="600" loading={index > 1 ? 'lazy' : 'eager'} />
            <span className="photo-caption">{photo.caption}</span>
            <span className="photo-year">{photo.year}</span>
            <span className="photo-shade" aria-hidden="true" />
          </button>
        ))}
      </div>
      <button className="fold-button" onClick={() => setFolded((value) => !value)} aria-expanded={!folded}>
        {folded ? 'Unfold our photos' : 'Fold them away'}
      </button>
    </section>
  )
}

function Letter() {
  return (
    <section className="page-content letter" aria-labelledby="letter-title">
      <p className="eyebrow">A note for your next chapter</p>
      <h2 id="letter-title">Dear {keepsake.name},</h2>
      <div className="letter-rule" aria-hidden="true" />
      {keepsake.letter.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <p className="sign-off">With all my love,<br /><span>{keepsake.from}</span></p>
      <p className="postscript">P.S. Twenty-five looks beautiful on you.</p>
    </section>
  )
}

function PhotoDialog({ photo, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (photo && !dialog.open) dialog.showModal()
    if (!photo && dialog.open) dialog.close()
  }, [photo])

  return (
    <dialog ref={dialogRef} className="photo-dialog" onClose={onClose} onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}>
      {photo && (
        <figure>
          <button className="dialog-close" onClick={() => dialogRef.current.close()} aria-label="Close full-screen photo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <img src={photo.src} alt={photo.alt} />
          <figcaption><span>{photo.caption}</span><span>{photo.year}</span></figcaption>
        </figure>
      )}
    </dialog>
  )
}

export default function App() {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState('next')
  const [activeTrack, setActiveTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [openPhoto, setOpenPhoto] = useState(null)
  const [microphone, setMicrophone] = useState({ status: 'requesting' })
  const audioRef = useRef(null)
  const touchStart = useRef(null)

  useEffect(() => {
    keepsake.photos.forEach(({ src }) => { const image = new Image(); image.src = src })
    requestMicrophonePermission().then(setMicrophone)
  }, [])

  const retryMicrophone = () => {
    microphonePermissionRequest = undefined
    setMicrophone({ status: 'requesting' })
    requestMicrophonePermission().then(setMicrophone)
  }

  useEffect(() => {
    const handleKey = (event) => {
      if (openPhoto || ['INPUT', 'BUTTON', 'AUDIO'].includes(document.activeElement?.tagName)) return
      if (event.key === 'ArrowRight') changePage(1)
      if (event.key === 'ArrowLeft') changePage(-1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const changePage = (step) => {
    setDirection(step < 0 ? 'back' : 'next')
    setPage((current) => movePage(current, step, pageNames.length))
    requestAnimationFrame(() => document.querySelector('.book')?.focus({ preventScroll: true }))
  }

  const toggleTrack = async (index) => {
    const audio = audioRef.current
    if (activeTrack === index && isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }
    if (activeTrack !== index) {
      audio.src = keepsake.songs[index].src
      setActiveTrack(index)
    }
    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const handlePointerDown = (event) => {
    if (event.target.closest('button, audio, dialog')) {
      touchStart.current = null
      return
    }
    touchStart.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event) => {
    if (!touchStart.current) return
    const dx = event.clientX - touchStart.current.x
    const dy = event.clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.25) return
    if (dx < 0) changePage(1)
    else changePage(-1)
  }

  const pages = [
    <Cover key="cover" />,
    <Playlist key="playlist" activeTrack={activeTrack} isPlaying={isPlaying} onTrack={toggleTrack} />,
    <Photos key="photos" onOpen={setOpenPhoto} />,
    <Letter key="letter" />,
    <CakePage key="wish" microphone={microphone} onMicrophoneRequest={retryMicrophone} onMicrophoneStart={() => audioRef.current?.pause()} />,
  ]

  return (
    <main className="app-shell">
      <a className="skip-link" href="#keepsake-book">Skip to keepsake</a>
      <div className="ambient-note" aria-hidden="true"><span>made with</span><strong>love &amp; a little paper</strong></div>
      <div className="book-wrap">
        <p className="page-status" aria-live="polite">{pageNames[page]} · {page + 1} of {pageNames.length}</p>
        {activeTrack !== null && (
          <button className="now-playing" onClick={() => toggleTrack(activeTrack)} aria-label={`${isPlaying ? 'Pause' : 'Play'} ${keepsake.songs[activeTrack].title}`}>
            <span className={`sound-bars ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true"><i /><i /><i /></span>
            <span><small>{isPlaying ? 'Now playing' : 'Paused'}</small>{keepsake.songs[activeTrack].title}</span>
          </button>
        )}
        <article id="keepsake-book" className={`book turn-${direction}`} tabIndex="-1" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} aria-label={`Keepsake book, ${pageNames[page]} page`}>
          <div className="paper-grain" aria-hidden="true" />
          <div className="page-key" key={page}>{pages[page]}</div>
          <nav className="book-nav" aria-label="Keepsake pages">
            <button className="nav-button back" onClick={() => changePage(-1)} disabled={page === 0}>
              <Arrow direction="left" /> Back
            </button>
            <div className="page-dots" aria-label={`Page ${page + 1} of ${pageNames.length}`}>
              {pageNames.map((name, index) => <span key={name} className={index === page ? 'is-current' : ''} aria-hidden="true" />)}
            </div>
            <button className="nav-button next" onClick={() => changePage(1)}>
              {page === pageNames.length - 1 ? 'Start over' : 'Turn'} <Arrow direction="right" />
            </button>
          </nav>
        </article>
        <p className="swipe-hint">Swipe the paper or use the buttons</p>
      </div>
      <audio ref={audioRef} preload="metadata" onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} />
      <PhotoDialog photo={openPhoto} onClose={() => setOpenPhoto(null)} />
    </main>
  )
}
