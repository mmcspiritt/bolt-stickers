import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCanvasDataURL, getCanvasSVG } from '../utils/fabricHelpers';
import { fabric } from 'fabric';
import { applyShapeToDataURL } from '../utils/shapes';
import { useAnalytics } from './AnalyticsContext';
import { trackEvents, trackStickerDesign } from '../utils/analytics';
import { SavedDesign, saveCurrentDesign, loadCurrentDesign, restoreCanvasState } from '../utils/storage';

interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Size {
  width: number;
  height: number;
}

interface Element {
  id: string;
  type: 'image' | 'text' | 'shape';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: React.CSSProperties;
  rotation?: number;
  crop?: { unit: '%'; x: number; y: number; width: number; height: number };
  originalSize?: { width: number; height: number };
}

interface StickerContextType {
  elements: Element[];
  size: Size;
  setSize: (size: Size) => void;
  canvasShape: string;
  setCanvasShape: (shape: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  finish: 'matte' | 'glossy';
  setFinish: (finish: 'matte' | 'glossy') => void;
  notes: string;
  setNotes: (notes: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  designName: string;
  setDesignName: (name: string) => void;
  addImage: (url: string) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  downloadSticker: (backgroundColor?: string) => Promise<void>;
  downloadStickerSVG: (backgroundColor?: string) => Promise<void>;
  resetCanvas: () => void;
}

interface StickerProviderProps {
  children: React.ReactNode;
}

const StickerContext = createContext<StickerContextType | undefined>(undefined);

export function StickerProvider({ children }: StickerProviderProps) {
  // Initialize state with saved design or defaults
  const savedDesign = loadCurrentDesign();
  
  const [elements, setElements] = useState<Element[]>([]);
  const [size, setSize] = useState<Size>(savedDesign?.size || { width: 3, height: 3 });
  const [canvasShape, setCanvasShape] = useState(savedDesign?.canvasShape || 'square');
  const [quantity, setQuantity] = useState(savedDesign?.quantity || 50);
  const [finish, setFinish] = useState<'matte' | 'glossy'>(savedDesign?.finish || 'matte');
  const [notes, setNotes] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(savedDesign?.backgroundColor || '#ffffff');
  const [designName, setDesignName] = useState(savedDesign?.designName || 'Untitled Design');
  const [designId] = useState(savedDesign?.id || crypto.randomUUID());
  const { analytics } = useAnalytics();

  // Restore canvas state if there's saved data
  useEffect(() => {
    if (savedDesign?.canvasData) {
      const timer = setTimeout(() => {
        restoreCanvasState(savedDesign.canvasData);
      }, 100); // Small delay to ensure canvas is initialized
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-save whenever state changes
  useEffect(() => {
    const autoSave = async () => {
      const design: Omit<SavedDesign, 'canvasData'> = {
        id: designId,
        designName,
        size,
        quantity,
        finish,
        backgroundColor,
        canvasShape,
        lastModified: new Date().toISOString(),
        created: savedDesign?.created || new Date().toISOString()
      };

      const saved = await saveCurrentDesign(design);
      if (!saved) {
        console.error('Failed to auto-save design');
      }
    };

    // Debounce auto-save to prevent too frequent saves
    const timer = setTimeout(autoSave, 1000);
    return () => clearTimeout(timer);
  }, [size, quantity, finish, backgroundColor, canvasShape, designName, designId, elements]);

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id));
    toast.success('Element deleted');
  };

  const duplicateElement = (id: string) => {
    const element = elements.find((el) => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
      };
      setElements((prev) => [...prev, newElement]);
      toast.success('Element duplicated');
    }
  };

  const updateSize = (dimension: 'width' | 'height', value: number) => {
    setSize((prev) => ({ ...prev, [dimension]: value }));
    trackStickerDesign(analytics, trackEvents.SIZE_CHANGED, {
      width: size.width,
      height: size.height,
      shape: canvasShape,
      finish,
      quantity
    });
  };

  const updateCanvasShape = (shape: string) => {
    setCanvasShape(shape);
    trackStickerDesign(analytics, trackEvents.SHAPE_CHANGED, {
      width: size.width,
      height: size.height,
      shape,
      finish,
      quantity
    });
    const event = new CustomEvent('shapeChanged', { detail: { shape } });
    window.dispatchEvent(event);
  };

  const updateQuantity = (value: number) => {
    setQuantity(value);
    trackStickerDesign(analytics, trackEvents.QUANTITY_CHANGED, {
      width: size.width,
      height: size.height,
      shape: canvasShape,
      finish,
      quantity: value
    });
  };

  const updateFinish = (newFinish: 'matte' | 'glossy') => {
    setFinish(newFinish);
    trackStickerDesign(analytics, trackEvents.FINISH_CHANGED, {
      width: size.width,
      height: size.height,
      shape: canvasShape,
      finish: newFinish,
      quantity
    });
  };

  const updateNotes = (newNotes: string) => {
    setNotes(newNotes);
  };

  const updateBackgroundColor = (color: string) => {
    setBackgroundColor(color);
  };

  const handleSetDesignName = (name: string) => {
    setDesignName(name);
    const design: Omit<SavedDesign, 'canvasData'> = {
      id: designId,
      designName: name,
      size,
      quantity,
      finish,
      backgroundColor,
      canvasShape,
      lastModified: new Date().toISOString(),
      created: savedDesign?.created || new Date().toISOString()
    };

    saveCurrentDesign(design).catch(error => {
      console.error('Failed to save design name:', error);
    });

    trackStickerDesign(analytics, trackEvents.DESIGN_NAME_CHANGED, {
      name,
      width: size.width,
      height: size.height,
      shape: canvasShape,
      finish,
      quantity
    });
  };

  const downloadSticker = async (bgColor: string = 'white') => {
    try {
      const fabricCanvas = (window as any).fabricCanvas as fabric.Canvas;
      if (!fabricCanvas) {
        throw new Error('Canvas not initialized');
      }

      const dataUrl = await getCanvasDataURL(fabricCanvas);
      
      const link = document.createElement('a');
      link.download = 'sticker-design.png';
      link.href = dataUrl;
      link.click();
      
      toast.success('Sticker downloaded successfully');
    } catch (err) {
      console.error('Error downloading sticker:', err);
      toast.error('Failed to download sticker');
    }
  };

  const downloadStickerSVG = async () => {
    try {
      const fabricCanvas = (window as any).fabricCanvas as fabric.Canvas;
      if (!fabricCanvas) {
        throw new Error('Canvas not initialized');
      }

      const svg = await getCanvasSVG(fabricCanvas);
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = 'sticker-design.svg';
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('SVG downloaded successfully');
    } catch (err) {
      console.error('Error downloading SVG:', err);
      toast.error('Failed to download SVG');
    }
  };

  const resetCanvas = () => {
    setElements([]);
    setBackgroundColor('#ffffff');
    setCanvasShape('square');
    const event = new CustomEvent('resetCanvas');
    window.dispatchEvent(event);
    toast.success('Canvas reset');
  };

  const addImage = (url: string) => {
    const newElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: url,
      position: {
        x: 0,
        y: 0,
      },
    };
    setElements((prev) => [...prev, newElement]);
  };

  return (
    <StickerContext.Provider
      value={{
        elements,
        size,
        setSize,
        canvasShape,
        setCanvasShape,
        quantity,
        setQuantity,
        finish,
        setFinish,
        notes,
        setNotes,
        backgroundColor,
        setBackgroundColor,
        designName,
        setDesignName: handleSetDesignName,
        addImage,
        updateElement,
        deleteElement,
        duplicateElement,
        updateSize,
        updateCanvasShape,
        updateQuantity,
        updateFinish,
        updateNotes,
        updateBackgroundColor,
        downloadSticker,
        downloadStickerSVG,
        resetCanvas,
      }}
    >
      {children}
    </StickerContext.Provider>
  );
}

export function useSticker() {
  const context = useContext(StickerContext);
  if (context === undefined) {
    throw new Error('useSticker must be used within a StickerProvider');
  }
  return context;
}