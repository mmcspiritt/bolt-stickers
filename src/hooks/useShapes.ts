import { Square, Circle, Triangle, Hexagon } from 'lucide-react';
import { useSticker } from '../context/StickerContext';
import { ShapePreviews } from '../components/ShapePreviews';

export const shapes = [
  { 
    id: 'square', 
    icon: Square,
    Preview: ShapePreviews.square
  },
  { 
    id: 'circle', 
    icon: Circle,
    Preview: ShapePreviews.circle
  },
  { 
    id: 'triangle', 
    icon: Triangle,
    Preview: ShapePreviews.triangle
  },
  { 
    id: 'hexagon', 
    icon: Hexagon,
    Preview: ShapePreviews.hexagon
  },
];

export function useShapes() {
  const { canvasShape, updateCanvasShape } = useSticker();

  const handleShapeChange = (shapeId: string) => {
    updateCanvasShape(shapeId);
  };

  return {
    shapes,
    currentShape: canvasShape,
    handleShapeChange,
  };
} 