import { fabric } from 'fabric';
import { 
  Copy, 
  Trash2, 
  RotateCw, 
  GripHorizontal,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter
} from 'lucide-react';
import { useWindow } from '../hooks/useWindow';
import { useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface ImageToolbarProps {
  object: fabric.Object;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRotate?: () => void;
  onCenterVertically?: () => void;
  onCenterHorizontally?: () => void;
}

export function ImageToolbar({
  object,
  onDelete,
  onDuplicate,
  onRotate,
  onCenterVertically,
  onCenterHorizontally
}: ImageToolbarProps) {
  const { isMobile } = useWindow();
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('toolbarPosition');
    // On mobile, default to bottom center, on desktop top right
    const defaultPosition = isMobile 
      ? { x: (window.innerWidth - 280) / 2, y: window.innerHeight - 80 }
      : { x: window.innerWidth - 320, y: 20 };
    return saved ? JSON.parse(saved) : defaultPosition;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  // Update position when window resizes to keep toolbar in view
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const toolbarWidth = isMobile ? 280 : 320;
        const toolbarHeight = 60;
        
        // On mobile, center horizontally when width changes
        const x = isMobile 
          ? (window.innerWidth - toolbarWidth) / 2 
          : Math.min(prev.x, window.innerWidth - toolbarWidth);
        const y = Math.min(prev.y, window.innerHeight - toolbarHeight);
        
        return { 
          x: Math.max(0, x), 
          y: Math.max(0, y)
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem('toolbarPosition', JSON.stringify(position));
  }, [position]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // Ensure toolbar stays within viewport bounds
    const toolbarWidth = isMobile ? 280 : 320;
    const toolbarHeight = 60;
    
    const boundedX = Math.max(0, Math.min(window.innerWidth - toolbarWidth, newX));
    const boundedY = Math.max(0, Math.min(window.innerHeight - toolbarHeight, newY));

    setPosition({ x: boundedX, y: boundedY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('touchmove', handleDrag, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);
  
  if (!object) return null;

  return (
    <div 
      className={`
        fixed bg-white rounded-lg shadow-lg select-none
        ${isMobile ? 'p-1.5 space-x-1' : 'p-2 space-x-2'}
        transition-shadow
        ${isDragging ? 'shadow-xl' : ''}
        z-50
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
        maxWidth: '90vw',
      }}
    >
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={`
          hover:bg-gray-100 rounded-lg transition-colors touch-none cursor-grab active:cursor-grabbing
          ${isMobile ? 'p-1.5' : 'p-2'}
          inline-flex items-center
        `}
      >
        <GripHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      <div className={`inline-flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className={`
              hover:bg-gray-100 rounded-lg transition-colors
              ${isMobile ? 'p-1.5' : 'p-2'}
            `}
            title="Duplicate"
          >
            <Copy className="w-5 h-5" />
          </button>
        )}
        {onRotate && (
          <button
            onClick={onRotate}
            className={`
              hover:bg-gray-100 rounded-lg transition-colors
              ${isMobile ? 'p-1.5' : 'p-2'}
            `}
            title="Rotate 90°"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        )}
        {onCenterVertically && (
          <button
            onClick={onCenterVertically}
            className={`
              hover:bg-gray-100 rounded-lg transition-colors
              ${isMobile ? 'p-1.5' : 'p-2'}
            `}
            title="Center Vertically"
          >
            <AlignVerticalJustifyCenter className="w-5 h-5" />
          </button>
        )}
        {onCenterHorizontally && (
          <button
            onClick={onCenterHorizontally}
            className={`
              hover:bg-gray-100 rounded-lg transition-colors
              ${isMobile ? 'p-1.5' : 'p-2'}
            `}
            title="Center Horizontally"
          >
            <AlignHorizontalJustifyCenter className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className={`
              hover:bg-red-100 text-red-600 rounded-lg transition-colors
              ${isMobile ? 'p-1.5' : 'p-2'}
            `}
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}