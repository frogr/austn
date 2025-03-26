import React from 'react'

const Sidebar = () => {
  return (
    <div className="fixed inset-y-0 left-0 w-56 bg-gray-800 text-white flex flex-col sidebar">
      <div className="p-5">
        <h1 className="text-2xl font-bold">Austn</h1>
      </div>
      <nav className="flex-1 px-5 py-3">
        <ul className="space-y-5">
          <li>
            <a 
              href="/" 
              className="block py-2 text-white transition-colors hover:text-yellow-300"
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="/blog" 
              className="block py-2 text-white transition-colors hover:text-yellow-300"
            >
              Blog
            </a>
          </li>
          <li>
            <a 
              href="/work" 
              className="block py-2 text-white transition-colors hover:text-yellow-300"
            >
              Work
            </a>
          </li>
          <li>
            <a 
              href="/contact" 
              className="block py-2 text-white transition-colors hover:text-yellow-300"
            >
              Contact
            </a>
          </li>
          <li>
            <a 
              href="/fun" 
              className="block py-2 text-white transition-colors hover:text-yellow-300"
            >
              Fun
            </a>
          </li>
          <li>
            <a 
              href="/games" 
              className="block py-2 text-white transition-colors hover:text-yellow-300"
            >
              Games
            </a>
          </li>
        </ul>
      </nav>
      <div className="p-5">
        <div className="text-sm text-gray-400">&copy; 2025 Austn</div>
      </div>
    </div>
  )
}

export default Sidebar