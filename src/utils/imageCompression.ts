import { fabric } from 'fabric';

/**
 * Compresses an image data URL to ensure it's under the size limit
 * @param dataUrl The original data URL
 * @param maxSizeKB Maximum size in kilobytes
 * @returns A compressed data URL
 */
export function compressImageDataUrl(dataUrl: string, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let quality = 1.0;
      const maxSize = maxSizeKB * 1024; // Convert to bytes
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Start with original dimensions
      let width = img.width;
      let height = img.height;

      // If the image is larger than 2000px in either dimension, scale it down
      const maxDimension = 2000;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels until we get under the size limit
      const tryCompress = (currentQuality: number): string => {
        const compressed = canvas.toDataURL('image/png', currentQuality);
        const size = Math.ceil((compressed.length - 22) * 3 / 4); // Approximate size in bytes

        if (size <= maxSize || currentQuality <= 0.1) {
          return compressed;
        }

        // Reduce quality and try again
        const newQuality = Math.max(0.1, currentQuality - 0.1);
        return tryCompress(newQuality);
      };

      const compressedDataUrl = tryCompress(quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = dataUrl;
  });
}
