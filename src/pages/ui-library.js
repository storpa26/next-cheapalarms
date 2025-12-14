import { useRouter } from "next/router"
import { useEffect } from "react"
import { ExplorerLayout } from "@/design-system/ui-explorer/components/ExplorerLayout"
import { registry } from "@/design-system/ui-explorer/registry"

export default function UILibraryPage() {
  const router = useRouter()
  const viewId = router.query.view || null
  
  // Gate: dev-only
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-foreground">404</h1>
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    )
  }
  
  // Default to first item if no view selected
  useEffect(() => {
    if (!viewId && registry.length > 0) {
      router.replace(`/ui-library?view=${registry[0].id}`, undefined, { shallow: true })
    }
  }, [viewId, router])
  
  return <ExplorerLayout viewId={viewId} />
}
