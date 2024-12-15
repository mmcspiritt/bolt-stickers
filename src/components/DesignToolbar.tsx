import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSticker } from '../context/StickerContext';
import { cn } from '../lib/utils';
import ColorPicker from './ColorPicker';
import { useImageUpload } from '../hooks/useImageUpload';
import {
  Image,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Palette,
  Ruler,
  Trash2,
  LucideIcon,
} from 'lucide-react';
import { useShapes } from '../hooks/useShapes';
import { useCanvasSize } from '../hooks/useCanvasSize';

interface DesignToolbarProps {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
}

type ConfigType = 'upload' | 'color' | 'size' | 'shape' | null;

type Tool = {
  id: ConfigType | 'reset';
  icon: LucideIcon | (() => JSX.Element);
  label: string;
  action: () => void;
};

export default function DesignToolbar({ isSidebarOpen, isModalOpen }: DesignToolbarProps) {
  const [activeConfig, setActiveConfig] = useState<ConfigType>(null);

  const {
    size,
    updateSize,
    updateCanvasShape,
    addImage,
    backgroundColor,
    updateBackgroundColor,
    resetCanvas,
  } = useSticker();

  const { handleImageUpload } = useImageUpload();
  const { shapes, currentShape, handleShapeChange } = useShapes();

  const { 
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

  // Hide toolbar when sidebar or modal is open
  if (isSidebarOpen || isModalOpen) {
    return null;
  }

  const tools: Tool[] = [
    {
      id: 'upload',
      icon: Image,
      label: 'Upload Image',
      action: () => setActiveConfig(activeConfig === 'upload' ? null : 'upload'),
    },
    {
      id: 'color',
      icon: () => {
        if (backgroundColor === '#ffffff' || !backgroundColor) {
          return <Palette className="w-5 h-5" />;
        }
        return (
          <div
            className="w-5 h-5 rounded-full border"
            style={{
              backgroundColor,
              borderColor: backgroundColor === '#ffffff' ? '#e2e8f0' : 'transparent'
            }}
          />
        );
      },
      label: 'Background Color',
      action: () => setActiveConfig(activeConfig === 'color' ? null : 'color'),
    },
    {
      id: 'size' as ConfigType,
      icon: Ruler,
      label: 'Size',
      action: () => setActiveConfig(activeConfig === 'size' ? null : 'size'),
    },
    {
      id: 'shape' as ConfigType,
      icon: Square,
      label: 'Shape',
      action: () => setActiveConfig(activeConfig === 'shape' ? null : 'shape'),
    },
    {
      id: 'reset',
      icon: Trash2,
      label: 'Reset Canvas',
      action: () => {
        resetCanvas();
        setActiveConfig(null);
      },
    },
  ];

  return (
    <>
      <div className="fixed z-50 lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:left-auto bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0">
        <div className="flex lg:flex-col items-center gap-2">
          <h2 className="text-xs font-serif italic text-gray-600 tracking-wide mb-1 lg:rotate-180 lg:writing-vertical-lr lg:mb-0 lg:mr-2">Design Options</h2>
          
          <div className="flex lg:flex-col items-center gap-3 bg-white rounded-full lg:rounded-lg shadow-lg px-4 py-2 lg:p-2 border">
            {tools.map((tool) => {
              const Icon = tool.icon as LucideIcon | (() => JSX.Element);
              return (
                <button
                  key={tool.id}
                  onClick={tool.action}
                  className={cn(
                    "p-3 rounded-full hover:bg-gray-100 transition-colors relative group",
                    activeConfig === tool.id && "bg-gray-100"
                  )}
                >
                  {React.createElement(Icon, null)}
                  <span className="absolute lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:ml-2 -top-8 left-1/2 -translate-x-1/2 lg:translate-x-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Color Picker */}
          {activeConfig === 'color' && (
            <div className="absolute lg:left-full lg:top-0 lg:ml-4 lg:bottom-auto bottom-20 left-0 right-0 lg:right-auto bg-white p-4 border lg:rounded-lg shadow-lg">
              <ColorPicker
                color={backgroundColor}
                onChange={updateBackgroundColor}
              />
            </div>
          )}

          {/* Size Controls */}
          {activeConfig === 'size' && (
            <div className="absolute lg:left-full lg:top-0 lg:ml-4 lg:bottom-auto bottom-full left-1/2 -translate-x-1/2 lg:translate-x-0 mb-4 lg:mb-0 bg-white rounded-lg shadow-lg p-4 border w-[300px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Width (inches)</label>
                  <input
                    type="number"
                    value={size.width}
                    onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                    min={1}
                    max={getMaxSize('width')}
                    step={1}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Height (inches)</label>
                  <input
                    type="number"
                    value={size.height}
                    onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                    min={1}
                    max={getMaxSize('height')}
                    step={1}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shape Selector */}
          {activeConfig === 'shape' && (
            <div className="absolute lg:left-full lg:top-0 lg:ml-4 lg:bottom-auto bottom-full left-1/2 -translate-x-1/2 lg:translate-x-0 mb-4 lg:mb-0 bg-white rounded-lg shadow-lg p-4 border">
              <div className="grid grid-cols-2 gap-4">
                {shapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => {
                      handleShapeChange(shape.id);
                      setActiveConfig(null);
                    }}
                    className={cn(
                      "p-3 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center gap-2",
                      currentShape === shape.id && "bg-gray-100"
                    )}
                  >
                    {React.createElement(shape.icon, { className: "w-6 h-6" })}
                    <span className="text-xs">{shape.id.charAt(0).toUpperCase() + shape.id.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {activeConfig === 'upload' && (
            <div className="absolute lg:left-full lg:top-0 lg:ml-4 lg:bottom-auto bottom-full left-1/2 -translate-x-1/2 lg:translate-x-0 mb-4 lg:mb-0 w-64">
              <div
                {...getRootProps()}
                className="bg-white rounded-lg shadow-lg p-4 border-2 border-dashed border-primary text-center"
              >
                <input {...getInputProps()} />
                <Image className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drop image here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {activeConfig && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setActiveConfig(null)}
        />
      )}
    </>
  );
}