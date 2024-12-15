import { fabric } from 'fabric';

export interface DrawingSettings {
  isDrawing: boolean;
  brushSize: number;
  brushColor: string;
}

export function setupDrawing(canvas: fabric.Canvas, settings: DrawingSettings) {
  canvas.isDrawingMode = settings.isDrawing;
  const brush = new fabric.PencilBrush(canvas);
  brush.width = settings.brushSize;
  brush.color = settings.brushColor;
  canvas.freeDrawingBrush = brush;

  // Add drawing events
  canvas.on('path:created', (e) => {
    const path = e.path;
    if (path) {
      path.set({
        strokeUniform: true,
        strokeLineCap: 'round',
        strokeLineJoin: 'round'
      });
      canvas.renderAll();
    }
  });
} 