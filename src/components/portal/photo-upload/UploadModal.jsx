import { useState } from "react";
import { X } from "lucide-react";
import { UploadButtons } from "./UploadButtons";
import { PhotoGrid } from "./PhotoGrid";
import { SkipSection } from "./SkipSection";
import { startUploadSession, uploadFile, compressImage } from "@/lib/uploadApi";
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
  // Local modal state (draft)
  const [photos, setPhotos] = useState(product.photos || []);
  const [note, setNote] = useState(product.note || '');
  const [skipReason, setSkipReason] = useState(product.skipReason || '');
  const [isSkipping, setIsSkipping] = useState(!!product.skipReason);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const queryClient = useQueryClient();
  const storePhotosMutation = useStoreEstimatePhotos();

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!file.type.startsWith("image/") || !allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Invalid file type', {
        description: `${file.name} is not supported. Please use JPG, PNG, GIF, or WEBP.`,
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.error('File too large', {
        description: `${file.name} is ${sizeMB}MB. Maximum size is 10MB.`,
      });
      return;
    }

    setUploading(true);

    // Add uploading placeholder
    const tempId = Date.now();
    setPhotos(prev => [...prev, { id: tempId, status: 'uploading' }]);

    try {
      // Start session if needed
      let session = await startUploadSession(estimateId, locationId);

      // Compress image
      const compressedFile = await compressImage(file);

      // Prepare metadata
      const photoIndex = photos.length + 1;
      const metadata = {
        itemName: product.name,
        slotIndex: product.slotIndex || 1,
        photoIndex: photoIndex,
        label: `${product.name} - Photo ${photoIndex}`,
      };

      // Upload with progress
      const result = await uploadFile(compressedFile, metadata, (progressData) => {
        // Update uploading photo with progress
        setPhotos(prev => prev.map(p => 
          p.id === tempId 
            ? { ...p, progress: progressData.progress }
            : p
        ));
      });

      // Replace temp photo with real one
      const newPhoto = {
        id: result.attachmentId,
        url: result.url,
        attachmentId: result.attachmentId,
        filename: compressedFile.name,
        label: metadata.label,
        status: 'saved',
        ...metadata,
      };
      
      setPhotos(prev => prev.map(p => 
        p.id === tempId ? newPhoto : p
      ));

      // AUTO-SAVE: Store immediately after upload
      const currentPhotos = photos.filter(p => p.id !== tempId);
      const updatedPhotos = [...currentPhotos, newPhoto];
      
      // Get existing photos and update
      const cachedPhotos = queryClient.getQueryData(['estimate-photos', estimateId]);
      const existingUploads = (cachedPhotos?.ok && cachedPhotos?.stored?.uploads) 
        ? cachedPhotos.stored.uploads 
        : [];
      
      const otherProductPhotos = existingUploads.filter(
        p => p.itemName !== product.name
      );
      
      const allUploads = [...otherProductPhotos, ...updatedPhotos];
      
      // Optimistic update - update cache immediately
      queryClient.setQueryData(['estimate-photos', estimateId], {
        ok: true,
        stored: { uploads: allUploads }
      });
      
      // Background save to backend
      storePhotosMutation.mutate({
        estimateId,
        locationId,
        uploads: allUploads,
      });

      toast.success('Photo saved', {
        description: compressedFile.name,
        duration: 2000,
      });

    } catch (error) {
      // Remove failed upload
      setPhotos(prev => prev.filter(p => p.id !== tempId));
      
      toast.error('Upload failed', {
        description: error.message,
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!confirm('Delete this photo?')) return;
    
    // Remove from local state
    const updatedPhotos = photos.filter(p => p.id !== photo.id && p.attachmentId !== photo.attachmentId);
    setPhotos(updatedPhotos);
    
    // AUTO-SAVE: Update backend immediately
    const cachedPhotos = queryClient.getQueryData(['estimate-photos', estimateId]);
    const existingUploads = (cachedPhotos?.ok && cachedPhotos?.stored?.uploads) 
      ? cachedPhotos.stored.uploads 
      : [];
    
    const otherProductPhotos = existingUploads.filter(
      p => p.itemName !== product.name
    );
    
    const allUploads = [...otherProductPhotos, ...updatedPhotos];
    
    // Optimistic update
    queryClient.setQueryData(['estimate-photos', estimateId], {
      ok: true,
      stored: { uploads: allUploads }
    });
    
    // Background save
    storePhotosMutation.mutate({
      estimateId,
      locationId,
      uploads: allUploads,
    });
    
    toast.success('Photo removed', {
      duration: 2000,
    });
  };

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
          p => p.itemName !== product.name
        );

        // Store without this product's photos
        await storePhotosMutation.mutateAsync({
          estimateId,
          locationId,
          uploads: otherProductPhotos,
        });
        
        // Optimistic update
        queryClient.setQueryData(['estimate-photos', estimateId], {
          ok: true,
          stored: { uploads: otherProductPhotos }
        });

        toast.success('Product skipped', {
          description: skipReason.trim() || 'No reason provided',
          duration: 2000,
        });
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet - Centered, relative to drawer */}
      <div className="relative bg-white w-full max-w-full md:max-w-md rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
              {product.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {product.quantity > 1 ? `${product.quantity} units` : '1 unit'}
              {product.required && ' • Required'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
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
                    onDelete={handleDeletePhoto}
                    uploading={uploading}
                  />
                </div>
              )}

              {/* Note Field */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                  Note for installer (Optional)
                </label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Front door, show the whole doorway and nearby wall."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none h-24"
                />
              </div>

              {/* Toggle to Skip Mode */}
              <button 
                type="button"
                onClick={() => setIsSkipping(true)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-4"
              >
                I cannot add a photo for this product
              </button>
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
        <div className="p-5 border-t border-slate-100 flex gap-3 bg-white">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full font-semibold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleDone}
            disabled={saving}
            className="flex-1 py-3.5 rounded-full font-bold text-sm bg-primary text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </button>
        </div>
      </div>
    </div>
  );
}

