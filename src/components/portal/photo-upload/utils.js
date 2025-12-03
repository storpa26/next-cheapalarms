/**
 * Utility functions for photo upload
 */

/**
 * Determine product status based on photos and skip state
 */
export function determineProductStatus(product) {
  if (product.skipReason && product.skipReason.trim().length > 0) {
    return 'skipped';
  }
  if (product.photos && product.photos.length > 0) {
    return 'ready';
  }
  return 'pending';
}

/**
 * Get photo count for a product
 */
export function getPhotoCount(product) {
  if (!product.photos) return 0;
  return product.photos.length;
}

/**
 * Calculate overall progress
 */
export function calculateProgress(products) {
  const total = products.length;
  const completed = products.filter(p => {
    const status = determineProductStatus(p);
    return status === 'ready' || status === 'skipped';
  }).length;
  
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Validate if all required products have photos or skip reasons
 */
export function validateAllProducts(products) {
  const requiredProducts = products.filter(p => p.required);
  const incomplete = requiredProducts.filter(p => {
    const status = determineProductStatus(p);
    return status === 'pending';
  });
  
  return {
    isComplete: incomplete.length === 0,
    incompleteCount: incomplete.length,
    incompleteProducts: incomplete,
  };
}

/**
 * Group photos by product name and slot
 */
export function groupPhotosByProduct(uploads) {
  const grouped = {};
  
  (uploads || []).forEach(upload => {
    const itemName = upload.itemName || 'Unknown';
    const slotIndex = upload.slotIndex || 1;
    
    if (!grouped[itemName]) {
      grouped[itemName] = {};
    }
    if (!grouped[itemName][slotIndex]) {
      grouped[itemName][slotIndex] = [];
    }
    
    grouped[itemName][slotIndex].push(upload);
  });
  
  return grouped;
}

