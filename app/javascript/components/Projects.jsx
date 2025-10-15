import React, { useState } from 'react';
import { useTheme } from './Theme';

const Projects = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'Pages AI Assistant',
      category: 'ai',
      description: 'Natural language document generation that grew adoption 4% → 11%',
      technologies: ['OpenAI', 'Rails', 'PDF Processing', 'React'],
      link: '/projects/pages-ai',
      featured: true,
      gradient: 'var(--gradient-accent)',
      details: {
        fullDescription: 'Architected and shipped AI-powered document generation at CompanyCam, integrating OpenAI with Rails for natural language processing. Optimized PDF infrastructure achieving 10x size reduction.',
        highlights: [
          'Grew feature adoption from 4% to 11% of companies',
          '10x PDF size optimization',
          'Thousands of daily document exports',
          'Natural language UI that users actually understand'
        ]
      }
    },
    {
      id: 2,
      title: 'Boys & Girls Club Platform',
      category: 'web',
      description: '$2MM+ donation processing system for national fundraiser',
      technologies: ['Node.js', 'Express', 'Stripe', 'Heroku'],
      link: '/projects/bgca',
      featured: true,
      gradient: 'var(--gradient-vibrant)',
      details: {
        fullDescription: 'Subcontracted to build critical donation infrastructure for BGCA 2021 fundraiser. Handled payment processing, receipts, and real-time tracking for a high-stakes live event.',
        highlights: [
          'Processed over $2 million in donations',
          'Zero downtime during live fundraiser',
          'Stripe integration with custom receipt generation',
          'Built under tight deadline, delivered on time'
        ]
      }
    },
    {
      id: 3,
      title: 'Hub - Rails Starter Kit',
      category: 'web',
      description: 'My opinionated alternative to Jumpstart Pro',
      technologies: ['Rails 7', 'React', 'Stripe', 'Docker', 'Hotwire'],
      link: '/projects/hub',
      featured: true,
      gradient: 'var(--gradient-cool)',
      details: {
        fullDescription: 'Built with Claude as my pair programmer. A production-ready Rails boilerplate with my preferred patterns, because sometimes you need to build things your way.',
        highlights: [
          'Authentication, payments, and multi-tenancy out of the box',
          'My personal Rails patterns baked in',
          'Docker-ready with one command deploy',
          'Built 10x faster using AI pair programming'
        ]
      }
    },
    {
      id: 5,
      title: 'AI Experiments Lab',
      category: 'ai',
      description: '20+ projects built with Claude: TodayIn3Minutes, gitRAG, and more',
      technologies: ['Claude AI', 'OpenAI', 'Python', 'RAG Systems'],
      link: '/projects/ai-lab',
      featured: false,
      gradient: 'linear-gradient(135deg, var(--pink-accent) 0%, var(--purple-accent) 100%)',
      details: {
        fullDescription: 'My personal laboratory for AI-powered development. Building everything from CLI tools to automation scripts, documenting the journey on YouTube.',
        highlights: [
          'TodayIn3Minutes - AI news summarizer',
          'gitRAG - Repository knowledge system',
          'Overcommunicator - Because context matters',
          'YouTube channel documenting the process'
        ]
      }
    },
    {
      id: 6,
      title: 'Backlit Platform Suite',
      category: 'web',
      description: 'Rails apps for Super Bowl, Oscars, and Grammys production',
      technologies: ['Rails', 'Twilio', 'Multi-tenancy', 'SMS'],
      link: '/projects/backlit',
      featured: false,
      gradient: 'linear-gradient(135deg, var(--indigo-accent) 0%, var(--teal-accent) 100%)',
      details: {
        fullDescription: 'Long-term contractor building Rails applications for major television events. Built COVID-compliant coordination system for 200+ Oscar nominees.',
        highlights: [
          'SMS system coordinating 200+ people at Dolby Theatre',
          'Multi-tenant platform for entertainment industry',
          'Supported Super Bowl, Oscars, Grammys broadcasts',
          'Real-time event coordination tools'
        ]
      }
    },
    {
      id: 7,
      title: 'curl.lol',
      category: 'experiment',
      description: 'URL shortener with analytics - because why not?',
      technologies: ['Rails', 'Redis', 'PostgreSQL'],
      link: '/projects/curl-lol',
      externalLink: 'https://curl.lol',
      featured: false,
      gradient: 'var(--gradient-primary)'
    },
    {
      id: 8,
      title: 'Minecraft Build Planner',
      category: 'game',
      description: 'Three.js tool for planning builds - built with Claude',
      technologies: ['Three.js', 'JavaScript', 'Claude AI'],
      link: '/projects/minecraft-planner',
      featured: false,
      gradient: 'linear-gradient(135deg, var(--green-accent) 0%, var(--blue-accent) 100%)'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'web', label: 'Web Apps' },
    { value: 'game', label: 'Games' },
    { value: 'ai', label: 'AI/ML' },
    { value: 'experiment', label: 'Experiments' }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const isDark = theme === 'dark';
  
  return (
    <div className="min-h-screen pt-12 pb-6 relative overflow-hidden" 
         style={{ background: 'transparent' }}>
      {/* Background mesh disabled to avoid top band */}
      <div className="absolute inset-0 opacity-0" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 readable-content">
        {/* Header with simple solid text */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-black mb-3"
              style={{ 
                fontSize: 'clamp(3rem, 6vw, 4rem)',
                color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
                letterSpacing: '-0.03em'
              }}>
            Projects
          </h1>
          <p className="font-medium max-w-2xl mx-auto px-4" 
             style={{ 
               fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
               color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
               letterSpacing: '-0.01em'
             }}>
            Significant work shipped
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
                ? { backgroundColor: 'var(--accent-color)', boxShadow: 'var(--shadow-glow)', color: '#000' }
                : { color: 'var(--text-primary)' }}
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
              className="group cursor-pointer rounded-2xl p-6 transition-all hover:scale-[1.02]"
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
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                backdropFilter: 'saturate(200%) blur(20px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Decorative overlays removed for simpler look */}

              <div className="flex flex-col h-full relative z-10">
                {/* Emoji icon removed */}

                {/* Project Info */}
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2"
                    style={{ color: 'var(--text-primary)' }}>
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

        {/* Call to Action with solid accent */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="glass-thick rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 max-w-2xl mx-auto relative overflow-hidden">
            {/* Background effect removed */}
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3"
                  style={{ color: 'var(--text-primary)' }}>
                Have a project in mind?
              </h2>
              <p className="mb-4 sm:mb-6 text-sm sm:text-base px-4" style={{ color: 'var(--text-secondary)' }}>
                I love working with teams that care about craft and humans in equal measure.
              </p>
              <a href="/#contact" className="inline-flex items-center gap-2 transform hover:scale-105 transition-all text-sm sm:text-base px-6 py-3 rounded-lg font-medium"
                 style={{ backgroundColor: 'var(--accent-color)', color: '#000' }}>
                <span className="material-icons text-base">send</span>
                <span>Get in Touch</span>
              </a>
            </div>
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
