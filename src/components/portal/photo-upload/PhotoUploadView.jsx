import { useState, useMemo } from "react";
import { ProductListCard } from "./ProductListCard";
import { UploadModal } from "./UploadModal";
import { ProgressBar } from "./ProgressBar";
import { StickySubmitBar } from "./StickySubmitBar";
import { calculateProgress, validateAllProducts, groupPhotosByProduct } from "./utils";
import { useEstimate, useEstimatePhotos, useStoreEstimatePhotos } from "@/lib/react-query/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

/**
 * Main photo upload view component
 * Displays list of products, manages upload state, handles submission
 */
export function PhotoUploadView({ estimateId, locationId, onComplete, view }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingStatus, setSavingStatus] = useState('Saved just now');
  
  // Check if photos already submitted
  const submissionStatus = view?.photos?.submission_status;
  const isAlreadySubmitted = submissionStatus === 'submitted';
  const submittedAt = view?.photos?.submitted_at;
  
  const queryClient = useQueryClient();
  const storePhotosMutation = useStoreEstimatePhotos();

  // Fetch estimate items
  const { data: estimateData, isLoading: loadingEstimate, error: estimateError } = useEstimate({
    estimateId,
    locationId,
    enabled: !!estimateId,
  });

  // Fetch photos
  const { data: photosData, isLoading: loadingPhotos } = useEstimatePhotos({
    estimateId,
    enabled: !!estimateId,
  });

  // Build product list from estimate items
  const products = useMemo(() => {
    if (!estimateData?.ok || !estimateData.items) return [];

    // Group photos by product
    const photosByProduct = groupPhotosByProduct(photosData?.stored?.uploads || []);

    // Group estimate items by name (handle quantities)
    const grouped = {};
    estimateData.items.forEach(item => {
      const name = item.name || 'Unknown Item';
      if (!grouped[name]) {
        grouped[name] = {
          name,
          quantity: 0,
          required: true, // Assume all are required
          photos: [],
          note: '',
          skipReason: '',
        };
      }
      grouped[name].quantity += item.qty || item.quantity || 1;
    });

    // Add photos to each product
    Object.keys(grouped).forEach(name => {
      if (photosByProduct[name]) {
        // Flatten all photos for this product across all slots
        const allPhotos = Object.values(photosByProduct[name]).flat();
        grouped[name].photos = allPhotos;
      }
      
      // Add slotIndex for first unit
      grouped[name].slotIndex = 1;
    });

    return Object.values(grouped);
  }, [estimateData, photosData]);

  // Calculate progress
  const progress = useMemo(() => calculateProgress(products), [products]);
  
  // Validate completion
  const validation = useMemo(() => validateAllProducts(products), [products]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setShowValidation(false);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (updatedProduct) => {
    setSavingStatus('Saving...');
    
    try {
      // Get all photos from all products
      const allPhotos = products.flatMap(p => 
        p.name === updatedProduct.name ? updatedProduct.photos : p.photos
      );

      // Store updated photos
      await storePhotosMutation.mutateAsync({
        estimateId,
        locationId,
        uploads: allPhotos,
      });

      // Refetch to update UI
      await queryClient.invalidateQueries(['estimate-photos', estimateId]);
      
      handleCloseModal();
      
      setTimeout(() => {
        setSavingStatus('Saved just now');
      }, 1000);

      // Show appropriate message based on action
      const isSkipped = updatedProduct.status === 'skipped';
      const hasPhotos = updatedProduct.photos && updatedProduct.photos.length > 0;
      
      if (isSkipped) {
        toast.success('Product skipped', {
          description: updatedProduct.skipReason || 'No reason provided',
          duration: 2000,
        });
      } else if (hasPhotos) {
        toast.success('Photos saved', {
          description: `${updatedProduct.photos.length} photo${updatedProduct.photos.length !== 1 ? 's' : ''} added`,
          duration: 2000,
        });
      } else {
        toast.success('Changes saved', {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error('Failed to save', {
        description: error.message,
      });
      setSavingStatus('Save failed');
    }
  };

  const handleSubmitAll = async () => {
    if (!validation.isComplete) {
      setShowValidation(true);
      toast.error('Incomplete', {
        description: `${validation.incompleteCount} required item${validation.incompleteCount !== 1 ? 's' : ''} need photos or to be skipped.`,
      });
      
      // Scroll to first error
      const firstIncomplete = validation.incompleteProducts[0];
      if (firstIncomplete) {
        // Could add scroll-to-element logic here
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit photos to backend
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

      // Invalidate portal status to refresh submission status
      await queryClient.invalidateQueries(['portal-status', estimateId]);
      
      toast.success('Photos submitted successfully', {
        description: 'Your photos have been sent to the installation team.',
        duration: 4000,
      });
      
      // Close the photo manager
      if (onComplete) {
        onComplete();
      }
      
    } catch (error) {
      toast.error('Submission failed', {
        description: error.message,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loadingEstimate || loadingPhotos) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="ml-3 text-sm text-slate-500">Loading products...</p>
      </div>
    );
  }

  // Error state
  if (estimateError) {
    return (
      <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-semibold">Error loading estimate</p>
        <p className="text-sm mt-1">{estimateError.message}</p>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
        <p className="font-semibold text-slate-900">No products found</p>
        <p className="text-sm text-slate-500 mt-1">This estimate doesn't have any products yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pb-32">
      {/* Sticky Header with Progress */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 pb-4 pt-6 px-5 transition-all">
        <div className="w-full">
          <div className="flex justify-between items-start mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Installation Photos</h1>
            <span className={`text-xs font-medium transition-colors ${
              savingStatus === 'Saving...' ? 'text-primary' : 'text-slate-400'
            }`}>
              {savingStatus}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4 leading-snug pr-4">
            Add photos for each product so installers can see where devices will go.
          </p>
          
          {/* Submission Status Warning */}
          {isAlreadySubmitted && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-800 font-medium">
                ✓ Photos already submitted {submittedAt && (() => {
                  try {
                    const date = new Date(submittedAt);
                    if (!isNaN(date.getTime())) {
                      return `on ${date.toLocaleDateString()}`;
                    }
                  } catch {}
                  return null;
                })()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can still add or edit photos. Click "Submit photos" again when done.
              </p>
            </div>
          )}
          
          {/* Progress Bar */}
          <ProgressBar 
            completed={progress.completed}
            total={progress.total}
            percent={progress.percent}
          />
        </div>
      </header>

      {/* Product List */}
      <main className="p-5 space-y-4">
        {products.map((product) => {
          const hasError = showValidation && product.required && product.status === 'pending';
          
          return (
            <ProductListCard
              key={product.name}
              product={product}
              onClick={() => handleOpenModal(product)}
              hasError={hasError}
            />
          );
        })}
      </main>

      {/* Sticky Submit Bar */}
      <StickySubmitBar
        isComplete={validation.isComplete}
        incompleteCount={validation.incompleteCount}
        onSubmit={handleSubmitAll}
        isSubmitting={isSubmitting}
        isResubmit={isAlreadySubmitted}
      />

      {/* Upload Modal */}
      {selectedProduct && (
        <UploadModal
          product={selectedProduct}
          estimateId={estimateId}
          locationId={locationId}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

