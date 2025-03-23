
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Work = () => {
  const projects = [
    {
      id: 1,
      title: "E-commerce Redesign",
      description: "A complete overhaul of an online store with improved UX and conversion rates.",
      tags: ["React", "Node.js", "Tailwind CSS"],
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
    },
    {
      id: 2,
      title: "Health App Dashboard",
      description: "An intuitive dashboard for a health tracking application with data visualization.",
      tags: ["Vue.js", "D3.js", "Firebase"],
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
    },
    {
      id: 3,
      title: "Financial Analytics Platform",
      description: "A comprehensive platform for financial data analysis and reporting.",
      tags: ["TypeScript", "React", "MongoDB"],
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
    },
    {
      id: 4,
      title: "Travel Blog",
      description: "A responsive travel blog with dynamic content and interactive maps.",
      tags: ["WordPress", "PHP", "JavaScript"],
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7"
    }
  ];

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 lg:px-24 pb-12 animate-page-transition">
      <Link to="/" className="inline-flex items-center text-sm mb-8 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow hover:shadow-md transition-all">
        <ChevronLeft size={16} />
        <span className="ml-1">Back to Home</span>
      </Link>
      
      <div className="mb-12 text-center">
        <h1 className="font-pixel text-3xl mb-4 text-retro-purple">My Work</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          A selection of my projects and collaborations
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-white/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2 group-hover:text-retro-purple transition-colors">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
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
        ))}
      </div>
    </div>
  );
};

export default Work;
