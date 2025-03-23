
import { useEffect, useRef } from 'react';

type MatrixRainProps = {
  intensity?: 'light' | 'medium' | 'heavy';
  color?: string;
};

const MatrixRain = ({ intensity = 'light', color = '#39ff14' }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Define matrix characters
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const techTerms = ['rails', 'ruby', 'postgres', 'sql', 'node', 'api', 'db', 'terminal'];
    
    // Determine drop count based on intensity
    const getDensityFactor = () => {
      switch (intensity) {
        case 'light': return 0.01;
        case 'medium': return 0.02;
        case 'heavy': return 0.05;
        default: return 0.01;
      }
    };
    
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const densityFactor = getDensityFactor();
    const drops: number[] = Array(columns).fill(1);
    const opacities: number[] = Array(columns).fill(0);
    
    // Animation function
    const draw = () => {
      ctx.fillStyle = 'rgba(18, 18, 18, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px JetBrains Mono`;
      
      // Iterate over each column
      for (let i = 0; i < drops.length; i++) {
        // Randomly decide whether to draw or not
        if (Math.random() < densityFactor) {
          // Randomly decide to draw a tech term
          if (Math.random() < 0.03) {
            const term = techTerms[Math.floor(Math.random() * techTerms.length)];
            ctx.fillStyle = `rgba(${color.replace(/[^\d,]/g, '')}, ${opacities[i]})`;
            ctx.fillText(term, i * fontSize, drops[i] * fontSize);
          } else {
            // Draw random character
            const char = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillStyle = `rgba(${color.replace(/[^\d,]/g, '')}, ${opacities[i]})`;
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          }
          
          // Move drops and reset when they reach bottom
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
            opacities[i] = 0;
          }
          
          // Increment drop position
          drops[i]++;
          
          // Fade in opacity at the beginning
          if (opacities[i] < 1) {
            opacities[i] += 0.02;
          }
        }
      }
    };
    
    // Set animation interval
    const interval = setInterval(draw, 50);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, [intensity, color]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none"
    />
  );
};

export default MatrixRain;
