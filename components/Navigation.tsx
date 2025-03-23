
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">
          <Link to="/">austn</Link>
        </div>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-purple-400">Home</Link>
          <Link to="/blog" className="hover:text-purple-400">Blog</Link>
          <Link to="/work" className="hover:text-purple-400">Work</Link>
          <Link to="/contact" className="hover:text-purple-400">Contact</Link>
          <Link to="/fun" className="hover:text-purple-400">Fun</Link>
          <Link to="/games" className="hover:text-purple-400">Games</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
