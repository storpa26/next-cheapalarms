import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Image } from "lucide-react";
import { WP_API_BASE } from "@/lib/wp";

const MAX_PHOTOS_PER_SLOT = 2;

// Detect if device is mobile
function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Individual slot component - compact design
function ProductSlot({ 
  productName, 
  slotIndex, 
  photos, 
  canAddMore, 
  estimateId, 
  locationId,
  onUploadComplete,
  onError 
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const isMobile = isMobileDevice();

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds 10MB limit`);
        return;
      }

      setUploading(true);
      try {
        // Start upload session
        const sessionRes = await fetch("/api/upload/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estimateId, locationId }),
        });
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok || !sessionData.ok) {
          throw new Error(sessionData.err || sessionData.error || "Failed to start upload session");
        }

        // Upload file
        const formData = new FormData();
        formData.append("file", file);

        const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE || "http://localhost:10013/wp-json";
        const uploadRes = await fetch(`${wpBase}/ca/v1/upload?token=${encodeURIComponent(sessionData.token)}`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(errorData.err || errorData.error || "Upload failed");
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.ok) {
          throw new Error(uploadData.err || uploadData.error || "Upload failed");
        }

        // Store photo with metadata
        const photoMetadata = {
          url: uploadData.url,
          attachmentId: uploadData.attachmentId,
          filename: file.name,
          label: `${productName} #${slotIndex} - Photo ${photos.length + 1}`,
          itemName: productName,
          slotIndex: slotIndex,
          photoIndex: photos.length + 1,
        };

        // Fetch existing photos to append
        const existingRes = await fetch(`/api/estimate/photos?estimateId=${encodeURIComponent(estimateId)}`);
        const existingData = await existingRes.json();
        const existingUploads = (existingData.ok && existingData.stored?.uploads) ? existingData.stored.uploads : [];
        const allUploads = [...existingUploads, photoMetadata];

        // Store all photos
        const storeRes = await fetch("/api/estimate/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estimateId,
            locationId,
            uploads: allUploads.map((p) => ({
              url: p.url,
              attachmentId: p.attachmentId,
              filename: p.filename || p.label,
              label: p.label || p.filename,
              itemName: p.itemName,
              slotIndex: p.slotIndex,
              photoIndex: p.photoIndex,
            })),
          }),
        });

        const storeData = await storeRes.json();
        if (!storeRes.ok || !storeData.ok) {
          throw new Error(storeData.err || storeData.error || "Failed to store photo");
        }

        onUploadComplete?.([photoMetadata]);
        // Refresh page to show new photo
        window.location.reload();
      } catch (error) {
        const errorMsg = error.message || "Failed to upload photo";
        alert(errorMsg);
        onError?.(errorMsg);
      } finally {
        setUploading(false);
        // Reset inputs
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
      }
    },
    [productName, slotIndex, photos.length, estimateId, locationId, onUploadComplete, onError]
  );

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">
        {productName} #{slotIndex}
      </div>
      
      {/* Compact photo grid with upload buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {/* Display uploaded photos */}
        {photos.map((photo, photoIndex) => (
          <div key={photoIndex} className="relative w-16 h-16 rounded border border-border bg-muted overflow-hidden shrink-0">
            <img
              src={photo.url}
              alt={`${productName} #${slotIndex} - Photo ${photoIndex + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        {/* Upload buttons - inline, no dialog */}
        {canAddMore && (
          <>
            {isMobile ? (
              // Mobile: Two icons side by side
              <>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="w-16 h-16 rounded border-2 border-dashed border-border bg-muted/40 flex items-center justify-center hover:border-primary/60 transition-colors disabled:opacity-50 shrink-0"
                  title="Take Photo"
                >
                  {uploading ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Camera className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-16 h-16 rounded border-2 border-dashed border-border bg-muted/40 flex items-center justify-center hover:border-primary/60 transition-colors disabled:opacity-50 shrink-0"
                  title="Upload Photo"
                >
                  {uploading ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Image className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </>
            ) : (
              // Desktop: Single button
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 rounded border-2 border-dashed border-border bg-muted/40 flex items-center justify-center hover:border-primary/60 transition-colors disabled:opacity-50 shrink-0"
                title="Add Photo"
              >
                {uploading ? (
                  <span className="text-xs">...</span>
                ) : (
                  <Image className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileInput}
        className="hidden"
        disabled={uploading}
      />
      {isMobile && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
      )}
    </div>
  );
}

// Product row component - compact
function ProductRow({ productName, quantity, slots, estimateId, locationId, onUploadComplete, onError }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{productName}</h3>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: quantity }, (_, index) => {
          const slotIndex = index + 1;
          const slotPhotos = slots[slotIndex] || [];
          const canAddMore = slotPhotos.length < MAX_PHOTOS_PER_SLOT;

          return (
            <ProductSlot
              key={slotIndex}
              productName={productName}
              slotIndex={slotIndex}
              photos={slotPhotos}
              canAddMore={canAddMore}
              estimateId={estimateId}
              locationId={locationId}
              onUploadComplete={onUploadComplete}
              onError={onError}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ProductPhotoUpload({ estimateId, locationId, onUploadComplete, onError }) {
  const [estimateItems, setEstimateItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storedPhotos, setStoredPhotos] = useState({}); // { "ProductName": { slotIndex: [photos] } }

  // Fetch estimate items
  useEffect(() => {
    if (!estimateId || !locationId) {
      setLoading(false);
      return;
    }

    const fetchEstimate = async () => {
      try {
        const res = await fetch(`/api/estimate?estimateId=${encodeURIComponent(estimateId)}&locationId=${encodeURIComponent(locationId)}`);
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.err || data.error || "Failed to fetch estimate");
        }

        const items = data.items || [];
        setEstimateItems(items);
      } catch (err) {
        setError(err.message || "Failed to load estimate items");
        onError?.(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [estimateId, locationId, onError]);

  // Fetch stored photos
  useEffect(() => {
    if (!estimateId) return;

    const fetchPhotos = async () => {
      try {
        const res = await fetch(`/api/estimate/photos?estimateId=${encodeURIComponent(estimateId)}`);
        const data = await res.json();
        if (data.ok && data.stored && data.stored.uploads && Array.isArray(data.stored.uploads)) {
          // Group photos by product and slot
          const grouped = {};
          data.stored.uploads.forEach((upload) => {
            const itemName = upload.itemName || (upload.label ? upload.label.split(' #')[0] : "Unknown");
            const slotIndex = upload.slotIndex || 1;
            if (!grouped[itemName]) {
              grouped[itemName] = {};
            }
            if (!grouped[itemName][slotIndex]) {
              grouped[itemName][slotIndex] = [];
            }
            grouped[itemName][slotIndex].push({
              url: upload.url || upload.urls?.[0] || "",
              attachmentId: upload.attachmentId,
              filename: upload.filename || upload.label || "Photo",
              itemName: upload.itemName || itemName,
              slotIndex: upload.slotIndex || slotIndex,
              photoIndex: upload.photoIndex || grouped[itemName][slotIndex].length + 1,
            });
          });
          setStoredPhotos(grouped);
        }
      } catch (err) {
        console.error("Failed to fetch photos:", err);
      }
    };

    fetchPhotos();
  }, [estimateId]);

  // Group items by name
  const groupedItems = estimateItems.reduce((acc, item) => {
    const name = item.name || "Unknown Item";
    const qty = item.qty || item.quantity || 1;
    if (!acc[name]) {
      acc[name] = { name, quantity: 0 };
    }
    acc[name].quantity += qty;
    return acc;
  }, {});

  const productGroups = Object.values(groupedItems);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
        <p className="text-sm text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        <p className="font-semibold">Error loading estimate</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (productGroups.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
        <p className="text-sm text-muted-foreground">No products found in estimate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {productGroups.map((product) => (
        <ProductRow
          key={product.name}
          productName={product.name}
          quantity={product.quantity}
          slots={storedPhotos[product.name] || {}}
          estimateId={estimateId}
          locationId={locationId}
          onUploadComplete={onUploadComplete}
          onError={onError}
        />
      ))}
    </div>
  );
}
