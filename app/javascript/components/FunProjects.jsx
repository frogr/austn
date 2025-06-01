import React, { useContext } from 'react';
import ResponsiveImage from './ResponsiveImage';
import { ThemeContext } from './ThemeProvider';

const FunProjects = () => {
  // Use ThemeContext via useContext hook
  try {
    // This component uses CSS variables so we don't need to track theme state
    // Just ensure ThemeContext is properly initialized
    useContext(ThemeContext);
  } catch (e) {
    console.log('ThemeContext not available, using default theme');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-primary">Fun Stuff</h1>
      <p className="text-base md:text-lg mb-6 md:mb-8 text-secondary">
        A collection of personal projects, hobbies, and interests outside of my professional work.
      </p>

      {/* What I'm Learning Section */}
      <div className="theme-card glass-effect p-4 md:p-6 relative">
        
        <div className="relative z-1">
          <h2 className="text-xl font-semibold mb-4 text-primary">What I'm Learning Right Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-3 rounded-md">
              <h3 className="font-medium mb-2 text-primary">WebGL & Three.js</h3>
              <p className="text-secondary text-sm">Exploring 3D graphics in the browser for interactive visualizations.</p>
            </div>
            <div className="bg-card p-3 rounded-md">
              <h3 className="font-medium mb-2 text-primary">Advanced Rails</h3>
              <p className="text-secondary text-sm">Diving deeper into Rails internals and performance optimization.</p>
            </div>
            <div className="bg-card p-3 rounded-md">
              <h3 className="font-medium mb-2 text-primary">Machine Learning</h3>
              <p className="text-secondary text-sm">Getting started with ML fundamentals for potential future projects.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunProjects;