import * as React from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/table"
import { Badge } from "../../../../components/ui/badge"
import { Button } from "../../../../components/ui/button"

export default function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell><Badge variant="success">Active</Badge></TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">Edit</Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell><Badge variant="warning">Pending</Badge></TableCell>
          <TableCell>User</TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">Edit</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

