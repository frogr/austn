import { FC } from 'react';
import GameCard from './GameCard';

export interface Game {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
}

interface GamesGridProps {
  games: Game[];
}

const GamesGrid: FC<GamesGridProps> = ({ games }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {games.map((game, index) => (
        <GameCard
          key={index}
          title={game.title}
          description={game.description}
          imageUrl={game.imageUrl}
          link={game.link}
        />
      ))}
      {games.length === 0 && (
        <div className="col-span-full text-center p-12">
          <p className="text-gray-500">No games available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default GamesGrid;