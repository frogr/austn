import React from 'react';
import { useTheme } from './ThemeContext';

const BentoHome = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30 overflow-hidden">
        <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-10 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bento-container bento-grid-home pt-6 md:pt-10 lg:pt-16 relative z-10" style={{ gridAutoFlow: 'dense' }}>
        {/* Hero Section */}
        <div className="bento-box bento-hero bento-gradient-1 flex flex-col justify-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient-accent)' }}>
              Hi, I'm Austn
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4" style={{ color: 'var(--text-secondary)' }}>
              Full-Stack Engineer crafting beautiful digital experiences
            </p>
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              <a href="/projects" className="btn btn-primary text-sm sm:text-base">
                <span className="material-icons text-lg sm:text-base">folder</span>
                <span className="hidden sm:inline">View Projects</span>
                <span className="sm:hidden">Projects</span>
              </a>
              <a href="#contact" className="btn btn-secondary text-sm sm:text-base">
                <span className="material-icons text-lg sm:text-base">mail</span>
                <span className="hidden sm:inline">Contact Me</span>
                <span className="sm:hidden">Contact</span>
              </a>
            </div>
          </div>
          
          {/* Floating decoration - hidden on mobile */}
          <div className="hidden md:block absolute -top-10 -right-10 w-40 h-40 opacity-20"
               style={{ background: 'var(--gradient-cool)', filter: 'blur(40px)' }}></div>
        </div>

        {/* Skills Section - Medium Bento with gradient */}
        <div className="bento-box bento-medium bento-gradient-2 flex flex-col h-full">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
            Core Skills
          </h3>
          <div className="space-y-1 md:space-y-1.5 flex-1">
            <div className="glass-thick rounded-lg p-1.5 md:p-2 transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1.5 text-xs md:text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                Frontend
              </h4>
              <p className="text-xs pl-3 mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>
                React, Vue, TypeScript, Tailwind
              </p>
            </div>
            <div className="glass-thick rounded-lg p-1.5 md:p-2 transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1.5 text-xs md:text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--purple-accent)' }}></span>
                Backend
              </h4>
              <p className="text-xs pl-3 mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>
                Ruby on Rails, Node.js, PostgreSQL
              </p>
            </div>
            <div className="glass-thick rounded-lg p-1.5 md:p-2 transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1.5 text-xs md:text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--teal-accent)' }}></span>
                Cloud & DevOps
              </h4>
              <p className="text-xs pl-3 mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>
                AWS, Docker, CI/CD, Kubernetes
              </p>
            </div>
          </div>
        </div>

        {/* Recent Work - Large Bento */}
        <div className="bento-box bento-large">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Recent Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="apple-card group p-2 sm:p-2.5 md:p-3">
              <div className="hidden lg:block absolute top-0 right-0 w-16 h-16 opacity-10"
                   style={{ background: 'var(--gradient-accent)', filter: 'blur(20px)' }}></div>
              <h4 className="text-sm font-semibold mb-1">Enterprise SaaS Platform</h4>
              <p className="text-xs mb-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Led development of a multi-tenant platform serving 10,000+ users
              </p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                React • Rails • AWS
              </span>
            </div>
            <div className="apple-card group p-2 sm:p-2.5 md:p-3">
              <div className="hidden lg:block absolute top-0 right-0 w-16 h-16 opacity-10"
                   style={{ background: 'var(--gradient-cool)', filter: 'blur(20px)' }}></div>
              <h4 className="text-sm font-semibold mb-1">Real-time Analytics Dashboard</h4>
              <p className="text-xs mb-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Built high-performance dashboard with WebSocket live updates
              </p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                Vue • Node.js • Redis
              </span>
            </div>
          </div>
        </div>

        {/* Blog Preview - Medium Bento */}
        <div className="bento-box bento-medium flex flex-col h-full">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Latest Blog Post
          </h3>
          <article className="space-y-1.5 md:space-y-2 flex-1 flex flex-col">
            <h4 className="text-sm md:text-base font-semibold line-clamp-2 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Building Scalable React Applications
            </h4>
            <p className="text-xs md:text-sm line-clamp-3 flex-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Explore best practices for structuring large React applications, 
              including state management, code splitting, and performance optimization...
            </p>
            <a href="/blog" className="apple-link text-xs md:text-sm inline-flex items-center group mt-auto pt-1">
              Read more 
              <span className="material-icons text-base ml-1 transform group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
          </article>
        </div>

        {/* Tech Setup - Medium Bento */}
        <div className="bento-box bento-medium flex flex-col h-full">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Tech Setup
          </h3>
          <div className="space-y-1 md:space-y-1.5 flex-1">
            <div className="glass-thick rounded-lg p-1.5 md:p-2 transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1.5 text-xs md:text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="material-icons text-base">computer</span>
                Hardware & Software
              </h4>
              <p className="text-xs pl-6 mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>
                My daily driver tools and setup
              </p>
            </div>
            <a href="/tech-setup" className="apple-link text-xs md:text-sm inline-flex items-center group mt-auto pt-1">
              View Full Setup 
              <span className="material-icons text-base ml-1 transform group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
          </div>
        </div>

        {/* Quick Stats - Small Bentos with gradients */}
        <div className="bento-box bento-small bento-gradient-3 flex flex-col justify-center items-center text-center group hover:scale-105 p-2 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold mb-0.5" 
               style={{ background: 'var(--gradient-vibrant)', 
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent' }}>5+</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Years Experience</div>
        </div>

        <div className="bento-box bento-small bento-gradient-1 flex flex-col justify-center items-center text-center group hover:scale-105 p-2 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold mb-0.5" 
               style={{ background: 'var(--gradient-accent)', 
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent' }}>50+</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Projects Delivered</div>
        </div>

        <div className="bento-box bento-small bento-gradient-2 flex flex-col justify-center items-center text-center group hover:scale-105 p-2 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold mb-0.5" 
               style={{ background: 'var(--gradient-cool)', 
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent' }}>100%</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Client Satisfaction</div>
        </div>

        {/* Featured Game - Wide Bento */}
        <div className="bento-box bento-wide relative overflow-visible flex items-center">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
            <div className="flex-1">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Arena Shooter
              </h3>
              <p className="text-xs md:text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                A fast-paced 3D browser game built with Three.js
              </p>
              <a href="/games/arena-shooter" className="btn btn-gradient-vibrant text-xs md:text-sm py-1.5">
                <span className="material-icons">sports_esports</span>
                Play Now
              </a>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-24 h-24 xl:w-32 xl:h-32 rounded-xl animate-pulse"
                   style={{ background: 'var(--gradient-vibrant)', opacity: 0.3 }}></div>
            </div>
          </div>
          
          {/* Animated background element */}
          <div className="hidden md:block absolute -top-4 -right-4 w-16 h-16 lg:w-24 lg:h-24 rounded-full animate-bounce"
               style={{ background: 'var(--gradient-vibrant)', 
                       opacity: 0.2,
                       filter: 'blur(20px)' }}></div>
        </div>

        {/* Contact CTA - Medium Bento with gradient background */}
        <div id="contact" className="bento-box bento-medium relative"
             style={{ 
               background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(191, 90, 242, 0.1) 100%)',
               overflow: 'visible',
               zIndex: 1
             }}>
          <div className="relative z-10">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1.5 sm:mb-2" style={{ color: 'var(--text-primary)' }}>
              Let's Connect
            </h3>
            <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: 'var(--text-muted)' }}>
              Have a project in mind? I'd love to hear about it.
            </p>
          <div className="space-y-1.5 sm:space-y-2 relative z-10">
            <a href="mailto:hi@austn.net" 
               className="flex items-center gap-2 sm:gap-3 group transition-all hover:translate-x-1 text-sm sm:text-base"
               style={{ 
                 color: 'var(--accent-color)', 
                 textDecoration: 'none',
                 display: 'flex',
                 position: 'relative',
                 zIndex: 10
               }}>
              <span className="material-icons group-hover:scale-110 transition-transform text-lg sm:text-base">email</span>
              <span className="break-all">hi@austn.net</span>
            </a>
            <a href="https://github.com/frogr" 
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 sm:gap-3 group transition-all hover:translate-x-1 text-sm sm:text-base"
               style={{ 
                 color: 'var(--purple-accent)', 
                 textDecoration: 'none',
                 display: 'flex',
                 position: 'relative',
                 zIndex: 10
               }}>
              <span className="material-icons group-hover:scale-110 transition-transform text-lg sm:text-base">code</span>
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com/in/austindanielfrench" 
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 sm:gap-3 group transition-all hover:translate-x-1 text-sm sm:text-base"
               style={{ 
                 color: 'var(--indigo-accent)', 
                 textDecoration: 'none',
                 display: 'flex',
                 position: 'relative',
                 zIndex: 10
               }}>
              <span className="material-icons group-hover:scale-110 transition-transform text-lg sm:text-base">business</span>
              <span>LinkedIn</span>
            </a>
            </div>
          </div>
          
          {/* Floating decoration - smaller on mobile */}
          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-20 h-20 sm:w-32 sm:h-32 rounded-full"
               style={{ 
                 background: 'var(--gradient-cool)', 
                 opacity: 0.1,
                 filter: 'blur(30px)',
                 animation: 'pulse 4s infinite',
                 pointerEvents: 'none'
               }}></div>
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
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default BentoHome;