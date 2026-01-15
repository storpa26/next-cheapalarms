"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export default function CompanyDetailModal({ company, open, onClose }) {
  const [now, setNow] = useState(null);

  // Get current time on client-side only (SSR-safe)
  useEffect(() => {
    setNow(Date.now());
  }, []);

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="p-6">
          <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{company.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {company.contactName}
              </DialogDescription>
            </div>
            {company.activeJobs > 0 && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                {company.activeJobs} active jobs
              </Badge>
            )}
          </div>
          </DialogHeader>

          <div className="space-y-6 pt-6">
          {/* Contact Information */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Contact Name:</span>
                  <p className="font-medium text-foreground mt-1">{company.contactName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium text-foreground mt-1">{company.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium text-foreground mt-1">{company.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-foreground">📍 Address</h3>
              <p className="text-foreground">
                {company.address}
                <br />
                {company.city}, {company.state} {company.postcode}
              </p>
            </CardContent>
          </Card>

          {/* Job Statistics */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Job Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-foreground">{company.totalJobs}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Jobs</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-foreground">{company.activeJobs}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active Jobs</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-2xl font-bold text-foreground">
                    {company.totalJobs - company.activeJobs}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Job:</span>
                  <span className="font-medium text-foreground">
                    {(() => {
                      // SSR-safe date formatting
                      const date = new Date(company.lastJobDate);
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const month = months[date.getUTCMonth()];
                      const day = date.getUTCDate();
                      const year = date.getUTCFullYear();
                      return `${day} ${month} ${year}`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Days Since Last Job:</span>
                  <span className="font-medium text-foreground">
                    {now !== null
                      ? `${Math.floor((now - new Date(company.lastJobDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job History Preview */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 text-foreground">Job History</h3>
              <div className="space-y-2">
                {now !== null
                  ? Array.from({ length: Math.min(5, company.totalJobs) }).map((_, i) => {
                      // SSR-safe: Use deterministic job number based on index
                      const jobNumber = 1000 + (i * 137) % 4000; // Deterministic pseudo-random
                      // SSR-safe date formatting (using client-side now value)
                      const jobDate = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const month = months[jobDate.getUTCMonth()];
                      const day = jobDate.getUTCDate();
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-background/50 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Job #{jobNumber}</span>
                            <Badge variant="outline" className="text-xs">
                              {i === 0 ? "Active" : "Completed"}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {`${day} ${month}`}
                          </span>
                        </div>
                      );
                    })
                  : (
                    <div className="text-sm text-muted-foreground">Loading job history...</div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium transition-opacity hover:opacity-90">
              View in ServiceM8
            </button>
            <button className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium transition-colors hover:bg-muted">
              View All Jobs
            </button>
            <button className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium transition-colors hover:bg-muted">
              Contact
            </button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

