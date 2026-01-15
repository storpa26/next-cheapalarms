import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
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
    const staffMember = staff.find((s) => s.uuid === staffUuid);
    return staffMember ? (staffMember.name || staffMember.first_name + " " + staffMember.last_name || "Unknown") : staffUuid;
  };

  const formatActivityDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-muted/30 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">📅 Schedule Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Activities */}
        {loadingActivities ? (
          <div className="text-sm text-muted-foreground">Loading schedule...</div>
        ) : activities.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Existing Schedule</Label>
            <div className="space-y-2">
              {activities.map((activity, idx) => (
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
                        {formatActivityDate(activity.start_date || activity.scheduled_start_date)} - {formatActivityDate(activity.end_date || activity.scheduled_end_date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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
