import { fabric } from 'fabric';
import toast from 'react-hot-toast';

interface ExtendedImage extends fabric.Image {
  resizeFilter?: fabric.IBaseFilter;
}

export function addImageToCanvas(canvas: fabric.Canvas, url: string): Promise<fabric.Image> {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(url, 
      (img) => {
        try {
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const scale = Math.min(
            (canvasWidth * 0.8) / (img.width || 1),
            (canvasHeight * 0.8) / (img.height || 1)
          );

          img.set({
            left: (canvasWidth - ((img.width || 0) * scale)) / 2,
            top: (canvasHeight - ((img.height || 0) * scale)) / 2,
            scaleX: scale,
            scaleY: scale,
            cornerStyle: 'circle',
            cornerColor: '#2196F3',
            cornerSize: 12,
            transparentCorners: false,
            padding: 10,
            centeredRotation: true,
            centeredScaling: true,
            lockUniScaling: false,
            preserveAspectRatio: false,
            noScaleCache: false,
            strokeUniform: true,
            objectCaching: false,
            hasBorders: true,
            hasControls: true,
          });

          img.setControlsVisibility({
            mt: true,
            mb: true,
            ml: true,
            mr: true,
            tl: true,
            tr: true,
            bl: true,
            br: true
          });

          canvas.add(img);
          canvas.renderAll();
          resolve(img);
        } catch (error) {
          reject(error);
        }
      },
      { crossOrigin: 'anonymous' }
    );
  });
}