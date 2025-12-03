import { ChevronRight, Package } from "lucide-react";
import { StatusPill } from "./StatusPill";

/**
 * Product card component for photo upload list
 * Shows product name, quantity, status, and thumbnail preview
 */
export function ProductListCard({ 
  product, 
  onClick, 
  hasError = false 
}) {
  const { name, quantity, photos = [], status, required } = product;
  const showThumbnails = photos.length > 0;
  
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white rounded-2xl p-4 border transition-all active:scale-[0.99] cursor-pointer
        ${hasError 
          ? 'border-red-300 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' 
          : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon Area */}
        <div className={`
          w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
          ${status === 'ready' ? 'bg-primary/10' : 'bg-slate-50'}
        `}>
          <Package className={`h-6 w-6 ${status === 'ready' ? 'text-primary' : 'text-slate-600'}`} />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-sm truncate pr-2">
              {name} {quantity > 1 && `(x${quantity})`}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <div className="shrink-0 ml-2">
              <StatusPill status={status} />
            </div>
          </div>

          {/* Helper Text */}
          <p className={`text-xs mb-3 ${hasError ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
            {hasError 
              ? "Action required" 
              : status === 'skipped' 
                ? 'Skipped (no photo)' 
                : status === 'ready'
                  ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} added`
                  : 'Tap to add photos'
            }
          </p>

          {/* Thumbnails */}
          {showThumbnails && (
            <div className="flex -space-x-2">
              {photos.slice(0, 3).map((photo, idx) => (
                <div 
                  key={photo.attachmentId || photo.url || idx} 
                  className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden bg-slate-200 relative z-0"
                >
                  <img 
                    src={photo.url} 
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
              {photos.length > 3 && (
                <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  +{photos.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Chevron for affordance */}
        {!showThumbnails && (
          <div className="self-center text-slate-300">
            <ChevronRight size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

