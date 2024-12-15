import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { useSticker } from '../context/StickerContext';
import { RgbaColorPicker } from 'react-colorful';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

extend([cmykPlugin]);

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const { downloadSticker, downloadStickerSVG } = useSticker();
  const [backgroundColor, setBackgroundColor] = useState<RGBAColor>({ r: 255, g: 255, b: 255, a: 1 });
  const [cmykValues, setCmykValues] = useState<CMYKColor>({ c: 0, m: 0, y: 0, k: 0 });
  const [isTransparent, setIsTransparent] = useState(false);

  if (!isOpen) return null;

  const handleColorChange = (color: RGBAColor) => {
    setBackgroundColor(color);
    const cmyk = colord(color).toCmyk();
    setCmykValues({
      c: Math.round(cmyk.c * 100),
      m: Math.round(cmyk.m * 100),
      y: Math.round(cmyk.y * 100),
      k: Math.round(cmyk.k * 100),
    });
  };

  const handleCMYKChange = (key: keyof CMYKColor, value: number) => {
    const newCMYK = { ...cmykValues, [key]: value };
    setCmykValues(newCMYK);
    const rgba = colord({
      c: newCMYK.c / 100,
      m: newCMYK.m / 100,
      y: newCMYK.y / 100,
      k: newCMYK.k / 100,
    }).toRgb();
    setBackgroundColor(rgba);
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    const bgColor = isTransparent ? 'transparent' : 
      `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;

    if (format === 'png') {
      await downloadSticker(bgColor);
    } else {
      await downloadStickerSVG(bgColor);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Download Options</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <Label className="mb-2">Background Color</Label>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="transparent"
                checked={isTransparent}
                onChange={(e) => setIsTransparent(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="transparent">Transparent Background</Label>
            </div>

            {!isTransparent && (
              <Tabs defaultValue="picker" className="w-full">
                <TabsList className="mb-4 w-full flex justify-center">
                  <TabsTrigger value="picker">Color Picker</TabsTrigger>
                  <TabsTrigger value="cmyk">CMYK Values</TabsTrigger>
                </TabsList>

                <TabsContent value="picker" className="flex justify-center">
                  <div className="w-[200px]">
                    <RgbaColorPicker color={backgroundColor} onChange={handleColorChange} />
                  </div>
                </TabsContent>

                <TabsContent value="cmyk">
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div>
                      <Label>Cyan (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cmykValues.c}
                        onChange={(e) => handleCMYKChange('c', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Magenta (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cmykValues.m}
                        onChange={(e) => handleCMYKChange('m', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Yellow (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cmykValues.y}
                        onChange={(e) => handleCMYKChange('y', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Key (Black) (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cmykValues.k}
                        onChange={(e) => handleCMYKChange('k', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleDownload('png')}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download as PNG</span>
            </button>
            <button
              onClick={() => handleDownload('svg')}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download as Vector (SVG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}