import { fabric } from 'fabric';

export const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Add image size validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('Image file too large (max 5MB)'));
      return;
    }

    // Create object URL instead of base64 for better memory usage
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      // Add image dimension validation
      const MAX_DIMENSION = 4096;
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Image dimensions too large (max ${MAX_DIMENSION}px)`));
        return;
      }
      resolve(objectUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid image data'));
    };

    img.src = objectUrl;
  });
};

export const setupImageObject = (
  canvas: fabric.Canvas,
  img: fabric.Image
) => {
  // Enable image caching for better performance
  img.set({
    objectCaching: true,
    statefullCache: true,
    cacheProperties: ['fill', 'stroke', 'strokeWidth'],
    // ... other properties
  });

  // Optimize image size if too large
  if (img.width! > 2048 || img.height! > 2048) {
    const scale = Math.min(
      2048 / img.width!,
      2048 / img.height!
    );
    img.scale(scale);
  }

  return img;
};

// Add image compression
export const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Target max dimension
      const MAX_SIZE = 2048;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image compression failed'));
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}; 