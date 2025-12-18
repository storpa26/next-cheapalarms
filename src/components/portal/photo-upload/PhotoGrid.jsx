import { Loader2, Trash2, Eye } from "lucide-react";
import { useState } from "react";

/**
 * Photo grid component - displays uploaded photos in 3-column grid
 * Shows uploading state, delete button, and preview
 */
export function PhotoGrid({ photos = [], onDelete, uploading = false }) {
  const [previewPhoto, setPreviewPhoto] = useState(null);

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
                <Loader2 className="animate-spin text-primary mb-1" size={20} />
                <span className="text-[10px] text-muted-foreground font-medium">Uploading...</span>
              </div>
            ) : (
              <>
                <img 
                  src={photo.url} 
                  alt={photo.filename || "Photo"} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Overlay Controls - appears on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewPhoto(photo);
                    }}
                    className="p-1.5 bg-background rounded-full text-foreground hover:scale-110 transition-transform"
                    title="Preview"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(photo);
                    }}
                    className="p-1.5 bg-background rounded-full text-error hover:scale-110 transition-transform"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {/* Saved badge */}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-success/90 backdrop-blur text-success-foreground text-[9px] font-bold rounded">
                  Saved
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewPhoto && (
        <div 
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={previewPhoto.url} 
              alt={previewPhoto.filename}
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
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

