// Web Worker for non-blocking image compression
// Uses createImageBitmap (preferred) or Image constructor (fallback) for better compatibility

self.onmessage = async function(e) {
  // FIX: Validate e.data exists before destructuring
  if (!e || !e.data) {
    self.postMessage({ success: false, error: 'Invalid message: missing data' });
    return;
  }
  
  const { fileData, fileName, fileType, maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = e.data;
  
  try {
    // Check if OffscreenCanvas is available (required for worker)
    if (typeof OffscreenCanvas === 'undefined') {
      self.postMessage({ success: false, error: 'OffscreenCanvas not supported' });
      return;
    }
    
    let imageBitmap = null;
    let img = null;
    
    // BEST PRACTICE: Try createImageBitmap first (async, works better in workers)
    if (typeof createImageBitmap !== 'undefined') {
      try {
        // FIX: Validate data URL format before parsing
        if (!fileData || typeof fileData !== 'string' || !fileData.includes(',')) {
          throw new Error('Invalid data URL format: missing comma separator');
        }
        
        // Convert data URL to blob manually (more reliable than fetch)
        const parts = fileData.split(',');
        const base64Data = parts[1];
        
        if (!base64Data) {
          throw new Error('Invalid data URL: missing base64 data');
        }
        
        const mimeType = fileData.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
        
        // FIX: Wrap atob in try-catch to handle InvalidCharacterError
        let binaryString;
        try {
          binaryString = atob(base64Data);
        } catch (error) {
          throw new Error(`Invalid base64 data in data URL: ${error.message}`);
        }
        
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });
        
        // Use createImageBitmap with blob
        imageBitmap = await createImageBitmap(blob);
      } catch (error) {
        // Fallback to Image constructor if createImageBitmap fails
        // FIX: Add error logging in development (workers have self.console, but no process.env)
        // Silent fallback - error is handled gracefully by using Image constructor
        if (typeof self !== 'undefined' && self.console && self.console.warn) {
          self.console.warn('createImageBitmap failed, using Image constructor fallback:', error.message || error);
        }
      }
    }
    
    // FALLBACK: Use Image constructor if createImageBitmap not available or failed
    if (!imageBitmap) {
      if (typeof Image === 'undefined') {
        self.postMessage({ success: false, error: 'Image constructor not available in worker' });
        return;
      }
      
      // Use Image constructor as fallback
      img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = fileData;
      });
    }
    
    // Get image dimensions
    let width, height;
    if (imageBitmap) {
      width = imageBitmap.width;
      height = imageBitmap.height;
    } else if (img) {
      width = img.width;
      height = img.height;
    } else {
      self.postMessage({ success: false, error: 'No image data available' });
      return;
    }
    
    // Calculate new dimensions
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    // Create OffscreenCanvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      self.postMessage({ success: false, error: 'Canvas context not available' });
      return;
    }
    
    // Draw image (works with both ImageBitmap and Image)
    if (imageBitmap) {
      ctx.drawImage(imageBitmap, 0, 0, width, height);
      imageBitmap.close(); // Cleanup ImageBitmap memory
    } else if (img) {
      ctx.drawImage(img, 0, 0, width, height);
    }
    
    // Determine output format (keep original format or use JPEG)
    const outputType = fileType === 'image/png' ? 'image/png' : 'image/jpeg';
    
    // Convert to blob
    try {
      const blob = await canvas.convertToBlob({ 
        type: outputType, 
        quality: quality 
      });
      
      if (!blob) {
        self.postMessage({ success: false, error: 'Failed to create blob' });
        return;
      }
      
      // Create File from blob
      const fileExtension = outputType === 'image/png' ? '.png' : '.jpg';
      const newFileName = fileName.replace(/\.[^.]+$/, fileExtension);
      
      // Convert blob to ArrayBuffer for transfer (Files can't be transferred)
      const buffer = await blob.arrayBuffer();
      
      self.postMessage({ 
        success: true, 
        buffer: buffer, // Transferable
        fileName: newFileName,
        fileType: outputType,
      }, [buffer]); // Transfer ownership for performance
    } catch (error) {
      self.postMessage({ success: false, error: 'Compression failed: ' + error.message });
    }
  } catch (error) {
    self.postMessage({ success: false, error: 'Processing error: ' + error.message });
  }
};
