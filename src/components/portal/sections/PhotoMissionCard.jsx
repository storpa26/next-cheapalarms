import { Camera, Image as ImageIcon, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductPhotoUpload } from "./ProductPhotoUpload";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function PhotoMissionCard({
  photoItems,
  estimateId,
  locationId,
  showUploader,
  onLaunchCamera,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [uploadAction, setUploadAction] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const totalCount = photoItems.length;
  const totalItems = photoItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleStart = (action, itemLabel) => {
    setUploadAction(action);
    setActiveItem(itemLabel || null);
    onLaunchCamera();
  };

  const handleRowClick = (itemLabel) => {
    handleStart(isMobile ? "camera" : "upload", itemLabel);
  };

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Photo updates</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Deployment photos</h3>
          <p className="text-sm text-slate-500">
            {totalCount > 0
              ? `Capture photos for ${totalCount} product${totalCount > 1 ? "s" : ""} (${totalItems} total item${totalItems > 1 ? "s" : ""}).`
              : "Please capture the highlighted areas so we can finalize placement."}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-4">
          <Camera className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 rounded-2xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Upload Error</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="rounded-full p-1 text-red-600 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 max-h-64 space-y-3 overflow-y-auto pr-1">
        {totalCount > 0 ? (
          photoItems.map((item) => (
            <div
              key={item.label}
              role="button"
              tabIndex={0}
              onClick={() => handleRowClick(item.label)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleRowClick(item.label);
                }
              }}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 cursor-pointer transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-slate-200 p-2 text-slate-500">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {item.label}
                    {item.quantity > 1 && (
                      <span className="ml-2 text-xs text-slate-500">(×{item.quantity})</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.uploadedCount > 0
                      ? `${item.uploadedCount} photo${item.uploadedCount > 1 ? "s" : ""} uploaded`
                      : isMobile
                        ? "Tap to capture"
                        : "Click to choose photo"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStart("camera", item.label);
                      }}
                      className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-primary hover:border-primary/50"
                      title="Capture photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStart("upload", item.label);
                      }}
                      className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-primary hover:border-primary/50"
                      title="Upload from files"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "Uploaded"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
            No products found in estimate
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleStart("camera", null)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-primary px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/30 transition hover:shadow-xl"
          >
            <Camera className="h-5 w-5" />
            Capture Photo
          </button>
          <button
            type="button"
            onClick={() => handleStart("upload", null)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Upload className="h-5 w-5" />
            Upload Photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleStart("upload")}
          className="mt-5 w-full rounded-2xl bg-linear-to-r from-primary to-secondary px-4 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/30 transition hover:shadow-xl"
        >
          Submit
        </button>
      )}

      {showUploader && estimateId ? (
        <div className="sr-only" aria-hidden="true">
          <ProductPhotoUpload
            estimateId={estimateId}
            locationId={locationId}
            initialAction={uploadAction}
            initialItemName={activeItem}
            onInitialActionHandled={() => {
              setUploadAction(null);
              setActiveItem(null);
            }}
            onUploadComplete={() => {
              setUploadAction(null);
              setActiveItem(null);
              setError(null); // Clear error on success
            }}
            onError={(errorMsg) => {
              setError(errorMsg); // Display error to user
              setUploadAction(null);
              setActiveItem(null);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
 
