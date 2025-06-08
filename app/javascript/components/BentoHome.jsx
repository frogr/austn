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
              Web Developer | Ruby on Rails Expert | Building scalable solutions that drive growth
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
              <p className="text-xs pl-3 mt-0.5">React, JS, Tailwind</p>
            </div>
            <div className="glass-thick rounded-lg skill-item transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1 text-xs">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--purple-accent)' }}></span>
                Backend
              </h4>
              <p className="text-xs pl-3 mt-0.5">Rails, Node, PostgreSQL</p>
            </div>
            <div className="glass-thick rounded-lg skill-item transition-transform hover:scale-105">
              <h4 className="font-medium flex items-center gap-1 text-xs">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--teal-accent)' }}></span>
                Cloud & DevOps
              </h4>
              <p className="text-xs pl-3 mt-0.5">AWS, Docker, Heroku</p>
            </div>
          </div>
        </div>

        {/* Recent Work - 2x1 */}
        <div className="bento-box bento-2x1">
          <h3 className="font-semibold mb-2">Recent Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a href="/projects/bgca" className="apple-card group p-2 block hover:scale-105 transition-transform">
              <h4 className="text-sm font-semibold mb-1">$2MM+ Platform</h4>
              <p className="text-xs mb-1">Boys & Girls Club donation system</p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                Node.js • Stripe
              </span>
            </a>
            <a href="/projects/curl-lol" className="apple-card group p-2 block hover:scale-105 transition-transform">
              <h4 className="text-sm font-semibold mb-1">curl.lol</h4>
              <p className="text-xs mb-1">URL shortener with analytics</p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                Rails • Redis
              </span>
            </a>
          </div>
        </div>

        {/* Blog Preview - 1x1 */}
        <div className="bento-box bento-1x1">
          <h3 className="font-semibold mb-1">Latest Blog</h3>
          <article className="space-y-1">
            <h4 className="text-sm font-semibold line-clamp-1">Hello World!</h4>
            <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              First post generated with homemade Ruby on Rails Obsidian plugin!
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
              Hardware & software tools
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
                           WebkitTextFillColor: 'transparent' }}>7+</div>
              <div className="text-xs">Years</div>
            </div>
            <div className="stat-item flex flex-col justify-center items-center">
              <div className="text-lg sm:text-xl font-bold" 
                   style={{ background: 'var(--gradient-accent)', 
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent' }}>$10MM+</div>
              <div className="text-xs">Revenue</div>
            </div>
            <div className="stat-item flex flex-col justify-center items-center">
              <div className="text-lg sm:text-xl font-bold" 
                   style={{ background: 'var(--gradient-cool)', 
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent' }}>100%</div>
              <div className="text-xs">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Featured Projects - 2x2 */}
        <div className="bento-box bento-2x2">
          <h3 className="font-semibold mb-2">Featured Projects</h3>
          <div className="space-y-2 flex-1 overflow-auto">
            <a href="/projects/hub" className="apple-card group p-2 block hover:scale-102 transition-transform">
              <h4 className="text-sm font-semibold mb-1">
                🚀 Hub - React/Rails SaaS
              </h4>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Production-ready boilerplate platform
              </p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                React • Rails • Stripe • Docker
              </span>
            </a>
            <a href="/projects/portfolio" className="apple-card group p-2 block hover:scale-102 transition-transform">
              <h4 className="text-sm font-semibold mb-1">
                🌐 This Portfolio Site
              </h4>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Modern portfolio with dark mode
              </p>
              <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
                React • Rails • Tailwind • SSR
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
                Fast-paced 3D browser game
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

        {/* Latest Activity - 1x1 */}
        <div className="bento-box bento-1x1">
          <h3 className="font-semibold mb-1">Activity</h3>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="material-icons text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>code</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Pushed to portfolio</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Updated components</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-icons text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>star</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Starred rails/rails</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Ruby on Rails</p>
              </div>
            </div>
          </div>
          <a href="https://github.com/frogr" target="_blank" rel="noopener noreferrer" 
             className="apple-link text-xs inline-flex items-center group mt-2">
            GitHub
            <span className="material-icons text-sm ml-1">open_in_new</span>
          </a>
        </div>

        {/* Contact CTA - 1x1 */}
        <div id="contact" className="bento-box bento-1x1 bento-contact relative"
             style={{ 
               background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(191, 90, 242, 0.1) 100%)'
             }}>
          <div className="relative z-10">
            <h3 className="font-semibold mb-1">Let's Connect</h3>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Have a project in mind?
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