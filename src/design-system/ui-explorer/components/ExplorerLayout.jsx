import * as React from "react"
import { ExplorerSidebar } from "./ExplorerSidebar"
import { ExplorerHeader } from "./ExplorerHeader"
import { PreviewFrame } from "./PreviewFrame"
import { CodeBlock } from "./CodeBlock"
import { getItemById } from "../registry"

export function ExplorerLayout({ viewId }) {
  const item = viewId ? getItemById(viewId) : null
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ExplorerSidebar activeId={viewId} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {item ? (
          <>
            <ExplorerHeader item={item} />
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Description */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                
                {/* Preview */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Preview</h3>
                  <PreviewFrame>
                    <item.DemoComponent />
                  </PreviewFrame>
                </div>
                
                {/* Code Snippet */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Usage</h3>
                  <CodeBlock code={item.code} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2 text-foreground">Welcome to UI Explorer</h2>
              <p className="text-muted-foreground">Select an item from the sidebar to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

