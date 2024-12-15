import { useRef, useState, useEffect } from 'react';
import { useSticker } from '../context/StickerContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { trackEvents, trackStickerDesign } from '../utils/analytics';
import Ruler from './Ruler';
import FabricCanvas from './FabricCanvas';

export default function Canvas() {
  const { size, quantity, finish, canvasShape } = useSticker();
  const { analytics } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [lastModified, setLastModified] = useState(Date.now());

  // Scale factor to convert inches to pixels (96 DPI)
  const SCALE_FACTOR = 96;

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // Calculate the scaled dimensions
        const scaledWidth = size.width * SCALE_FACTOR;
        const scaledHeight = size.height * SCALE_FACTOR;
        
        // Calculate scaling factor to fit within container while maintaining aspect ratio
        const scale = Math.min(
          (containerWidth * 0.9) / scaledWidth,
          (containerHeight * 0.9) / scaledHeight
        );
        
        setCanvasSize({
          width: Math.floor(scaledWidth * scale),
          height: Math.floor(scaledHeight * scale)
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [size]);

  // Track design modifications
  useEffect(() => {
    const canvas = (window as any).fabricCanvas as fabric.Canvas;
    if (!canvas) return;

    const handleModification = () => {
      const now = Date.now();
      // Only track if more than 5 seconds have passed since last modification
      if (now - lastModified > 5000) {
        setLastModified(now);
        trackStickerDesign(analytics, trackEvents.DESIGN_EDITED, {
          width: size.width,
          height: size.height,
          shape: canvasShape,
          finish,
          quantity,
          price: 0 // Price will be calculated at checkout
        });
      }
    };

    canvas.on('object:modified', handleModification);
    canvas.on('object:added', handleModification);
    canvas.on('object:removed', handleModification);

    return () => {
      canvas.off('object:modified', handleModification);
      canvas.off('object:added', handleModification);
      canvas.off('object:removed', handleModification);
    };
  }, [analytics, size, canvasShape, finish, quantity, lastModified]);

  return (
    <div 
      ref={containerRef} 
      className="h-[calc(100vh-5rem)] p-4 md:p-8 flex items-center justify-center"
    >
      <div className="relative">
        <Ruler 
          orientation="horizontal" 
          size={size.width} 
          totalWidth={canvasSize.width} 
        />
        <Ruler 
          orientation="vertical" 
          size={size.height} 
          totalHeight={canvasSize.height}
        />
        <div className="rounded-lg border border-gray-200/50 shadow-sm inline-block">
          <FabricCanvas 
            width={canvasSize.width} 
            height={canvasSize.height} 
          />
        </div>
      </div>
    </div>
  );
}