
import { useEffect, useState } from 'react';

const PixelCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<{x: number, y: number, opacity: number}[]>([]);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Add to trail with decreasing opacity
      setTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, opacity: 0.7 }];
        if (newTrail.length > 5) {
          return newTrail.slice(1).map((point, index) => ({
            ...point,
            opacity: 0.7 - (index * 0.12) // Decrease opacity for older points
          }));
        }
        return newTrail;
      });
    };
    
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Cursor trail */}
      {trail.map((point, index) => (
        <div 
          key={index} 
          className="fixed pointer-events-none z-40 w-2 h-2"
          style={{ 
            left: `${point.x}px`, 
            top: `${point.y}px`,
            opacity: point.opacity,
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#0ff0fc',
            boxShadow: '0 0 4px #0ff0fc'
          }}
        />
      ))}
    
      {/* Main cursor */}
      <div 
        className={`fixed pointer-events-none z-50 ${isClicking ? 'w-5 h-5' : 'w-4 h-4'} transition-all duration-100`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="relative">
          {/* Tech-themed pixelated cursor */}
          <div 
            className={`absolute ${isClicking ? 'bg-neon-green opacity-90' : 'bg-neon-purple opacity-70'} w-full h-full transition-colors duration-150`} 
            style={{ 
              clipPath: 'polygon(0% 0%, 75% 0%, 75% 75%, 100% 75%, 100% 100%, 25% 100%, 25% 25%, 0% 25%)',
              boxShadow: isClicking ? '0 0 8px #39ff14' : '0 0 5px #bc13fe'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PixelCursor;
