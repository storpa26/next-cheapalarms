/**
 * Upload API - Direct WordPress REST API communication
 * Ported from reference implementation that works perfectly
 */

// Get WordPress API base from environment
const WP_API_BASE = process.env.NEXT_PUBLIC_WP_URL || 'http://localhost:10013/wp-json';

// Upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  compressionQuality: 0.8,
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  timeout: 30000, // 30 seconds
};

// Current upload session
let currentSession = null;

/**
 * Start upload session with token
 */
export async function startUploadSession(estimateId, locationId) {
  try {
    const response = await fetch(`${WP_API_BASE}/ca/v1/upload/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        estimateId,
        locationId,
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

    currentSession = {
      token: data.token,
      estimateId,
      locationId,
      exp: data.exp,
      startTime: Date.now(),
    };

    return currentSession;
  } catch (error) {
    throw new Error(`Failed to start upload session: ${error.message}`);
  }
}

/**
 * Upload a single file with progress tracking
 * Uses XMLHttpRequest for real-time progress updates
 */
export function uploadFile(file, metadata, onProgress) {
  return new Promise((resolve, reject) => {
    if (!currentSession) {
      reject(new Error('No active upload session. Call startUploadSession first.'));
      return;
    }

    // Validate file
    if (!UPLOAD_CONFIG.supportedFormats.includes(file.type)) {
      reject(new Error(`Unsupported file type: ${file.type}`));
      return;
    }

    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      reject(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`));
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', currentSession.token);
    
    // Add metadata
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          formData.append(key, String(metadata[key]));
        }
      });
    }

    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress({
          progress,
          loaded: event.loaded,
          total: event.total,
          status: 'uploading',
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          
          if (!result.ok) {
            reject(new Error(result.err || result.error || 'Upload failed'));
            return;
          }

          if (onProgress) {
            onProgress({ progress: 100, status: 'completed' });
          }
          
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.err || errorData.error || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'));
    });

    // Configure and send
    xhr.open('POST', `${WP_API_BASE}/ca/v1/upload`);
    xhr.timeout = UPLOAD_CONFIG.timeout;
    xhr.withCredentials = true; // Include cookies
    xhr.send(formData);
  });
}

/**
 * Compress image before upload
 * Optimized: Skip compression for files < 2MB for faster uploads
 */
export async function compressImage(file) {
  // Skip if already small - increased threshold to 2MB for speed
  if (file.size < 2 * 1024 * 1024) { // Less than 2MB
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 1920px width)
      const maxWidth = 1920;
      const maxHeight = 1920;
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
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        UPLOAD_CONFIG.compressionQuality
      );
    };

    img.onerror = () => {
      // If image load fails, return original
      resolve(file);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get current session
 */
export function getCurrentSession() {
  return currentSession;
}

/**
 * Clear current session
 */
export function clearSession() {
  currentSession = null;
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

