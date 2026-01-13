import * as React from "react"
import { useState } from "react"
import { PageHeader } from "../../../../components/ui/page-header"
import { DataToolbar } from "../../../../components/ui/data-toolbar"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/table"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"

export default function EstimatesListDemo() {
  const [searchValue, setSearchValue] = useState("")
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Estimates"
        description="Manage and review customer estimates"
        actions={<Button>New Estimate</Button>}
      />
      
      <DataToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search estimates..."
        filters={
          <>
            <Button variant="outline" size="sm">Filter</Button>
            <Button variant="outline" size="sm">Sort</Button>
          </>
        }
        actions={<Button size="sm">Export</Button>}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estimate #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>EST-001</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell><Badge variant="success">Active</Badge></TableCell>
            <TableCell>2024-01-15</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">View</Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>EST-002</TableCell>
            <TableCell>Jane Smith</TableCell>
            <TableCell><Badge variant="warning">Pending</Badge></TableCell>
            <TableCell>2024-01-14</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">View</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

