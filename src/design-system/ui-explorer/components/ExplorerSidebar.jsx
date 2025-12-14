import * as React from "react"
import { useRouter } from "next/router"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { registry, getGroups, searchItems } from "../registry"
import { cn } from "@/lib/utils"

export function ExplorerSidebar({ activeId }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const groups = getGroups()
  const filteredItems = searchQuery 
    ? searchItems(searchQuery)
    : registry
  
  const handleItemClick = (id) => {
    router.push(`/ui-library?view=${id}`, undefined, { shallow: true })
  }
  
  return (
    <div className="w-64 border-r border-border bg-surface flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => {
          const groupItems = filteredItems.filter(item => item.group === group)
          if (groupItems.length === 0) return null
          
          return (
            <div key={group} className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group}
              </div>
              {groupItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm transition-colors duration-normal ease-standard",
                    "hover:bg-state-hover-bg",
                    activeId === item.id
                      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium"
                      : "text-foreground"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

