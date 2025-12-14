import * as React from "react"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DialogDemo() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Dialog Title</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This is a dialog example. Click outside or close button to dismiss.
          </p>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </Dialog>
    </div>
  )
}

