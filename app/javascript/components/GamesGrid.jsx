import React from 'react'
import GameCard from './GameCard'

/**
 * GamesGrid component for displaying a grid of games
 * Receives props directly from the application.js parser
 */
const GamesGrid = ({ games = [] }) => {
  // Using destructured props with default empty array
  return (
    <div className="flex flex-wrap justify-center gap-8">
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