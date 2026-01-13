import { useRouter } from "next/router"
import { useEffect } from "react"
import { ExplorerLayout } from "../design-system/ui-explorer/components/ExplorerLayout"
import { registry } from "../design-system/ui-explorer/registry"

export default function UILibraryPage() {
  const router = useRouter()
  const viewId = router.query.view || null
  
  // Default to first item if no view selected
  useEffect(() => {
    if (!viewId && registry.length > 0) {
      router.replace(`/ui-library?view=${registry[0].id}`, undefined, { shallow: true })
    }
  }, [viewId, router])
  
  return <ExplorerLayout viewId={viewId} />
}
