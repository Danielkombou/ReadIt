import { useCallback, useEffect, useState } from 'react'
import { track } from '../lib/analytics'

type ThemeMode = 'system' | 'light' | 'dark'

const THEME_KEY = 'readit-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'system'
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY)
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const isDark = mode === 'system' ? systemDark : mode === 'dark'

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = isDark ? 'light' : 'dark'
    setMode(next)
    window.localStorage.setItem(THEME_KEY, next)
    track('theme_toggle', { theme: next })
  }, [isDark])

  return { isDark, mode, toggleTheme }
}
