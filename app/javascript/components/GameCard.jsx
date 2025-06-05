import React, { useContext } from 'react'
import { ThemeContext } from './ThemeProvider'
import ResponsiveImage from './ResponsiveImage'

/**
 * GameCard component for displaying a game in the games list
 * Enhanced with glass morphism effect
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
  
  // Mock stats data for demo
  const stats = [
    { value: '2.4K', label: 'Players' },
    { value: '4.8', label: 'Rating' },
    { value: '10+', label: 'Levels' }
  ];
  
  return (
    <a href={link} className="block no-underline">
      <div className="game-card glass-morphism cursor-pointer transform transition-transform hover:translate-y-[-4px]">
        {/* Decorative elements for glassmorphism effect */}
        <div className="decorative-element decorative-element-1"></div>
        <div className="decorative-element decorative-element-2"></div>
        
        <div className="game-card-content">
          <div className="game-image-container">
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
            <h2 className="game-title">{title}</h2>
            <p className="game-description">{description}</p>
            
            {/* Stats section to utilize empty space */}
            <div className="game-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            
            <span className="play-button">
              Play Now
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default GameCard