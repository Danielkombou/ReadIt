import { useState, useRef, useEffect } from 'react'
import './App.css'

const DEFAULT_TEXT = `Reading is to the mind what exercise is to the body.
It strengthens, nourishes, and expands it.
The more you read, the more things you will know.
The more that you learn, the more places you'll go.`

export default function App() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timerRef = useRef<number | null>(null)

  const charCount = text.length
  const maxChars = 5000

  // Calculate approximate duration based on word count (avg 150 words per minute)
  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const estSeconds = Math.max(1, Math.round((words / 150) * 60))
    setDuration(estSeconds)
  }, [text])

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.')
      return
    }

    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      if (!text.trim()) return
      
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      utterance.onstart = () => {
        setIsPlaying(true)
        setCurrentTime(0)
        const startTime = Date.now()

        timerRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000
          if (elapsed >= duration) {
            setCurrentTime(duration)
            setProgress(100)
            if (timerRef.current) clearInterval(timerRef.current)
          } else {
            setCurrentTime(Math.floor(elapsed))
            setProgress((elapsed / duration) * 100)
          }
        }, 200)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setProgress(100)
        setCurrentTime(duration)
        if (timerRef.current) clearInterval(timerRef.current)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        if (timerRef.current) clearInterval(timerRef.current)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSkipTime = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)))
    // Note: Web Speech API doesn't support seeking directly, but we can restart or adjust. For simple UI responsiveness:
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`
  }

  return (
    <div className="readit-container">
      {/* Header Card */}
      <header className="readit-header-card">
        <div className="brand">
          <svg className="speaker-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <span className="brand-title">ReadIt</span>
        </div>
        <button className="theme-toggle-btn" aria-label="Toggle theme" onClick={() => {
          document.documentElement.classList.toggle('dark')
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </header>

      {/* Textarea Card */}
      <div className="readit-text-card">
        <textarea
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= maxChars) {
              setText(e.target.value)
            }
          }}
          placeholder="Paste your text here or type..."
          rows={7}
          maxLength={maxChars}
        />
        <div className="char-counter">
          {charCount} / {maxChars}
        </div>
      </div>

      {/* Sound Control Card */}
      <div className="readit-control-card">
        <div className="audio-controls">
          <button className="control-btn" title="Previous" onClick={() => {
            window.speechSynthesis.cancel()
            setIsPlaying(false)
            setCurrentTime(0)
            setProgress(0)
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
          
          <button className="control-btn" title="Rewind 10s" onClick={() => handleSkipTime(-10)}>
            <div className="icon-with-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span className="badge-num">10</span>
            </div>
          </button>

          <button className="play-pause-btn" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <button className="control-btn" title="Forward 10s" onClick={() => handleSkipTime(10)}>
            <div className="icon-with-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
              </svg>
              <span className="badge-num">10</span>
            </div>
          </button>

          <button className="control-btn" title="Next" onClick={() => {
            window.speechSynthesis.cancel()
            setIsPlaying(false)
            setCurrentTime(duration)
            setProgress(100)
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
        </div>

        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="progress-bar-container">
          <div 
            className="progress-bar-track"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickX = e.clientX - rect.left
              const width = rect.width
              const pct = Math.max(0, Math.min(1, clickX / width))
              setProgress(pct * 100)
              setCurrentTime(Math.floor(pct * duration))
            }}
          >
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
              <div className="progress-thumb"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="readit-footer">
        Listen to more. Learn more. <span className="heart">💜</span>
      </footer>
    </div>
  )
}
