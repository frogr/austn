import { FC } from 'react';

interface GameCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
}

const GameCard: FC<GameCardProps> = ({ title, description, imageUrl, link }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-white/20 transition-transform hover:scale-105">
      <div className="relative pb-[56.25%]">
        <img 
          src={imageUrl || "/placeholder.svg"} 
          alt={title} 
          className="absolute h-full w-full object-cover" 
        />
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 text-retro-purple">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <a 
          href={link} 
          className="inline-block bg-retro-purple hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-full shadow-md transition-colors"
        >
          Play Now
        </a>
      </div>
    </div>
  );
};

export default GameCard;