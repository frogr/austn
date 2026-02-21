import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

const Projects = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('all');

  const projects = [
    {
      id: 10,
      title: 'Austn.net AI Tools Suite',
      category: 'ai',
      description: '7+ AI tools running on local GPU infrastructure — image generation, TTS, background removal, stem separation, 3D modeling, chat, and more',
      technologies: ['Rails', 'Python', 'ComfyUI', 'LMStudio', 'React', 'Sidekiq'],
      link: '/projects/ai-tools',
      featured: true,
      gradient: 'var(--gradient-accent)',
      details: {
        fullDescription: 'Self-hosted AI platform running on personal GPU infrastructure. Integrates ComfyUI for image generation, Chatterbox for voice cloning/TTS, Hunyuan3D for 3D model generation, and local LLMs via LMStudio. All tools are free to use and demonstrate real-world local LLM deployment.',
        highlights: [
          '7+ AI tools accessible from a single platform',
          'Self-hosted on personal GPU — no API costs',
          'Local LLMs that actually work in production',
          'Free and open for anyone to try'
        ]
      }
    },
    {
      id: 1,
      title: 'Pages AI Assistant',
      category: 'ai',
      description: 'Natural language document generation that grew adoption 4% → 11%',
      technologies: ['OpenAI', 'Rails', 'React', 'TypeScript'],
      link: '/projects/pages-ai',
      featured: true,
      gradient: 'var(--gradient-accent)',
      details: {
        fullDescription: 'Architected and shipped AI-powered document generation at CompanyCam, integrating OpenAI with Rails for natural language processing.',
        highlights: [
          'Grew feature adoption from 4% to 11% of companies',
          'Thousands of daily document exports',
          'Natural language UI that users actually understand'
        ]
      }
    },
    {
      id: 11,
      title: 'CompanyCam',
      category: 'web',
      description: 'Backend engineering for the #1 photo documentation app in construction (140,000+ users)',
      technologies: ['Rails', 'PostgreSQL', 'GraphQL', 'Sidekiq', 'AWS', 'React'],
      link: '/projects/companycam',
      featured: true,
      gradient: 'var(--gradient-vibrant)',
      details: {
        fullDescription: 'Backend engineer at CompanyCam, the industry-leading photo documentation platform for construction with 140,000+ users. Built AI features, optimized critical infrastructure, and mentored developers.',
        highlights: [
          'Built Pages AI Assistant (3,000+ daily generations)',
          'Optimized PDF exports with 10x size reduction',
          'Architected Share Link feature for all user-generated assets',
          'Mentored 3 developers on Rails best practices'
        ]
      }
    },
    {
      id: 12,
      title: 'CoverMyMeds',
      category: 'web',
      description: '$10M+ ARR launched across 9 pharmaceutical brands, tech lead for major launches',
      technologies: ['Rails', 'Hotwire', 'Stimulus', 'PostgreSQL', 'Kafka'],
      link: '/projects/covermymeds',
      featured: true,
      gradient: 'var(--gradient-cool)',
      details: {
        fullDescription: 'Software engineer at CoverMyMeds, the industry standard for electronic prior authorization connected to 950,000+ providers and 50,000+ pharmacies. Led launches for major pharmaceutical brands.',
        highlights: [
          'Generated $10M+ ARR launching 9 pharma brands',
          'Tech lead for Spravato, Renflexis, and Ontruzant launches',
          'Built Configuration Station for automated brand launches',
          'Created VEST Framework for technical debt tracking'
        ]
      }
    },
    {
      id: 7,
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
      id: 2,
      title: 'Boys & Girls Club Platform',
      category: 'web',
      description: '$2MM+ donation processing system for national fundraiser',
      technologies: ['Node.js', 'Express', 'Stripe', 'Heroku'],
      link: '/projects/bgca',
      featured: true,
      gradient: 'var(--gradient-vibrant)',
      details: {
        fullDescription: 'Subcontracted to build critical donation infrastructure for BGCA 2021 fundraiser. Handled payment processing at massive scale for a great cause',
        highlights: [
          'Processed over $2 million in donations',
          'Stripe integration',
          'Built under tight deadline, delivered ahead of time'
        ]
      }
    },
    {
      id: 3,
      title: 'TinyRails',
      category: 'experiment',
      description: 'Rebuilt Rails from scratch to learn how web frameworks actually work',
      technologies: ['Ruby', 'Rack', 'JSON', 'Web Frameworks'],
      link: '/projects/tinyrails',
      featured: true,
      gradient: 'var(--gradient-cool)',
      details: {
        fullDescription: 'Reconstructed Rails core functionality from scratch using Ruby. Educational project to demystify web framework internals by implementing routing, controllers, and data persistence.',
        highlights: [
          'Custom routing system mapping URLs to controllers',
          'Rack integration for web server communication',
          'File-based JSON database with basic CRUD operations',
          'Working demo app (best_tweets) proving it functions'
        ]
      }
    },
    {
      id: 4,
      title: 'Hub - Rails Starter Kit',
      category: 'web',
      description: 'My opinionated alternative to Jumpstart Pro',
      technologies: ['Rails 7', 'React', 'Stripe', 'Docker', 'Hotwire'],
      link: '/projects/hub',
      featured: true,
      gradient: 'var(--gradient-cool)',
      details: {
        fullDescription: 'Built with Claude as my pair programmer. A production-ready Rails boilerplate with my preferred patterns',
        highlights: [
          'Authentication, payments, and multi-tenancy out of the box',
          'My personal Rails patterns baked in',
          'Docker-ready with one command deploy',
          'Built 10x faster using AI pair programming'
        ]
      }
    },
    {
      id: 13,
      title: 'T2 Modus',
      category: 'web',
      description: 'Data pipeline automation processing 25K daily customers, cut runtime from 6 hours to 45 minutes',
      technologies: ['Rails', 'PostgreSQL', 'Data Pipelines'],
      link: '/projects/t2modus',
      featured: false,
      gradient: 'var(--gradient-primary)',
      details: {
        fullDescription: 'Software engineer at T2 Modus building identity verification and compliance tools for auto dealerships. Dramatically improved data processing efficiency.',
        highlights: [
          'Automated data pipeline processing 25K daily customers',
          'Reduced job runtime from 6 hours to 45 minutes',
          'Cut onboarding time from 3 weeks to 1 week'
        ]
      }
    },
    {
      id: 6,
      title: 'AI Experiments Lab',
      category: 'ai',
      description: '20+ projects: gaming apps, web platforms, developer tools, games, and hardware',
      technologies: ['Claude AI', 'React', 'Rails', 'Python', 'Arduino', 'Godot'],
      link: '/projects/ai-lab',
      featured: false,
      gradient: 'linear-gradient(135deg, var(--pink-accent) 0%, var(--purple-accent) 100%)',
      details: {
        fullDescription: 'Comprehensive collection spanning gaming apps (Dota 2 Tracker, League of Matchups), web platforms (ECHOROOMS, TodayIn3Minutes), developer tools (austncoder, GitRAG), games (Frogger, Chess, Godot), hardware (Arduino, PiHole), and AI/ML experiments.',
        highlights: [
          'Gaming apps with OpenDota API and U.GG scraping',
          'Subscription platforms and productivity tools with OAuth',
          'Local LLM agents and RAG-based git query tools',
          'Games built in React and Godot (2D/3D prototypes)',
          'Arduino LED projects and network ad blocking',
          'AI image generation with ComfyUI and Stable Diffusion'
        ]
      }
    },
    {
      id: 8,
      title: 'curl.lol',
      category: 'experiment',
      description: 'URL shortener with event-based analytics',
      technologies: ['Rails', 'Redis', 'PostgreSQL'],
      link: '/projects/curl-lol',
      externalLink: 'https://github.com/frogr/url_shortener',
      featured: false,
      gradient: 'var(--gradient-primary)'
    },
    {
      id: 9,
      title: 'Minecraft Build Planner',
      category: 'game',
      description: 'Three.js tool for planning builds',
      technologies: ['Three.js', 'JavaScript'],
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
      <div className="absolute inset-0 opacity-0" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 readable-content">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="font-black mb-3"
              style={{ 
                fontSize: 'clamp(3rem, 6vw, 4rem)',
                color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
                letterSpacing: '-0.03em'
              }}>
            Projects
          </h1>
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
              <div className="flex flex-col h-full relative z-10">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                  {project.title}
                </h3>
                
                <p className="text-xs sm:text-sm mb-2 flex-grow transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>

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

        <div className="mt-6 sm:mt-8 text-center">
          <div className="glass-thick rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 max-w-2xl mx-auto relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3"
                  style={{ color: 'var(--text-primary)' }}>
                Have a project in mind?
              </h2>
              <p className="mb-4 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                Book a time to chat or send me an email directly.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="/book" className="inline-flex items-center gap-2 transform hover:scale-105 transition-all text-sm sm:text-base px-6 py-3 rounded-lg font-medium"
                   style={{ backgroundColor: 'var(--accent-color)', color: '#000' }}>
                  <span className="material-icons text-base">calendar_today</span>
                  <span>Book a Meeting</span>
                </a>
                <a href="mailto:hi@austn.net" className="inline-flex items-center gap-2 transform hover:scale-105 transition-all text-sm sm:text-base px-6 py-3 rounded-lg font-medium"
                   style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                  <span className="material-icons text-base">email</span>
                  <span>hi@austn.net</span>
                </a>
              </div>
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
