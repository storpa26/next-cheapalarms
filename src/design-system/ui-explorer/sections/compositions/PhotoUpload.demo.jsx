import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stack } from "@/components/ui/stack"
import { Camera, CheckCircle2 } from "lucide-react"

export default function PhotoUploadDemo() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Photo Upload"
        description="Upload photos for your estimate items"
      />
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">3 of 5 items</span>
        </div>
        <Progress value={60} />
      </div>
      
      <Stack gap={4}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kitchen Sensors</CardTitle>
              <Badge variant="success">Complete</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              3 photos uploaded
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Front Door</CardTitle>
              <Badge variant="warning">Pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" />
              0 photos uploaded
            </div>
          </CardContent>
        </Card>
      </Stack>
    </div>
  )
}

