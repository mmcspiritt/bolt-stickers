import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useSticker } from '../context/StickerContext';

export function useFabric() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const { backgroundColor } = useSticker();

  // Better object controls configuration
  const setupObjectControls = (obj: fabric.Object) => {
    obj.set({
      cornerColor: '#FFF',
      cornerStyle: 'circle',
      borderColor: '#2196F3',
      borderScaleFactor: 1.5,
      transparentCorners: false,
      borderOpacityWhenMoving: 1,
      cornerStrokeColor: '#2196F3',
      padding: 10,
      cornerSize: 12,
      objectCaching: false,
    });
  };

  // Initialize canvas with better defaults
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
      selection: true,
      controlsAboveOverlay: true,
      centeredScaling: true,
      enableRetinaScaling: true,
      uniformScaling: true,
      stopContextMenu: true,
      targetFindTolerance: 8,
      fireRightClick: true,
    });

    // Add global object controls
    fabricCanvas.on('object:added', (e) => {
      if (e.target) {
        setupObjectControls(e.target);
      }
    });

    // Improve movement handling
    fabricCanvas.on('object:moving', (e) => {
      if (!e.target) return;
      requestAnimationFrame(() => {
        e.target?.setCoords();
        fabricCanvas.renderAll();
      });
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  return {
    canvasRef,
    canvas,
    // ... other methods
  };
} 