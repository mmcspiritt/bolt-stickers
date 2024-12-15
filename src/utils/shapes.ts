// Create a persistent shape cache
const shapeCache = new Map();

export function createClipPath(shape: string, width: number, height: number): fabric.Object | null {
  const cacheKey = `${shape}-${width}-${height}`;
  
  if (shapeCache.has(cacheKey)) {
    return shapeCache.get(cacheKey);
  }

  const center = { x: width / 2, y: height / 2 };
  const size = Math.min(width, height);
  const radius = size / 2;

  let clipPath: fabric.Object;

  switch (shape) {
    case 'circle':
      clipPath = new fabric.Circle({
        radius,
        left: center.x - radius,
        top: center.y - radius,
        originX: 'left',
        originY: 'top',
      });
      break;

    case 'square':
      clipPath = new fabric.Rect({
        width: size,
        height: size,
        left: center.x - size / 2,
        top: center.y - size / 2,
        originX: 'left',
        originY: 'top',
      });
      break;

    case 'triangle':
      clipPath = new fabric.Triangle({
        width: size,
        height: size,
        left: center.x,
        top: center.y,
        originX: 'center',
        originY: 'center',
      });
      break;

    case 'hexagon': {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push({
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        });
      }
      clipPath = new fabric.Polygon(points, {
        left: center.x,
        top: center.y,
        originX: 'center',
        originY: 'center',
      });
      break;
    }

    default:
      return null;
  }

  shapeCache.set(cacheKey, clipPath);
  return clipPath;
}

export function applyShapeToDataURL(canvas: fabric.Canvas): string {
  if (!canvas.clipPath) return canvas.toDataURL();

  // Create a temporary canvas for the shaped version
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width!;
  tempCanvas.height = canvas.height!;
  const ctx = tempCanvas.getContext('2d')!;

  // Draw the original canvas
  const dataUrl = canvas.toDataURL();
  const img = new Image();
  img.src = dataUrl;

  // Apply the clip path
  ctx.save();
  const path = new Path2D();
  
  if (canvas.clipPath instanceof fabric.Circle) {
    path.arc(
      canvas.clipPath.left! + canvas.clipPath.radius!,
      canvas.clipPath.top! + canvas.clipPath.radius!,
      canvas.clipPath.radius!,
      0,
      2 * Math.PI
    );
  } else if (canvas.clipPath instanceof fabric.Rect) {
    path.rect(
      canvas.clipPath.left!,
      canvas.clipPath.top!,
      canvas.clipPath.width!,
      canvas.clipPath.height!
    );
  } else if (canvas.clipPath instanceof fabric.Triangle) {
    const height = canvas.clipPath.height!;
    const width = canvas.clipPath.width!;
    const left = canvas.clipPath.left!;
    const top = canvas.clipPath.top!;
    
    path.moveTo(left, top + height);
    path.lineTo(left + width / 2, top);
    path.lineTo(left + width, top + height);
    path.closePath();
  } else if (canvas.clipPath instanceof fabric.Polygon) {
    const points = canvas.clipPath.points!;
    if (points.length > 0) {
      path.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y);
      }
      path.closePath();
    }
  }

  ctx.clip(path);
  ctx.drawImage(img, 0, 0);
  ctx.restore();

  return tempCanvas.toDataURL();
}