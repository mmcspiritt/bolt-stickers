import { fabric } from 'fabric';

export interface SavedDesign {
  id: string;
  designName: string;
  canvasData: string; // JSON string of canvas state
  size: {
    width: number;
    height: number;
  };
  quantity: number;
  finish: 'matte' | 'glossy';
  backgroundColor: string;
  canvasShape: string;
  lastModified: string;
  created: string;
}

const CURRENT_DESIGN_KEY = 'current_design';
const DESIGN_VERSION = '1.0.0'; // For future migrations if needed

export const saveCurrentDesign = async (design: Omit<SavedDesign, 'canvasData'>) => {
  try {
    const canvas = (window as any).fabricCanvas as fabric.Canvas;
    if (!canvas) {
      console.error('No canvas found');
      return false;
    }

    // Include additional properties for fabric objects
    const canvasData = JSON.stringify(canvas.toJSON(['id', 'selectable', 'crossOrigin', 'src']));
    
    const designToSave = {
      ...design,
      canvasData,
      lastModified: new Date().toISOString()
    };

    localStorage.setItem(CURRENT_DESIGN_KEY, JSON.stringify({
      version: DESIGN_VERSION,
      data: designToSave
    }));

    return true;
  } catch (error) {
    console.error('Error saving design:', error);
    return false;
  }
};

export const loadCurrentDesign = (): SavedDesign | null => {
  try {
    const saved = localStorage.getItem(CURRENT_DESIGN_KEY);
    if (!saved) return null;

    const { data } = JSON.parse(saved);
    return data;
  } catch (error) {
    console.error('Error loading design:', error);
    return null;
  }
};

export const restoreCanvasState = async (canvasData: string): Promise<boolean> => {
  try {
    const canvas = (window as any).fabricCanvas as fabric.Canvas;
    if (!canvas) {
      console.error('No canvas found');
      return false;
    }

    return new Promise((resolve) => {
      canvas.loadFromJSON(canvasData, () => {
        // Ensure all objects are properly rendered
        canvas.getObjects().forEach(obj => {
          if (obj.type === 'image') {
            obj.crossOrigin = 'anonymous';
          }
          obj.setCoords();
        });
        canvas.renderAll();
        resolve(true);
      });
    });
  } catch (error) {
    console.error('Error restoring canvas:', error);
    return false;
  }
};
