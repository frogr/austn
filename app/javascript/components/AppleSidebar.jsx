import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const AppleSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Check for mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
      // Close mobile menu when resizing to desktop
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Separate rendering for mobile
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger menu - always visible */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-200"
          style={{ 
            backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}
        >
          <span className="material-icons" style={{ 
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontSize: '24px'
          }}>
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
        
        {/* Mobile overlay backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <div 
          className={`fixed inset-y-0 left-0 w-64 flex flex-col z-40 transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(20, 20, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}
        >
          {/* Header */}
          <div className="p-6">
            <h1 className="text-2xl font-bold"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
              Austn
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <a 
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                      ${isActive(item.path) ? 'shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    style={isActive(item.path) 
                      ? { 
                          background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                          color: 'white'
                        } 
                      : { 
                          color: theme === 'dark' ? '#ffffff' : '#000000'
                        }
                    }
                  >
                    <span className="material-icons" style={{ fontSize: '24px' }}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6"></div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div 
      className={`fixed inset-y-0 left-0 ${collapsed ? 'w-20' : 'w-64'} flex flex-col z-40 transition-all duration-300 ease-in-out`}
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
      }}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <h1 
          className={`text-2xl font-bold ${collapsed ? 'hidden' : 'block'}`}
          style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
        >
          Austn
        </h1>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <span className="material-icons" 
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
            {collapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <a 
                href={item.path}
                className={`flex items-center gap-3 ${collapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-xl
                  transition-all duration-300 ${isActive(item.path) ? 'shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                style={isActive(item.path) 
                  ? { 
                      background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                      color: 'white'
                    } 
                  : { 
                      color: theme === 'dark' ? '#ffffff' : '#000000'
                    }
                }
              >
                <span className="material-icons" style={{ fontSize: '24px' }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6">
        {!collapsed && (
          <div className="mt-4 text-xs text-center"
               style={{ color: theme === 'dark' ? '#999' : '#666' }}>
            &copy; 2025 Austn
          </div>
        )}
      </div>
    </div>
  );
};

export default AppleSidebar;
