import { fabric } from 'fabric';
import { debounce } from '../performance';

const TOUCH_THROTTLE = 16; // ~60fps

export function setupImageControls(canvas: fabric.Canvas) {
  fabric.Object.prototype.set({
    transparentCorners: false,
    borderColor: '#2563eb',
    cornerColor: '#2563eb',
    cornerStrokeColor: '#ffffff',
    cornerSize: 16,
    padding: 12,
    cornerStyle: 'circle',
  });

  let lastPosX = 0;
  let lastPosY = 0;
  let isDragging = false;

  // Touch event handling
  canvas.on('touch:start', (e) => {
    const touch = e.e.touches[0];
    lastPosX = touch.clientX;
    lastPosY = touch.clientY;
    isDragging = true;
  });

  const handleTouchMove = debounce((e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastPosX;
    const deltaY = touch.clientY - lastPosY;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const transform = new fabric.Transform(activeObject, false);
    transform.translate(deltaX, deltaY);
    canvas.renderAll();

    lastPosX = touch.clientX;
    lastPosY = touch.clientY;
  }, TOUCH_THROTTLE);

  canvas.on('touch:move', (e) => {
    e.e.preventDefault();
    handleTouchMove(e.e);
  });

  canvas.on('touch:end', () => {
    isDragging = false;
  });

  // Object movement bounds
  canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (!obj) return;

    const bounds = obj.getBoundingRect(true);
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    const matrix = obj.calcTransformMatrix();
    let adjusted = false;

    if (bounds.left < 0) {
      matrix[4] -= bounds.left;
      adjusted = true;
    }
    if (bounds.top < 0) {
      matrix[5] -= bounds.top;
      adjusted = true;
    }
    if (bounds.left + bounds.width > canvasWidth) {
      matrix[4] -= (bounds.left + bounds.width - canvasWidth);
      adjusted = true;
    }
    if (bounds.top + bounds.height > canvasHeight) {
      matrix[5] -= (bounds.top + bounds.height - canvasHeight);
      adjusted = true;
    }

    if (adjusted) {
      obj.setPositionByOrigin(
        { x: matrix[4], y: matrix[5] },
        'left',
        'top'
      );
      canvas.requestRenderAll();
    }
  });

  // Canvas resize handling
  let resizeTimeout: NodeJS.Timeout;
  canvas.on('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        const center = obj.getCenterPoint();
        const scaleX = canvas.getWidth() / obj._originalWidth;
        const scaleY = canvas.getHeight() / obj._originalHeight;
        const scale = Math.min(scaleX, scaleY);
        
        obj.set({
          left: center.x * scaleX,
          top: center.y * scaleY,
          scaleX: obj.scaleX! * scale,
          scaleY: obj.scaleY! * scale,
        });
      });
      canvas.renderAll();
    }, 250);
  });
}