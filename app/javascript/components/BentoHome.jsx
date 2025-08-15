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
            <p className="text-[10px] sm:text-xs md:text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              Senior Backend Engineer | AI Experimentalist
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

        {/* Stats - 3x1 */}
        <div className="bento-box bento-3x1">
          <div className="grid grid-cols-3 gap-2 h-full">
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-black bg-clip-text text-transparent"
                   style={{ backgroundImage: 'var(--gradient-vibrant)' }}>6+</div>
              <div className="text-[10px] sm:text-xs opacity-70">Years</div>
            </div>
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-black bg-clip-text text-transparent"
                   style={{ backgroundImage: 'var(--gradient-accent)' }}>20+</div>
              <div className="text-[10px] sm:text-xs opacity-70">AI Projects</div>
            </div>
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-black bg-clip-text text-transparent"
                   style={{ backgroundImage: 'var(--gradient-cool)' }}>100%</div>
              <div className="text-[10px] sm:text-xs opacity-70">Success</div>
            </div>
          </div>
        </div>

        {/* Featured Projects - 2x2 */}
        <div className="bento-box bento-2x2 bento-gradient-2">
          <h3 className="font-bold text-xs sm:text-sm mb-1">Featured Projects</h3>
          <div className="space-y-1">
            <a href="/projects/pages-ai" className="block glass-thick rounded-md p-1.5 hover:scale-[1.01] transition-transform">
              <h4 className="font-semibold text-[10px] sm:text-xs">🤖 Pages AI Assistant</h4>
              <p className="text-[9px] sm:text-[10px] opacity-70">AI-powered docs at CompanyCam</p>
            </a>
            <a href="/projects/hub" className="block glass-thick rounded-md p-1.5 hover:scale-[1.01] transition-transform">
              <h4 className="font-semibold text-[10px] sm:text-xs">🚀 Hub - Rails Starter</h4>
              <p className="text-[9px] sm:text-[10px] opacity-70">Production-ready boilerplate</p>
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

        {/* Recent Blog Posts - 2x1 */}
        <div className="bento-box bento-2x1">
          <h3 className="font-bold text-xs sm:text-sm mb-1">Recent Posts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            <a href="/blog/ai-development" className="block hover:translate-x-0.5 transition-transform">
              <h4 className="font-semibold text-[10px] sm:text-xs">AI-Powered Development</h4>
              <p className="text-[9px] sm:text-[10px] opacity-60">Building faster with Claude</p>
            </a>
            <a href="/blog/rails-optimization" className="block hover:translate-x-0.5 transition-transform">
              <h4 className="font-semibold text-[10px] sm:text-xs">Rails Performance Tips</h4>
              <p className="text-[9px] sm:text-[10px] opacity-60">10x your app speed</p>
            </a>
            <a href="/blog/three-js-journey" className="block hover:translate-x-0.5 transition-transform">
              <h4 className="font-semibold text-[10px] sm:text-xs">Learning Three.js</h4>
              <p className="text-[9px] sm:text-[10px] opacity-60">From zero to 3D games</p>
            </a>
          </div>
        </div>

        {/* Skills - 1x2 */}
        <div className="bento-box bento-1x2">
          <h3 className="font-bold text-xs sm:text-sm mb-1">Skills</h3>
          <div className="grid grid-cols-2 gap-1 text-[9px] sm:text-[10px]">
            <div className="glass-thick rounded px-1.5 py-0.5">React</div>
            <div className="glass-thick rounded px-1.5 py-0.5">Rails</div>
            <div className="glass-thick rounded px-1.5 py-0.5">Three.js</div>
            <div className="glass-thick rounded px-1.5 py-0.5">AI/LLMs</div>
            <div className="glass-thick rounded px-1.5 py-0.5">PostgreSQL</div>
            <div className="glass-thick rounded px-1.5 py-0.5">Docker</div>
            <div className="glass-thick rounded px-1.5 py-0.5">TypeScript</div>
            <div className="glass-thick rounded px-1.5 py-0.5">AWS</div>
          </div>
        </div>

        {/* AI Lab - 2x1 */}
        <div className="bento-box bento-2x1 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" 
               style={{ background: 'linear-gradient(135deg, var(--pink-accent) 0%, var(--purple-accent) 100%)' }}></div>
          <div className="relative z-10">
            <h3 className="font-bold text-xs sm:text-sm mb-0.5">🧪 AI Experiments Lab</h3>
            <p className="text-[10px] sm:text-xs mb-1 opacity-80">
              20+ projects built with Claude as my pair programmer
            </p>
            <div className="flex gap-1 flex-wrap">
              <a href="/projects/ai-experiments" className="btn btn-gradient-vibrant text-[10px] sm:text-xs py-0.5 px-2">
                Explore Lab
              </a>
              <a href="https://youtube.com/@austn" target="_blank" rel="noopener noreferrer" 
                 className="btn btn-secondary text-[10px] sm:text-xs py-0.5 px-2">
                <span className="material-icons text-xs">play_circle</span>
                Watch
              </a>
            </div>
          </div>
        </div>

        {/* Contact - 1x1 */}
        <div className="bento-box bento-1x1 bento-gradient-3">
          <h3 className="font-bold text-xs sm:text-sm mb-1">Connect</h3>
          <div className="space-y-1">
            <a href="mailto:hi@austn.net" className="flex items-center gap-1 text-[10px] sm:text-xs hover:translate-x-0.5 transition-transform">
              <span className="material-icons text-xs">email</span>
              <span>Email</span>
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

        {/* Mini Projects Grid - 1x1 */}
        <div className="bento-box bento-1x1">
          <h3 className="font-bold text-xs sm:text-sm mb-1">Quick Links</h3>
          <div className="space-y-0.5">
            <a href="/projects/curl-lol" className="block text-[9px] sm:text-[10px] hover:translate-x-0.5 transition-transform">
              🔗 curl.lol - URL Shortener
            </a>
            <a href="/projects/minecraft-planner" className="block text-[9px] sm:text-[10px] hover:translate-x-0.5 transition-transform">
              🎮 Minecraft Planner
            </a>
            <a href="/projects/backlit" className="block text-[9px] sm:text-[10px] hover:translate-x-0.5 transition-transform">
              🎬 Backlit Platform
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BentoHome;