import React, { useState } from 'react'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  
  // Dark-only colors
  const isDark = true;
  
  // Check for mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // On mobile, ensure sidebar is collapsed
  useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
  }, [isMobile]);
  
  // Dispatch custom events when sidebar state changes
  useEffect(() => {
    const event = new CustomEvent(
      collapsed ? window.sidebarEvents.COLLAPSED : window.sidebarEvents.EXPANDED
    );
    document.dispatchEvent(event);
  }, [collapsed]);
  
  return (
    <div 
      className={`fixed inset-y-0 left-0 ${collapsed ? 'w-16' : 'w-56'} flex flex-col sidebar z-[100] transition-all duration-300`}
      style={{ 
        backgroundColor: '#1f2937',
        color: '#ffffff'
      }}
    >
      <div className="p-5 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${collapsed ? 'hidden' : 'block'}`}>Austn</h1>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: '#ffffff' }}
          className="focus:outline-none"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <nav className="flex-1 px-5 py-3">
        <ul className="space-y-5">
          <li>
            <a 
              href="/" 
              className="block py-2 flex items-center"
              style={{ color: '#ffffff' }}
            >
              <span className="material-icons mr-2">home</span>
              {!collapsed && <span>Home</span>}
            </a>
          </li>
          <li>
            <a 
              href="/blog" 
              className="block py-2 flex items-center"
              style={{ color: '#ffffff' }}
            >
              <span className="material-icons mr-2">article</span>
              {!collapsed && <span>Blog</span>}
            </a>
          </li>
          <li>
            <a 
              href="/work" 
              className="block py-2 flex items-center"
              style={{ color: '#ffffff' }}
            >
              <span className="material-icons mr-2">work</span>
              {!collapsed && <span>Work</span>}
            </a>
          </li>
          <li>
            <a 
              href="/contact" 
              className="block py-2 flex items-center"
              style={{ color: '#ffffff' }}
            >
              <span className="material-icons mr-2">mail</span>
              {!collapsed && <span>Contact</span>}
            </a>
          </li>
          <li>
            <a 
              href="/fun" 
              className="block py-2 flex items-center"
              style={{ color: '#ffffff' }}
            >
              <span className="material-icons mr-2">emoji_emotions</span>
              {!collapsed && <span>Fun</span>}
            </a>
          </li>
          <li>
            <a 
              href="/games" 
              className="block py-2 flex items-center"
              style={{ color: isDark ? '#ffffff' : '#1f2937' }}
            >
              <span className="material-icons mr-2">sports_esports</span>
              {!collapsed && <span>Games</span>}
            </a>
          </li>
        </ul>
      </nav>
      <div className="p-5">
        <div 
          className={`text-sm ${collapsed ? 'hidden' : 'block'}`}
          style={{ color: '#9ca3af' }}
        >
          &copy; 2025 Austn
        </div>
      </div>
    </div>
  )
}

export default Sidebar
