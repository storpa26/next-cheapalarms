import * as React from "react"
import { Button } from "../../../../components/ui/button"
import { Stack } from "../../../../components/ui/stack"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs"

export default function ButtonDemo() {
  const [variant, setVariant] = React.useState("default")
  const [size, setSize] = React.useState("default")
  const [disabled, setDisabled] = React.useState(false)
  
  const variantMap = {
    default: "default",
    secondary: "secondary",
    outline: "outline",
    ghost: "ghost",
    destructive: "destructive",
    link: "link",
    gradient: "gradient",
  }
  
  const sizeMap = {
    sm: "sm",
    default: "default",
    lg: "lg",
  }
  
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg">
        <Button
          variant={variantMap[variant]}
          size={sizeMap[size]}
          disabled={disabled}
        >
          Button
        </Button>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Props</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Variant</label>
            <Tabs value={variant} onValueChange={setVariant}>
              <TabsList>
                <TabsTrigger value="default">Default</TabsTrigger>
                <TabsTrigger value="secondary">Secondary</TabsTrigger>
                <TabsTrigger value="outline">Outline</TabsTrigger>
                <TabsTrigger value="ghost">Ghost</TabsTrigger>
                <TabsTrigger value="destructive">Destructive</TabsTrigger>
                <TabsTrigger value="link">Link</TabsTrigger>
                <TabsTrigger value="gradient">Gradient</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Size</label>
            <Tabs value={size} onValueChange={setSize}>
              <TabsList>
                <TabsTrigger value="sm">Small</TabsTrigger>
                <TabsTrigger value="default">Default</TabsTrigger>
                <TabsTrigger value="lg">Large</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              <span className="text-sm">Disabled</span>
            </label>
          </div>
        </CardContent>
      </Card>
      
      {/* All Variants */}
      <div>
        <h3 className="text-sm font-semibold mb-3">All Variants</h3>
        <Stack gap={2}>
          <Stack direction="row" gap={2} className="flex-wrap">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button variant="gradient">Gradient</Button>
          </Stack>
        </Stack>
      </div>
      
      {/* All Sizes */}
      <div>
        <h3 className="text-sm font-semibold mb-3">All Sizes</h3>
        <Stack direction="row" gap={2} className="flex-wrap items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </Stack>
      </div>
    </div>
  )
}

