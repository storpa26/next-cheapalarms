import { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UploadButtons } from "./UploadButtons";
import { PhotoGrid } from "./PhotoGrid";
import { SkipSection } from "./SkipSection";
import { startUploadSession, uploadFile, compressImage, getCurrentSession, clearSession, UPLOAD_CONFIG } from "@/lib/uploadApi";
import { useStoreEstimatePhotos } from "@/lib/react-query/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Upload modal component - bottom sheet for uploading photos to a single product
 * Supports camera, gallery, skip with reason
 */
export function UploadModal({
  product,
  estimateId,
  locationId,
  onClose,
  onSave,
}) {
  // FIX: Validate product prop - return early if missing (defensive programming)
  if (!product) {
    // FIX: Only log in development to avoid leaking info in production
    if (process.env.NODE_ENV === 'development') {
      console.error('UploadModal: product prop is required');
    }
    return null; // Gracefully handle missing product
  }
  
  // Local modal state (draft) - use optional chaining for safety
  const [photos, setPhotos] = useState(product?.photos || []);
  const [note, setNote] = useState(product?.note || '');
  const [skipReason, setSkipReason] = useState(product?.skipReason || '');
  const [isSkipping, setIsSkipping] = useState(!!product?.skipReason);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  
  const queryClient = useQueryClient();
  const storePhotosMutation = useStoreEstimatePhotos();
  
  // Refs for cleanup and tracking
  const thumbnailUrlsRef = useRef(new Set()); // Track thumbnail URLs for cleanup
  const uploadAbortControllersRef = useRef(new Map()); // Track uploads for cancellation (Map<tempId, abortFunction>)
  const progressDebounceTimersRef = useRef(new Map()); // Debounce progress updates
  const isMountedRef = useRef(true); // Track if component is mounted (prevents state updates after unmount)

  // Helper function to create thumbnail preview (MEMORY LEAK FIX: useCallback + cleanup)
  // Note: Data URLs don't need revoking, but we track them for memory awareness
  const createThumbnail = useCallback(async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = UPLOAD_CONFIG.thumbnailSize; // Use constant
          canvas.width = size;
          canvas.height = size;
          
          // Center and crop to square
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size / 2) - (img.width / 2) * scale;
          const y = (size / 2) - (img.height / 2) * scale;
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', UPLOAD_CONFIG.thumbnailQuality);
          
          // Track thumbnail URL for cleanup awareness (data URLs are cleaned up automatically when no longer referenced)
          if (thumbnailUrl) {
            thumbnailUrlsRef.current.add(thumbnailUrl);
          }
          
          resolve(thumbnailUrl);
        };
        
        img.onerror = () => {
          resolve(null);
        };
        
        // Use data URL from FileReader (already converted, no object URL needed)
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        resolve(null);
      };
      
      reader.readAsDataURL(file);
    });
  }, []);
  
  // Cleanup effect for memory management
  useEffect(() => {
    isMountedRef.current = true; // Mark as mounted
    
    // FIX: Add page unload handler to cancel uploads when user closes tab/browser
    const handleBeforeUnload = (e) => {
      // Cancel all uploads when page is closing
      uploadAbortControllersRef.current.forEach((abortFn) => {
        if (typeof abortFn === 'function') {
          abortFn();
        }
      });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      isMountedRef.current = false; // Mark as unmounted to prevent state updates after unmount
      
      // PHASE 1: Don't cancel uploads on unmount - let them continue in background
      // Uploads will complete and auto-save automatically
      
      // Clear progress debounce timers to prevent state updates on unmounted component
      progressDebounceTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      progressDebounceTimersRef.current.clear();
      
      // Note: Thumbnail URLs are data URLs (base64), not blob URLs, so they don't need revoking
      // But we clear the tracking set anyway for memory
      thumbnailUrlsRef.current.clear();
      
      // Note: We don't clear the session on unmount because uploads are still in progress
      // The session will expire naturally or be cleaned up by the uploadApi cleanup function
      // Clearing it here would cause uploads to fail
      
      // Remove beforeunload listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [estimateId]);

  // FIX: Wrap handleFileSelect with useCallback to prevent unnecessary re-renders
  const handleFileSelect = useCallback(async (files) => {
    // MUST FIX: Prevent concurrent upload batches - guard against race condition
    if (uploading) {
      toast.warning('Upload already in progress', {
        description: 'Please wait for current uploads to complete',
        duration: 2000,
      });
      return;
    }
    
    // Support both single file and FileList
    const fileArray = files instanceof FileList 
      ? Array.from(files) 
      : Array.isArray(files) 
        ? files 
        : [files];
    
    if (fileArray.length === 0) return;

    // Validate all files first
    // FIX: Use UPLOAD_CONFIG constants instead of hardcoded values
    const validFiles = [];
    for (const file of fileArray) {
      if (!file) continue;

      const allowedTypes = UPLOAD_CONFIG.supportedFormats.concat(['image/jpg']); // Include jpg variant
      if (!file.type.startsWith("image/") || !allowedTypes.includes(file.type.toLowerCase())) {
        toast.error('Invalid file type', {
          description: `${file.name} is not supported. Please use JPG, PNG, GIF, or WEBP.`,
        });
        continue;
      }

      const maxSize = UPLOAD_CONFIG.maxFileSize;
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        toast.error('File too large', {
          description: `${file.name} is ${sizeMB}MB. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`,
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // MUST FIX: Check if component is mounted before updating state
    if (!isMountedRef.current) return;
    setUploading(true);

    // Ensure session exists (reuse if valid)
    // FIX: Add error handling for session creation to prevent stuck uploading state
    // FIX: Get session for specific estimateId (Map-based) - this already cleans up expired sessions
    let session = getCurrentSession(estimateId);
    
    // FIX: Check expiry AFTER getCurrentSession (which already cleaned up expired ones)
    // If session exists, check if it's expired or belongs to different estimate
    const now = Date.now() / 1000;
    const isSessionExpired = session?.exp != null && 
                             session.exp !== 0 && 
                             typeof session.exp === 'number' &&
                             session.exp < now;
    
    try {
      // FIX: Proper check order - session.estimateId check only if session exists
      if (!session || isSessionExpired || (session.estimateId !== estimateId)) {
        session = await startUploadSession(estimateId, locationId);
      }
      
      // FIX: Validate session after creation
      if (!session || !session.token) {
        throw new Error('Failed to start upload session: Invalid session token');
      }
    } catch (error) {
      toast.error('Failed to start upload session', {
        description: error.message || 'Please try again',
        duration: 5000,
      });
      // MUST FIX: Check if component is mounted before updating state
      if (isMountedRef.current) {
        setUploading(false);
      }
      return; // Exit early to prevent stuck state
    }

    // FIX: Get current photos count from state snapshot to avoid stale closure
    const currentPhotosSnapshot = photos;
    
    // Create upload tasks with placeholders
    // FIX: Add randomness to tempId to prevent collision if multiple files selected in same millisecond
    const uploadTasks = validFiles.map((file, index) => ({
      file,
      tempId: Date.now() + index + Math.random() * 1000, // FIX: Add randomness
      photoIndex: currentPhotosSnapshot.length + index + 1, // FIX: Use snapshot instead of closure
    }));

    // FIX RACE CONDITION: Create all thumbnails first, then batch update state
    // FIX: Use Promise.allSettled to handle thumbnail creation errors gracefully
    const thumbnailResults = await Promise.allSettled(
      uploadTasks.map(async ({ file, tempId }) => {
        try {
          const thumbnailUrl = await createThumbnail(file);
          return { tempId, thumbnailUrl };
        } catch (error) {
          // Return null on error instead of throwing - allows upload to continue
          return { tempId, thumbnailUrl: null };
        }
      })
    );

    // Extract valid thumbnail results (filter out rejected promises)
    const validThumbnails = thumbnailResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // FIX RACE CONDITION: Batch update state once with all thumbnails
    // MUST FIX: Check if component is mounted before updating state
    if (isMountedRef.current) {
      setPhotos(prev => {
        const newPhotos = validThumbnails.map(({ tempId, thumbnailUrl }) => ({
          id: tempId,
          status: 'uploading',
          progress: 0,
          thumbnailUrl, // May be null if thumbnail creation failed - UI handles this
        }));
        return [...prev, ...newPhotos];
      });
    }

    // Upload all files in parallel
    const uploadPromises = uploadTasks.map(async ({ file, tempId, photoIndex }) => {
      try {
        // Compress image (non-blocking with Web Worker)
        const compressedFile = await compressImage(file);

        // Prepare metadata - use optional chaining for safety
        const metadata = {
          itemName: product?.name || 'Unknown Product',
          slotIndex: product?.slotIndex || 1,
          photoIndex: photoIndex,
          label: `${product?.name || 'Unknown Product'} - Photo ${photoIndex}`,
        };

        // Upload with progress (DEBOUNCED to prevent excessive re-renders)
        // FIX: Store upload promise with abort function for cancellation
        // FIX: Pass estimateId to uploadFile for proper session lookup
        const uploadPromise = uploadFile(compressedFile, metadata, (progressData) => {
          // FIX: Force immediate update for 100% progress (don't debounce final update)
          if (progressData.progress === 100) {
            // Clear any pending debounce timer
            const existingTimer = progressDebounceTimersRef.current.get(tempId);
            if (existingTimer) {
              clearTimeout(existingTimer);
              progressDebounceTimersRef.current.delete(tempId);
            }
            // MUST FIX: Check if component is mounted before updating state
            if (isMountedRef.current) {
              setPhotos(prev => prev.map(p => 
                p.id === tempId 
                  ? { ...p, progress: 100, status: 'completed' }
                  : p
              ));
            }
            return;
          }
          
          // Debounce progress updates for non-100% values
          const existingTimer = progressDebounceTimersRef.current.get(tempId);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }
          
          // MUST FIX: Check if component is mounted before updating state (prevents React warning/crash)
          const timer = setTimeout(() => {
            if (isMountedRef.current) {
              setPhotos(prev => prev.map(p => 
                p.id === tempId 
                  ? { ...p, progress: progressData.progress, status: 'uploading' }
                  : p
              ));
            }
            progressDebounceTimersRef.current.delete(tempId);
          }, UPLOAD_CONFIG.progressUpdateInterval);
          
          progressDebounceTimersRef.current.set(tempId, timer);
        }, null, estimateId); // FIX: Pass estimateId as 5th parameter for proper session lookup
        
        // MUST FIX: Store abort function with cleanup - clears timer AND aborts upload
        uploadAbortControllersRef.current.set(tempId, () => {
          // Clear progress debounce timer first (prevents state update after abort)
          const timer = progressDebounceTimersRef.current.get(tempId);
          if (timer) {
            clearTimeout(timer);
            progressDebounceTimersRef.current.delete(tempId);
          }
          // Then abort the upload
          if (uploadPromise.abort && typeof uploadPromise.abort === 'function') {
            uploadPromise.abort();
          }
        });
        
        // Wait for upload to complete
        const result = await uploadPromise;

        // FIX: Validate upload response before using it (security: don't trust server blindly)
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid upload response: expected object');
        }
        // FIX: attachmentId can be number (WordPress post ID) or string - convert to string for consistency
        if (!result.attachmentId || (typeof result.attachmentId !== 'string' && typeof result.attachmentId !== 'number')) {
          throw new Error('Invalid upload response: missing or invalid attachmentId');
        }
        // Convert to string for consistency (WordPress returns number, but we use as string ID)
        const attachmentIdStr = String(result.attachmentId);
        if (attachmentIdStr.trim() === '') {
          throw new Error('Invalid upload response: empty attachmentId');
        }
        // FIX: Allow both absolute (https?) and relative URLs for flexibility
        if (!result.url || typeof result.url !== 'string' || 
            (!result.url.match(/^https?:\/\//) && !result.url.startsWith('/'))) {
          throw new Error('Invalid upload response: missing or invalid url (must be absolute or relative)');
        }

        // Replace temp with real photo
        const newPhoto = {
          id: attachmentIdStr, // Use string version for consistency
          url: result.url,
          attachmentId: attachmentIdStr, // Use string version for consistency
          filename: compressedFile.name,
          label: metadata.label,
          status: 'saved',
          ...metadata,
        };

        // MUST FIX: Check if component is mounted before updating state
        if (isMountedRef.current) {
          setPhotos(prev => prev.map(p => 
            p.id === tempId ? newPhoto : p
          ));
        }

        // FIX: Remove abort function from tracking on success
        uploadAbortControllersRef.current.delete(tempId);
        
        return { success: true, photo: newPhoto, tempId };
      } catch (error) {
        // FIX: Clear debounce timer on error before removing photo
        const existingTimer = progressDebounceTimersRef.current.get(tempId);
        if (existingTimer) {
          clearTimeout(existingTimer);
          progressDebounceTimersRef.current.delete(tempId);
        }
        
        // FIX: Remove abort function from tracking on error
        uploadAbortControllersRef.current.delete(tempId);
        
        // MUST FIX: Check if component is mounted before updating state
        if (isMountedRef.current) {
          setPhotos(prev => prev.filter(p => p.id !== tempId));
        }
        return { success: false, error: error.message, tempId };
      }
    });

    // Wait for all uploads to complete
    const results = await Promise.allSettled(uploadPromises);

    // Process results
    const successfulPhotos = [];
    const failed = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successfulPhotos.push(result.value.photo);
      } else {
        const error = result.status === 'rejected' 
          ? result.reason?.message || 'Upload failed'
          : result.value?.error || 'Upload failed';
        failed.push(error);
      }
    });

    // Update cache with all successful photos
    if (successfulPhotos.length > 0) {
      // FIX: Use functional update to get latest state instead of stale closure variable
      queryClient.setQueryData(['estimate-photos', estimateId], (oldData) => {
        const existingUploads = (oldData?.ok && oldData?.stored?.uploads) 
          ? oldData.stored.uploads 
          : [];
        
        const otherProductPhotos = existingUploads.filter(
          p => p.itemName !== (product?.name || 'Unknown Product')
        );
        
        // Get current saved photos from existing cache (not from closure variable)
        // Exclude photos that are being uploaded now (they have attachmentIds in successfulPhotos)
        const successfulAttachmentIds = new Set(successfulPhotos.map(p => p.attachmentId));
        const currentSavedPhotos = existingUploads.filter(p => 
          p.itemName === (product?.name || 'Unknown Product') && 
          p.status === 'saved' && 
          !successfulAttachmentIds.has(p.attachmentId)
        );
        
        const allUploads = [...otherProductPhotos, ...currentSavedPhotos, ...successfulPhotos];
        
        return {
          ok: true,
          stored: { uploads: allUploads }
        };
      });
      
      // Get final state for background save
      const finalCachedPhotos = queryClient.getQueryData(['estimate-photos', estimateId]);
      const finalUploads = (finalCachedPhotos?.ok && finalCachedPhotos?.stored?.uploads) 
        ? finalCachedPhotos.stored.uploads 
        : [];
      
      // Background save with error handling
      // FIX: Remove empty onError handler - hook's default error handling is sufficient
      storePhotosMutation.mutate({
        estimateId,
        locationId,
        uploads: finalUploads,
      });

      toast.success(`${successfulPhotos.length} photo(s) saved`, {
        duration: 2000,
      });
    }

    // Show errors (UX FIX: Batch multiple errors into summary)
    if (failed.length > 0) {
      if (failed.length === 1) {
        toast.error('Upload failed', {
          description: failed[0],
          duration: 5000,
        });
      } else {
        // Batch multiple errors into single summary toast
        toast.error(`${failed.length} upload(s) failed`, {
          description: failed.slice(0, 3).join(', ') + (failed.length > 3 ? ` and ${failed.length - 3} more...` : ''),
          duration: 7000,
        });
      }
    }

    // FIX: Clear all pending debounce timers immediately
    // React batches state updates, so we don't need to wait for timers to naturally expire
    // Clearing timers prevents state updates on unmounted components
    progressDebounceTimersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });
    progressDebounceTimersRef.current.clear();
    
    // MUST FIX: Check if component is mounted before updating state
    if (isMountedRef.current) {
      setUploading(false);
    }
    // FIX: photos IS needed in dependencies because we use photos.length for photoIndex calculation
    // Without it, we'd use a stale photos.length value, causing incorrect indexing
    // The callback being recreated when photos changes is acceptable since we need the latest state
    // FIX: uploading IS needed in dependencies for the concurrent upload guard
  }, [estimateId, locationId, photos, uploading, product?.name, product?.slotIndex, queryClient, storePhotosMutation, createThumbnail]);

  const handleDeletePhotoClick = (photo) => {
    setPhotoToDelete(photo);
    setDeleteDialogOpen(true);
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;
    
    // FIX: Capture original photos state BEFORE any mutations to avoid stale closure
    const originalPhotosSnapshot = photos;
    
    // Remove from local state
    const updatedPhotos = photos.filter(p => p.id !== photoToDelete.id && p.attachmentId !== photoToDelete.attachmentId);
    // MUST FIX: Check if component is mounted before updating state
    if (isMountedRef.current) {
      setPhotos(updatedPhotos);
    }
    
    // AUTO-SAVE: Update backend immediately
    const cachedPhotos = queryClient.getQueryData(['estimate-photos', estimateId]);
    const existingUploads = (cachedPhotos?.ok && cachedPhotos?.stored?.uploads) 
      ? cachedPhotos.stored.uploads 
      : [];
    
    const otherProductPhotos = existingUploads.filter(
      p => p.itemName !== (product?.name || 'Unknown Product')
    );
    
    const allUploads = [...otherProductPhotos, ...updatedPhotos];
    
    // Optimistic update (before mutation)
    queryClient.setQueryData(['estimate-photos', estimateId], {
      ok: true,
      stored: { uploads: allUploads }
    });
    
    // FIX: Move success toast to onSuccess callback to prevent race condition
    // Background save with error handling
    storePhotosMutation.mutate({
      estimateId,
      locationId,
      uploads: allUploads,
    }, {
      onSuccess: () => {
        // FIX: Success toast in callback - only shows if mutation succeeds
        toast.success('Photo removed', {
          duration: 2000,
        });
        setDeleteDialogOpen(false);
        setPhotoToDelete(null);
      },
      onError: (error) => {
        // MUST FIX: Check if component is mounted before updating state
        if (isMountedRef.current) {
          // FIX: Revert optimistic update on error
          queryClient.setQueryData(['estimate-photos', estimateId], cachedPhotos);
          // FIX: Use captured snapshot instead of closure variable to avoid stale state
          setPhotos(originalPhotosSnapshot);
        }
        toast.error('Failed to remove photo', {
          description: error.message || 'Please try again',
          duration: 5000,
        });
      }
    });
  };

  // PHASE 1: Allow uploads to continue in background - don't cancel on modal close
  const handleClose = useCallback(() => {
    // Clear progress debounce timers to prevent state updates after modal closes
    // But DON'T cancel uploads - let them continue in background
    progressDebounceTimersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });
    progressDebounceTimersRef.current.clear();
    
    // Note: Uploads continue in background and will auto-save when complete
    // User can close modal and continue working - uploads won't be cancelled
    
    // Close modal
    onClose();
  }, [onClose]);

  const handleDone = async () => {
    // Photos are auto-saved after upload, just need to handle skip/note
    setSaving(true);
    
    try {
      // If skipping, store the skip status
      if (isSkipping) {
        const cachedPhotos = queryClient.getQueryData(['estimate-photos', estimateId]);
        const existingUploads = (cachedPhotos?.ok && cachedPhotos?.stored?.uploads) 
          ? cachedPhotos.stored.uploads 
          : [];

        // Remove any photos for this product (skipping = no photos)
        const otherProductPhotos = existingUploads.filter(
          p => p.itemName !== (product?.name || 'Unknown Product')
        );

        // FIX: Apply optimistic update BEFORE mutation (for instant UI feedback)
        queryClient.setQueryData(['estimate-photos', estimateId], {
          ok: true,
          stored: { uploads: otherProductPhotos }
        });

        // Store without this product's photos
        try {
          await storePhotosMutation.mutateAsync({
            estimateId,
            locationId,
            uploads: otherProductPhotos,
          });

          toast.success('Product skipped', {
            description: skipReason.trim() || 'No reason provided',
            duration: 2000,
          });
        } catch (error) {
          // FIX: Revert optimistic update on error
          queryClient.setQueryData(['estimate-photos', estimateId], cachedPhotos);
          throw error; // Re-throw to be caught by outer try-catch
        }
      }
      
      // Determine final status
      const status = isSkipping 
        ? 'skipped' 
        : photos.length > 0 
          ? 'ready' 
          : 'pending';

      // Close modal
      onSave({
        ...product,
        photos: isSkipping ? [] : photos,
        note: note.trim(),
        skipReason: isSkipping ? skipReason.trim() : '',
        status,
      });
    } catch (error) {
      toast.error('Failed to update', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Centered Modal */}
      <div className="relative bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-foreground line-clamp-1">
              {product?.name || 'Product'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(product?.quantity || 1) > 1 ? `${product?.quantity || 1} units` : '1 unit'}
              {product?.required && ' • Required'}
            </p>
          </div>
          <Button 
            type="button"
            onClick={handleClose} 
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1">
          
          {!isSkipping ? (
            <>
              {/* Upload Buttons */}
              <div className="mb-6">
                <UploadButtons 
                  onFileSelect={handleFileSelect}
                  uploading={uploading}
                />
              </div>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="mb-6">
                  <PhotoGrid 
                    photos={photos}
                    onDelete={handleDeletePhotoClick}
                    uploading={uploading}
                  />
                </div>
              )}

              {/* Note Field */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Note for installer (Optional)
                </label>
                <Textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Front door, show the whole doorway and nearby wall."
                  className="h-24"
                />
              </div>

              {/* Toggle to Skip Mode */}
              <Button 
                type="button"
                onClick={() => setIsSkipping(true)}
                variant="link"
                className="text-xs underline decoration-border underline-offset-4"
              >
                I cannot add a photo for this product
              </Button>
            </>
          ) : (
            <SkipSection 
              skipReason={skipReason}
              onSkipReasonChange={setSkipReason}
              onCancel={() => setIsSkipping(false)}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-border flex gap-3 bg-surface">
          <Button 
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1 rounded-full"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleDone}
            disabled={saving}
            variant="default"
            className="flex-1 rounded-full shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              isSkipping ? 'Skip' : 'Done'
            )}
          </Button>
        </div>
      </div>

      {/* Delete Photo Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

