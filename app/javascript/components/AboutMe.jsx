import React, { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import ResponsiveImage from './ResponsiveImage';

const AboutMe = () => {
  // Use ThemeContext via useContext hook
  try {
    // This component uses CSS variables so we don't need to track theme state
    // Just ensure ThemeContext is properly initialized
    useContext(ThemeContext);
  } catch (e) {
    console.log('ThemeContext not available, using default theme');
  }
  // Placeholder data - replace with your actual data
  const skills = [
    { name: 'Full Stack Web Development' },
    { name: 'Ruby on Rails' },
    { name: 'React.js' },
  ];

  const featuredPost = {
    title: 'Hello world!',
    excerpt: 'First post generated with homemade ruby on rails Obsidian plugin!',
    image: 'https://i.ibb.co/sd9h4Wk1/Chat-GPT-Image-Mar-27-2025-09-44-04-PM.png',
    url: '/blog/hello-world',
    date: 'March 25, 2025',
  };

  const favoriteItems = [
    {
      category: 'Development Tools',
      items: [
        { name: 'VS Code', description: 'My primary code editor', image: 'https://example.com/vscode.png', url: 'https://code.visualstudio.com/' },
        { name: 'Figma', description: 'Design and prototyping', image: 'https://example.com/figma.png', url: 'https://figma.com/' },
      ],
    },
    {
      category: 'Learning Resources',
      items: [
        { name: 'Frontend Masters', description: 'Advanced web courses', image: 'https://example.com/fem.png', url: 'https://frontendmasters.com/' },
        { name: 'MDN Web Docs', description: 'Web documentation', image: 'https://example.com/mdn.png', url: 'https://developer.mozilla.org/' },
      ],
    },
  ];

  return (
    <div 
      className="w-full h-screen overflow-y-auto absolute top-0 left-0 right-0 bottom-0"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <main className="py-6 px-6 ml-16 transition-all duration-300" id="about-me-content">
        <div className="max-w-4xl mx-auto">
          {/* Domain name header */}
          <div 
            className="text-center text-2xl font-mono mb-12 rounded-md p-4 theme-card glass-effect"
          >
            austn.net
          </div>
          
          {/* Hero Section */}
          <div className="theme-card glass-effect rounded-md p-8 mb-12">
            {/* Decorative elements to enhance glass effect */}
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--pill-bg)' }}
              >
                <ResponsiveImage
                  src="https://i.ibb.co/TBvNqtT1/Chat-GPT-Image-Mar-27-2025-09-07-30-PM.png" 
                  alt="Austin's profile picture" 
                  width={128} 
                  height={128} 
                  className="rounded-full w-24 h-24"
                  objectFit="cover"
                />
              </div>
              
              <h1 className="text-4xl font-bold mb-4">Austin!</h1>
              <p className="text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>Software Engineer</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill.name} 
                    className="theme-pill"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* About Me Section */}
          <div className="theme-card glass-effect rounded-md p-8 mb-12 relative">
            <h2 className="text-2xl font-semibold mb-6">About Me</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              I'm a passionate full-stack developer with expertise in React and Ruby on Rails. 
              With over 5 years of experience building web applications, I focus on creating 
              intuitive, performant user experiences with clean, maintainable code.
            </p>
          </div>
          
          {/* Featured Post */}
          <div className="theme-card glass-effect rounded-md p-8 mb-12">
            {/* Decorative elements for featured post */}
            <div 
              className="absolute w-40 h-40 rounded-full blur-xl -top-5 right-10 bg-pink-500/10" 
              style={{ animation: 'pulse-slow 9s infinite, float 18s ease-in-out infinite' }}
            ></div>
            <div 
              className="absolute w-28 h-28 rounded-full blur-xl bottom-5 left-20 bg-yellow-500/10"
              style={{ animation: 'pulse-slow 12s infinite, float 14s ease-in-out infinite reverse' }}
            ></div>
            <h2 className="text-2xl font-semibold mb-6">Featured Post</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div 
                  className="aspect-video rounded-md overflow-hidden"
                  style={{ backgroundColor: 'var(--pill-bg)' }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <ResponsiveImage
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      width={480}
                      height={270}
                      className="w-full h-full"
                      objectFit="cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-xl font-medium mb-2">{featuredPost.title}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{featuredPost.date}</p>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{featuredPost.excerpt}</p>
                <a 
                  href={featuredPost.url} 
                  className="theme-button inline-flex items-center"
                >
                  Read More
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Favorite Items */}
          <div className="theme-card glass-effect rounded-md p-8 mb-12 relative">
            <h2 className="text-2xl font-semibold mb-6">My Favorite Things</h2>
            
            {favoriteItems.map((category) => (
              <div key={category.category} className="mb-8 last:mb-0">
                <h3 className="text-xl font-medium mb-4">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item) => (
                    <a 
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start p-4 rounded-md transition-all theme-card glass-effect"
                    >
                      <div 
                        className="mr-4 w-12 h-12 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: 'var(--pill-bg)' }}
                      >
                        {/* Replace with actual image */}
                        <span style={{ color: 'var(--text-muted)' }} className="text-xs">{item.name.substring(0, 2)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutMe;