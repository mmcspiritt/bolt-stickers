import { fabric } from 'fabric';
import { optimize } from 'svgo-browser';

export function getCanvasDataURL(canvas: fabric.Canvas): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary canvas
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d')!;

      // Set dimensions with higher resolution
      const multiplier = 4;
      tempCanvas.width = canvas.width! * multiplier;
      tempCanvas.height = canvas.height! * multiplier;

      // Make canvas transparent by default
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Scale context for higher resolution
      ctx.scale(multiplier, multiplier);

      // Get the complete canvas with all objects
      const mainImage = new Image();
      mainImage.crossOrigin = 'anonymous';
      
      mainImage.onload = () => {
        ctx.save();

        // Create shape mask
        if (canvas.clipPath) {
          const path = new Path2D();
          const center = {
            x: canvas.width! / 2,
            y: canvas.height! / 2
          };
          const size = Math.min(canvas.width!, canvas.height!);
          const radius = size / 2;

          switch (canvas.clipPath.type) {
            case 'circle':
              path.arc(center.x, center.y, radius, 0, Math.PI * 2);
              break;
            case 'rect':
              path.rect(
                center.x - radius,
                center.y - radius,
                size,
                size
              );
              break;
            case 'triangle': {
              const height = Math.sqrt(3) * radius;
              path.moveTo(center.x, center.y - radius);
              path.lineTo(center.x + radius, center.y + height/2);
              path.lineTo(center.x - radius, center.y + height/2);
              path.closePath();
              break;
            }
            case 'polygon': {
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3 - Math.PI / 6;
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                if (i === 0) path.moveTo(x, y);
                else path.lineTo(x, y);
              }
              path.closePath();
              break;
            }
          }

          // Fill shape background if background color exists
          if (canvas.backgroundColor && canvas.backgroundColor !== 'transparent') {
            ctx.save();
            ctx.fillStyle = canvas.backgroundColor;
            ctx.fill(path);
            ctx.restore();
          }

          // Apply clip path for content
          ctx.clip(path);
        } else if (canvas.backgroundColor && canvas.backgroundColor !== 'transparent') {
          // If no clip path but has background color, fill the entire canvas
          ctx.fillStyle = canvas.backgroundColor;
          ctx.fillRect(0, 0, canvas.width!, canvas.height!);
        }

        // Draw the canvas content
        ctx.drawImage(mainImage, 0, 0, canvas.width!, canvas.height!);
        ctx.restore();

        // Convert to data URL and resolve
        resolve(tempCanvas.toDataURL('image/png'));
      };

      mainImage.onerror = () => reject(new Error('Failed to load canvas image'));
      
      mainImage.src = canvas.toDataURL({
        format: 'png',
        quality: 1,
        enableRetinaScaling: true,
      });
    } catch (error) {
      reject(error);
    }
  });
}

export const getCanvasSVG = (canvas: fabric.Canvas): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Store the current background color
      const originalBgColor = canvas.backgroundColor;
      
      // Temporarily remove the background color from the canvas
      canvas.setBackgroundColor('transparent', () => {
        // Get SVG without background
        const svg = canvas.toSVG({
          width: canvas.width,
          height: canvas.height,
          viewBox: {
            x: 0,
            y: 0,
            width: canvas.width as number,
            height: canvas.height as number,
          },
          encoding: 'UTF-8',
        });

        // Create a parser to modify the SVG
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgElement = doc.documentElement;

        // Set background color as an attribute
        if (originalBgColor && originalBgColor !== 'transparent') {
          svgElement.setAttribute('fill', originalBgColor);
        }

        // Convert back to string
        let finalSvg = new XMLSerializer().serializeToString(svgElement);

        // Add XML declaration if not present
        if (!finalSvg.includes('<?xml')) {
          finalSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n${finalSvg}`;
        }

        // Restore the original background color
        canvas.setBackgroundColor(originalBgColor || 'transparent', () => {
          canvas.renderAll();
          resolve(finalSvg);
        });
      });
    } catch (error) {
      console.error('Error generating SVG:', error);
      reject(error);
    }
  });
};