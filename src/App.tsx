import { useSpeech } from './hooks/useSpeech'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { TextAreaCard } from './components/TextAreaCard'
import { AudioControls } from './components/AudioControls'
import { Footer } from './components/Footer'

const DEFAULT_TEXT = `Reading is to the mind what exercise is to the body.
It strengthens, nourishes, and expands it.
The more you read, the more things you will know.
The more that you learn, the more places you'll go.`

export default function App() {
  const { isDark, toggleTheme } = useTheme()
  const speech = useSpeech(DEFAULT_TEXT)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-muted">
      <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />

        <TextAreaCard text={speech.text} maxChars={speech.maxChars} onChange={speech.setText} />

        <AudioControls
          isPlaying={speech.isPlaying}
          currentTime={speech.currentTime}
          duration={speech.duration}
          progress={speech.progress}
          onToggle={speech.toggle}
          onSkip={speech.skip}
          onSeek={speech.seekTo}
          onRestart={speech.restart}
          onFinish={speech.finish}
        />

        <Footer />
      </div>
    </div>
  )
}
