import React from 'react'

/**
 * GameCard component for displaying a game in the games list
 */
const GameCard = ({ title, description, imageUrl, link }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <div className="relative pb-[56.25%]">
        <img 
          src={imageUrl || "https://via.placeholder.com/640x360?text=Game+Preview"} 
          alt={title} 
          className="absolute h-full w-full object-cover" 
        />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400 mb-4">{description}</p>
        <a 
          href={link} 
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors"
        >
          Play Now
        </a>
      </div>
    </div>
  )
}

export default GameCard