import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

export default function JobSchedulingPanel({ jobUuid, onScheduled }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("12:00");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);

  // Fetch staff list
  useEffect(() => {
    if (!jobUuid) return;
    
    const fetchStaff = async () => {
      try {
        const res = await fetch("/api/servicem8/staff");
        if (!res.ok) throw new Error("Failed to fetch staff");
        const data = await res.json();
        if (data.ok && data.staff) {
          setStaff(Array.isArray(data.staff) ? data.staff : [data.staff]);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        toast.error("Failed to load staff list");
      }
    };

    fetchStaff();
  }, [jobUuid]);

  // Fetch existing activities
  useEffect(() => {
    if (!jobUuid) return;

    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetch(`/api/servicem8/jobs/${jobUuid}/activities`);
        if (!res.ok) throw new Error("Failed to fetch activities");
        const data = await res.json();
        if (data.ok && data.activities) {
          setActivities(Array.isArray(data.activities) ? data.activities : [data.activities]);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [jobUuid]);

  const handleSchedule = async () => {
    if (!selectedStaff || !startDate || !endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    // Format dates for ServiceM8 (ISO8601 format: "2024-12-15 09:00:00")
    const startDateTime = `${startDate} ${startTime}:00`;
    const endDateTime = `${endDate} ${endTime}:00`;

    setScheduling(true);
    try {
      const res = await fetch(`/api/servicem8/jobs/${jobUuid}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffUuid: selectedStaff,
          startDate: startDateTime,
          endDate: endDateTime,
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to schedule job");
      }

      toast.success(data.alreadyExists ? "Job already scheduled for this time" : "Job scheduled successfully");
      
      // Refresh activities
      const activitiesRes = await fetch(`/api/servicem8/jobs/${jobUuid}/activities`);
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        if (activitiesData.ok && activitiesData.activities) {
          setActivities(Array.isArray(activitiesData.activities) ? activitiesData.activities : [activitiesData.activities]);
        }
      }

      // Reset form
      setSelectedStaff("");
      setStartDate("");
      setEndDate("");
      
      if (onScheduled) {
        onScheduled(data);
      }
    } catch (error) {
      console.error("Error scheduling job:", error);
      toast.error(error.message || "Failed to schedule job");
    } finally {
      setScheduling(false);
    }
  };

  // Set default dates (today for start, today + 1 day for end)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (!startDate) setStartDate(formatDate(today));
    if (!endDate) setEndDate(formatDate(tomorrow));
  }, []);

  const getStaffName = (staffUuid) => {
    if (!staffUuid) return "Unassigned";
    const staffMember = staff.find((s) => s.uuid === staffUuid);
    if (!staffMember) return staffUuid; // Return UUID if staff member not found
    
    // Use same pattern as line 210 - handle undefined properly
    return staffMember.name 
      || `${staffMember.first_name || ""} ${staffMember.last_name || ""}`.trim() 
      || staffMember.email 
      || "Unknown";
  };

  const formatActivityDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid (not NaN)
      if (isNaN(date.getTime())) {
        console.warn("Invalid date format:", dateStr);
        return null;
      }
      
      // Filter out obviously old test data (before 2020)
      // These are likely test/old data entries from ServiceM8
      if (date.getFullYear() < 2020) {
        return null;
      }
      
      return date.toLocaleString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Date parsing error:", err, dateStr);
      return null;
    }
  };

  // Robust date parsing that handles both "YYYY-MM-DD HH:mm:ss" and ISO8601 formats
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Try parsing as-is first (handles ISO8601: "2026-01-28T09:00:00Z" or "2026-01-28T09:00:00+10:00")
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try replacing space with 'T' for ISO8601-like strings (e.g., "2026-01-28 09:00:00" -> "2026-01-28T09:00:00")
    const isoStr = dateStr.replace(' ', 'T');
    date = new Date(isoStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If still invalid, return null
    console.warn('Failed to parse date:', dateStr);
    return null;
  };

  // Check for scheduling conflicts (overlapping time windows for same staff)
  const checkConflict = (staffUuid, startDateTime, endDateTime) => {
    if (!staffUuid || !startDateTime || !endDateTime) {
      return null;
    }

    const newStart = parseDate(startDateTime);
    const newEnd = parseDate(endDateTime);

    if (!newStart || !newEnd) {
      console.warn('Conflict check: Invalid date format', { startDateTime, endDateTime });
      return null;
    }

    // Get all activities for the selected staff member (from current job only)
    const staffActivities = activities.filter((activity) => {
      const activityStaff = activity.staff_uuid || activity.assigned_to_staff_uuid;
      return activityStaff === staffUuid;
    });

    console.log('Conflict check:', {
      staffUuid,
      newWindow: { start: startDateTime, end: endDateTime, parsed: { start: newStart, end: newEnd } },
      totalActivities: activities.length,
      staffActivitiesCount: staffActivities.length,
    });

    // Check for overlapping time windows
    const conflictingActivities = staffActivities.filter((activity) => {
      const activityStart = activity.start_date || activity.scheduled_start_date;
      const activityEnd = activity.end_date || activity.scheduled_end_date;

      if (!activityStart || !activityEnd) {
        return false;
      }

      const existingStart = parseDate(activityStart);
      const existingEnd = parseDate(activityEnd);

      if (!existingStart || !existingEnd) {
        return false;
      }

      // Check for overlap: newStart < existingEnd && newEnd > existingStart
      const hasOverlap = newStart < existingEnd && newEnd > existingStart;
      
      if (hasOverlap) {
        console.log('⚠️ Conflict detected:', {
          staffUuid,
          newWindow: { start: newStart, end: newEnd },
          existingWindow: { start: existingStart, end: existingEnd },
          activityUuid: activity.uuid,
        });
      }
      
      return hasOverlap;
    });

    if (conflictingActivities.length === 0) {
      console.log('✓ No conflicts found for staff:', staffUuid);
      return null;
    }

    console.warn('⚠️ Found conflicts:', {
      count: conflictingActivities.length,
      conflicts: conflictingActivities.map(a => ({
        uuid: a.uuid,
        start: a.start_date || a.scheduled_start_date,
        end: a.end_date || a.scheduled_end_date,
      })),
    });

    return {
      count: conflictingActivities.length,
      activities: conflictingActivities,
    };
  };

  // Check for conflicts whenever staff or dates change
  useEffect(() => {
    if (!selectedStaff || !startDate || !endDate) {
      setConflictWarning(null);
      return;
    }

    const startDateTime = `${startDate} ${startTime}:00`;
    const endDateTime = `${endDate} ${endTime}:00`;
    
    console.log('Running conflict check:', {
      staffUuid: selectedStaff,
      startDateTime,
      endDateTime,
      activitiesCount: activities.length,
    });
    
    const conflict = checkConflict(selectedStaff, startDateTime, endDateTime);
    setConflictWarning(conflict);
  }, [selectedStaff, startDate, startTime, endDate, endTime, activities]);

  return (
    <Card className="bg-muted/30 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">📅 Schedule Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Activities */}
        {loadingActivities ? (
          <div className="text-sm text-muted-foreground">Loading schedule...</div>
        ) : (() => {
          const filteredActivities = activities.filter((activity) => {
            // Filter out activities with invalid/old dates (test data)
            const start = formatActivityDate(activity.start_date || activity.scheduled_start_date);
            const end = formatActivityDate(activity.end_date || activity.scheduled_end_date);
            return start || end; // Only show activities with at least one valid date
          });

          if (filteredActivities.length === 0) return null;

          const MAX_VISIBLE = 5;
          const visibleActivities = showAllActivities 
            ? filteredActivities 
            : filteredActivities.slice(0, MAX_VISIBLE);
          const hasMore = filteredActivities.length > MAX_VISIBLE;

          return (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Existing Schedule</Label>
              <div className="space-y-2">
                {visibleActivities.map((activity, idx) => (
                  <div
                    key={activity.uuid || idx}
                    className="p-3 rounded-lg bg-background/50 border border-border/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {getStaffName(activity.staff_uuid || activity.assigned_to_staff_uuid)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            const start = formatActivityDate(activity.start_date || activity.scheduled_start_date);
                            const end = formatActivityDate(activity.end_date || activity.scheduled_end_date);
                            if (!start && !end) return "Invalid date";
                            if (!start) return `Until ${end}`;
                            if (!end) return `From ${start}`;
                            return `${start} - ${end}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  className="w-full mt-2"
                >
                  {showAllActivities 
                    ? "Show less" 
                    : `Show ${filteredActivities.length - MAX_VISIBLE} more`}
                </Button>
              )}
            </div>
          );
        })()}

        {/* Conflict Warning */}
        {conflictWarning && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex items-start gap-2">
              <Badge variant="warning" className="shrink-0">⚠️ Conflict</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-warning-foreground">
                  This staff member already has {conflictWarning.count} scheduling{conflictWarning.count > 1 ? 's' : ''} for this time period
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can still schedule, but this may cause double-booking. Please verify in ServiceM8.
                </p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Note: Conflicts are only checked within this job. Check ServiceM8 for cross-job conflicts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Form */}
        <div className="space-y-4 pt-2 border-t border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Assign To</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.uuid} value={member.uuid}>
                      {member.name || `${member.first_name || ""} ${member.last_name || ""}`.trim() || member.email || member.uuid}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSchedule}
            disabled={scheduling || !selectedStaff || !startDate || !endDate}
            className="w-full"
          >
            {scheduling ? "Scheduling..." : "Schedule Job"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
