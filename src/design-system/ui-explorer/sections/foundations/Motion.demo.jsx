import * as React from "react"
import { Stack } from "@/components/ui/stack"
import { useEffect, useState } from "react"

export default function MotionDemo() {
  const [motionVars, setMotionVars] = useState({})
  
  useEffect(() => {
    const root = document.documentElement
    setMotionVars({
      fast: getComputedStyle(root).getPropertyValue('--motion-fast').trim(),
      normal: getComputedStyle(root).getPropertyValue('--motion-normal').trim(),
      slow: getComputedStyle(root).getPropertyValue('--motion-slow').trim(),
    })
  }, [])
  
  const motions = [
    { name: "Fast", value: motionVars.fast || "150ms", var: "--motion-fast" },
    { name: "Normal", value: motionVars.normal || "250ms", var: "--motion-normal" },
    { name: "Slow", value: motionVars.slow || "350ms", var: "--motion-slow" },
  ]
  
  return (
    <Stack gap={4}>
      <div>
        <h3 className="text-sm font-semibold mb-3">Durations</h3>
        <div className="space-y-2">
          {motions.map((motion) => (
            <div key={motion.name} className="flex items-center gap-4">
              <div className="w-20 text-sm">{motion.name}</div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full animate-pulse"
                    style={{ 
                      animationDuration: motion.value
                    }}
                  />
                </div>
              </div>
              <div className="w-32 text-xs text-muted-foreground">{motion.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3">Easing Functions</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>ease-standard: cubic-bezier(0.4, 0, 0.2, 1)</div>
          <div>ease-emphasized: cubic-bezier(0.2, 0, 0, 1)</div>
          <div>ease-in: cubic-bezier(0.4, 0, 1, 1)</div>
          <div>ease-out: cubic-bezier(0, 0, 0.2, 1)</div>
          <div>ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)</div>
        </div>
      </div>
    </Stack>
  )
}

