import React from 'react';
import { useTheme } from './ThemeContext';

const BentoHome = () => {
  const { theme } = useTheme();

  return (
    <div className="h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-48 h-48 bg-yellow-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Use the bento grid system that was working */}
      <div className="bento-container bento-grid-home relative z-10 overflow-y-auto">
        
        {/* Hero Section - Full width */}
        <div className="bento-box bento-full bento-gradient-1 flex items-center py-2">
          <div className="w-full">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-0.5 bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient-accent)' }}>
              Hi, I'm Austin French
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-3" style={{ color: 'var(--text-secondary)' }}>
              Senior Backend Engineer | AI Experimentalist | Interested in Education & Presentation
            </p>
            <div className="flex gap-1 flex-wrap">
              <a href="/projects" className="btn btn-primary text-[10px] sm:text-xs py-1 px-2">
                <span className="material-icons text-xs">folder</span>
                <span>View Projects</span>
              </a>
              <a href="/blog" className="btn btn-secondary text-[10px] sm:text-xs py-1 px-2">
                <span className="material-icons text-xs">article</span>
                <span>Read Blog</span>
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
              <p className="text-xs pl-3 mt-0.5">TypeScript, React, Three.js</p>
            </div>
            <div className="glass-thick rounded-lg skill-item transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1 text-xs">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--purple-accent)' }}></span>
                Backend
              </h4>
              <p className="text-xs pl-3 mt-0.5">Rails, Ruby, API Design</p>
            </div>
            <div className="glass-thick rounded-lg skill-item transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1 text-xs">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--teal-accent)' }}></span>
                Cloud & DevOps
              </h4>
              <p className="text-xs pl-3 mt-0.5">AI/ML, OpenAI, RAG</p>
            </div>
          </div>
        </div>

        {/* Recent Work - 2x1 */}
        <div className="bento-box bento-2x1">
          <h3 className="font-semibold mb-2">Recent Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a href="/projects/pages-ai" className="apple-card group p-2 block hover:scale-105 transition-transform">
              <h4 className="text-sm font-semibold mb-1">Pages AI Assistant</h4>
              <p className="text-xs mb-1">AI chatbot to generate beautiful documents</p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                OpenAI • Rails • RubyLLM
              </span>
            </a>
            <a href="/projects/bgca" className="block glass-thick rounded-md p-1.5 hover:scale-[1.01] transition-transform">
              <h4 className="font-semibold text-[10px] sm:text-xs">💝 $2MM+ Platform</h4>
              <p className="text-[9px] sm:text-[10px] opacity-70">Boys & Girls Club fundraiser</p>
            </a>
          </div>
          <a href="/projects" className="apple-link text-[10px] sm:text-xs inline-flex items-center group mt-1">
            View All Projects
            <span className="material-icons text-sm ml-1 transform group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

        {/* Blog Preview - 1x1 */}
        <div className="bento-box bento-1x1">
          <h3 className="font-semibold mb-1">Latest Blog</h3>
          <article className="space-y-1">
            <h4 className="text-sm font-semibold line-clamp-1">How I use Claude Code</h4>
            <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              How I've used Claude to ship 20+ projects quickly and securely
            </p>
            <a href="/blog" className="apple-link text-xs inline-flex items-center group">
              Read more 
              <span className="material-icons text-sm ml-1 transform group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
          </div>
        </div>

        {/* Tech Setup - 1x1 */}
        <div className="bento-box bento-1x1">
          <h3 className="font-semibold mb-1">Tech Setup</h3>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-icons text-sm" style={{ color: 'var(--text-muted)' }}>computer</span>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Dev setup
            </p>
          </div>
        </div>

        {/* Quick Stats - 3x1 */}
        <div className="bento-box bento-2x1 bento-stats">
          <div className="grid grid-cols-3 gap-2 h-full">
            <div className="stat-item flex flex-col justify-center items-center">
              <div className="text-lg sm:text-xl font-bold" 
                   style={{ background: 'var(--gradient-vibrant)', 
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent' }}>7+</div>
              <div className="text-xs">Years Shipping</div>
            </div>
            <div className="stat-item flex flex-col justify-center items-center">
              <div className="text-lg sm:text-xl font-bold" 
                   style={{ background: 'var(--gradient-accent)', 
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent' }}>20+</div>
              <div className="text-xs">AI Projects</div>
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
                Rails • React • Stripe
              </span>
            </a>
            <a href="https://github.com/frogr" target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-1 text-[10px] sm:text-xs hover:translate-x-0.5 transition-transform">
              <span className="material-icons text-xs">code</span>
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com/in/austindanielfrench" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 text-[10px] sm:text-xs hover:translate-x-0.5 transition-transform">
              <span className="material-icons text-xs">business</span>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Game Preview - 1x1 */}
        <div className="bento-box bento-1x1 flex flex-col justify-center">
          <h3 className="font-bold text-xs sm:text-sm mb-0.5">🎮 Arena Shooter</h3>
          <p className="text-[10px] sm:text-xs opacity-70 mb-1">Three.js game</p>
          <a href="/games/arena-shooter" className="btn btn-gradient-accent text-[10px] sm:text-xs py-0.5 w-full justify-center">
            Play Now
          </a>
        </div>

        {/* Current Focus - 2x1 */}
        <div className="bento-box bento-2x1">
          <h3 className="font-bold text-xs sm:text-sm mb-1">Current Focus</h3>
          <div className="flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] glass-thick">🎯 AI Integration</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] glass-thick">📚 Teaching</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] glass-thick">🚀 Open Source</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] glass-thick">🎮 Game Dev</span>
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
              Let's build something important
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