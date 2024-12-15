import { RgbaColorPicker } from 'react-colorful';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useColorPicker, RGBAColor } from '../hooks/useColorPicker';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const {
    color: rgbaColor,
    cmykValues,
    handleColorChange,
    handleCMYKChange,
    getRgbaString
  } = useColorPicker(color);

  const handleRGBAChange = (newColor: RGBAColor) => {
    const hexColor = handleColorChange(newColor);
    onChange(hexColor);
  };

  const handleCMYKUpdate = (key: keyof typeof cmykValues, value: number) => {
    const hexColor = handleCMYKChange(key, value);
    onChange(hexColor);
  };

  return (
    <div className="space-y-4">
      <Label>Background Color</Label>
      <Tabs defaultValue="picker" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="picker">Color Picker</TabsTrigger>
          <TabsTrigger value="rgb">RGB</TabsTrigger>
          <TabsTrigger value="cmyk">CMYK</TabsTrigger>
        </TabsList>

        <TabsContent value="picker" className="flex justify-center pt-4">
          <RgbaColorPicker color={rgbaColor} onChange={handleRGBAChange} />
        </TabsContent>

        <TabsContent value="rgb" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Red</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={rgbaColor.r}
                onChange={(e) => handleColorChange({ ...rgbaColor, r: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Green</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={rgbaColor.g}
                onChange={(e) => handleColorChange({ ...rgbaColor, g: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Blue</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={rgbaColor.b}
                onChange={(e) => handleColorChange({ ...rgbaColor, b: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Alpha</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={rgbaColor.a}
                onChange={(e) => handleColorChange({ ...rgbaColor, a: Number(e.target.value) })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cmyk" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cyan (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={cmykValues.c}
                onChange={(e) => handleCMYKUpdate('c', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Magenta (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={cmykValues.m}
                onChange={(e) => handleCMYKUpdate('m', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Yellow (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={cmykValues.y}
                onChange={(e) => handleCMYKUpdate('y', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Key (Black) (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={cmykValues.k}
                onChange={(e) => handleCMYKUpdate('k', Number(e.target.value))}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div 
        className="w-full h-12 rounded-md border"
        style={{ backgroundColor: getRgbaString() }}
      />
    </div>
  );
}