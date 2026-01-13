import * as React from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { cn } from "../../../lib/utils"

export function CodeBlock({ code, language = "jsx" }) {
  const [copied, setCopied] = React.useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }
  
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm border border-border">
        <code className="text-foreground font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

