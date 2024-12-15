import React, { useEffect, useRef, useState, MouseEvent, TouchEvent } from 'react';
import { 
  Trash2, 
  Copy, 
  RotateCw,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Crop,
  Check,
  X
} from 'lucide-react';
import { useSticker } from '../context/StickerContext';
import { Rnd } from 'react-rnd';
import ReactCrop, { type Crop as CropArea } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import toast from 'react-hot-toast';

interface DesignElementProps {
  element: {
    id: string;
    type: 'image' | 'text' | 'shape';
    content: string;
    position: { x: number; y: number };
    size?: { width: number; height: number };
    style?: React.CSSProperties;
    rotation?: number;
    crop?: CropArea;
    originalSize?: { width: number; height: number };
  };
  onUpdate: (id: string, updates: any) => void;
  canvasSize: { width: number; height: number };
}

export default function DesignElement({ element, onUpdate, canvasSize }: DesignElementProps) {
  const { deleteElement, duplicateElement } = useSticker();
  const [isHovered, setIsHovered] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [rotation, setRotation] = useState(element.rotation || 0);
  const [tooltipText, setTooltipText] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<CropArea>(element.crop || {
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const toolbarTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (toolbarTimeoutRef.current) {
        clearTimeout(toolbarTimeoutRef.current);
      }
    };
  }, []);

  const showToolbar = () => {
    setIsToolbarVisible(true);
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
    }
  };

  const hideToolbar = () => {
    toolbarTimeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsToolbarVisible(false);
      }
    }, 2000);
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    onUpdate(element.id, { 
      rotation: newRotation,
      transform: `rotate(${newRotation}deg)`
    });
    toast.success('Image rotated 90° clockwise');
  };

  const handleCropComplete = () => {
    if (!imgRef.current || crop.width === 0 || crop.height === 0) {
      toast.error('Invalid crop area');
      return;
    }

    const image = imgRef.current;
    const cropWidth = (crop.width / 100) * image.naturalWidth;
    const cropHeight = (crop.height / 100) * image.naturalHeight;
    
    // Calculate new size maintaining aspect ratio
    const aspectRatio = cropWidth / cropHeight;
    let newWidth = element.size?.width || canvasSize.width * 0.8;
    let newHeight = newWidth / aspectRatio;

    // Ensure the new size fits within the canvas
    if (newHeight > canvasSize.height * 0.8) {
      newHeight = canvasSize.height * 0.8;
      newWidth = newHeight * aspectRatio;
    }

    // Center the cropped image
    const newX = (canvasSize.width - newWidth) / 2;
    const newY = (canvasSize.height - newHeight) / 2;

    onUpdate(element.id, { 
      crop,
      size: { width: newWidth, height: newHeight },
      position: { x: newX, y: newY },
      originalSize: { width: image.naturalWidth, height: image.naturalHeight }
    });
    
    setIsCropping(false);
    toast.success('Image cropped and centered');
  };

  const handleCenterHorizontally = () => {
    if (elementRef.current && canvasSize.width) {
      const elementWidth = elementRef.current.offsetWidth;
      const newX = (canvasSize.width - elementWidth) / 2;
      onUpdate(element.id, { position: { ...element.position, x: newX } });
      toast.success('Centered horizontally');
    }
  };

  const handleCenterVertically = () => {
    if (elementRef.current && canvasSize.height) {
      const elementHeight = elementRef.current.offsetHeight;
      const newY = (canvasSize.height - elementHeight) / 2;
      onUpdate(element.id, { position: { ...element.position, y: newY } });
      toast.success('Centered vertically');
    }
  };

  const controls = [
    { icon: Trash2, action: () => deleteElement(element.id), tooltip: 'Delete' },
    { icon: Copy, action: () => duplicateElement(element.id), tooltip: 'Duplicate' },
    { icon: RotateCw, action: handleRotate, tooltip: 'Rotate 90°' },
    { icon: AlignHorizontalJustifyCenter, action: handleCenterHorizontally, tooltip: 'Center Horizontally' },
    { icon: AlignVerticalJustifyCenter, action: handleCenterVertically, tooltip: 'Center Vertically' },
    { icon: Crop, action: () => setIsCropping(true), tooltip: 'Crop Image' },
  ];

  if (element.type !== 'image') {
    return null;
  }

  if (isCropping) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Crop Image</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCropComplete}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                title="Confirm Crop"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsCropping(false);
                  setCrop(element.crop || { unit: '%', x: 0, y: 0, width: 100, height: 100 });
                }}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            keepSelection
            aspect={undefined}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={element.content}
              alt="Crop"
              className="max-w-full"
              style={{ maxHeight: '70vh' }}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>
      </div>
    );
  }

  return (
    <Rnd
      position={{ x: element.position.x, y: element.position.y }}
      size={element.size || { width: 'auto', height: 'auto' }}
      onDragStop={(e: MouseEvent | TouchEvent, d: { x: number; y: number }) => {
        onUpdate(element.id, { position: { x: d.x, y: d.y } });
      }}
      onResizeStop={(_e: MouseEvent | TouchEvent, 
        _direction: string, 
        ref: HTMLElement, 
        _delta: { width: number; height: number }, 
        position: { x: number; y: number }) => {
        onUpdate(element.id, {
          size: { width: ref.offsetWidth, height: ref.offsetHeight },
          position,
        });
      }}
      style={{ transform: `rotate(${rotation}deg)` }}
      bounds="parent"
      onMouseEnter={() => {
        setIsHovered(true);
        showToolbar();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        hideToolbar();
      }}
      resizeHandleStyles={{
        topRight: { cursor: 'ne-resize' },
        topLeft: { cursor: 'nw-resize' },
        bottomRight: { cursor: 'se-resize' },
        bottomLeft: { cursor: 'sw-resize' },
        top: { cursor: 'n-resize' },
        right: { cursor: 'e-resize' },
        bottom: { cursor: 's-resize' },
        left: { cursor: 'w-resize' },
      }}
      className="group touch-manipulation"
      lockAspectRatio={element.crop ? true : false}
    >
      <div ref={elementRef} className="relative w-full h-full">
        <div className={`relative w-full h-full ${isHovered ? 'ring-2 ring-blue-500' : ''}`}>
          <img
            src={element.content}
            alt=""
            className="w-full h-full object-contain select-none"
            draggable={false}
            style={{
              clipPath: element.crop ? 
                `inset(${element.crop.y}% ${100 - (element.crop.x + element.crop.width)}% ${100 - (element.crop.y + element.crop.height)}% ${element.crop.x}%)` : 
                undefined
            }}
            crossOrigin="anonymous"
          />
        </div>

        {(isHovered || isToolbarVisible) && (
          <div 
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-white rounded-lg shadow-lg p-1 z-50 transition-opacity duration-200"
            style={{ opacity: isToolbarVisible ? 1 : 0 }}
          >
            {controls.map(({ icon: Icon, action, tooltip }, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action();
                }}
                onMouseEnter={() => setTooltipText(tooltip)}
                onMouseLeave={() => setTooltipText('')}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors relative group"
              >
                <Icon className="w-4 h-4" />
                {tooltipText === tooltip && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    {tooltip}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Rnd>
  );
}