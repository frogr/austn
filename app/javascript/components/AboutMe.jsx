import React, { useContext } from 'react';
import { ThemeContext } from './Theme';
import ResponsiveImage from './ResponsiveImage';

const AboutMe = () => {
  // Get theme context if available
  let theme = 'dark'; // Default to dark if context not available
  try {
    const themeContext = useContext(ThemeContext);
    if (themeContext) {
      theme = themeContext.theme;
    }
  } catch (e) {
    console.log('ThemeContext not available, using default theme');
  }
  
  const isDark = theme === 'dark';
  const skills = [
    { name: 'AI-Powered Development' },
    { name: 'Ruby on Rails Architecture' },
    { name: 'Teaching & Mentoring' },
  ];

  const featuredPost = {
    title: 'Why I Pair Program with Claude',
    excerpt: 'How AI transformed my development workflow - from idea to production in hours, not weeks. A deep dive into my process.',
    image: 'https://i.ibb.co/sd9h4Wk1/Chat-GPT-Image-Mar-27-2025-09-44-04-PM.png',
    url: '/blog/ai-pair-programming',
    date: 'January 2025',
  };

  const favoriteItems = [
    {
      category: 'Daily Drivers',
      items: [
        { name: 'Claude Code', description: 'My AI pair programmer & daily driver', url: 'https://claude.ai/' },
        { name: 'Rails', description: 'Still the best framework', url: 'https://rubyonrails.org/' },
        { name: 'Three.js', description: 'For when 2D gets boring', url: 'https://threejs.org/' },
      ],
    },
    {
      category: 'Inspiration Sources',
      items: [
        { name: 'Sandi Metz', description: 'POODR changed my life', url: 'https://sandimetz.com/' },
        { name: 'DHH', description: 'Opinionated software', url: 'https://dhh.dk/' },
        { name: 'IndieHackers', description: 'Building in public', url: 'https://www.indiehackers.com/' },
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
            className="text-center text-2xl font-mono mb-12 rounded-md p-4 glass-panel"
          >
            austn.net
          </div>
          
          {/* Hero Section */}
          <div 
            className="rounded-md p-8 mb-12 glass-morphism"
          >
            {/* Decorative gradient orbs removed for simpler look */}
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
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
              
              <h1 className="text-4xl font-bold mb-4">Austin French</h1>
              <p className="text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>Senior Backend Engineer</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill.name} 
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* About Me Section */}
          <div 
            className="rounded-md p-8 mb-12 glass-panel relative"
          >
            {/* Subtle decorative accent for glass panel */}
            <div 
              className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-md z-0"
            >
              <div 
                className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-lg bg-teal-500/5"
              ></div>
            </div>
            <h2 className="text-2xl font-semibold mb-6">About Me</h2>
            <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <p>
                My superpower is taking complex technical problems and making them human. Whether it's teaching 
                9 students at Lambda School, mentoring a CSM into 
                their first dev role, or architecting AI features that actual humans want to use - I believe 
                the best code serves people, not just machines.
              </p>
              <p>
                Currently shipping AI-powered features at CompanyCam, where I helped grow our Pages AI adoption 
                from 4% to 11% by obsessing over the user experience. Before that, I launched 9 pharmaceutical 
                brands at CoverMyMeds and built a $2MM donation platform for the Boys & Girls Club.
              </p>
              <p className="italic">
                "The best code is no code, the second best is code that writes itself with AI, and the third 
                best is code that makes someone's day easier."
              </p>
            </div>
          </div>
          
          {/* Featured Post */}
          <div 
            className="rounded-md p-8 mb-12 glass-morphism"
          >
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
                  style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
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
                  className="glass-button inline-flex items-center"
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
          <div 
            className="rounded-md p-8 mb-12 glass-panel relative"
          >
            {/* Subtle decorative accent for glass panel */}
            <div 
              className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-md z-0"
            >
              <div 
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-lg bg-indigo-500/5"
              ></div>
            </div>
            <h2 className="text-2xl font-semibold mb-6">Tools & Inspiration</h2>
            
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
                      className="group flex items-start p-4 rounded-md transition-all glass-panel"
                    >
                      {/* Emoji icon removed */}
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
