import { memo } from 'react'
import { Heart } from 'lucide-react'

export const Footer = memo(function Footer() {
  return (
    <footer className="flex items-center justify-center gap-1.5 text-sm text-muted">
      Listen to more. Learn more.
      <Heart className="size-4 fill-current text-accent" aria-hidden="true" />
    </footer>
  )
})