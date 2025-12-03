import { Camera } from "lucide-react";
import { useState, useMemo } from "react";
import { useEstimate, useEstimatePhotos } from "@/lib/react-query/hooks";
import { ProductListCard, UploadModal, ProgressBar, calculateProgress, groupPhotosByProduct } from "../photo-upload";
import { Spinner } from "@/components/ui/spinner";

/**
 * Photo Mission Card - Shows product list with upload status
 * Click product → Opens modal directly (no drawer)
 */
export function PhotoMissionCard({
  photoItems,
  estimateId,
  locationId,
  onLaunchCamera,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);

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
            products.map((product) => (
              <ProductListCard
                key={product.name}
                product={product}
                onClick={() => setSelectedProduct(product)}
                hasError={false}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal - Opens directly from portal */}
      {selectedProduct && (
        <UploadModal
          product={selectedProduct}
          estimateId={estimateId}
          locationId={locationId}
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
