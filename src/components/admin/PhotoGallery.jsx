import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useEstimatePhotos } from "../../lib/react-query/hooks/use-estimate-photos";

/**
 * Fuzzy match helper: returns true if names match exactly or partially (case-insensitive)
 */
function fuzzyMatch(name1, name2) {
  const n1 = (name1 || "").toLowerCase().trim();
  const n2 = (name2 || "").toLowerCase().trim();
  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

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

  // Group photos by item name (exact grouping from photo data)
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

  // PERFORMANCE: Precompute fuzzy photo map for all items (single O(n*m) pass)
  // Maps each item name to its matched photos, avoiding repeated fuzzy matching in render
  const fuzzyPhotoMap = useMemo(() => {
    const map = {};
    const photoKeys = Object.keys(photosByItem);
    
    items.forEach((item) => {
      const itemName = item.name || "Unknown";
      
      // Exact match first
      if (photosByItem[itemName]) {
        map[itemName] = photosByItem[itemName];
        return;
      }
      
      // Fuzzy match
      for (const photoKey of photoKeys) {
        if (fuzzyMatch(itemName, photoKey)) {
          map[itemName] = photosByItem[photoKey];
          return;
        }
      }
      
      map[itemName] = [];
    });
    
    return map;
  }, [items, photosByItem]);

  // Get photos for selected item (uses precomputed map)
  const selectedItemPhotos = useMemo(() => {
    if (!selectedItem) return [];
    const itemName = selectedItem.name || selectedItem.itemName || "";
    if (!itemName) return [];
    
    // Use precomputed map if available
    if (fuzzyPhotoMap[itemName]) {
      return fuzzyPhotoMap[itemName];
    }
    
    // Fallback for items not in the items array (e.g., selected from elsewhere)
    if (photosByItem[itemName]) {
      return photosByItem[itemName];
    }
    
    // Fuzzy fallback
    for (const [photoKey, photos] of Object.entries(photosByItem)) {
      if (fuzzyMatch(itemName, photoKey)) {
        return photos;
      }
    }
    
    return [];
  }, [selectedItem, fuzzyPhotoMap, photosByItem]);

  // Get photo counts for each item (uses precomputed map)
  const itemPhotoCounts = useMemo(() => {
    const counts = {};
    items.forEach((item) => {
      const itemName = item.name || "Unknown";
      counts[itemName] = fuzzyPhotoMap[itemName]?.length ?? 0;
    });
    return counts;
  }, [items, fuzzyPhotoMap]);

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
  // Uses precomputed fuzzyPhotoMap for O(n) instead of O(n*m)
  const itemsWithPhotos = useMemo(() => {
    return items.filter((item) => {
      const itemName = item.name || "Unknown";
      return (fuzzyPhotoMap[itemName]?.length ?? 0) > 0;
    });
  }, [items, fuzzyPhotoMap]);

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
                  <Image
                    src={photo.url}
                    alt={photo.label || `Photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 150px"
                    className="object-cover transition group-hover:scale-105"
                    loading="lazy"
                    unoptimized
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
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Image
                src={lightboxPhoto.url}
                alt={lightboxPhoto.label || "Photo"}
                width={1200}
                height={900}
                className="rounded-lg object-contain"
                style={{ maxHeight: "90vh", maxWidth: "90vw", width: "auto", height: "auto" }}
                priority
                unoptimized
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
            // Use precomputed fuzzy map (no inline fuzzy matching)
            const itemPhotos = fuzzyPhotoMap[itemName] || [];
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
                        <Image
                          src={photo.url}
                          alt={photo.label || `Photo ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 150px"
                          className="object-cover transition group-hover:scale-105"
                          loading="lazy"
                          unoptimized
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
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxPhoto.url}
              alt={lightboxPhoto.label || "Photo"}
              width={1200}
              height={900}
              className="rounded-lg object-contain"
              style={{ maxHeight: "90vh", maxWidth: "90vw", width: "auto", height: "auto" }}
              priority
              unoptimized
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

