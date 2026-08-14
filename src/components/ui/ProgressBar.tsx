import { memo, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  onSeek: (percent: number) => void
  className?: string
}

export const ProgressBar = memo(function ProgressBar({
  value,
  onSeek,
  className,
}: ProgressBarProps) {
  const seekFromEvent = useCallback(
    (clientX: number, element: HTMLDivElement) => {
      const rect = element.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      onSeek(pct * 100)
    },
    [onSeek],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault()
        onSeek(Math.max(0, value - 5))
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault()
        onSeek(Math.min(100, value + 5))
      }
    },
    [onSeek, value],
  )

  return (
    <div
      role="slider"
      aria-label="Playback progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      className={cn('group relative h-1.5 w-full cursor-pointer rounded-full bg-border', className)}
      onClick={(event) => seekFromEvent(event.clientX, event.currentTarget)}
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-100 ease-linear"
        style={{ width: `${value}%` }}
      >
        <div className="absolute right-0 top-1/2 size-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent ring-2 ring-background" />
      </div>
    </div>
  )
})
