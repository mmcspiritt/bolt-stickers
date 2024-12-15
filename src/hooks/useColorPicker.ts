import { useState, useCallback, useMemo } from 'react';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';

extend([cmykPlugin]);

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export function useColorPicker(initialColor: string) {
  const [color, setColor] = useState<RGBAColor>(() => {
    const c = colord(initialColor);
    return c.toRgb();
  });

  const [cmykValues, setCmykValues] = useState<CMYKColor>(() => {
    const cmyk = colord(color).toCmyk();
    return {
      c: Math.round(cmyk.c * 100),
      m: Math.round(cmyk.m * 100),
      y: Math.round(cmyk.y * 100),
      k: Math.round(cmyk.k * 100),
    };
  });

  const rgbToCmyk = useCallback((color: RGBAColor) => {
    const cmyk = colord(color).toCmyk();
    return {
      c: Math.round(cmyk.c * 100),
      m: Math.round(cmyk.m * 100),
      y: Math.round(cmyk.y * 100),
      k: Math.round(cmyk.k * 100),
    };
  }, []);

  const debouncedColorChange = useMemo(
    () => (newColor: RGBAColor) => {
      setColor(newColor);
      setCmykValues(rgbToCmyk(newColor));
      return colord(newColor).toHex();
    },
    [rgbToCmyk]
  );

  const handleCMYKChange = useCallback((key: keyof CMYKColor, value: number) => {
    const newCMYK = { ...cmykValues, [key]: value };
    setCmykValues(newCMYK);
    const rgba = colord({
      c: newCMYK.c / 100,
      m: newCMYK.m / 100,
      y: newCMYK.y / 100,
      k: newCMYK.k / 100,
    }).toRgb();
    setColor(rgba);
    return colord(rgba).toHex();
  }, [cmykValues]);

  return {
    color,
    cmykValues,
    handleColorChange: debouncedColorChange,
    handleCMYKChange,
    getRgbaString: () => `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
    getHexString: () => colord(color).toHex(),
  };
} 