/**
 * Upload API - Direct WordPress REST API communication
 * Ported from reference implementation that works perfectly
 */

// Get WordPress API base from environment
const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:10013/wp-json';

// Upload configuration constants
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  compressionQuality: 0.8,
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  timeout: 30000, // 30 seconds
  maxImageWidth: 1920,
  maxImageHeight: 1920,
  compressionSizeThreshold: 2 * 1024 * 1024, // 2MB - skip compression for files smaller than this
  workerTimeout: 10000, // 10 seconds
  thumbnailSize: 200,
  thumbnailQuality: 0.7,
  progressUpdateInterval: 200, // Debounce progress updates (ms)
};

// Export config for use in components
export { UPLOAD_CONFIG };

// FIX: Store sessions per estimateId to avoid conflicts between multiple modals/tabs
// Map<estimateId, session>
const sessionMap = new Map();

// Web Worker pool for compression (limit concurrent workers)
let activeWorkerCount = 0;
const MAX_CONCURRENT_WORKERS = 3; // Limit concurrent workers to prevent resource exhaustion

// Track active XMLHttpRequest instances for cancellation
const activeXhrInstances = new Map(); // Map<uploadId, XMLHttpRequest>
// FIX: Track upload promises for proper abort handling
const uploadPromises = new Map(); // Map<uploadId, { promise, reject }>
let uploadIdCounter = 0;

/**
 * Start upload session with token
 * FIX: Validate inputs and use Map-based session storage
 */
