import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WorkGrid from '../components/WorkGrid';
import { WorkCardProps } from '../components/WorkCard';

// Type for API response
interface WorkPost {
  id: number;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const Work = () => {
  const [projects, setProjects] = useState<WorkCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/work_posts.json');
        
        if (!response.ok) {
          throw new Error(`Error fetching work posts: ${response.statusText}`);
        }
        
        const data: WorkPost[] = await response.json();
        
        // Transform the API data to match our WorkCardProps interface
        const formattedProjects: WorkCardProps[] = data.map((post, index) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          tags: post.tags,
          image: post.image_url
        }));
        
        setProjects(formattedProjects);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch work posts:', err);
        setError('Failed to load work projects. Please try again later.');
        setLoading(false);
        
        // Fallback data in case API fails
        setProjects([
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
          }
        ]);
      }
    };

    fetchWorkPosts();
  }, []);

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
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="inline-block w-12 h-12 border-4 border-retro-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <WorkGrid projects={projects} />
      )}
    </div>
  );
};

export default Work;