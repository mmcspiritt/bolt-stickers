import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, X } from 'lucide-react';
import { useSticker } from '../context/StickerContext';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import NumberInput from './NumberInput';
import SizeConstraintDialog from './SizeConstraintDialog';
import ColorPicker from './ColorPicker';
import { processImageFile } from '../utils/imageHandlers';
import { toast } from 'react-hot-toast';
import { useImageUpload } from '../hooks/useImageUpload';
import { useShapes } from '../hooks/useShapes';
import { useCanvasSize } from '../hooks/useCanvasSize';
import EditableTitle from './EditableTitle';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { 
    size, 
    updateSize,
    updateCanvasShape,
    addImage,
    backgroundColor,
    updateBackgroundColor,
  } = useSticker();

  const [showSizeDialog, setShowSizeDialog] = useState(false);

  const { handleImageUpload } = useImageUpload();

  const { shapes, handleShapeChange } = useShapes();

  const { 
    showSizeDialog: canvasShowSizeDialog, 
    setShowSizeDialog: setCanvasShowSizeDialog, 
    handleSizeChange,
    getMaxSize 
  } = useCanvasSize();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles[0]) {
        await handleImageUpload(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="lg:hidden mb-4">
          <EditableTitle />
        </div>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Design Options</h2>
          {onClose && (
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <div
              {...getRootProps()}
              className="border-2 border-blue-500 rounded-lg p-4 text-center hover:border-blue-600 cursor-pointer transition-colors"
            >
              <input {...getInputProps()} />
              <Image className="mx-auto h-8 w-8 text-blue-500" />
              <p className="mt-1 text-sm text-muted-foreground">
                Drop image or tap to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports PNG, JPG, SVG, AI, PDF
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="Width (inches)"
                value={size.width}
                onChange={(value) => handleSizeChange('width', value)}
                min={1}
                max={getMaxSize('width')}
                step={1}
                helpText={`Max: ${getMaxSize('width')}"`}
              />
              <NumberInput
                label="Height (inches)"
                value={size.height}
                onChange={(value) => handleSizeChange('height', value)}
                min={1}
                max={getMaxSize('height')}
                step={1}
                helpText={`Max: ${getMaxSize('height')}"`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Shape</Label>
            <div className="grid grid-cols-2 gap-2">
              {shapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => handleShapeChange(shape.id)}
                  className="p-2 rounded-lg hover:bg-muted flex flex-col items-center gap-1"
                >
                  <shape.Preview />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <ColorPicker
              color={backgroundColor}
              onChange={updateBackgroundColor}
            />
          </div>
        </div>
      </ScrollArea>

      <SizeConstraintDialog 
        isOpen={canvasShowSizeDialog}
        onClose={() => setCanvasShowSizeDialog(false)}
      />
    </div>
  );
}