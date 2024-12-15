interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  size: number;
  totalWidth?: number;
  totalHeight?: number;
  className?: string;
}

export default function Ruler({ orientation, size, totalWidth = 0, totalHeight = 0, className = '' }: RulerProps) {
  const divisions = Math.floor(size * 2); // Show half-inch marks
  const marks = Array.from({ length: divisions + 1 }, (_, i) => i / 2);

  const rulerStyle = orientation === 'horizontal'
    ? {
        width: `${totalWidth}px`,
        height: '24px',
        top: '-24px',
        left: '0',
      }
    : {
        width: '24px',
        height: `${totalHeight}px`,
        top: '0',
        left: '-24px',
      };

  return (
    <div
      className={`absolute bg-gray-100 border border-gray-300 ${className}`}
      style={rulerStyle}
    >
      {marks.map((mark) => {
        const position = (mark / size) * (orientation === 'horizontal' ? totalWidth : totalHeight);
        const isWholeMark = mark % 1 === 0;
        
        return (
          <div
            key={mark}
            className="absolute flex items-center justify-center"
            style={
              orientation === 'horizontal'
                ? {
                    left: `${position}px`,
                    height: isWholeMark ? '100%' : '50%',
                    top: isWholeMark ? '0' : '50%',
                    width: '1px',
                    borderRight: `1px solid ${isWholeMark ? '#4B5563' : '#9CA3AF'}`,
                  }
                : {
                    top: `${position}px`,
                    width: isWholeMark ? '100%' : '50%',
                    left: isWholeMark ? '0' : '50%',
                    height: '1px',
                    borderBottom: `1px solid ${isWholeMark ? '#4B5563' : '#9CA3AF'}`,
                  }
            }
          >
            {isWholeMark && (
              <span 
                className="text-[10px] font-medium text-gray-600"
                style={
                  orientation === 'horizontal'
                    ? { transform: 'translateX(-50%)', position: 'absolute', top: '4px' }
                    : { transform: 'translateY(-50%)', position: 'absolute', left: '4px' }
                }
              >
                {mark}"
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}