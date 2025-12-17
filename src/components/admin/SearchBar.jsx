import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export function SearchBar({ 
  search, 
  onSearchChange, 
  startDate, 
  onStartDateChange,
  endDate,
  onEndDateChange,
  workflowStatus,
  onWorkflowStatusChange,
  placeholder = "Search..." 
}) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={startDate || ""}
            onChange={(e) => onStartDateChange?.(e.target.value)}
            className="w-auto"
            placeholder="Start Date"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={endDate || ""}
            onChange={(e) => onEndDateChange?.(e.target.value)}
            className="w-auto"
            placeholder="End Date"
          />
        </div>

        {/* Workflow Status Filter */}
        {onWorkflowStatusChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Workflow:</label>
            <Select value={workflowStatus || ""} onValueChange={onWorkflowStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4"
          />
        </div>
      </div>
    </div>
  );
}

