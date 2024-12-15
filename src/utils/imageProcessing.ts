import { toast } from 'react-hot-toast';

export async function detectImageShape(imageUrl: string): Promise<string | null> {
  if (!imageUrl) {
    toast.error('No image URL provided');
    return null;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const imageData = await new Promise<ImageData>((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Scale down large images for processing
        const maxDimension = 1000;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        
        try {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          resolve(imageData);
        } catch (e) {
          reject(e instanceof Error ? e : new Error('Failed to process image'));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });

    // Process image data with optimized sampling
    const { data, width, height } = imageData;
    const points: [number, number][] = [];
    const alphaThreshold = 10;
    const whiteThreshold = 245;

    // Adaptive sampling rate based on image size
    const samplingRate = Math.max(1, Math.floor(Math.sqrt(width * height) / 100));

    // Find non-transparent and non-white pixels with adaptive sampling
    for (let y = 0; y < height; y += samplingRate) {
      for (let x = 0; x < width; x += samplingRate) {
        const idx = (y * width + x) * 4;
        const [r, g, b, a] = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
        
        if (a > alphaThreshold && !(r > whiteThreshold && g > whiteThreshold && b > whiteThreshold)) {
          points.push([x / width * 100, y / height * 100]);
        }
      }
    }

    if (points.length === 0) {
      console.log('No content detected in image, using default square shape');
      return null;
    }

    // Find the bounding box using reduce for better performance
    const bounds = points.reduce((acc, [x, y]) => ({
      minX: Math.min(acc.minX, x),
      maxX: Math.max(acc.maxX, x),
      minY: Math.min(acc.minY, y),
      maxY: Math.max(acc.maxY, y)
    }), { minX: 100, maxX: 0, minY: 100, maxY: 0 });

    // Check if the shape is too simple or rectangular
    const width_ratio = (bounds.maxX - bounds.minX) / 100;
    const height_ratio = (bounds.maxY - bounds.minY) / 100;
    const aspect_ratio = width_ratio / height_ratio;

    // If the shape is approximately rectangular (aspect ratio close to 1)
    // or too simple, return null to use default square shape
    if (aspect_ratio > 0.9 && aspect_ratio < 1.1) {
      console.log('Shape appears to be rectangular, using default square shape');
      return null;
    }

    // Add bleed margin (5%)
    const bleedMargin = 5;
    const path = `polygon(${[
      [bounds.minX - bleedMargin, bounds.minY - bleedMargin],
      [bounds.maxX + bleedMargin, bounds.minY - bleedMargin],
      [bounds.maxX + bleedMargin, bounds.maxY + bleedMargin],
      [bounds.minX - bleedMargin, bounds.maxY + bleedMargin]
    ].map(([x, y]) => 
      `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`
    ).join(', ')})`;

    return path;
  } catch (error) {
    console.error('Error in detectImageShape:', error);
    return null; // Return null to use default square shape
  }
}