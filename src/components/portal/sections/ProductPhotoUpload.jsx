import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Camera, Image } from "lucide-react";
import { useEstimate, useEstimatePhotos, useStoreEstimatePhotos } from "@/lib/react-query/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/error-messages";

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
  onError,
  registerSlotRef,
  registerFileInputRef,
  registerCameraInputRef,
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const isMobile = isMobileDevice();
  const queryClient = useQueryClient();
  const storePhotosMutation = useStoreEstimatePhotos();

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!file.type.startsWith("image/") || !allowedTypes.includes(file.type.toLowerCase())) {
        onError?.(getErrorMessage(415, `${file.name} is not a supported image type. Please use JPG, PNG, GIF, or WEBP.`));
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        onError?.(getErrorMessage(413, `${file.name} is too large (${sizeMB}MB). Maximum size is 10MB.`));
        return;
      }

      // Set uploading state immediately - React will batch this but it should still render
      setUploading(true);
      
      // Use requestAnimationFrame to ensure spinner renders before async work
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      
      try {
        // Start upload session
        const sessionRes = await fetch("/api/upload/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ estimateId, locationId }),
        });
        if (!sessionRes.ok) {
          const errorMessage = getErrorMessage(sessionRes.status, "Failed to start upload session");
          throw new Error(errorMessage);
        }
        
        const sessionData = await sessionRes.json();
        if (!sessionData.ok) {
          throw new Error(sessionData.err || sessionData.error || "Failed to start upload session");
        }

        // Upload file - Use Next.js proxy instead of direct WordPress call
        const formData = new FormData();
        formData.append("file", file);

        // Use Next.js proxy endpoint which handles cookies and authentication
        const uploadRes = await fetch(`/api/upload?token=${encodeURIComponent(sessionData.token)}`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          const userMessage = getErrorMessage(uploadRes.status, "Failed to upload photo");
          const detailMessage = errorData.err || errorData.error || userMessage;
          throw new Error(detailMessage);
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.ok) {
          throw new Error(uploadData.err || uploadData.error || "Upload failed");
        }

        // Get existing photos from React Query cache (no need to fetch again)
        const cachedPhotos = queryClient.getQueryData(['estimate-photos', estimateId]);
        const existingUploads = (cachedPhotos?.ok && cachedPhotos?.stored?.uploads) 
          ? cachedPhotos.stored.uploads 
          : [];

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

        const allUploads = [...existingUploads, photoMetadata];

        // Store all photos using React Query mutation (automatically invalidates cache)
        await storePhotosMutation.mutateAsync({
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
        });

        onUploadComplete?.([photoMetadata]);
        // No need to reload - React Query will automatically refetch and update UI
      } catch (error) {
        // Provide user-friendly error message
        const errorMsg = error.message || getErrorMessage('upload_failed');
        onError?.(errorMsg);
      } finally {
        setUploading(false);
        // Reset inputs
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
      }
    },
    [productName, slotIndex, photos.length, estimateId, locationId, onUploadComplete, onError, queryClient, storePhotosMutation]
  );

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  // Register file input refs when component mounts (only for first slot)
  // Register immediately - refs will be populated when React attaches them
  useEffect(() => {
    if (slotIndex === 1) {
      if (registerFileInputRef) {
        registerFileInputRef(fileInputRef);
      }
      if (registerCameraInputRef) {
        registerCameraInputRef(cameraInputRef);
      }
    }
    // Cleanup: unregister when component unmounts
    return () => {
      if (slotIndex === 1) {
        if (registerFileInputRef) {
          registerFileInputRef(null);
        }
        if (registerCameraInputRef) {
          registerCameraInputRef(null);
        }
      }
    };
  }, [slotIndex, registerFileInputRef, registerCameraInputRef]);

  return (
    <div className="space-y-1.5" ref={registerSlotRef}>
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
                    <Spinner size="sm" />
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
                    <Spinner size="sm" />
                  ) : (
                    <Image className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </>
            ) : (
              // Desktop: Clickable card area
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`w-16 h-16 rounded border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center hover:border-primary/60 transition-colors shrink-0 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Click to choose photo"
              >
                {uploading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Image className="h-4 w-4 text-muted-foreground mb-0.5" />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">Click here</span>
                  </>
                )}
              </div>
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
function ProductRow({
  productName,
  quantity,
  slots,
  estimateId,
  locationId,
  onUploadComplete,
  onError,
  registerProductRef,
  registerFileInputRef,
  registerCameraInputRef,
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{productName}</h3>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: quantity }, (_, index) => {
          const slotIndex = index + 1;
          const slotPhotos = slots[slotIndex] || [];
          const canAddMore = slotPhotos.length < MAX_PHOTOS_PER_SLOT;
          const isFirstSlot = index === 0;

          return (
            <div key={slotIndex}>
              <ProductSlot
                productName={productName}
                slotIndex={slotIndex}
                photos={slotPhotos}
                canAddMore={canAddMore}
                estimateId={estimateId}
                locationId={locationId}
                onUploadComplete={onUploadComplete}
                onError={onError}
                registerSlotRef={
                  isFirstSlot ? (element) => registerProductRef(productName, element) : undefined
                }
                registerFileInputRef={
                  isFirstSlot ? (ref) => registerFileInputRef(productName, ref) : undefined
                }
                registerCameraInputRef={
                  isFirstSlot ? (ref) => registerCameraInputRef(productName, ref) : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProductPhotoUpload({
  estimateId,
  locationId,
  initialAction,
  initialItemName,
  onInitialActionHandled,
  onUploadComplete,
  onError,
}) {
  const productSlotRefs = useRef({});
  const fileInputRefs = useRef({}); // Store file input refs directly
  const cameraInputRefs = useRef({}); // Store camera input refs directly
  
  const registerProductRef = useCallback((productName, element) => {
    if (!productName) return;
    if (element) {
      productSlotRefs.current[productName] = element;
    } else {
      delete productSlotRefs.current[productName];
    }
  }, []);

  const registerFileInputRef = useCallback((productName, inputRef) => {
    if (!productName) return;
    if (inputRef) {
      fileInputRefs.current[productName] = inputRef;
    } else {
      delete fileInputRefs.current[productName];
    }
  }, []);

  const registerCameraInputRef = useCallback((productName, inputRef) => {
    if (!productName) return;
    if (inputRef) {
      cameraInputRefs.current[productName] = inputRef;
    } else {
      delete cameraInputRefs.current[productName];
    }
  }, []);
  
  // Use React Query hooks for data fetching (with caching and deduplication)
  const { data: estimateData, isLoading: loading, error: estimateError } = useEstimate({
    estimateId: estimateId || undefined,
    locationId: locationId || undefined,
    enabled: !!estimateId && !!locationId,
  });

  const { data: photosData } = useEstimatePhotos({
    estimateId: estimateId || undefined,
    enabled: !!estimateId,
  });

  // Extract estimate items
  const estimateItems = estimateData?.items || [];
  const error = estimateError?.message || null;

  // Trigger file input when initialAction is set
  useEffect(() => {
    if (!initialAction || !initialItemName) return;

    const timer = setTimeout(() => {
      if (initialAction === "upload") {
        // Try direct ref first (most reliable)
        const fileInput = fileInputRefs.current[initialItemName];
        if (fileInput && fileInput.current) {
          fileInput.current.click();
          onInitialActionHandled?.();
          return;
        }
        
        // Fallback: try to find via querySelector
        const targetElement = productSlotRefs.current[initialItemName];
        if (targetElement) {
          const uploadButton = targetElement.querySelector('button[title="Upload Photo"]');
          if (uploadButton) {
            uploadButton.click();
            onInitialActionHandled?.();
            return;
          }
          const fileButton = targetElement.querySelector('button[title="Add Photo"]');
          if (fileButton) {
            fileButton.click();
            onInitialActionHandled?.();
            return;
          }
          const fileInputElement = targetElement.querySelector('input[type="file"]:not([capture])');
          if (fileInputElement) {
            fileInputElement.click();
            onInitialActionHandled?.();
            return;
          }
        }
      } else if (initialAction === "camera") {
        // Try direct ref first
        const cameraInput = cameraInputRefs.current[initialItemName];
        if (cameraInput && cameraInput.current) {
          cameraInput.current.click();
          onInitialActionHandled?.();
          return;
        }
        
        // Fallback: try to find via querySelector
        const targetElement = productSlotRefs.current[initialItemName];
        if (targetElement) {
          const cameraButton = targetElement.querySelector('button[title="Take Photo"]');
          if (cameraButton) {
            cameraButton.click();
            onInitialActionHandled?.();
            return;
          }
          const cameraInputElement = targetElement.querySelector('input[type="file"][capture="environment"]');
          if (cameraInputElement) {
            cameraInputElement.click();
            onInitialActionHandled?.();
            return;
          }
        }
      }
      
      // If we get here, we couldn't trigger the input
      // Could not trigger file input - component may not be mounted yet
      onInitialActionHandled?.();
    }, 300); // Increased timeout to ensure refs are registered

    return () => clearTimeout(timer);
  }, [initialAction, initialItemName, onInitialActionHandled]);

  // Group stored photos by product and slot
  const storedPhotos = useMemo(() => {
    if (!photosData?.ok || !photosData?.stored?.uploads || !Array.isArray(photosData.stored.uploads)) {
      return {};
    }

    const grouped = {};
    photosData.stored.uploads.forEach((upload) => {
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
    return grouped;
  }, [photosData]);

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
      <div className="rounded-lg border border-border bg-muted/40 p-6">
        <div className="flex items-center justify-center gap-3">
          <Spinner size="md" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
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
      {productGroups.map((product, groupIndex) => (
         <ProductRow
           key={product.name}
           productName={product.name}
           quantity={product.quantity}
           slots={storedPhotos[product.name] || {}}
           estimateId={estimateId}
           locationId={locationId}
           onUploadComplete={onUploadComplete}
           onError={onError}
           registerProductRef={registerProductRef}
           registerFileInputRef={registerFileInputRef}
           registerCameraInputRef={registerCameraInputRef}
         />
      ))}
    </div>
  );
}
