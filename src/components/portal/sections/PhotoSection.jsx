/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { ProductPhotoUpload } from "./ProductPhotoUpload";

function EmptyPhotoState({ onSelectFiles, onSkip }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We haven't received any photos yet. Upload a few shots of the main areas our technicians will work
        in so we can prepare the correct gear.
      </p>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 rounded-lg border-2 border-dashed border-border bg-muted/40 p-6 text-center">
          <p className="font-medium text-foreground">Drop files here</p>
          <p className="text-sm text-muted-foreground">JPG or PNG up to 10MB each.</p>
          <Button className="mt-4" variant="secondary" onClick={onSelectFiles}>
            Select files
          </Button>
        </div>
        <div className="flex-1 rounded-lg border border-border bg-background p-6">
          <p className="font-medium text-foreground">Can't share photos?</p>
          <p className="text-sm text-muted-foreground">
            Choose "Skip for now" and we'll call to double-check anything we need before installation.
          </p>
          <Button variant="outline" className="mt-4" onClick={onSkip}>
            Skip photos for now
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PhotoSection({ photos, photoTab, setPhotoTab, estimateId, locationId }) {
  const [uploaded, setUploaded] = useState(photos.items ?? []);
  const samples = photos.samples ?? [];
  const missing = photos.missingCount ?? 0;
  const required = photos.required ?? 6;
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photosSkipped, setPhotosSkipped] = useState(false);
  const photoUploadRef = useRef(null);

  // Fetch uploaded photos
  const fetchUploadedPhotos = useCallback(async () => {
    if (!estimateId) return;
    setLoadingPhotos(true);
    try {
      const res = await fetch(`/api/estimate/photos?estimateId=${encodeURIComponent(estimateId)}`);
      const data = await res.json();
      if (data.ok && data.stored && data.stored.uploads && Array.isArray(data.stored.uploads)) {
        // Transform stored uploads to match the expected format
        const fetchedPhotos = data.stored.uploads.map((upload) => ({
          url: upload.url || upload.urls?.[0] || "",
          label: upload.label || upload.filename || "Uploaded photo",
          notes: upload.notes || "",
          attachmentId: upload.attachmentId,
        }));
        setUploaded(fetchedPhotos);
      } else if (data.ok && data.stored && (!data.stored.uploads || data.stored.uploads.length === 0)) {
        // No stored uploads - keep existing uploaded state or set to empty
        setUploaded([]);
      }
    } catch (err) {
      console.error("Failed to fetch photos:", err);
      // Don't clear uploaded on error - keep existing state
    } finally {
      setLoadingPhotos(false);
    }
  }, [estimateId]);

  // Fetch photos on mount and when estimateId changes
  useEffect(() => {
    fetchUploadedPhotos();
  }, [fetchUploadedPhotos]);

  // Update tabs when uploaded count changes
  const tabs = [
    { id: "uploaded", label: `Uploaded (${uploaded.length})` },
    { id: "missing", label: `Missing (${missing})` },
    { id: "samples", label: "Example shots" },
  ];

  // Handle skip photos
  const handleSkipPhotos = useCallback(() => {
    if (window.confirm("Are you sure you want to skip uploading photos? We'll call you to confirm details instead.")) {
      setPhotosSkipped(true);
      // Optionally, you could store this in the backend
      // For now, just show a confirmation message
    }
  }, []);

  const handleSendPasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Please enter your email address");
      return;
    }
    setEmailError("");
    setSendingEmail(true);
    try {
      const res = await fetch("/api/auth/send-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.err || json.error || "Failed to send email");
      }
      setEmailSent(true);
      setEmail("");
    } catch (err) {
      setEmailError(err.message || "Failed to send password reset email");
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle photo upload completion
  const handleUploadComplete = useCallback(
    async (newUploadedPhotos) => {
      if (!estimateId || !locationId) {
        setUploadError("Missing estimate ID or location ID");
        return;
      }

      try {
        // Store photos linked to estimate
        const uploads = newUploadedPhotos.map((photo) => ({
          url: photo.url,
          attachmentId: photo.attachmentId,
          filename: photo.filename,
          label: photo.filename,
        }));

        const res = await fetch("/api/estimate/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estimateId,
            locationId,
            uploads,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.err || data.error || "Failed to store photos");
        }

        // Update local state immediately for better UX
        setUploaded((prev) => [...prev, ...newUploadedPhotos.map((photo) => ({
          url: photo.url,
          label: photo.filename || "Uploaded photo",
          notes: "",
          attachmentId: photo.attachmentId,
        }))]);
        
        // Refresh uploaded photos list to ensure consistency
        await fetchUploadedPhotos();
        setUploadError("");
      } catch (err) {
        setUploadError(err.message || "Failed to save photos");
      }
    },
    [estimateId, locationId, fetchUploadedPhotos]
  );

  const handleUploadError = useCallback((error) => {
    setUploadError(error);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Site photos</CardTitle>
          <CardDescription>
            Uploading photos helps the install team prepare the right equipment.
          </CardDescription>
        </div>
        <div className="flex gap-2 rounded-md border border-border bg-muted/40 p-1 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPhotoTab(tab.id)}
              className={`rounded px-3 py-1 transition ${
                photoTab === tab.id ? "bg-background text-foreground shadow" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {/* Email input for password reset */}
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="mb-2 font-medium text-foreground">Need to log in?</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Enter your email address and we'll send you a link to set your password.
          </p>
          {emailSent ? (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              Password reset email sent! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSendPasswordReset} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={sendingEmail}
              />
              <Button type="submit" disabled={sendingEmail || !email} variant="secondary" className="sm:w-auto">
                {sendingEmail ? "Sending..." : "Send Login Link"}
              </Button>
            </form>
          )}
          {emailError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{emailError}</p>
          )}
        </div>
        {photoTab === "uploaded" ? (
          uploaded.length ? (
            <ul className="grid gap-4 md:grid-cols-3">
              {uploaded.map((photo) => (
                <li key={photo.url} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="overflow-hidden rounded-md bg-muted">
                    <img
                      src={photo.url}
                      alt={photo.label ?? "Uploaded photo"}
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{photo.label ?? "Uploaded photo"}</div>
                    {photo.notes ? <p>{photo.notes}</p> : null}
                    <p>{photo.size ?? "JPEG"}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPhotoState
              onSelectFiles={() => {
                // Switch to missing tab where PhotoUpload is rendered
                setPhotoTab("missing");
                // After a brief delay, trigger the file input
                setTimeout(() => {
                  if (photoUploadRef.current) {
                    photoUploadRef.current.click();
                  }
                }, 100);
              }}
              onSkip={handleSkipPhotos}
            />
          )
        ) : null}

        {photoTab === "missing" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload photos for each product in your estimate. Click on a slot to add photos (up to 2 per slot).
            </p>
            {uploadError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                {uploadError}
              </div>
            )}
            {estimateId && locationId ? (
              <ProductPhotoUpload
                estimateId={estimateId}
                locationId={locationId}
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/40 p-6 text-center">
                <p className="font-medium text-foreground">Loading...</p>
              </div>
            )}
            <div className="rounded-lg border border-border bg-background p-6">
              <p className="font-medium text-foreground">Can't share photos?</p>
              <p className="text-sm text-muted-foreground mt-2">
                That's okay—you can skip this step and we'll call to confirm details.
              </p>
              <Button variant="outline" className="mt-4" onClick={handleSkipPhotos}>
                Skip photos for now
              </Button>
            </div>
            {photosSkipped && (
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                Photos skipped. We'll call you to confirm details before installation.
              </div>
            )}
          </div>
        ) : null}

        {photoTab === "samples" ? (
          <div className="space-y-4">
            <p>Here's what our install team typically needs:</p>
            <ul className="grid gap-4 md:grid-cols-3">
              {samples.map((sample) => (
                <li key={sample.id} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="overflow-hidden rounded-md bg-muted">
                    <img src={sample.url} alt={sample.title} className="aspect-video w-full object-cover" />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{sample.title}</div>
                    <p>{sample.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

