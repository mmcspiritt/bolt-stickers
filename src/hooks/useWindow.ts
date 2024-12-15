import { useEffect, useState } from 'react';

interface WindowDimensions {
  width: number | undefined;
  height: number | undefined;
  isMobile: boolean;
}

export function useWindow(): WindowDimensions {
  const [dimensions, setDimensions] = useState<WindowDimensions>({
    width: undefined,
    height: undefined,
    isMobile: false
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setDimensions({
        width,
        height: window.innerHeight,
        isMobile: width < 768
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
} 