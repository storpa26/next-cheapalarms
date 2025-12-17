import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useEstimatePhotos } from "@/lib/react-query/hooks/use-estimate-photos";

/**
 * PhotoGallery component for displaying customer photos in admin sidebar
 * Supports both selected item view and grouped accordion view
 */
export function PhotoGallery({ estimateId, items = [], selectedItem = null, portalMeta = {} }) {
  const submissionStatus = portalMeta?.photos?.submission_status;
  const submittedAt = portalMeta?.photos?.submitted_at;
  const { data: photosData, isLoading } = useEstimatePhotos({
    estimateId: estimateId || undefined,
    enabled: !!estimateId,
  });
  

  const [expandedItems, setExpandedItems] = useState(new Set());
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Close lightbox on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && lightboxPhoto) {
        setLightboxPhoto(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [lightboxPhoto]);

  // Extract photos from API response
  const allPhotos = useMemo(() => {
    if (!photosData?.ok) return [];
    
    // Try stored.uploads first (new format)
    if (photosData.stored?.uploads && Array.isArray(photosData.stored.uploads)) {
      return photosData.stored.uploads.map((upload) => ({
        url: upload.url || upload.urls?.[0] || "",
        label: upload.label || upload.filename || "Photo",
        itemName: upload.itemName || "Unknown",
        slotIndex: upload.slotIndex || 1,
        photoIndex: upload.photoIndex || 1,
      }));
    }
    
    // Fallback to items array (old format)
    if (Array.isArray(photosData.items)) {
      return photosData.items;
    }
    
    return [];
  }, [photosData]);

  // Group photos by item name
  const photosByItem = useMemo(() => {
    const grouped = {};
    allPhotos.forEach((photo) => {
      const itemName = photo.itemName || "Unknown";
      if (!grouped[itemName]) {
        grouped[itemName] = [];
      }
      grouped[itemName].push(photo);
    });
    return grouped;
  }, [allPhotos]);

  // Get photos for selected item (with fuzzy matching)
  const selectedItemPhotos = useMemo(() => {
    if (!selectedItem) return [];
    const itemName = selectedItem.name || selectedItem.itemName || "";
    
    if (!itemName) return [];
    
    // Exact match first
    if (photosByItem[itemName]) {
      return photosByItem[itemName];
    }
    
    // Try fuzzy matching (case-insensitive, partial match)
    const normalizedItemName = itemName.toLowerCase().trim();
    for (const [photoItemName, photos] of Object.entries(photosByItem)) {
      const normalizedPhotoItemName = photoItemName.toLowerCase().trim();
      if (
        normalizedPhotoItemName === normalizedItemName ||
        normalizedPhotoItemName.includes(normalizedItemName) ||
        normalizedItemName.includes(normalizedPhotoItemName)
      ) {
        return photos;
      }
    }
    
    return [];
  }, [selectedItem, photosByItem]);

  // Get photo counts for each item (with fuzzy matching)
  const itemPhotoCounts = useMemo(() => {
    const counts = {};
    items.forEach((item) => {
      const itemName = item.name || "Unknown";
      
      // Exact match first
      if (photosByItem[itemName]) {
        counts[itemName] = photosByItem[itemName].length;
        return;
      }
      
      // Try fuzzy matching
      const normalizedItemName = itemName.toLowerCase().trim();
      for (const [photoItemName, photos] of Object.entries(photosByItem)) {
        const normalizedPhotoItemName = photoItemName.toLowerCase().trim();
        if (
          normalizedPhotoItemName === normalizedItemName ||
          normalizedPhotoItemName.includes(normalizedItemName) ||
          normalizedItemName.includes(normalizedPhotoItemName)
        ) {
          counts[itemName] = photos.length;
          return;
        }
      }
      
      counts[itemName] = 0;
    });
    return counts;
  }, [items, photosByItem]);

  const toggleItem = (itemName) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) {
        next.delete(itemName);
      } else {
        next.add(itemName);
      }
      return next;
    });
  };

  // IMPORTANT: Calculate itemsWithPhotos BEFORE any returns to avoid hooks count mismatch
  const itemsWithPhotos = useMemo(() => {
    return items.filter((item) => {
      const itemName = item.name || "Unknown";
      
      // Check exact match
      if (photosByItem[itemName]?.length > 0) {
        return true;
      }
      
      // Check fuzzy match
      const normalizedItemName = itemName.toLowerCase().trim();
      for (const [photoItemName, photos] of Object.entries(photosByItem)) {
        const normalizedPhotoItemName = photoItemName.toLowerCase().trim();
        if (
          (normalizedPhotoItemName === normalizedItemName ||
            normalizedPhotoItemName.includes(normalizedItemName) ||
            normalizedItemName.includes(normalizedPhotoItemName)) &&
          photos.length > 0
        ) {
          return true;
        }
      }
      
      return false;
    });
  }, [items, photosByItem]);

  // Handle case when estimateId is not available
  if (!estimateId) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Photos</h3>
        <p className="text-sm text-muted-foreground">
          Photos will appear once the invoice is linked to an estimate
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Photos</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const totalPhotos = allPhotos.length;

  if (totalPhotos === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Photos</h3>
        <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
      </div>
    );
  }

  // If item is selected, show photos for that item only
  if (selectedItem) {
    return (
      <>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Photos for: {selectedItem.name || "Item"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {selectedItemPhotos.length} {selectedItemPhotos.length === 1 ? "photo" : "photos"}
            </span>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Click the item row again to view all photos
          </p>
          
          {selectedItemPhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos attached to this item</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {selectedItemPhotos.map((photo, idx) => (
                <Button
                  key={idx}
                  onClick={() => setLightboxPhoto(photo)}
                  variant="ghost"
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted p-0 h-auto hover:border-border hover:shadow-md"
                >
                  <img
                    src={photo.url}
                    alt={photo.label || `Photo ${idx + 1}`}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%239ca3af'%3EBroken%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10"></div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightboxPhoto && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <div className="relative max-h-full max-w-full">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.label || "Photo"}
                className="max-h-[90vh] max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                onClick={() => setLightboxPhoto(null)}
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
              {lightboxPhoto.label && (
                <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/70 p-3 text-sm text-white">
                  {lightboxPhoto.label}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // Show all photos grouped by item in accordion
  if (itemsWithPhotos.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Photos</h3>
        <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Customer Photos</h3>
            {submissionStatus === 'submitted' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-bg text-success text-xs font-semibold rounded-full">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Submitted
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {totalPhotos} {totalPhotos === 1 ? "photo" : "photos"}
            {submittedAt && ` • Submitted ${new Date(submittedAt).toLocaleString()}`}
          </div>
        </div>

        <div className="space-y-2">
          {itemsWithPhotos.map((item) => {
            const itemName = item.name || "Unknown";
            
            // Find matching photos (exact or fuzzy)
            let itemPhotos = photosByItem[itemName] || [];
            if (itemPhotos.length === 0) {
              const normalizedItemName = itemName.toLowerCase().trim();
              for (const [photoItemName, photos] of Object.entries(photosByItem)) {
                const normalizedPhotoItemName = photoItemName.toLowerCase().trim();
                if (
                  normalizedPhotoItemName === normalizedItemName ||
                  normalizedPhotoItemName.includes(normalizedItemName) ||
                  normalizedItemName.includes(normalizedPhotoItemName)
                ) {
                  itemPhotos = photos;
                  break;
                }
              }
            }
            
            const isExpanded = expandedItems.has(itemName);
            const photoCount = itemPhotos.length;

            return (
              <div key={itemName} className="border-b border-border/40 last:border-b-0 pb-2 last:pb-0">
                <Button
                  onClick={() => toggleItem(itemName)}
                  variant="ghost"
                  className="flex w-full items-center justify-between py-2 text-left h-auto"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{itemName}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {photoCount}
                    </span>
                  </div>
                  <svg
                    className={`h-4 w-4 text-muted-foreground transition ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {isExpanded && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {itemPhotos.map((photo, idx) => (
                      <Button
                        key={idx}
                        onClick={() => setLightboxPhoto(photo)}
                        variant="ghost"
                        className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted p-0 h-auto hover:border-border hover:shadow-md"
                      >
                        <img
                          src={photo.url}
                          alt={photo.label || `Photo ${idx + 1}`}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%239ca3af'%3EBroken%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10"></div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-h-full max-w-full">
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.label || "Photo"}
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              onClick={() => setLightboxPhoto(null)}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            {lightboxPhoto.label && (
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/70 p-3 text-sm text-white">
                {lightboxPhoto.label}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

