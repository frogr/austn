import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

const Projects = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'This Portfolio',
      category: 'web',
      description: 'React + Rails website showcasing my work and projects',
      technologies: ['React', 'Ruby on Rails', 'Tailwind CSS', 'JavaScript'],
      link: '/projects/portfolio',
      featured: true,
      image: '🌐',
      gradient: 'var(--gradient-accent)',
      details: {
        fullDescription: 'A modern portfolio website built with React and Rails, featuring a responsive design, dark mode support, and interactive project showcases.',
        highlights: [
          'Server-side rendering with React on Rails',
          'Glass morphism design with custom CSS',
          'Dark/light theme support',
          'Responsive bento grid layout'
        ]
      }
    },
    {
      id: 2,
      title: 'curl.lol',
      category: 'web',
      description: 'URL shortener service with analytics and custom domains',
      technologies: ['Ruby on Rails', 'PostgreSQL', 'Redis', 'JavaScript'],
      link: '/projects/curl-lol',
      externalLink: 'https://curl.lol',
      featured: true,
      image: '🔗',
      gradient: 'var(--gradient-vibrant)',
      details: {
        fullDescription: 'A fast and reliable URL shortener service with real-time analytics, custom domain support, and API access for developers.',
        highlights: [
          'High-performance URL redirection',
          'Real-time click analytics',
          'Custom domain support',
          'RESTful API for developers'
        ]
      }
    },
    {
      id: 3,
      title: 'Hub',
      category: 'web',
      description: 'SaaS for selling boilerplate React/Rails necessities',
      technologies: ['React', 'Rails', 'Stripe', 'Docker', 'PostgreSQL'],
      link: '/projects/hub',
      featured: true,
      image: '🚀',
      gradient: 'var(--gradient-cool)',
      details: {
        fullDescription: 'A SaaS platform that helps developers get a jumpstart on their projects by providing production-ready React/Rails boilerplate code with authentication, payments, and more.',
        highlights: [
          'Production-ready boilerplate code',
          'Integrated Stripe payments',
          'User authentication system',
          'Docker containerization',
          'CI/CD pipeline templates'
        ]
      }
    },
    {
      id: 4,
      title: 'Arena Shooter',
      category: 'game',
      description: 'Fast-paced 3D browser game with multiplayer support',
      technologies: ['Three.js', 'JavaScript', 'WebGL', 'WebSockets'],
      link: '/games/arena-shooter',
      featured: false,
      image: '🎮',
      gradient: 'var(--gradient-primary)',
      details: {
        fullDescription: 'A browser-based 3D arena shooter game built with Three.js, featuring smooth gameplay and multiplayer capabilities.',
        highlights: [
          'Real-time multiplayer gameplay',
          '3D graphics with Three.js',
          'Custom physics engine',
          'Responsive controls'
        ]
      }
    },
    {
      id: 5,
      title: 'Boys & Girls Club Donation Platform',
      category: 'web',
      description: 'Donation system handling $2MM+ in transactions',
      technologies: ['Node.js', 'Express', 'Stripe', 'Heroku'],
      link: '/projects/bgca',
      featured: false,
      image: '💝',
      gradient: 'linear-gradient(135deg, var(--pink-accent) 0%, var(--purple-accent) 100%)',
      details: {
        fullDescription: 'Built the complete donation infrastructure for the Boys and Girls Club of America 2021 fundraiser, processing over $2 million in donations.',
        highlights: [
          'Secure payment processing with Stripe',
          'High-availability architecture',
          'Real-time donation tracking',
          'Custom receipt generation'
        ]
      }
    },
    {
      id: 6,
      title: 'Car Search Aggregator',
      category: 'web',
      description: 'Search eBay and Craigslist listings simultaneously',
      technologies: ['Node.js', 'React', 'Express', 'APIs'],
      link: '/projects/car-search',
      featured: false,
      image: '🚗',
      gradient: 'linear-gradient(135deg, var(--indigo-accent) 0%, var(--teal-accent) 100%)',
      details: {
        fullDescription: 'A web application that aggregates car listings from eBay and Craigslist, allowing users to search both platforms within a specified radius.',
        highlights: [
          'Integrated eBay and Craigslist APIs',
          'Location-based search',
          'Real-time data aggregation',
          'Responsive React frontend'
        ]
      }
    },
    {
      id: 7,
      title: 'Movement Demo',
      category: 'experiment',
      description: 'Smooth character movement system for web games',
      technologies: ['JavaScript', 'Canvas API'],
      link: '/movement-demo',
      featured: false,
      image: '🏃',
      gradient: 'var(--gradient-primary)'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'web', label: 'Web Apps' },
    { value: 'game', label: 'Games' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'ai', label: 'AI/ML' },
    { value: 'experiment', label: 'Experiments' }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pt-12 pb-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with gradient text */}
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2 bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-accent)' }}>
            Projects
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--text-secondary)' }}>
            A collection of my work spanning web applications, games, and experiments
          </p>
        </div>

        {/* Filter Pills with gradient active state */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 md:mb-6 px-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`
                px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 font-medium text-xs sm:text-sm
                ${filter === cat.value
                  ? 'text-white shadow-lg transform scale-105'
                  : 'glass hover:bg-glass-thick hover:scale-105'
                }
              `}
              style={filter === cat.value
                ? { 
                    background: 'var(--gradient-accent)',
                    boxShadow: 'var(--shadow-glow)'
                  }
                : { color: 'var(--text-primary)' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid with animated cards */}
        <div className="bento-grid-projects">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="bento-box"
              onClick={() => {
                if (project.link) {
                  if (window.Turbo) {
                    window.Turbo.visit(project.link);
                  } else {
                    window.location.href = project.link;
                  }
                }
              }}
              style={{
                animationDelay: `${index * 100}ms`,
                background: theme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)'
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-[1.5rem]"
                   style={{ background: project.gradient }}></div>

              {/* Floating gradient orb */}
              <div className="absolute -top-4 -right-4 w-20 h-20 opacity-20 group-hover:opacity-30 transition-opacity"
                   style={{ 
                     background: project.gradient, 
                     filter: 'blur(40px)',
                     animation: 'pulse 4s infinite'
                   }}></div>

              <div className="flex flex-col h-full relative z-10">
                {/* Project Icon with animation */}
                <div className="text-2xl sm:text-3xl mb-2 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {project.image}
                </div>

                {/* Project Info */}
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 bg-clip-text text-transparent group-hover:text-transparent transition-all"
                    style={{ 
                      color: 'var(--text-primary)',
                      backgroundImage: project.gradient 
                    }}>
                  {project.title}
                </h3>
                
                <p className="text-xs sm:text-sm mb-2 flex-grow transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>

                {/* Technologies with glass effect */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {project.technologies.map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs rounded-full glass-thick transform group-hover:scale-105 transition-transform"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Link indicator with gradient */}
                {project.link && (
                  <div className="flex items-center text-xs sm:text-sm font-medium gap-1 group-hover:gap-2 transition-all mt-auto pt-2"
                       style={{ color: 'var(--accent-color)' }}>
                    <span>View Project</span>
                    <span className="material-icons text-base transform group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action with gradient background */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="glass-thick rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 max-w-2xl mx-auto relative overflow-hidden">
            {/* Animated gradient mesh background */}
            <div className="absolute inset-0 opacity-30"
                 style={{ background: 'var(--gradient-mesh)' }}></div>
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'var(--gradient-accent)' }}>
                Have a project in mind?
              </h2>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base px-4" style={{ color: 'var(--text-secondary)' }}>
                I'm always interested in hearing about new opportunities and challenges.
              </p>
              <a href="/#contact" className="btn btn-gradient-vibrant transform hover:scale-105 transition-all text-xs sm:text-sm">
                <span className="material-icons text-lg sm:text-base">send</span>
                Get in Touch
              </a>
            </div>

            {/* Floating decorations */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full"
                 style={{ 
                   background: 'var(--gradient-cool)', 
                   opacity: 0.2,
                   filter: 'blur(40px)'
                 }}></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full"
                 style={{ 
                   background: 'var(--gradient-vibrant)', 
                   opacity: 0.2,
                   filter: 'blur(40px)'
                 }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Projects;