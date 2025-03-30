import React, { useContext } from 'react'
import { ThemeContext } from './ThemeProvider'
import ResponsiveImage from './ResponsiveImage'

/**
 * GameCard component for displaying a game in the games list
 */
const GameCard = ({ title, description, imageUrl, link }) => {
  console.log('GameCard rendering:', { title, imageUrl, link });
  
  // Get theme context if available
  let theme = 'dark'; // Default to dark if context not available
  try {
    const themeContext = useContext(ThemeContext);
    if (themeContext) {
      theme = themeContext.theme;
    }
  } catch (e) {
    console.log('ThemeContext not available, using default theme');
  }
  
  const isDark = theme === 'dark';
  
  return (
    <div 
      className="rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 w-[400px] mx-auto"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="relative pb-[56.25%]">
        <ResponsiveImage
          src={imageUrl || "https://via.placeholder.com/640x360?text=Game+Preview"} 
          alt={title} 
          className="absolute h-full w-full" 
          width={640}
          height={360}
          objectFit="contain"
        />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)' }} className="mb-4">{description}</p>
        <a 
          href={link} 
          className="inline-block theme-button font-bold py-2 px-4 rounded transition-colors"
        >
          Play Now
        </a>
      </div>
    </div>
  )
}

export default GameCard