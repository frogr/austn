import { FC } from 'react';

export interface WorkCardProps {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
}

const WorkCard: FC<WorkCardProps> = ({ title, description, tags, image }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-white/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 group-hover:text-retro-purple transition-colors">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="bg-retro-cream text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-end">
          <button className="text-retro-purple font-medium text-sm flex items-center gap-1 hover:underline">
            View project details
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkCard;