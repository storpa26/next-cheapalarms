/**
 * Utility functions for photo upload
 */

/**
 * Determine product status based on photos, skip state, and required flag
 */
export function determineProductStatus(product) {
  // If product is optional (required: false), mark as optional unless photos added
  if (!product.required) {
    if (product.photos && product.photos.length > 0) {
      return 'ready'; // Optional but customer added photos anyway
    }
    return 'optional'; // Optional and no photos needed
  }
  
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
 * Only counts required products toward completion
 */
export function calculateProgress(products) {
  // Only count required products toward progress
  const requiredProducts = products.filter(p => p.required !== false);
  const total = requiredProducts.length;
  const completed = requiredProducts.filter(p => {
    const status = determineProductStatus(p);
    return status === 'ready' || status === 'skipped';
  }).length;
  
  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    optionalCount: products.length - requiredProducts.length,
  };
}

/**
 * Validate if all required products have photos or skip reasons
 * Optional products (required: false) are not validated
 */
export function validateAllProducts(products) {
  // Only validate required products
  const requiredProducts = products.filter(p => p.required !== false);
  const incomplete = requiredProducts.filter(p => {
    const status = determineProductStatus(p);
    return status === 'pending';
  });
  
  return {
    isComplete: incomplete.length === 0,
    incompleteCount: incomplete.length,
    incompleteProducts: incomplete,
    optionalCount: products.filter(p => p.required === false).length,
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

