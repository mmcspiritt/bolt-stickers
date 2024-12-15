import { useState, useEffect } from 'react';
import { useSticker } from '../context/StickerContext';
import { toast } from 'react-hot-toast';

export function useCanvasSize() {
  const { size, updateSize } = useSticker();
  const [showSizeDialog, setShowSizeDialog] = useState(false);

  // Handle size constraints
  useEffect(() => {
    if ((size.width > 10 && size.height > 10) || 
        (size.width > 17 || size.height > 17)) {
      const timeout = setTimeout(() => {
        setShowSizeDialog(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [size.width, size.height]);

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    // Get max allowed value based on other dimension
    const maxAllowed = dimension === 'width' 
      ? (size.height <= 10 ? 17 : 10)
      : (size.width <= 10 ? 17 : 10);

    // Validate input
    if (value < 1) {
      value = 1;
      toast.error('Minimum size is 1 inch');
    } else if (value > maxAllowed) {
      value = maxAllowed;
      toast.error(`Maximum ${dimension} for this size is ${maxAllowed} inches`);
    }

    updateSize(dimension, value);
  };

  return {
    size,
    showSizeDialog,
    setShowSizeDialog,
    handleSizeChange,
    getMaxSize: (dimension: 'width' | 'height') => 
      dimension === 'width' 
        ? (size.height <= 10 ? 17 : 10)
        : (size.width <= 10 ? 17 : 10)
  };
} 