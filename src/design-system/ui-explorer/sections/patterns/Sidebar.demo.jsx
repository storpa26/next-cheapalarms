import * as React from "react"
import {
  LayoutDashboard,
  Package,
  FileText,
  Receipt,
  Mail,
  Users,
  Settings,
  Plug,
  ScrollText,
  Sparkles,
  ListChecks,
  CreditCard,
  MessageCircle,
  Monitor,
  Smartphone,
  Menu,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card"
import { Stack } from "../../../../components/ui/stack"
import { Radio } from "../../../../components/ui/radio"
import { Button } from "../../../../components/ui/button"
import { Sidebar } from "../../../../components/ui/sidebar"
import { cn } from "../../../../lib/utils"

// Admin navigation items
const ADMIN_NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin", badge: null },
  { label: "Products", icon: Package, href: "/admin/products", badge: null },
  { label: "Estimates", icon: FileText, href: "/admin/estimates", badge: 3 },
  { label: "Invoices", icon: Receipt, href: "/admin/invoices", badge: null },
  { label: "Invites", icon: Mail, href: "/admin/invites", badge: 2 },
  { label: "Customers", icon: Users, href: "/admin/customers", badge: null },
  { label: "Settings", icon: Settings, href: "/admin/settings", badge: null },
  { label: "Integrations", icon: Plug, href: "/admin/integrations", badge: null },
  { label: "Logs", icon: ScrollText, href: "/admin/logs", badge: null },
]

// Customer navigation items
const CUSTOMER_NAV_ITEMS = [
  { label: "Overview", icon: Sparkles, href: "/portal", badge: null },
  { label: "Estimates", icon: ListChecks, href: "/portal?nav=estimates", badge: null },
  { label: "Payments", icon: CreditCard, href: "/portal?nav=payments", badge: null },
  { label: "Support", icon: MessageCircle, href: "/portal?nav=support", badge: 1 },
  { label: "Preferences", icon: Settings, href: "/portal?nav=preferences", badge: null },
]

export default function SidebarDemo() {
  const [variant, setVariant] = React.useState("minimal")
  const [navType, setNavType] = React.useState("admin")
  const [activeItem, setActiveItem] = React.useState(ADMIN_NAV_ITEMS[0].href)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState("desktop")

  const navItems = navType === "admin" ? ADMIN_NAV_ITEMS : CUSTOMER_NAV_ITEMS
  const title = navType === "admin" ? "Admin Portal" : "Customer Portal"
  const subtitle = navType === "admin" ? "Superadmin" : "Operations & concierge"

  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
    status: "online",
  }

  React.useEffect(() => {
    setActiveItem(navItems[0].href)
  }, [navType, navItems])

  const variants = [
    { value: "minimal", label: "Minimal Gradient" },
    { value: "glass", label: "Glassmorphism" },
    { value: "gradient", label: "Brand Gradient" },
    { value: "compact", label: "Compact" },
    { value: "elevated", label: "Elevated Card" },
    { value: "split", label: "Split Design" },
  ]

  return (
    <div className="space-y-6">
      {/* Main Preview and Controls - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Preview Section - Left Side */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              Interactive sidebar preview. Resize your browser or use the view mode toggle to see mobile behavior.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* View Mode Toggle */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">View Mode:</span>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("desktop")}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </Button>
                  <Button
                    variant={viewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("mobile")}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
              {viewMode === "mobile" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? "Close Menu" : "Open Menu"}
                </Button>
              )}
            </div>

            {/* Preview Container */}
            <div
              className={cn(
                "relative rounded-lg border border-border bg-muted/30 p-4",
                viewMode === "mobile" ? "overflow-hidden max-w-sm mx-auto" : "overflow-hidden"
              )}
              style={{ minHeight: "600px", position: "relative" }}
            >
              {/* Mobile Menu Button - Only show when sidebar is closed */}
              {viewMode === "mobile" && !mobileOpen && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMobileOpen(true)
                  }}
                  className="absolute left-4 top-4 z-50 rounded-full bg-gradient-to-r from-primary to-secondary p-3 shadow-lg transition-all hover:shadow-xl"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-primary-foreground" />
                </button>
              )}

              {/* Sidebar */}
              <div
                className={cn(
                  viewMode === "mobile" && "h-full w-full",
                  viewMode === "desktop" && "flex-shrink-0 relative"
                )}
              >
                <Sidebar
                  variant={variant}
                  navItems={navItems}
                  activeItem={activeItem}
                  title={title}
                  subtitle={subtitle}
                  user={user}
                  forceMobile={viewMode === "mobile"}
                  inContainer={true}
                  hideMobileButton={true}
                  mobileOpen={viewMode === "mobile" ? mobileOpen : undefined}
                  onMobileOpenChange={viewMode === "mobile" ? setMobileOpen : undefined}
                  onNavChange={setActiveItem}
                />
              </div>
            </div>

            {/* Mobile Instructions */}
            {viewMode === "mobile" && (
              <div className="mt-4 p-4 bg-info-bg border border-info/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Mobile Mode:</strong> The sidebar is hidden by default on mobile. Click "Open Menu" above or use the hamburger button to open it. On mobile, the sidebar slides in from the left as a drawer overlay.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Controls - Right Side */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Customize the sidebar design variant and navigation type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stack gap={6}>
                {/* Variant Selection */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Design Variant</label>
                  <div className="space-y-2">
                    {variants.map((v) => (
                      <label
                        key={v.value}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                          variant === v.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Radio
                          name="variant"
                          value={v.value}
                          checked={variant === v.value}
                          onChange={() => setVariant(v.value)}
                        />
                        <span className="text-sm font-medium">{v.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation Type */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Navigation Type</label>
                  <div className="space-y-2">
                    <label
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                        navType === "admin"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Radio
                        name="navType"
                        value="admin"
                        checked={navType === "admin"}
                        onChange={() => setNavType("admin")}
                      />
                      <span className="text-sm">Admin Portal</span>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                        navType === "customer"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Radio
                        name="navType"
                        value="customer"
                        checked={navType === "customer"}
                        onChange={() => setNavType("customer")}
                      />
                      <span className="text-sm">Customer Portal</span>
                    </label>
                  </div>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variant Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Minimal Gradient</h4>
              <p className="text-muted-foreground">
                Clean white background with gradient left border on active items. Subtle and professional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Glassmorphism</h4>
              <p className="text-muted-foreground">
                Frosted glass effect with backdrop blur. Modern and elegant with depth.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Brand Gradient</h4>
              <p className="text-muted-foreground">
                Full brand gradient sidebar background. Active items have white gradient background. Bold and branded.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Compact</h4>
              <p className="text-muted-foreground">
                Space-efficient design with smaller padding. Perfect for dense navigation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Elevated Card</h4>
              <p className="text-muted-foreground">
                Sidebar as elevated card with rounded corners. Active items have full gradient. Premium feel.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Split Design</h4>
              <p className="text-muted-foreground">
                Clear visual hierarchy with gradient header section and elevated user footer. Professional structure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
