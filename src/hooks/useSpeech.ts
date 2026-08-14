import { useCallback, useEffect, useRef, useState } from 'react'

const WORDS_PER_MINUTE = 150
const REFRESH_MS = 200
export const MAX_CHARS = 5000

function stripEmoji(text: string): string {
  return text
    .replace(/\u{1F3FB}/gu, '')
    .replace(/\u{1F3FC}/gu, '')
    .replace(/\u{1F3FD}/gu, '')
    .replace(/\u{1F3FE}/gu, '')
    .replace(/\u{1F3FF}/gu, '')
    .replace(/\u200D/gu, '')
    .replace(/\uFE0F/gu, '')
    .replace(/\u20E3/gu, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
}

function estimateDuration(text: string): number {
  const spoken = stripEmoji(text)
  const words = spoken.trim() ? spoken.trim().split(/\s+/).length : 0
  return Math.max(1, Math.round((words / WORDS_PER_MINUTE) * 60))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  const langBase = (navigator.language || 'en').split('-')[0].toLowerCase()
  const natural = /natural|neural|premium|enhanced|online/i
  let best: SpeechSynthesisVoice | null = null
  let bestScore = -1
  for (const voice of voices) {
    let score = 0
    if (voice.lang.toLowerCase().startsWith(langBase)) score += 4
    if (natural.test(voice.name)) score += 3
    if (/google/i.test(voice.name)) score += 2
    if (voice.default) score += 1
    if (score > bestScore) {
      bestScore = score
      best = voice
    }
  }
  return best
}

export function useSpeech(initialText: string) {
  const [text, setText] = useState(initialText)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const timerRef = useRef<number | null>(null)
  const baseOffsetRef = useRef(0)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  const duration = estimateDuration(text)

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const updateVoice = () => {
      const best = pickBestVoice(synth.getVoices())
      if (best) voiceRef.current = best
    }
    updateVoice()
    synth.addEventListener?.('voiceschanged', updateVoice)
    return () => synth.removeEventListener?.('voiceschanged', updateVoice)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    stopTimer()
    setIsPlaying(false)
  }, [stopTimer])

  const speakFrom = useCallback(
    (startSeconds: number) => {
      if (!('speechSynthesis' in window)) return
      const value = stripEmoji(text).trim()
      if (!value) return
      const total = estimateDuration(value)
      const startClamped = clamp(startSeconds, 0, total)
      const base = Math.floor((startClamped / total) * value.length)
      const remaining = value.slice(base).trim()
      if (!remaining) {
        setCurrentTime(total)
        setProgress(100)
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(remaining)
      if (voiceRef.current) utterance.voice = voiceRef.current
      baseOffsetRef.current = base

      utterance.onstart = () => {
        setIsPlaying(true)
        const startWall = Date.now()
        setCurrentTime(startClamped)
        setProgress((startClamped / total) * 100)
        stopTimer()
        timerRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - startWall) / 1000
          const t = Math.min(total, startClamped + elapsed)
          setCurrentTime(t)
          setProgress((t / total) * 100)
        }, REFRESH_MS)
      }

      utterance.onboundary = (event) => {
        const absolute = baseOffsetRef.current + event.charIndex
        const ratio = value.length ? absolute / value.length : 0
        setCurrentTime(ratio * total)
        setProgress(ratio * 100)
      }

      utterance.onend = () => {
        stopTimer()
        setIsPlaying(false)
        setCurrentTime(total)
        setProgress(100)
      }

      utterance.onerror = () => {
        stopTimer()
        setIsPlaying(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [stopTimer, text],
  )

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop()
    } else {
      speakFrom(currentTime >= duration ? 0 : currentTime)
    }
  }, [currentTime, duration, isPlaying, speakFrom, stop])

  const seekTo = useCallback(
    (seconds: number) => {
      const total = estimateDuration(text)
      const clamped = clamp(seconds, 0, total)
      if (isPlaying) {
        speakFrom(clamped)
      } else {
        setCurrentTime(clamped)
        setProgress((clamped / total) * 100)
      }
    },
    [isPlaying, speakFrom, text],
  )

  const skip = useCallback(
    (delta: number) => {
      seekTo(currentTime + delta)
    },
    [currentTime, seekTo],
  )

  const restart = useCallback(() => {
    seekTo(0)
  }, [seekTo])

  const finish = useCallback(() => {
    stop()
    setCurrentTime(duration)
    setProgress(100)
  }, [duration, stop])

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
