import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "./button";
import { Progress } from "./progress";
import { WP_API_BASE } from "../../lib/wp";

export const PhotoUpload = forwardRef(function PhotoUpload({ estimateId, locationId, onUploadComplete, onError }, ref) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadToken, setUploadToken] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Expose file input click method via ref
  useImperativeHandle(ref, () => ({
    click: () => {
      fileInputRef.current?.click();
    },
  }));

  // Start upload session to get token
  const startUploadSession = useCallback(async () => {
    if (uploadToken) return uploadToken;

    try {
      const res = await fetch("/api/upload/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimateId, locationId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.err || data.error || "Failed to start upload session");
      }
      setUploadToken(data.token);
      return data.token;
    } catch (error) {
      throw new Error(`Failed to start upload: ${error.message}`);
    }
  }, [estimateId, locationId, uploadToken]);

  // Upload a single file
  const uploadFile = useCallback(
    async (file, token) => {
      // Use timestamp + counter for SSR-safe unique IDs
      const fileId = `${Date.now()}-${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`;
      setUploadProgress((prev) => ({ ...prev, [fileId]: { progress: 0, status: "uploading" } }));

      try {
        const formData = new FormData();
        formData.append("file", file);
        // Note: Token is passed as query parameter, not in form data
        // This avoids WordPress REST API multipart parsing issues

        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: { progress, status: "uploading" },
              }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response.ok) {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [fileId]: { progress: 100, status: "completed" },
                  }));
                  resolve(response);
                } else {
                  throw new Error(response.err || response.error || "Upload failed");
                }
              } catch (e) {
                reject(new Error("Failed to parse response"));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileId]: { progress: 0, status: "error" },
            }));
            reject(new Error("Network error during upload"));
          });

          // Upload directly to WordPress to avoid multipart parsing issues in Next.js proxy
          // This ensures PHP receives the multipart request and populates $_FILES correctly
          const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE || 'http://localhost:10013/wp-json';
          xhr.open("POST", `${wpBase}/ca/v1/upload?token=${encodeURIComponent(token)}`);
          xhr.send(formData);
        });
      } catch (error) {
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { progress: 0, status: "error" },
        }));
        throw error;
      }
    },
    []
  );

  // Handle file selection
  const handleFiles = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;

      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          onError?.(`${file.name} is not an image file`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          onError?.(`${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);
      try {
        const token = await startUploadSession();
        const uploadPromises = validFiles.map((file) => uploadFile(file, token));
        const results = await Promise.allSettled(uploadPromises);

        const successful = [];
        const failed = [];

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            successful.push({
              url: result.value.url,
              attachmentId: result.value.attachmentId,
              filename: validFiles[index].name,
            });
          } else {
            failed.push({ filename: validFiles[index].name, error: result.reason?.message });
          }
        });

        if (failed.length > 0) {
          onError?.(`${failed.length} file(s) failed to upload: ${failed.map((f) => f.filename).join(", ")}`);
        }

        if (successful.length > 0) {
          setUploadedPhotos((prev) => [...prev, ...successful]);
          onUploadComplete?.(successful);
        }
      } catch (error) {
        onError?.(error.message || "Failed to upload photos");
      } finally {
        setUploading(false);
        // Clear progress after a delay
        setTimeout(() => {
          setUploadProgress({});
        }, 3000);
      }
    },
    [startUploadSession, uploadFile, onUploadComplete, onError]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const progressEntries = Object.entries(uploadProgress);
  const hasActiveUploads = progressEntries.length > 0 && progressEntries.some(([, p]) => p.status === "uploading");

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex-1 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : uploading
              ? "border-muted bg-muted/40"
              : "border-border bg-muted/40 hover:border-primary/60"
        }`}
      >
        <p className="font-medium text-foreground">Drop files here</p>
        <p className="text-sm text-muted-foreground">JPG or PNG up to 10MB each.</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Select files"}
        </Button>
      </div>

      {hasActiveUploads && (
        <div className="space-y-2">
          {progressEntries.map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {progress.status === "uploading" ? "Uploading..." : progress.status === "completed" ? "Completed" : "Error"}
                </span>
                <span className="text-muted-foreground">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {uploadedPhotos.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">
            {uploadedPhotos.length} photo(s) uploaded successfully!
          </p>
        </div>
      )}
    </div>
  );
});

