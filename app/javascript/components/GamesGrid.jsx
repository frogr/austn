import React from 'react'
import GameCard from './GameCard'

/**
 * GamesGrid component for displaying a grid of games
 * Receives props directly from the application.js parser
 */
const GamesGrid = ({ games = [] }) => {
  // Using destructured props with default empty array
  console.log('GamesGrid rendering with games:', games);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {games.map((game, index) => (
        <GameCard
          key={index}
          title={game.title}
          description={game.description}
          imageUrl={game.imageUrl}
          link={game.link}
        />
      ))}
    </div>
  )
}

export default GamesGrid