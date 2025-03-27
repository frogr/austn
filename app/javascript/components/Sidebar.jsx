import React, { useState, useEffect } from 'react'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  
  // Dispatch custom events when sidebar state changes
  useEffect(() => {
    const event = new CustomEvent(
      collapsed ? window.sidebarEvents.COLLAPSED : window.sidebarEvents.EXPANDED
    );
    document.dispatchEvent(event);
  }, [collapsed]);
  
  return (
    <div className={`fixed inset-y-0 left-0 ${collapsed ? 'w-16' : 'w-56'} bg-gray-800 text-white flex flex-col sidebar z-10 transition-all duration-300`}>
      <div className="p-5 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${collapsed ? 'hidden' : 'block'}`}>Austn</h1>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:text-yellow-300 focus:outline-none"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <nav className="flex-1 px-5 py-3">
        <ul className="space-y-5">
          <li>
            <a 
              href="/" 
              className="block py-2 text-white transition-colors hover:text-yellow-300 flex items-center"
            >
              <span className="material-icons mr-2">home</span>
              {!collapsed && <span>Home</span>}
            </a>
          </li>
          <li>
            <a 
              href="/blog" 
              className="block py-2 text-white transition-colors hover:text-yellow-300 flex items-center"
            >
              <span className="material-icons mr-2">article</span>
              {!collapsed && <span>Blog</span>}
            </a>
          </li>
          <li>
            <a 
              href="/work" 
              className="block py-2 text-white transition-colors hover:text-yellow-300 flex items-center"
            >
              <span className="material-icons mr-2">work</span>
              {!collapsed && <span>Work</span>}
            </a>
          </li>
          <li>
            <a 
              href="/contact" 
              className="block py-2 text-white transition-colors hover:text-yellow-300 flex items-center"
            >
              <span className="material-icons mr-2">mail</span>
              {!collapsed && <span>Contact</span>}
            </a>
          </li>
          <li>
            <a 
              href="/fun" 
              className="block py-2 text-white transition-colors hover:text-yellow-300 flex items-center"
            >
              <span className="material-icons mr-2">emoji_emotions</span>
              {!collapsed && <span>Fun</span>}
            </a>
          </li>
          <li>
            <a 
              href="/games" 
              className="block py-2 text-white transition-colors hover:text-yellow-300 flex items-center"
            >
              <span className="material-icons mr-2">sports_esports</span>
              {!collapsed && <span>Games</span>}
            </a>
          </li>
        </ul>
      </nav>
      <div className="p-5">
        <div className={`text-sm text-gray-400 ${collapsed ? 'hidden' : 'block'}`}>&copy; 2025 Austn</div>
      </div>
    </div>
  )
}

export default Sidebar