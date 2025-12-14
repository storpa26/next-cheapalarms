import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stack } from "@/components/ui/stack"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function CardDemo() {
  const [shadow, setShadow] = React.useState("card")
  const [showHeader, setShowHeader] = React.useState(true)
  const [showFooter, setShowFooter] = React.useState(false)
  
  const shadowMap = {
    none: "shadow-none",
    sm: "shadow-sm",
    card: "shadow-card",
    elevated: "shadow-elevated",
  }
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className={shadowMap[shadow]} style={{ width: "400px" }}>
          {showHeader && (
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is the card content. You can put any content here.
            </p>
          </CardContent>
          {showFooter && (
            <CardFooter>
              <Button variant="outline" size="sm">Action</Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Shadow</label>
            <Tabs value={shadow} onValueChange={setShadow}>
              <TabsList>
                <TabsTrigger value="none">None</TabsTrigger>
                <TabsTrigger value="sm">Small</TabsTrigger>
                <TabsTrigger value="card">Card</TabsTrigger>
                <TabsTrigger value="elevated">Elevated</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showHeader}
                onChange={(e) => setShowHeader(e.target.checked)}
              />
              <span className="text-sm">Show Header</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showFooter}
                onChange={(e) => setShowFooter(e.target.checked)}
              />
              <span className="text-sm">Show Footer</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