export async function startUploadSession(estimateId, locationId) {
  // FIX: Add input validation
  if (!estimateId || typeof estimateId !== 'string' || estimateId.trim() === '') {
    throw new Error('Invalid estimateId: must be a non-empty string');
  }
  if (!locationId || typeof locationId !== 'string' || locationId.trim() === '') {
    throw new Error('Invalid locationId: must be a non-empty string');
  }

  // FIX: Clean up expired sessions before storing new one (prevents memory leaks)
  cleanupExpiredSessions();

  try {
    const response = await fetch(`${WP_API_BASE}/ca/v1/upload/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        estimateId: estimateId.trim(),
        locationId: locationId.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.err || errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.ok || !data.token) {
      throw new Error(data.err || data.error || 'Failed to start upload session');
    }

    // FIX: Store session per estimateId instead of global variable
    const session = {
      token: data.token,
      estimateId: estimateId.trim(),
      locationId: locationId.trim(),
      exp: data.exp,
      startTime: Date.now(),
    };

    sessionMap.set(estimateId.trim(), session);
    return session;
  } catch (error) {
    throw new Error(`Failed to start upload session: ${error.message}`);
  }
}

/**
 * Upload a single file with progress tracking
 * Uses XMLHttpRequest for real-time progress updates
 * Returns an object with promise and abort function for cancellation
 */
export function uploadFile(file, metadata, onProgress, uploadId = null, estimateId = null) {
  // FIX: Get session from Map based on estimateId
  // If estimateId not provided, try to get from metadata or use first available session
  let session = null;
  if (estimateId) {
    session = sessionMap.get(estimateId);
  } else if (metadata?.estimateId) {
    session = sessionMap.get(metadata.estimateId);
  } else {
    // Fallback: use first available session (backward compatibility)
    const sessions = Array.from(sessionMap.values());
    session = sessions.length > 0 ? sessions[0] : null;
  }

  if (!session) {
    return Promise.reject(new Error('No active upload session. Call startUploadSession first.'));
  }

  // Validate file
  // FIX: Normalize image/jpg to image/jpeg for validation (browsers may send either)
  const normalizedFileType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (!UPLOAD_CONFIG.supportedFormats.includes(normalizedFileType)) {
    return Promise.reject(new Error(`Unsupported file type: ${file.type}`));
  }

  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    const maxSizeMB = (UPLOAD_CONFIG.maxFileSize / (1024 * 1024)).toFixed(0);
    return Promise.reject(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${maxSizeMB}MB)`));
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('token', session.token);
  
  // Add metadata
  if (metadata) {
    Object.keys(metadata).forEach(key => {
      if (metadata[key] !== undefined && metadata[key] !== null) {
        formData.append(key, String(metadata[key]));
      }
    });
  }

  // Create XMLHttpRequest for progress tracking
  // FIX: Store XHR instance for cancellation support
  const xhr = new XMLHttpRequest();
  const id = uploadId || `upload_${++uploadIdCounter}_${Date.now()}`;
  activeXhrInstances.set(id, xhr);

  // Track last progress to avoid redundant 100% update
  let lastProgressEventValue = 0;
  let isResolved = false; // Track if promise is resolved/rejected
  let isAborted = false; // Track if upload was aborted
  let promiseRejectFn = null; // Capture reject function for abort

  const promise = new Promise((resolve, reject) => {
    promiseRejectFn = reject; // Capture reject for abort
    
    // Track upload progress
    // FIX: Let UploadModal handle all debouncing logic - just pass through progress events
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress && !isResolved && !isAborted) {
        const progress = Math.round((event.loaded / event.total) * 100);
        lastProgressEventValue = progress; // Update last known progress
        
        // Pass progress through normally - UploadModal will handle debouncing
        onProgress({
          progress,
          loaded: event.loaded,
          total: event.total,
          status: progress === 100 ? 'completed' : 'uploading',
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (isAborted) return; // Ignore if already aborted
      
      // FIX: Remove XHR and promise from tracking on completion
      activeXhrInstances.delete(id);
      uploadPromises.delete(id);
      isResolved = true;
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          // FIX: Check for empty response before parsing
          if (!xhr.responseText || xhr.responseText.trim() === '') {
            reject(new Error('Empty response from server'));
            return;
          }
          
          const result = JSON.parse(xhr.responseText);
          
          if (!result.ok) {
            reject(new Error(result.err || result.error || 'Upload failed'));
            return;
          }

          // FIX: Only call onProgress(100) if not already at 100% from progress event
          // UploadModal handles immediate update for 100%, so this is just a safety net
          if (onProgress && lastProgressEventValue < 100) {
            onProgress({ progress: 100, status: 'completed' });
          }
          
          resolve(result);
        } catch (error) {
          // FIX: Preserve error context for better debugging
          reject(new Error(`Invalid response from server: ${error.message || 'Failed to parse JSON'}`));
        }
      } else {
        try {
          // FIX: Check for empty response before parsing
          if (xhr.responseText && xhr.responseText.trim() !== '') {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.err || errorData.error || `HTTP ${xhr.status}`));
          } else {
            reject(new Error(`Upload failed: HTTP ${xhr.status} (Empty response)`));
          }
        } catch (parseError) {
          // If JSON parse fails, provide more context
          reject(new Error(`Upload failed: HTTP ${xhr.status}${parseError.message ? ' - ' + parseError.message : ''}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      if (isAborted) return; // Ignore if already aborted
      activeXhrInstances.delete(id);
      uploadPromises.delete(id);
      isResolved = true;
      // FIX: Improve error message with more context
      reject(new Error(`Network error during upload: ${xhr.statusText || 'Connection failed'}`));
    });

    xhr.addEventListener('timeout', () => {
      if (isAborted) return; // Ignore if already aborted
      activeXhrInstances.delete(id);
      uploadPromises.delete(id);
      isResolved = true;
      reject(new Error('Upload timeout'));
    });

    // Configure and send
    xhr.open('POST', `${WP_API_BASE}/ca/v1/upload`);
    xhr.timeout = UPLOAD_CONFIG.timeout;
    xhr.withCredentials = true; // Include cookies
    
    xhr.send(formData);
  });

  // FIX: Store promise reference AFTER Promise constructor completes (promise is now initialized)
  // This ensures the promise is in the map for abort functionality
  uploadPromises.set(id, { promise, reject: promiseRejectFn });

  // Add abort method to promise for cancellation support
  // FIX: Make abort idempotent - safe to call multiple times or after resolution
  // FIX: Reject promise when aborted to prevent hanging promises
  // FIX: Strengthen race condition protection
  promise.abort = () => {
    if (isAborted || isResolved) return; // Already aborted or completed
    isAborted = true;
    
    // Remove from tracking
    if (activeXhrInstances.has(id)) {
      activeXhrInstances.delete(id);
    }
    uploadPromises.delete(id);
    
    // Abort XHR
    xhr.abort();
    
    // Reject promise to prevent hanging - check both conditions
    if (promiseRejectFn && !isResolved) {
      promiseRejectFn(new Error('Upload cancelled by user'));
      isResolved = true; // Mark as resolved since we rejected
    }
  };
  
  promise.uploadId = id;
  promise.isAborted = () => isAborted;
  promise.isResolved = () => isResolved;

  return promise;
}

/**
 * Abort an active upload by ID
 * FIX: Now properly rejects the promise when aborting
 */
export function abortUpload(uploadId) {
  const xhr = activeXhrInstances.get(uploadId);
  const uploadPromise = uploadPromises.get(uploadId);
  
  if (xhr) {
    xhr.abort();
    activeXhrInstances.delete(uploadId);
  }
  
  // FIX: Reject promise if it exists
  if (uploadPromise && uploadPromise.reject) {
    uploadPromise.reject(new Error('Upload cancelled by user'));
    uploadPromises.delete(uploadId);
    return true;
  }
  
  return false;
}

/**
 * Abort all active uploads (cleanup function)
 * FIX: Now properly rejects all promises when aborting
 */
export function abortAllUploads() {
  // Abort all XHR requests
  activeXhrInstances.forEach((xhr) => {
    xhr.abort();
  });
  activeXhrInstances.clear();
  
  // FIX: Reject all promises
  uploadPromises.forEach(({ reject }) => {
    if (reject && typeof reject === 'function') {
      reject(new Error('Upload cancelled'));
    }
  });
  uploadPromises.clear();
}

/**
 * Compress image before upload using Web Worker (non-blocking)
 * Optimized: Skip compression for files < 2MB for faster uploads
 */
export async function compressImage(file) {
  // Skip if already small - use config constant
  if (file.size < UPLOAD_CONFIG.compressionSizeThreshold) {
    return file;
  }

  // Try to use Web Worker for non-blocking compression
  // Helper function for synchronous fallback
  const compressSync = () => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      let objectUrl = null;

      img.onload = () => {
        // Calculate new dimensions using config constants
        const maxWidth = UPLOAD_CONFIG.maxImageWidth;
        const maxHeight = UPLOAD_CONFIG.maxImageHeight;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            // MEMORY LEAK FIX: Revoke object URL after image is loaded
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
              objectUrl = null;
            }
            
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          UPLOAD_CONFIG.compressionQuality
        );
      };

      img.onerror = () => {
        // MEMORY LEAK FIX: Revoke object URL on error too
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
        // If image load fails, return original
        resolve(file);
      };

      // MEMORY LEAK FIX: Store URL reference and revoke after use
      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  // Try Web Worker first if available (with concurrency limit)
  // FIX: Simplified atomic increment - outer if already checks the condition
  if (typeof Worker !== 'undefined' && activeWorkerCount < MAX_CONCURRENT_WORKERS) {
    // Increment counter (JavaScript is single-threaded, so this is safe)
    // If multiple calls happen rapidly, the outer check ensures we don't exceed limit
    activeWorkerCount++;
    
    try {
      return new Promise((resolve) => {
        // FIX: Use configurable worker path - defaults to public folder structure
        // In Next.js, files in public/ are served from root, so '/workers/' works
        // Could be made configurable via environment variable if needed in the future
        const workerPath = '/workers/image-compress.worker.js';
        const worker = new Worker(workerPath);
        let resolved = false;
        let timeoutId = null;
        
        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          worker.terminate(); // Terminate worker after use (simple and safe)
          activeWorkerCount--; // Decrement active worker count
        };
        
        const fallbackToSync = (reason) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          // FIX: Only log warnings in development
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Web Worker ${reason}, using synchronous compression`);
          }
          compressSync().then(resolve);
        };
        
        worker.onmessage = (e) => {
          cleanup();
          if (resolved) return;
          resolved = true;
          
          if (e.data.success && e.data.buffer) {
            // Recreate File from ArrayBuffer
            const compressedFile = new File([e.data.buffer], e.data.fileName, {
              type: e.data.fileType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            fallbackToSync('compression failed: ' + (e.data.error || 'unknown error'));
          }
        };
        
        worker.onerror = (error) => {
          // FIX: ErrorEvent compatibility - access message, filename, or lineno
          const errorMessage = error.message || error.filename || error.lineno || 'Worker error';
          fallbackToSync('error: ' + errorMessage);
        };
        
        // Fallback timeout using config constant
        timeoutId = setTimeout(() => {
          if (!resolved) {
            fallbackToSync('timeout');
          }
        }, UPLOAD_CONFIG.workerTimeout);
        
        // Convert file to data URL for worker
        const reader = new FileReader();
        reader.onload = (e) => {
          if (resolved) return;
          
          worker.postMessage({
            fileData: e.target.result, // Data URL
            fileName: file.name,
            fileType: file.type,
            maxWidth: UPLOAD_CONFIG.maxImageWidth,
            maxHeight: UPLOAD_CONFIG.maxImageHeight,
            quality: UPLOAD_CONFIG.compressionQuality,
          });
        };
        reader.onerror = () => {
          fallbackToSync('file read error');
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      activeWorkerCount = Math.max(0, activeWorkerCount - 1); // Decrement on error (safe)
      // Fallback to synchronous compression if Worker fails to initialize
      // FIX: Only log warnings in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Web Worker not available, using synchronous compression:', error);
      }
      return compressSync();
    }
  } else if (typeof Worker !== 'undefined' && activeWorkerCount >= MAX_CONCURRENT_WORKERS) {
    // FIX: Add Worker check to else if - only reachable if Worker is defined but limit reached
    // Too many workers active, fallback to sync
    // FIX: Only log warnings in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Worker concurrency limit reached, using synchronous compression');
    }
    return compressSync();
  }
  
  // No Worker support (typeof Worker === 'undefined'), use synchronous compression
  return compressSync();

}

