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

      <div className="bento-container bento-grid-home pt-4 md:pt-6 lg:pt-8 relative z-10">
        {/* Hero Section - Full width */}
        <div className="bento-box bento-full bento-gradient-1 flex flex-col justify-center">
          <div className="w-full max-w-2xl pl-16 md:pl-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient-accent)' }}>
              Hi, I'm Austin French
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-3" style={{ color: 'var(--text-secondary)' }}>
              Senior Backend Engineer | AI Experimentalist | Teaching code & shipping features with a human touch
            </p>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <a href="/projects" className="btn btn-primary text-sm">
                <span className="material-icons text-base">folder</span>
                <span>View Projects</span>
              </a>
              <a href="#contact" className="btn btn-secondary text-sm">
                <span className="material-icons text-base">mail</span>
                <span>Contact Me</span>
              </a>
            </div>
          </div>
        </div>

        {/* Skills Section - 1x1 */}
        <div className="bento-box bento-1x1 bento-gradient-2 bento-skills">
          <h3 className="font-semibold mb-2">Core Skills</h3>
          <div className="space-y-1 flex-1">
            <div className="glass-thick rounded-lg skill-item transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1 text-xs">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                Frontend
              </h4>
              <p className="text-xs pl-3 mt-0.5">React, Three.js, Design Systems</p>
            </div>
            <div className="glass-thick rounded-lg skill-item transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1 text-xs">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--purple-accent)' }}></span>
                Backend
              </h4>
              <p className="text-xs pl-3 mt-0.5">Rails, Ruby, API Architecture</p>
            </div>
            <div className="glass-thick rounded-lg skill-item transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1 text-xs">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--teal-accent)' }}></span>
                Cloud & DevOps
              </h4>
              <p className="text-xs pl-3 mt-0.5">AI/Claude, OpenAI, RAG Systems</p>
            </div>
          </div>
        </div>

        {/* Recent Work - 2x1 */}
        <div className="bento-box bento-2x1">
          <h3 className="font-semibold mb-2">Recent Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a href="/projects/pages-ai" className="apple-card group p-2 block hover:scale-105 transition-transform">
              <h4 className="text-sm font-semibold mb-1">Pages AI Assistant</h4>
              <p className="text-xs mb-1">11% adoption, 10x PDF optimization</p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                OpenAI • Rails • PDF
              </span>
            </a>
            <a href="/projects/bgca" className="apple-card group p-2 block hover:scale-105 transition-transform">
              <h4 className="text-sm font-semibold mb-1">$2MM+ Donation Platform</h4>
              <p className="text-xs mb-1">Boys & Girls Club fundraiser</p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                Stripe • Node.js • Heroku
              </span>
            </a>
          </div>
        </div>

        {/* Blog Preview - 1x1 */}
        <div className="bento-box bento-1x1">
          <h3 className="font-semibold mb-1">Latest Blog</h3>
          <article className="space-y-1">
            <h4 className="text-sm font-semibold line-clamp-1">AI-Powered Development</h4>
            <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              How I'm using Claude to ship 20+ projects faster than ever
            </p>
            <a href="/blog" className="apple-link text-xs inline-flex items-center group">
              Read more 
              <span className="material-icons text-sm ml-1 transform group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
          </article>
        </div>

        {/* Tech Setup - 1x1 */}
        <div className="bento-box bento-1x1">
          <h3 className="font-semibold mb-1">Tech Setup</h3>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-icons text-sm" style={{ color: 'var(--text-muted)' }}>computer</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              My eccentric but effective dev setup
            </p>
          </div>
          <a href="/tech-setup" className="apple-link text-xs inline-flex items-center group">
            View Setup 
            <span className="material-icons text-sm ml-1 transform group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

        {/* Quick Stats - 3x1 */}
        <div className="bento-box bento-3x1 bento-stats">
          <div className="grid grid-cols-3 gap-2 h-full">
            <div className="stat-item flex flex-col justify-center items-center">
              <div className="text-lg sm:text-xl font-bold" 
                   style={{ background: 'var(--gradient-vibrant)', 
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent' }}>6+</div>
              <div className="text-xs">Years Shipping</div>
            </div>
            <div className="stat-item flex flex-col justify-center items-center">
              <div className="text-lg sm:text-xl font-bold" 
                   style={{ background: 'var(--gradient-accent)', 
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent' }}>20+</div>
              <div className="text-xs">AI Projects</div>
            </div>
            <div className="stat-item flex flex-col justify-center items-center">
              <div className="text-lg sm:text-xl font-bold" 
                   style={{ background: 'var(--gradient-cool)', 
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent' }}>100%</div>
              <div className="text-xs">Student Success</div>
            </div>
          </div>
        </div>

        {/* Featured Projects - 2x2 */}
        <div className="bento-box bento-2x2">
          <h3 className="font-semibold mb-2">Featured Projects</h3>
          <div className="space-y-2 flex-1 overflow-auto">
            <a href="/projects/hub" className="apple-card group p-2 block hover:scale-102 transition-transform">
              <h4 className="text-sm font-semibold mb-1">
                🚀 Hub - Rails Starter Kit
              </h4>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Everything I'd throw in a new Rails project today
              </p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                Rails • React • Stripe • My Opinions
              </span>
            </a>
            <a href="/projects/ai-experiments" className="apple-card group p-2 block hover:scale-102 transition-transform">
              <h4 className="text-sm font-semibold mb-1">
                🤖 AI Experiment Lab
              </h4>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                TodayIn3Minutes, gitRAG & more
              </p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                Claude • OpenAI • RAG • YouTube
              </span>
            </a>
          </div>
          <a href="/projects" className="apple-link text-xs inline-flex items-center group mt-2">
            View All
            <span className="material-icons text-sm ml-1 transform group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

        {/* Featured Game - 2x1 */}
        <div className="bento-box bento-2x1 relative overflow-visible flex items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Arena Shooter</h3>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Three.js game built with Claude
              </p>
              <a href="/games/arena-shooter" className="btn btn-gradient-vibrant text-xs py-1.5">
                <span className="material-icons text-sm">sports_esports</span>
                Play Now
              </a>
            </div>
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-16 h-16 rounded-lg animate-pulse"
                   style={{ background: 'var(--gradient-vibrant)', opacity: 0.3 }}></div>
            </div>
          </div>
        </div>

        {/* Contact CTA - 1x1 */}
        <div id="contact" className="bento-box bento-1x1 bento-contact relative"
             style={{ 
               background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(191, 90, 242, 0.1) 100%)'
             }}>
          <div className="relative z-10">
            <h3 className="font-semibold mb-1">Let's Connect</h3>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Let's build something meaningful
            </p>
            <div className="space-y-1">
              <a href="mailto:hi@austn.net" 
                 className="flex items-center gap-2 group transition-all hover:translate-x-1 text-xs"
                 style={{ color: 'var(--accent-color)' }}>
                <span className="material-icons group-hover:scale-110 transition-transform text-sm">email</span>
                <span className="truncate">hi@austn.net</span>
              </a>
              <a href="https://github.com/frogr" 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 group transition-all hover:translate-x-1 text-xs"
                 style={{ color: 'var(--purple-accent)' }}>
                <span className="material-icons group-hover:scale-110 transition-transform text-sm">code</span>
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com/in/austindanielfrench" 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 group transition-all hover:translate-x-1 text-xs"
                 style={{ color: 'var(--indigo-accent)' }}>
                <span className="material-icons group-hover:scale-110 transition-transform text-sm">business</span>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoHome;