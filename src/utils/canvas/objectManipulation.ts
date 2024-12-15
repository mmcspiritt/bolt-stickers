import { fabric } from 'fabric';
import debounce from 'lodash/debounce';

export function centerObjectHorizontally(canvas: fabric.Canvas, object: fabric.Object) {
  if (!canvas || !object) return;
  
  const canvasWidth = canvas.getWidth();
  const objectWidth = object.getScaledWidth();
  const left = (canvasWidth - objectWidth) / 2;
  
  object.set('left', left);
  canvas.renderAll();
}

export function centerObjectVertically(canvas: fabric.Canvas, object: fabric.Object) {
  if (!canvas || !object) return;
  
  const canvasHeight = canvas.getHeight();
  const objectHeight = object.getScaledHeight();
  const top = (canvasHeight - objectHeight) / 2;
  
  object.set('top', top);
  canvas.renderAll();
}

export function updateCanvasShape(canvas: fabric.Canvas, shape: string) {
  // Disable rendering temporarily
  canvas.renderOnAddRemove = false;
  
  // Batch all shape updates
  const updateShape = debounce(() => {
    canvas.clipPath = null;
    
    // Cache calculations
    const width = canvas.getWidth();
    const height = canvas.getHeight();
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height);
    const radius = size / 2;

    let clipPath: fabric.Object | undefined;
    
    switch (shape) {
      case 'circle':
        clipPath = new fabric.Circle({
          radius,
          originX: 'center',
          originY: 'center',
          left: centerX,
          top: centerY,
        });
        break;

      case 'triangle':
        clipPath = new fabric.Triangle({
          width: size,
          height: size,
          originX: 'center',
          originY: 'center',
          left: centerX,
          top: centerY,
        });
        break;

      case 'hexagon': {
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
        }
        clipPath = new fabric.Polygon(points, {
          originX: 'center',
          originY: 'center',
          left: centerX,
          top: centerY,
        });
        break;
      }
    }

    if (clipPath) {
      canvas.clipPath = clipPath;
    }

    // Ensure all objects stay above background after shape change
    canvas.getObjects().forEach(obj => {
      obj.bringToFront();
    });

    // Re-enable rendering and update
    canvas.renderOnAddRemove = true;
    canvas.requestRenderAll();
  }, 16);

  updateShape();
}