/**
 * Clean up expired sessions to prevent memory leaks
 * FIX: Add automatic cleanup mechanism
 * FIX: Export function so it can be called from startUploadSession
 */
export function cleanupExpiredSessions() {
  const now = Date.now() / 1000;
  const expiredKeys = [];
  
  for (const [estimateId, session] of sessionMap.entries()) {
    if (session.exp != null && session.exp !== 0 && typeof session.exp === 'number' && session.exp < now) {
      expiredKeys.push(estimateId);
    }
  }
  
  // Remove expired sessions
  expiredKeys.forEach(key => sessionMap.delete(key));
  
  return expiredKeys.length;
}

/**
 * Get current session for a specific estimateId
 * FIX: Changed to support Map-based sessions
 * FIX: Automatically clean up expired sessions on access
 */
export function getCurrentSession(estimateId = null) {
  // Clean up expired sessions before lookup (prevents memory leaks)
  cleanupExpiredSessions();
  
  if (estimateId) {
    return sessionMap.get(estimateId) || null;
  }
  // Backward compatibility: return first available session
  const sessions = Array.from(sessionMap.values());
  return sessions.length > 0 ? sessions[0] : null;
}

/**
 * Clear session for a specific estimateId
 * FIX: Changed to support Map-based sessions
 */
export function clearSession(estimateId = null) {
  if (estimateId) {
    sessionMap.delete(estimateId);
  } else {
    // Clear all sessions (backward compatibility)
    sessionMap.clear();
  }
}

/**
 * Reset worker pool counter (cleanup function for memory management)
 * Note: Workers are terminated after each use, so this just resets the counter
 */
export function resetWorkerPool() {
  activeWorkerCount = 0;
}

/**
 * Get current active upload count (for debugging/monitoring)
 */
export function getActiveUploadCount() {
  return activeXhrInstances.size;
}

/**
 * Store photos metadata (for portal state)
 */
export async function storePhotosMetadata(estimateId, locationId, uploads) {
  try {
    const response = await fetch(`${WP_API_BASE}/ca/v1/estimate/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        estimateId,
        locationId,
        uploads,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.err || errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to store photos: ${error.message}`);
  }
}

