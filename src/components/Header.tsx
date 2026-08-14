import { memo } from 'react'
import { Moon, Sun, Volume2 } from 'lucide-react'
import { Card } from './ui/Card'
import { IconButton } from './ui/IconButton'

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
}

export const Header = memo(function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <Card className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2.5">
        <Volume2 className="size-6 text-accent" />
        <span className="text-lg font-semibold text-foreground">ReadIt</span>
      </div>
      <IconButton
        className="p-2"
        onClick={onToggleTheme}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </IconButton>
    </Card>
  )
})