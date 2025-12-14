import * as React from "react"
import { cn } from "@/lib/utils"
import { Stack } from "./stack"
import { Input } from "./input"
import { Button } from "./button"
import { Search, X } from "lucide-react"

/**
 * DataToolbar - Toolbar component for filtering, searching, and managing data
 * 
 * @param {Object} props
 * @param {string} props.searchValue - Current search value
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.searchPlaceholder - Search input placeholder
 * @param {React.ReactNode} props.filters - Optional filter components
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {string} props.className - Additional classes
 */
export function DataToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actions,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between",
        className
      )}
      {...props}
    >
      <div className="flex-1 w-full sm:w-auto">
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 w-full sm:w-64"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <Stack direction="row" gap={2} className="flex-wrap">
        {filters && <div className="flex items-center gap-2">{filters}</div>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </Stack>
    </div>
  )
}

