import * as React from "react"
import { Progress } from "../../../../components/ui/progress"
import { Stack } from "../../../../components/ui/stack"

export default function ProgressDemo() {
  return (
    <Stack gap={4}>
      <div>
        <p className="text-sm text-muted-foreground mb-2">25%</p>
        <Progress value={25} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">50%</p>
        <Progress value={50} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">75%</p>
        <Progress value={75} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">100%</p>
        <Progress value={100} />
      </div>
    </Stack>
  )
}

