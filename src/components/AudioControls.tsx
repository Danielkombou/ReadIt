import { memo } from 'react'
import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react'
import { Card } from './ui/Card'
import { IconButton } from './ui/IconButton'
import { ProgressBar } from './ui/ProgressBar'
import { formatTime } from '../lib/utils'

interface AudioControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  progress: number
  onToggle: () => void
  onSkip: (delta: number) => void
  onSeek: (seconds: number) => void
  onRestart: () => void
  onFinish: () => void
}

function SkipIcon({ forward }: { forward: boolean }) {
  const Icon = forward ? RotateCw : RotateCcw
  return (
    <span className="relative grid size-5 place-items-center" aria-hidden="true">
      <Icon className="size-5" />
      <span className="absolute text-[7px] font-bold leading-none tracking-tight">10</span>
    </span>
  )
}

export const AudioControls = memo(function AudioControls({
  isPlaying,
  currentTime,
  duration,
  progress,
  onToggle,
  onSkip,
  onSeek,
  onRestart,
  onFinish,
}: AudioControlsProps) {
  return (
    <Card className="flex w-full flex-col items-center gap-4 px-6 py-7">
      <div className="flex items-center gap-8">
        <IconButton
          className="p-2"
          onClick={onRestart}
          aria-label="Restart"
          title="Restart"
        >
          <SkipBack className="size-5" />
        </IconButton>

        <IconButton
          className="p-2"
          onClick={() => onSkip(-10)}
          aria-label="Rewind 10 seconds"
          title="Rewind 10 seconds"
        >
          <SkipIcon forward={false} />
        </IconButton>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
          className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-accent text-background shadow-accent transition-[filter,transform] hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isPlaying ? <Pause className="size-6" /> : <Play className="size-6" />}
        </button>

        <IconButton
          className="p-2"
          onClick={() => onSkip(10)}
          aria-label="Forward 10 seconds"
          title="Forward 10 seconds"
        >
          <SkipIcon forward />
        </IconButton>

        <IconButton
          className="p-2"
          onClick={onFinish}
          aria-label="Skip to end"
          title="Skip to end"
        >
          <SkipForward className="size-5" />
        </IconButton>
      </div>

      <div className="font-mono text-sm text-muted">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <ProgressBar value={progress} onSeek={(pct) => onSeek((pct / 100) * duration)} />
    </Card>
  )
})