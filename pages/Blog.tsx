
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Evolution of Web Design",
      excerpt: "From table layouts to flexbox and grid, web design has come a long way...",
      date: "May 15, 2023",
      category: "Design"
    },
    {
      id: 2,
      title: "Optimizing React Applications",
      excerpt: "Performance tips and tricks for your React projects that will boost speed...",
      date: "April 3, 2023",
      category: "Development"
    },
    {
      id: 3,
      title: "The Power of Animation in UX",
      excerpt: "How subtle animations can drastically improve user experience...",
      date: "March 22, 2023",
      category: "Design"
    },
    {
      id: 4,
      title: "Building with Tailwind CSS",
      excerpt: "My journey with utility-first CSS and how it changed my workflow...",
      date: "February 14, 2023",
      category: "Development"
    }
  ];

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 lg:px-24 pb-12 animate-page-transition">
      <Link to="/" className="inline-flex items-center text-sm mb-8 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow hover:shadow-md transition-all">
        <ChevronLeft size={16} />
        <span className="ml-1">Back to Home</span>
      </Link>
      
      <div className="mb-12 text-center">
        <h1 className="font-pixel text-3xl mb-4 text-retro-purple">Blog</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Thoughts, stories and ideas about web development and design
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post) => (
          <article 
            key={post.id} 
            className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-white/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-retro-cream text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                  {post.category}
                </span>
                <span className="text-gray-500 text-sm">{post.date}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-retro-purple">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex justify-end">
                <button className="text-retro-purple font-medium text-sm flex items-center gap-1 hover:underline">
                  Read more
                </button>
              </div>
            </div>
            <div className="h-1 w-full bg-retro-gradient"></div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
