import * as React from "react"
import { useState } from "react"
import { DataToolbar } from "@/components/ui/data-toolbar"
import { Button } from "@/components/ui/button"

export default function DataToolbarDemo() {
  const [searchValue, setSearchValue] = useState("")
  
  return (
    <DataToolbar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search items..."
      filters={
        <>
          <Button variant="outline" size="sm">Filter</Button>
          <Button variant="outline" size="sm">Sort</Button>
        </>
      }
      actions={
        <Button size="sm">Add New</Button>
      }
    />
  )
}

