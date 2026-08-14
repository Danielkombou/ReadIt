import { useCallback, useEffect, useRef, useState } from 'react'

const WORDS_PER_MINUTE = 150
const REFRESH_MS = 200
export const MAX_CHARS = 5000

function estimateDuration(text: string): number {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.round((words / WORDS_PER_MINUTE) * 60))
}

export function useSpeech(initialText: string) {
  const [text, setText] = useState(initialText)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(() => estimateDuration(initialText))
  const timerRef = useRef<number | null>(null)
  const durationRef = useRef(duration)

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    stopTimer()
    setIsPlaying(false)
  }, [stopTimer])

  const play = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    const value = text.trim()
    if (!value) return

    const total = durationRef.current
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value)

    utterance.onstart = () => {
      setIsPlaying(true)
      setCurrentTime(0)
      const startTime = Date.now()
      stopTimer()
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        if (elapsed >= total) {
          setCurrentTime(total)
          setProgress(100)
          stopTimer()
        } else {
          setCurrentTime(Math.floor(elapsed))
          setProgress((elapsed / total) * 100)
        }
      }, REFRESH_MS)
    }

    utterance.onend = () => {
      stopTimer()
      setIsPlaying(false)
      setProgress(100)
      setCurrentTime(total)
    }

    utterance.onerror = () => {
      stopTimer()
      setIsPlaying(false)
    }

    window.speechSynthesis.speak(utterance)
  }, [text, stopTimer])

  const toggle = useCallback(() => {
    if (isPlaying) stop()
    else play()
  }, [isPlaying, play, stop])

  const seekTo = useCallback((seconds: number) => {
    const total = durationRef.current
    const clamped = Math.min(total, Math.max(0, seconds))
    setCurrentTime(clamped)
    setProgress((clamped / total) * 100)
  }, [])

  const skip = useCallback(
    (delta: number) => {
      seekTo(currentTime + delta)
    },
    [currentTime, seekTo],
  )

  const restart = useCallback(() => {
    stop()
    seekTo(0)
  }, [seekTo, stop])

  const finish = useCallback(() => {
    stop()
    setCurrentTime(durationRef.current)
    setProgress(100)
  }, [stop])

  useEffect(() => {
    const next = estimateDuration(text)
    durationRef.current = next
    setDuration(next)
  }, [text])

  useEffect(
    () => () => {
      stop()
    },
    [stop],
  )

  return {
    text,
    setText,
    maxChars: MAX_CHARS,
    isPlaying,
    currentTime,
    progress,
    duration,
    toggle,
    skip,
    seekTo,
    restart,
    finish,
  }
}
