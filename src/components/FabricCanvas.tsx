import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useSticker } from '../context/StickerContext';
import { useWindow } from '../hooks/useWindow';
import { ImageToolbar } from './ImageToolbar';
import { toast } from 'react-hot-toast';
import { createClipPath } from '../utils/shapes';
import { saveCurrentDesign, loadCurrentDesign } from '../utils/storage';

interface FabricCanvasProps {
  width: number;
  height: number;
}

export default function FabricCanvas({ width, height }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const { backgroundColor, designName, size, quantity, finish, canvasShape } = useSticker();
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const { isMobile } = useWindow();
  const designIdRef = useRef<string>(crypto.randomUUID());
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize canvas with better performance settings
  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current || width === 0 || height === 0) return;

    // Clean up existing canvas instance properly
    if (fabricRef.current) {
      try {
        fabricRef.current.dispose();
      } catch (error) {
        console.error('Error disposing canvas:', error);
      }
      fabricRef.current = null;
    }

    // Create new canvas instance
    try {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: backgroundColor || '#ffffff',
        preserveObjectStacking: true,
        selection: true,
        controlsAboveOverlay: true,
        renderOnAddRemove: false,
        stateful: false,
        skipTargetFind: false,
        enableRetinaScaling: false,
      });

      // Restore saved canvas state if it exists
      const savedDesign = loadCurrentDesign();
      if (savedDesign?.canvasData) {
        canvas.loadFromJSON(savedDesign.canvasData, () => {
          canvas.renderAll();
          designIdRef.current = savedDesign.id;
        });
      }

      // Set up event handlers
      const handleSelection = (e: fabric.IEvent) => {
        const selected = canvas.getActiveObject();
        setSelectedObject(selected || null);
      };

      const handleDeselection = () => {
        setSelectedObject(null);
      };

      canvas.on({
        'selection:created': handleSelection,
        'selection:updated': handleSelection,
        'selection:cleared': handleDeselection,
        'object:modified': () => {
          saveCanvasState();
          handleSelection({ target: canvas.getActiveObject() } as fabric.IEvent);
        },
        'object:added': saveCanvasState,
        'object:removed': () => {
          saveCanvasState();
          handleDeselection();
        }
      });

      // Save reference to canvas
      fabricRef.current = canvas;
      (window as any).fabricCanvas = canvas;

      // Return cleanup function
      return () => {
        try {
          canvas.off(); // Remove all event listeners
          if (fabricRef.current === canvas) {
            fabricRef.current = null;
            (window as any).fabricCanvas = null;
          }
          // Only dispose if the canvas element still exists
          if (canvasRef.current && canvasRef.current.parentNode) {
            canvas.dispose();
          }
        } catch (error) {
          console.error('Error cleaning up canvas:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }
  }, [width, height]);

  // Handle image upload event
  useEffect(() => {
    const handleImageUpload = async (event: CustomEvent<{ imageUrl: string, fileType: string }>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const { imageUrl, fileType } = event.detail;
      console.log('Handling image upload:', { fileType });
      
      // Handle SVG files differently
      if (fileType === 'image/svg+xml') {
        try {
          // Convert data URL to SVG content
          const base64Content = imageUrl.split(',')[1];
          const svgString = atob(base64Content);
          console.log('Original SVG:', svgString);

          // Parse SVG to handle background color
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgString, 'image/svg+xml');
          const svgElement = doc.querySelector('svg');

          if (!svgElement) {
            console.error('No SVG element found');
            toast.error('Invalid SVG file');
            return;
          }

          // Extract background color from fill attribute
          let backgroundColor = svgElement.getAttribute('fill');
          if (backgroundColor) {
            // Remove fill attribute as it will be applied to canvas background
            svgElement.removeAttribute('fill');
          }

          // Convert back to string without the fill attribute
          const processedSvg = new XMLSerializer().serializeToString(svgElement);
          
          // Load SVG into fabric
          fabric.loadSVGFromString(processedSvg, (objects, options) => {
            if (!objects || objects.length === 0) {
              console.error('No SVG objects loaded');
              toast.error('Invalid SVG file');
              return;
            }

            const svgObject = fabric.util.groupSVGElements(objects, options);
            
            // Scale SVG to fit canvas
            const scale = Math.min(
              (canvas.width! * 0.8) / svgObject.width!,
              (canvas.height! * 0.8) / svgObject.height!
            );

            svgObject.set({
              left: canvas.width! / 2,
              top: canvas.height! / 2,
              originX: 'center',
              originY: 'center',
              cornerStyle: 'circle',
              cornerColor: '#2196F3',
              cornerStrokeColor: '#2196F3',
              borderColor: '#2196F3',
              cornerSize: 12,
              padding: 10,
              transparentCorners: false,
              scaleX: scale,
              scaleY: scale
            });

            // Set canvas background color if it was present in the SVG
            if (backgroundColor) {
              canvas.setBackgroundColor(backgroundColor, () => {
                canvas.add(svgObject);
                canvas.setActiveObject(svgObject);
                canvas.renderAll();
                saveCanvasState();
              });
            } else {
              canvas.add(svgObject);
              canvas.setActiveObject(svgObject);
              canvas.renderAll();
              saveCanvasState();
            }
          });
        } catch (error) {
          console.error('Error processing SVG:', error);
          toast.error('Failed to process SVG file');
        }
      } else {
        console.log('Processing regular image');
        // Handle other image types
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';

        imgElement.onload = () => {
          console.log('Image loaded successfully');
          const fabricImage = new fabric.Image(imgElement, {
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center',
            cornerStyle: 'circle',
            cornerColor: '#2196F3',
            cornerStrokeColor: '#2196F3',
            borderColor: '#2196F3',
            cornerSize: 12,
            padding: 10,
            transparentCorners: false,
          });

          // Scale image to fit canvas
          const scale = Math.min(
            (canvas.width! * 0.8) / fabricImage.width!,
            (canvas.height! * 0.8) / fabricImage.height!
          );

          fabricImage.scale(scale);

          canvas.add(fabricImage);
          canvas.setActiveObject(fabricImage);
          canvas.renderAll();
          saveCanvasState();
          console.log('Image added to canvas');
        };

        imgElement.onerror = (error) => {
          console.error('Error loading image:', error);
          toast.error('Failed to load image');
        };

        imgElement.src = imageUrl;
      }
    };

    window.addEventListener('addImage', handleImageUpload as EventListener);
    return () => {
      window.removeEventListener('addImage', handleImageUpload as EventListener);
    };
  }, []);

  // Handle object deletion
  const handleDelete = () => {
    const canvas = fabricRef.current;
    if (canvas && selectedObject) {
      canvas.remove(selectedObject);
      canvas.renderAll();
      setSelectedObject(null);
      saveCanvasState();
    }
  };

  // Handle object duplication
  const handleDuplicate = () => {
    const canvas = fabricRef.current;
    if (canvas && selectedObject) {
      selectedObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (selectedObject.left || 0) + 20,
          top: (selectedObject.top || 0) + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        saveCanvasState();
      });
    }
  };

  // Handle object rotation
  const handleRotate = () => {
    const canvas = fabricRef.current;
    if (canvas && selectedObject) {
      const currentAngle = selectedObject.angle || 0;
      selectedObject.rotate((currentAngle + 90) % 360);
      canvas.renderAll();
      saveCanvasState();
    }
  };

  // Handle centering object
  const handleCenter = () => {
    const canvas = fabricRef.current;
    if (canvas && selectedObject) {
      const center = canvas.getCenter();
      selectedObject.set({
        left: center.left,
        top: center.top,
        originX: 'center',
        originY: 'center',
      });
      canvas.renderAll();
      saveCanvasState();
    }
  };

  // Handle centering object vertically
  const handleCenterVertically = () => {
    const canvas = fabricRef.current;
    if (canvas && selectedObject) {
      const center = canvas.getCenter();
      selectedObject.set({
        top: center.top,
        originY: 'center'
      });
      canvas.renderAll();
      saveCanvasState();
    }
  };

  // Handle centering object horizontally
  const handleCenterHorizontally = () => {
    const canvas = fabricRef.current;
    if (canvas && selectedObject) {
      const center = canvas.getCenter();
      selectedObject.set({
        left: center.left,
        originX: 'center'
      });
      canvas.renderAll();
      saveCanvasState();
    }
  };

  // Handle shape changes
  useEffect(() => {
    const handleShapeChange = (event: CustomEvent<{ shape: string }>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const clipPath = createClipPath(event.detail.shape, canvas.width!, canvas.height!);
      if (clipPath) {
        canvas.clipPath = clipPath;
        canvas.renderAll();
        saveCanvasState();
      }
    };

    window.addEventListener('shapeChanged', handleShapeChange as EventListener);
    return () => {
      window.removeEventListener('shapeChanged', handleShapeChange as EventListener);
    };
  }, []);

  // Apply initial shape
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const clipPath = createClipPath(canvasShape, canvas.width!, canvas.height!);
    if (clipPath) {
      canvas.clipPath = clipPath;
      canvas.renderAll();
    }
  }, [canvasShape]);

  // Save canvas state when important properties change
  useEffect(() => {
    if (fabricRef.current) {
      saveCanvasState();
    }
  }, [backgroundColor, designName, size, quantity, finish, canvasShape]);

  const saveCanvasState = async () => {
    if (!fabricRef.current) return;

    const design = {
      id: designIdRef.current,
      designName,
      size,
      quantity,
      finish,
      backgroundColor,
      canvasShape,
      lastModified: new Date().toISOString(),
      created: new Date().toISOString()
    };

    try {
      await saveCurrentDesign(design);
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  };

  // Update background color
  useEffect(() => {
    const canvas = fabricRef.current;
    if (canvas) {
      canvas.setBackgroundColor(backgroundColor, () => {
        canvas.renderAll();
        saveCanvasState();
      });
    }
  }, [backgroundColor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedObject && (e.key === 'Delete' || e.key === 'Backspace')) {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedObject]);

  // Handle reset canvas event
  useEffect(() => {
    const handleResetCanvas = () => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Clear all objects
      canvas.clear();
      
      // Reset background color to white
      canvas.setBackgroundColor('#ffffff', () => {
        canvas.renderAll();
        saveCanvasState();
      });
    };

    window.addEventListener('resetCanvas', handleResetCanvas);
    return () => {
      window.removeEventListener('resetCanvas', handleResetCanvas);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <canvas ref={canvasRef} />
      {selectedObject && (
        <ImageToolbar 
          object={selectedObject}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onRotate={handleRotate}
          onCenter={handleCenter}
          onCenterVertically={handleCenterVertically}
          onCenterHorizontally={handleCenterHorizontally}
        />
      )}
    </div>
  );
}