import { Loader2, Trash2, Eye, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

/**
 * Photo grid component - displays uploaded photos in 3-column grid
 * Shows uploading state, delete button, and preview
 */
export function PhotoGrid({ photos = [], onDelete, uploading = false }) {
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const modalRef = useRef(null); // Ref for modal element

  // FIX: Add keyboard navigation and focus trap for preview modal (ESC to close, focus management)
  useEffect(() => {
    if (!previewPhoto) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape' && previewPhoto) {
        setPreviewPhoto(null);
      }
    };

    // FIX: Focus trap - prevent focus from escaping modal
    const handleTab = (e) => {
      if (!previewPhoto) return;
      
      // Use ref or querySelector (fallback) - ref is more reliable
      const modal = modalRef.current || document.querySelector('[role="dialog"][aria-label="Photo preview"]');
      if (!modal) return;
      
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement || (!firstElement && document.activeElement === modal)) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keydown', handleTab);
    
    // FIX: Focus first element when modal opens
    // Use requestAnimationFrame for better timing - ensures DOM is fully rendered and ref is attached
    requestAnimationFrame(() => {
      const modal = modalRef.current || document.querySelector('[role="dialog"][aria-label="Photo preview"]');
      if (modal) {
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          // If no focusable element, focus the modal itself
          modal.focus();
        }
      }
    });
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', handleTab);
    };
  }, [previewPhoto]);

  if (photos.length === 0 && !uploading) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div 
            key={photo.attachmentId || photo.url || photo.id} 
            className="aspect-square rounded-xl bg-muted relative overflow-hidden group border border-border-subtle"
          >
            {photo.status === 'uploading' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                {photo.thumbnailUrl ? (
                  <>
                    <img 
                      src={photo.thumbnailUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover opacity-50"
                      loading="lazy"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                      <Loader2 className="animate-spin text-primary mb-2" size={24} />
                      <div className="w-3/4 h-1 bg-muted rounded-full overflow-hidden mb-1">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${photo.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-foreground font-medium">
                        {photo.progress || 0}%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Loader2 className="animate-spin text-primary mb-2" size={24} />
                    <div className="w-3/4 h-1 bg-muted rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${photo.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {photo.progress || 0}%
                    </span>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* FIX: Validate photo.url before rendering */}
                {photo.url ? (
                  <>
                    <img 
                      src={photo.url} 
                      alt={photo.filename || "Photo"} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      aria-label={`Photo ${photo.photoIndex || ''}: ${photo.filename || 'Uploaded photo'}`}
                    />
                    
                    {/* Overlay Controls - appears on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // FIX: Only set preview if photo has URL
                          if (photo.url) {
                            setPreviewPhoto(photo);
                          }
                        }}
                        className="p-1.5 bg-background rounded-full text-foreground hover:scale-110 transition-transform"
                        title="Preview"
                        aria-label={`Preview ${photo.filename || 'photo'}`}
                        disabled={!photo.url}
                      >
                        <Eye size={14} aria-hidden="true" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(photo);
                        }}
                        className="p-1.5 bg-background rounded-full text-error hover:scale-110 transition-transform"
                        title="Delete"
                        aria-label={`Delete ${photo.filename || 'photo'}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                    
                    {/* Saved badge */}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-success/90 backdrop-blur text-success-foreground text-[9px] font-bold rounded">
                      Saved
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewPhoto && previewPhoto.url && (
        <div 
          ref={modalRef}
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          tabIndex={-1}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={previewPhoto.url} 
              alt={previewPhoto.filename || 'Photo'}
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              loading="eager"
            />
            {/* FIX: Add close button for better accessibility and focus trap */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewPhoto(null);
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/80"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium">{previewPhoto.filename || 'Photo'}</p>
              <p className="text-xs text-gray-300 mt-1">
                {previewPhoto.label || `Photo ${previewPhoto.photoIndex || ''}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

