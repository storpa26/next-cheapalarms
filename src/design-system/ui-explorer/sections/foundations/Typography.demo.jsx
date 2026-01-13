import * as React from "react"
import { Stack } from "../../../../components/ui/stack"

export default function TypographyDemo() {
  return (
    <Stack gap={6}>
      <div>
        <h3 className="text-sm font-semibold mb-3">Headings</h3>
        <Stack gap={2}>
          <h1 className="text-4xl font-bold text-foreground">Heading 1 (text-4xl)</h1>
          <h2 className="text-3xl font-bold text-foreground">Heading 2 (text-3xl)</h2>
          <h3 className="text-2xl font-semibold text-foreground">Heading 3 (text-2xl)</h3>
          <h4 className="text-xl font-semibold text-foreground">Heading 4 (text-xl)</h4>
        </Stack>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3">Body Text</h3>
        <Stack gap={2}>
          <p className="text-base text-foreground">Base text (text-base) - The quick brown fox jumps over the lazy dog</p>
          <p className="text-sm text-foreground">Small text (text-sm) - The quick brown fox jumps over the lazy dog</p>
          <p className="text-xs text-foreground">Extra small (text-xs) - The quick brown fox jumps over the lazy dog</p>
          <p className="text-sm text-muted-foreground">Muted text (text-muted-foreground) - The quick brown fox jumps over the lazy dog</p>
        </Stack>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3">Font Weights</h3>
        <Stack gap={2}>
          <p className="font-normal text-foreground">Normal (font-normal)</p>
          <p className="font-medium text-foreground">Medium (font-medium)</p>
          <p className="font-semibold text-foreground">Semibold (font-semibold)</p>
          <p className="font-bold text-foreground">Bold (font-bold)</p>
        </Stack>
      </div>
    </Stack>
  )
}

