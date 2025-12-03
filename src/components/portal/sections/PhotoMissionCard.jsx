import { Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useEstimate, useEstimatePhotos } from "@/lib/react-query/hooks";
import { ProductListCard, UploadModal, ProgressBar, calculateProgress, groupPhotosByProduct, validateAllProducts } from "../photo-upload";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Photo Mission Card - Shows product list with upload status
 * Click product → Opens modal directly (no drawer)
 */
export function PhotoMissionCard({
  photoItems,
  estimateId,
  locationId,
  view,
  onLaunchCamera,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [localSubmitted, setLocalSubmitted] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Check submission status (local state OR server data)
  const submissionStatus = view?.photos?.submission_status;
  const isSubmitted = localSubmitted || submissionStatus === 'submitted';
  const submittedAt = view?.photos?.submitted_at;

  // Fetch estimate items
  const { data: estimateData, isLoading } = useEstimate({
    estimateId,
    locationId,
    enabled: !!estimateId,
  });

  // Fetch photos
  const { data: photosData } = useEstimatePhotos({
    estimateId,
    enabled: !!estimateId,
  });

  // Build product list from estimate items
  const products = useMemo(() => {
    if (!estimateData?.ok || !estimateData.items) return [];

    const photosByProduct = groupPhotosByProduct(photosData?.stored?.uploads || []);

    // Group estimate items by name
    const grouped = {};
    estimateData.items.forEach(item => {
      const name = item.name || 'Unknown Item';
      if (!grouped[name]) {
        grouped[name] = {
          name,
          quantity: 0,
          required: true,
          photos: [],
          note: '',
          skipReason: '',
          status: 'pending',
        };
      }
      grouped[name].quantity += item.qty || item.quantity || 1;
    });

    // Add photos to each product and determine status
    Object.keys(grouped).forEach(name => {
      if (photosByProduct[name]) {
        const allPhotos = Object.values(photosByProduct[name]).flat();
        grouped[name].photos = allPhotos;
        grouped[name].status = allPhotos.length > 0 ? 'ready' : 'pending';
      }
    });

    return Object.values(grouped);
  }, [estimateData, photosData]);

  // Calculate progress
  const progress = useMemo(() => calculateProgress(products), [products]);
  
  // Validate completion
  const validation = useMemo(() => validateAllProducts(products), [products]);

  const handleSubmitPhotos = async () => {
    if (!validation.isComplete) {
      setShowValidation(true);
      toast.error('Incomplete', {
        description: `${validation.incompleteCount} required item${validation.incompleteCount !== 1 ? 's' : ''} need photos or to be skipped.`,
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/portal/submit-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estimateId, locationId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.err || errorData.error || 'Submission failed');
      }

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.err || result.error || 'Submission failed');
      }

      // Instant UI feedback
      setLocalSubmitted(true);
      
      // Background refetch of portal status
      queryClient.refetchQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'portal-status' && 
                 query.queryKey[1] === estimateId;
        },
      });
      
      toast.success('Photos submitted successfully', {
        description: `${result.photo_count || 0} photos sent to the installation team.`,
        duration: 4000,
      });
      
    } catch (error) {
      toast.error('Submission failed', {
        description: error.message,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner size="md" />
          <p className="text-sm text-slate-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Photo updates</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Installation photos</h3>
            <p className="text-sm text-slate-500">
              Add photos for each product so installers can see where devices will go.
            </p>
          </div>
          <div className="rounded-full bg-primary/10 p-4">
            <Camera className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Submission Status */}
        {isSubmitted && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Photos submitted {submittedAt && `on ${new Date(submittedAt).toLocaleDateString()}`}
            </p>
            <p className="text-xs text-green-600 mt-1">
              You can still edit. Click a product to add or replace photos.
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {products.length > 0 && (
          <div className="mb-4">
            <ProgressBar 
              completed={progress.completed}
              total={progress.total}
              percent={progress.percent}
            />
          </div>
        )}

        {/* Product List - Beautiful cards */}
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {products.length > 0 ? (
            products.map((product) => {
              const hasError = showValidation && product.required && product.status === 'pending';
              return (
                <ProductListCard
                  key={product.name}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                  hasError={hasError}
                />
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
              No products found
            </div>
          )}
        </div>

        {/* Submit Button - At bottom of card */}
        {products.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="text-center mb-3">
              {validation.isComplete ? (
                <p className="text-xs font-medium text-green-600 flex items-center justify-center gap-1">
                  <Check size={14} /> All required items are ready
                </p>
              ) : (
                <p className="text-xs font-medium text-orange-600 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> {validation.incompleteCount} required item{validation.incompleteCount !== 1 ? 's' : ''} need attention
                </p>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleSubmitPhotos}
              disabled={!validation.isComplete || isSubmitting}
              className={`
                w-full py-4 rounded-full font-bold text-sm transition-all flex justify-center items-center gap-2
                ${validation.isComplete 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl active:scale-[0.98]' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Submitting...
                </>
              ) : isSubmitted ? (
                "Resubmit photos"
              ) : (
                "Submit all photos"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal - Opens directly from portal */}
      {selectedProduct && (
        <UploadModal
          product={selectedProduct}
          estimateId={estimateId}
          locationId={locationId}
          view={view}
          onClose={() => setSelectedProduct(null)}
          onSave={(updatedProduct) => {
            setSelectedProduct(null);
            // React Query will auto-refetch and update the UI
          }}
        />
      )}
    </>
  );
}
