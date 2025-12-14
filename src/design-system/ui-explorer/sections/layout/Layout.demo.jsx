import * as React from "react"
import { Container } from "@/components/ui/container"
import { Stack } from "@/components/ui/stack"
import { Grid } from "@/components/ui/grid"
import { Spacer } from "@/components/ui/spacer"
import { Divider } from "@/components/ui/divider"

export default function LayoutDemo() {
  return (
    <Stack gap={6}>
      <div>
        <h3 className="text-sm font-semibold mb-3">Container</h3>
        <div className="bg-muted p-4 rounded-lg">
          <Container className="bg-surface border border-border p-4 rounded">
            <p className="text-sm">Container with max-width and responsive padding</p>
          </Container>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Stack</h3>
        <Stack gap={4} className="bg-muted p-4 rounded">
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded text-sm">Item 1</div>
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded text-sm">Item 2</div>
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded text-sm">Item 3</div>
        </Stack>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Grid</h3>
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-muted p-4 rounded text-center text-sm">
              Item {i}
            </div>
          ))}
        </Grid>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3">Spacer & Divider</h3>
        <div className="space-y-4">
          <div>Content above</div>
          <Divider />
          <div>Content below</div>
        </div>
      </div>
    </Stack>
  )
}

