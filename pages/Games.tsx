import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GamesGrid from '../components/GamesGrid';
import type { Game } from '../components/GamesGrid';

// Simple Memory Game
const MemoryGame = () => {
  const [cards, setCards] = useState<Array<{id: number, value: number, flipped: boolean, matched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  
  const initializeGame = () => {
    // Create pairs of cards (8 pairs = 16 cards)
    const cardValues = Array.from({ length: 8 }, (_, i) => i + 1);
    const cardPairs = [...cardValues, ...cardValues];
    
    // Shuffle the cards
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
  };
  
  useEffect(() => {
    initializeGame();
  }, []);
  
  useEffect(() => {
    // Check if two cards are flipped
    if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);
      
      setMoves(moves + 1);
      
      // Check if the cards match
      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Mark cards as matched
        const updatedCards = cards.map(card => 
          card.id === firstCardId || card.id === secondCardId 
            ? { ...card, matched: true } 
            : card
        );
        setCards(updatedCards);
        setMatchedPairs(matchedPairs + 1);
        setFlippedCards([]);
        
        // Check if game is complete
        if (matchedPairs + 1 === 8) {
          setGameComplete(true);
        }
      } else {
        // Flip cards back after a short delay
        setTimeout(() => {
          const updatedCards = cards.map(card => 
            card.id === firstCardId || card.id === secondCardId 
              ? { ...card, flipped: false } 
              : card
          );
          setCards(updatedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, matchedPairs, moves]);
  
  const handleCardClick = (cardId: number) => {
    // Prevent clicking if two cards are already flipped or the card is already matched/flipped
    if (flippedCards.length === 2) return;
    
    const clickedCard = cards.find(card => card.id === cardId);
    if (clickedCard?.matched || clickedCard?.flipped) return;
    
    // Flip the card
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, flipped: true } : card
    );
    
    setCards(updatedCards);
    setFlippedCards([...flippedCards, cardId]);
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-retro-purple">Memory Game</h3>
        <div className="flex space-x-4">
          <span className="px-3 py-1 bg-retro-cream rounded-full text-sm">Moves: {moves}</span>
          <span className="px-3 py-1 bg-retro-cream rounded-full text-sm">Pairs: {matchedPairs}/8</span>
        </div>
      </div>
      
      {gameComplete ? (
        <div className="text-center p-8">
          <h3 className="text-2xl font-bold mb-4 text-retro-purple">Congratulations!</h3>
          <p className="mb-6">You completed the game in {moves} moves.</p>
          <button 
            onClick={initializeGame}
            className="px-6 py-2 bg-retro-purple text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition-colors"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {cards.map(card => (
            <div 
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 ${
                card.flipped || card.matched 
                  ? 'bg-retro-purple text-white rotate-y-180' 
                  : 'bg-retro-cream hover:bg-retro-cream/80'
              } ${card.matched ? 'opacity-70' : 'opacity-100'}`}
            >
              {(card.flipped || card.matched) && (
                <span className="text-lg font-bold">{card.value}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Type for API response
interface GamePost {
  id: number;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  link: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const Games = () => {
  const [gameProjects, setGameProjects] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/game_posts.json');
        
        if (!response.ok) {
          throw new Error(`Error fetching games: ${response.statusText}`);
        }
        
        const data: GamePost[] = await response.json();
        
        // Transform the API data to match our Game interface
        const formattedGames: Game[] = data.map(game => ({
          title: game.title,
          description: game.description,
          imageUrl: game.image_url,
          link: game.link
        }));
        
        setGameProjects(formattedGames);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError('Failed to load games. Please try again later.');
        setLoading(false);
        
        // Fallback data in case API fails
        setGameProjects([
          {
            title: "Arena Shooter",
            description: "Fast-paced 2D arena shooter with enemies, power-ups, and high scores.",
            imageUrl: "/assets/images/games/arena-shooter.jpg",
            link: "/portfolio/arena_shooter",
          },
          {
            title: "Platformer",
            description: "Classic side-scrolling platformer with collectibles and obstacles.",
            imageUrl: "/assets/images/games/platformer.jpg",
            link: "#",
          }
        ]);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 lg:px-24 pb-12 animate-page-transition">
      <Link to="/" className="inline-flex items-center text-sm mb-8 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow hover:shadow-md transition-all">
        <ChevronLeft size={16} />
        <span className="ml-1">Back to Home</span>
      </Link>
      
      <div className="mb-12 text-center">
        <h1 className="font-pixel text-3xl mb-4 text-retro-purple">Games</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Check out my game development projects and have some fun with mini-games
        </p>
      </div>
      
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-retro-purple">Game Projects</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="inline-block w-12 h-12 border-4 border-retro-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <GamesGrid games={gameProjects} />
        )}
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6 text-retro-purple">Mini Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MemoryGame />
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/20">
            <h3 className="text-xl font-bold mb-6 text-retro-purple">More Games Coming Soon!</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block mb-4 w-16 h-16 border-4 border-retro-purple border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Stay tuned for additional mini-games...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Games;