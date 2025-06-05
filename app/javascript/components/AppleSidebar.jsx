import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const AppleSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Check for mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // On mobile, ensure sidebar is collapsed
  useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const navItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/projects', icon: 'folder', label: 'Projects' },
    { path: '/blog', icon: 'article', label: 'Blog' }
  ];

  const isActive = (path) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 ${collapsed ? 'w-20' : 'w-64'} 
        glass-thick flex flex-col z-50 transition-all duration-500 
        border-r ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center relative">
        <h1 
          className={`text-2xl font-bold bg-clip-text text-transparent ${collapsed ? 'hidden' : 'block'}`}
          style={{ 
            backgroundImage: 'var(--gradient-vibrant)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientShift 8s ease infinite'
          }}
        >
          Austn
        </h1>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-glass hover:scale-110 transition-all duration-200 group"
        >
          <span className="material-icons group-hover:rotate-180 transition-transform duration-300" 
                style={{ color: 'var(--text-primary)' }}>
            {collapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
        
        {/* Animated accent */}
        {!collapsed && (
          <div className="absolute -bottom-2 left-6 right-6 h-px opacity-30"
               style={{ background: 'var(--gradient-accent)' }}></div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <a 
                href={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-300 group relative overflow-hidden
                  ${isActive(item.path) 
                    ? 'text-white shadow-lg transform scale-105' 
                    : 'hover:bg-glass hover:scale-105'
                  }
                `}
                style={isActive(item.path) 
                  ? { 
                      background: 'var(--gradient-accent)', 
                      boxShadow: 'var(--shadow-glow)' 
                    } 
                  : { 
                      color: 'var(--text-primary)' 
                    }
                }
              >
                {/* Ripple effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                     style={{ 
                       background: 'radial-gradient(circle at center, var(--accent-color) 0%, transparent 70%)',
                       transform: 'scale(0)',
                       animation: isActive(item.path) ? 'none' : 'ripple 0.6s ease-out'
                     }}></div>
                
                <span className={`material-icons relative z-10 ${isActive(item.path) ? 'animate-pulse' : ''}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium relative z-10">{item.label}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6">
        {/* Theme Toggle with gradient */}
        <button
          onClick={() => window.ThemeContextValue.toggleTheme()}
          className={`
            w-full flex items-center justify-center gap-3 px-4 py-3 
            rounded-xl glass hover:bg-glass-thick group
            transition-all duration-300 mb-4 relative overflow-hidden
          `}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
               style={{ background: 'var(--gradient-primary)' }}></div>
          
          <span className="material-icons transform group-hover:rotate-180 transition-transform duration-500 relative z-10" 
                style={{ color: theme === 'dark' ? 'var(--warning-color)' : 'var(--indigo-accent)' }}>
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          {!collapsed && (
            <span className="relative z-10" style={{ color: 'var(--text-primary)' }}>
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </span>
          )}
        </button>

        {/* Copyright */}
        <div 
          className={`text-xs text-center ${collapsed ? 'hidden' : 'block'}`}
          style={{ color: 'var(--text-muted)' }}
        >
          &copy; 2025 Austn
        </div>
      </div>
      
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(30deg); }
        }
        @keyframes ripple {
          from { 
            transform: scale(0); 
            opacity: 0.5;
          }
          to { 
            transform: scale(4); 
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AppleSidebar;