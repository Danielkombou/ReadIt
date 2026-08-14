import { memo } from 'react'
import { Card } from './ui/Card'

interface TextAreaCardProps {
  text: string
  maxChars: number
  onChange: (value: string) => void
}

export const TextAreaCard = memo(function TextAreaCard({
  text,
  maxChars,
  onChange,
}: TextAreaCardProps) {
  return (
    <Card className="flex min-h-0 w-full flex-1 flex-col p-6">
      <textarea
        value={text}
        onChange={(event) => onChange(event.target.value.slice(0, maxChars))}
        placeholder="Paste your text here or type..."
        maxLength={maxChars}
        spellCheck={false}
        className="min-h-0 w-full flex-1 resize-none bg-transparent text-foreground outline-none placeholder:text-muted/70"
      />
      <div className="mt-3 self-end font-mono text-xs text-muted">
        {text.length} / {maxChars}
      </div>
    </Card>
  )
})