import React from 'react';
import { useTheme } from './ThemeContext';

const BentoHome = ({ latestBlogPosts = [], featuredProjects = [] }) => {
  const { theme } = useTheme();

  // Format date for blog posts
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Theme-aware styles
  const isDark = theme === 'dark';
  
  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      {/* Gradient mesh removed to avoid top color band */}

      {/* Compact bento grid with touching boxes (no internal scroll) */}
      <div className="bento-container bento-grid-home relative z-10">
        
        {/* Hero Section - Full width with gradient text */}
        <div className="bento-box bento-full flex items-center" 
             style={{ 
               background: isDark
                 ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(191, 90, 242, 0.05) 100%)'
                 : 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(191, 90, 242, 0.08) 100%)',
               borderTop: 'none',
               borderLeft: 'none',
               borderRight: 'none'
             }}>
          <div className="w-full">
            <h1 className="font-black mb-2"
                style={{ 
                  fontSize: 'clamp(3rem, 8vw, 5rem)',
                  background: 'linear-gradient(135deg, #007AFF 0%, #BF5AF2 50%, #FF375F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.03em'
                }}>
              Austin French
            </h1>
            <p className="font-medium mb-4" 
               style={{ 
                 fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                 color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
                 letterSpacing: '-0.01em'
               }}>
              Senior Backend Engineer · AI Experimentalist
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="/projects" className="btn-primary px-6 py-3 rounded-xl font-semibold text-base 
                                            inline-flex items-center gap-2 transition-all hover:scale-105"
                 style={{ 
                   background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
                   boxShadow: '0 4px 24px rgba(0, 122, 255, 0.3)'
                 }}>
                <span className="material-icons text-lg">rocket_launch</span>
                <span>View Projects</span>
              </a>
              <a href="/blog" className="px-6 py-3 rounded-xl font-semibold text-base 
                                        inline-flex items-center gap-2 transition-all hover:scale-105"
                 style={{ 
                   background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                   backdropFilter: 'blur(20px)',
                   border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                   color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
                 }}>
                <span className="material-icons text-lg">article</span>
                <span>Read Blog</span>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Work - 2x1 with glass effect */}
        <div className="bento-box bento-2x1" 
             style={{ 
               background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
               borderLeft: 'none'
             }}>
          <h3 className="font-bold text-xl mb-3">Recent Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featuredProjects.slice(0, 2).map(project => (
              <a key={project.id} href={`/projects/${project.id}`} 
                 className="group p-3 block rounded-lg transition-all hover:scale-105"
                 style={{ 
                   background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                   backdropFilter: 'blur(10px)',
                   border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)'
                 }}>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{project.image}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base truncate">{project.title}</h4>
                    <p className="text-sm opacity-80 line-clamp-1">{project.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <a href="/projects" className="inline-flex items-center gap-1 mt-3 text-sm font-medium transition-all hover:gap-2"
             style={{ color: '#007AFF' }}>
            View All Projects
            <span className="material-icons text-base">arrow_forward</span>
          </a>
        </div>

        {/* Latest Blog Posts - 2x2 with gradient accent */}
        <div className="bento-box bento-2x2"
             style={{ 
               background: isDark
                 ? 'linear-gradient(135deg, rgba(191, 90, 242, 0.03) 0%, rgba(255, 55, 95, 0.03) 100%)'
                 : 'linear-gradient(135deg, rgba(191, 90, 242, 0.05) 0%, rgba(255, 55, 95, 0.05) 100%)',
               borderRight: 'none'
             }}>
          <h3 className="font-bold text-xl mb-3">Latest Writing</h3>
          <div className="space-y-2 flex-1 overflow-auto">
            {latestBlogPosts.length > 0 ? (
              latestBlogPosts.map(post => (
                <a key={post.id} href={`/blog/${post.slug}`}
                   className="block p-3 rounded-lg transition-all hover:scale-[1.02]"
                   style={{ 
                     background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                     backdropFilter: 'blur(10px)',
                     border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)'
                   }}>
                  <h4 className="font-semibold text-base line-clamp-1">{post.title}</h4>
                  <p className="text-sm opacity-70 mt-1">{formatDate(post.created_at)}</p>
                </a>
              ))
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-lg"
                     style={{ 
                       background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                       backdropFilter: 'blur(10px)',
                       border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)'
                     }}>
                  <h4 className="font-semibold text-base">How I use Claude Code</h4>
                  <p className="text-sm opacity-70 mt-1">Ship 20+ projects quickly</p>
                </div>
                <div className="p-3 rounded-lg"
                     style={{ 
                       background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                       backdropFilter: 'blur(10px)',
                       border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)'
                     }}>
                  <h4 className="font-semibold text-base">Building with AI</h4>
                  <p className="text-sm opacity-70 mt-1">Lessons from production</p>
                </div>
              </div>
            )}
            <a href="/blog" className="inline-flex items-center gap-1 mt-2 text-sm font-medium transition-all hover:gap-2"
               style={{ color: '#BF5AF2' }}>
              Read All Posts
              <span className="material-icons text-base">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Core Skills - Compact 1x1 with color dots */}
        <div className="bento-box bento-1x1"
             style={{ 
               background: isDark
                 ? 'linear-gradient(135deg, rgba(0, 214, 143, 0.03) 0%, rgba(100, 210, 255, 0.03) 100%)'
                 : 'linear-gradient(135deg, rgba(0, 214, 143, 0.05) 0%, rgba(100, 210, 255, 0.05) 100%)',
               borderLeft: 'none'
             }}>
          <h3 className="font-bold text-lg mb-3">Core Stack</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#007AFF' }}></span>
              <span className="font-medium text-sm">Rails, Ruby, APIs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#BF5AF2' }}></span>
              <span className="font-medium text-sm">React, TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#00D68F' }}></span>
              <span className="font-medium text-sm">AI/ML, OpenAI</span>
            </div>
          </div>
        </div>

        {/* Stats - Inline compact 2x1 with gradient numbers */}
        <div className="bento-box bento-2x1 flex items-center"
             style={{ 
               background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
             }}>
          <div className="flex gap-6 w-full justify-around">
            <div className="text-center">
              <div className="font-bold" 
                   style={{ 
                     fontSize: '2.5rem',
                     background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent'
                   }}>7+</div>
              <div className="text-sm opacity-70">Years</div>
            </div>
            <div className="text-center">
              <div className="font-bold" 
                   style={{ 
                     fontSize: '2.5rem',
                     background: 'linear-gradient(135deg, #BF5AF2 0%, #FF375F 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent'
                   }}>20+</div>
              <div className="text-sm opacity-70">AI Projects</div>
            </div>
            <div className="text-center">
              <div className="font-bold" 
                   style={{ 
                     fontSize: '2.5rem',
                     background: 'linear-gradient(135deg, #00D68F 0%, #64D2FF 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent'
                   }}>$2M+</div>
              <div className="text-sm opacity-70">Processed</div>
            </div>
          </div>
        </div>

        {/* Featured Projects Grid - 2x2 with glassmorphism */}
        <div className="bento-box bento-2x2"
             style={{ 
               background: isDark
                 ? 'linear-gradient(135deg, rgba(94, 92, 230, 0.03) 0%, rgba(0, 122, 255, 0.03) 100%)'
                 : 'linear-gradient(135deg, rgba(94, 92, 230, 0.05) 0%, rgba(0, 122, 255, 0.05) 100%)',
               borderRight: 'none',
               borderBottom: 'none'
             }}>
          <h3 className="font-bold text-xl mb-3">Featured Projects</h3>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {featuredProjects.map(project => (
              <a key={project.id} href={`/projects/${project.id}`} 
                 className="p-3 rounded-lg hover:scale-105 transition-all flex flex-col"
                 style={{ 
                   background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                   backdropFilter: 'blur(10px)',
                   border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)'
                 }}>
                <span className="text-3xl mb-2">{project.image}</span>
                <h4 className="font-semibold text-sm line-clamp-1">{project.title}</h4>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {project.technologies.slice(0, 2).map(tech => (
                    <span key={tech} className="text-xs opacity-60">{tech}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Current Focus - Compact 1x1 with pills */}
        <div className="bento-box bento-1x1"
             style={{ 
               background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
               borderLeft: 'none',
               borderBottom: 'none'
             }}>
          <h3 className="font-bold text-lg mb-2">Now</h3>
          <div className="flex flex-wrap gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: 'rgba(0, 122, 255, 0.1)',
                    border: '1px solid rgba(0, 122, 255, 0.2)'
                  }}>🎯 AI</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: 'rgba(191, 90, 242, 0.1)',
                    border: '1px solid rgba(191, 90, 242, 0.2)'
                  }}>📚 Teaching</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: 'rgba(0, 214, 143, 0.1)',
                    border: '1px solid rgba(0, 214, 143, 0.2)'
                  }}>🚀 OSS</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: 'rgba(255, 55, 95, 0.1)',
                    border: '1px solid rgba(255, 55, 95, 0.2)'
                  }}>🎮 Games</span>
          </div>
        </div>

        {/* Contact - Compact 1x1 with hover effects */}
        <div className="bento-box bento-1x1"
             style={{ 
               background: isDark
                 ? 'linear-gradient(135deg, rgba(255, 149, 0, 0.03) 0%, rgba(255, 55, 95, 0.03) 100%)'
                 : 'linear-gradient(135deg, rgba(255, 149, 0, 0.05) 0%, rgba(255, 55, 95, 0.05) 100%)',
               borderBottom: 'none'
             }}>
          <h3 className="font-bold text-lg mb-3">Connect</h3>
          <div className="space-y-2">
            <a href="mailto:hi@austn.net" 
               className="flex items-center gap-2 group hover:translate-x-1 transition-all text-sm font-medium">
              <span className="material-icons text-base" style={{ color: '#007AFF' }}>email</span>
              <span>hi@austn.net</span>
            </a>
            <a href="https://github.com/frogr" 
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 group hover:translate-x-1 transition-all text-sm font-medium">
              <span className="material-icons text-base" style={{ color: '#BF5AF2' }}>code</span>
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com/in/austindanielfrench" 
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-2 group hover:translate-x-1 transition-all text-sm font-medium">
              <span className="material-icons text-base" style={{ color: '#5E5CE6' }}>business</span>
              <span>LinkedIn</span>
            </a>
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
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 5s;
        }
        .animation-delay-4000 {
          animation-delay: 10s;
        }
        .animation-delay-6000 {
          animation-delay: 15s;
        }
      `}</style>
    </div>
  );
};

export default BentoHome;
