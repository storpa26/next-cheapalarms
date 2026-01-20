/**
 * Upload API - Direct WordPress REST API communication
 * Ported from reference implementation that works perfectly
 */

import imageCompression from 'browser-image-compression';
import PQueue from 'p-queue';

// NOTE: Do not use WP_API_BASE for direct WordPress calls from browser
// All upload requests should go through Next.js API routes

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

// PHASE 2: Upload queue system - prevents server overload with parallel uploads
const uploadQueue = new PQueue({ 
  concurrency: 3, // Upload 3 files at a time
});

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
    // Use Next.js API route instead of direct WordPress call
    const response = await fetch('/api/upload/start', {
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
 * Internal upload function - performs actual upload
 * PHASE 2: This is wrapped by uploadQueue for concurrency control
 */
function _uploadFileInternal(file, metadata, onProgress, uploadId = null, estimateId = null) {
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

    // Configure and send to Next.js API route (which proxies to WordPress)
    xhr.open('POST', `/api/upload/file?token=${encodeURIComponent(session.token)}`);
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
 * PHASE 2: Upload a single file with progress tracking (queued version)
 * Uses upload queue for concurrency control (3 concurrent uploads)
 * Wraps _uploadFileInternal with p-queue
 * Returns a promise with abort function for cancellation
 */
export function uploadFile(file, metadata, onProgress, uploadId = null, estimateId = null) {
  // Add upload to queue with priority (lower photoIndex = higher priority)
  const priority = metadata?.photoIndex ? -metadata.photoIndex : 0;
  
  // Store reference to internal promise for abort functionality
  let internalPromise = null;
  
  // Create a task that returns the upload promise
  const uploadTask = async () => {
    // Store internal promise reference when task executes
    internalPromise = _uploadFileInternal(file, metadata, onProgress, uploadId, estimateId);
    return internalPromise;
  };
  
  // Add to queue and get the queued promise
  const queuedPromise = uploadQueue.add(uploadTask, { 
    priority, // Lower index = higher priority (photos upload in order)
    throwOnTimeout: true,
    timeout: UPLOAD_CONFIG.timeout + 5000, // Queue timeout (upload timeout + buffer)
  });
  
  // Preserve abort functionality by proxying to internal promise
  // Note: Abort only works after task starts executing (not while queued)
  // This is a limitation of p-queue, but acceptable since uploads start quickly
  queuedPromise.abort = () => {
    if (internalPromise && typeof internalPromise.abort === 'function') {
      return internalPromise.abort();
    }
    // If task hasn't started yet, we can't abort (queue limitation)
    // This is acceptable since uploads typically start quickly
    if (process.env.NODE_ENV === 'development') {
      console.warn('Cannot abort: upload task has not started executing yet');
    }
  };
  
  // Preserve promise properties for API compatibility
  // Note: These will work after the task starts executing
  // For immediate access, we'll use a getter pattern
  queuedPromise.uploadId = uploadId;
  queuedPromise.isAborted = () => internalPromise?.isAborted?.() || false;
  queuedPromise.isResolved = () => internalPromise?.isResolved?.() || false;
  
  return queuedPromise;
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
 * PHASE 2: Compress image before upload using browser-image-compression
 * Uses OffscreenCanvas API internally (non-blocking, better than Web Workers)
 * Optimized: Skip compression for files < 2MB for faster uploads
 */
export async function compressImage(file) {
  // Skip if already small - use config constant
  if (file.size < UPLOAD_CONFIG.compressionSizeThreshold) {
    return file;
  }

  const options = {
    maxSizeMB: 2, // Max file size in MB after compression
    maxWidthOrHeight: UPLOAD_CONFIG.maxImageWidth, // Max width or height
    useWebWorker: true, // Uses OffscreenCanvas internally (non-blocking)
    fileType: file.type, // Preserve original file type
    initialQuality: UPLOAD_CONFIG.compressionQuality, // 0.8 = 80% quality
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    // If compression fails, fallback to original file
    if (process.env.NODE_ENV === 'development') {
      console.warn('Image compression failed, using original:', error);
    }
    return file;
  }
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
 * PHASE 2: Reset worker pool counter (deprecated - no longer using Web Workers)
 * Kept for backward compatibility, but does nothing now
 * @deprecated No longer needed - browser-image-compression handles workers internally
 */
export function resetWorkerPool() {
  // No-op: We're using browser-image-compression now, which handles workers internally
  // Kept for backward compatibility only
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
    // Use Next.js API route instead of direct WordPress call
    const response = await fetch('/api/estimate/photos', {
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

