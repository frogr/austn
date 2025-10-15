import React, { useState, useContext } from 'react';
import { ThemeContext } from './Theme';

const WorkExperience = () => {
  const [expandedJob, setExpandedJob] = useState(null);
  
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

  const jobs = [
    {
      id: 1,
      company: "CompanyCam",
      position: "Backend Engineer",
      period: "Nov 2023 - Aug 2025",
      location: "Remote",
      description: "Building AI features and workflows",
      highlights: [
        "Shipped Pages AI Assistant: OpenAI integration that grew adoption 4% → 11% while optimizing PDFs by 10x",
        "Led cross-functional initiatives from executive alignment to production, supporting 101% to 104% NRR growth",
        "Built Outputs team as sole backend engineer - hired, onboarded, and created a culture of shipping",
        "Co-founded 'Backend Experiments' for technical debt reduction",
      ],
      technologies: ["Rails", "OpenAI API", "PDF Processing", "Team Leadership"]
    },
    {
      id: 2,
      company: "CoverMyMeds",
      position: "Software Engineer",
      period: "July 2021 - October 2023",
      location: "Remote",
      description: "Launched pharmaceutical brands and turned a CSM into a developer - both equally rewarding.",
      highlights: [
        "Launched 9 pharmaceutical brands, increasing platform coverage by 40% and generating >$10MM ARR",
        "Tech Lead for Spravato, Renflexis, and Ontruzant - because someone has to make pharma software interesting",
        "Created VEST Framework for tracking tech debt (finally made it visible and actionable)",
        "Mentored a CSM into their first dev role - taught HTML to Ruby, proved anyone can code with the right teacher",
        "Refactored Loyaltyscript client, cutting setup effort by 3 cards per brand (the little wins matter)",
        "Onboarded 5 developers remotely - turned Zoom onboarding into an art form"
      ],
      technologies: ["Rails", "Technical Leadership", "Mentoring", "Legacy Refactoring"]
    },
    {
      id: 3,
      company: "Backlit",
      position: "Web Development Contractor",
      period: "Oct 2018 - Apr 2019, Dec 2020 - Apr 2021, Oct 2023 - Mar 2025",
      location: "Remote",
      description: "The person they call when the Super Bowl, Oscars, or Grammys need Rails magic.",
      highlights: [
        "Built SMS system coordinating 200+ Oscar nominees at Dolby Theatre during COVID (Twilio + Rails + prayers)",
        "Developed Backlit-Pro and Timeslot: multi-tenant platforms for entertainment industry",
        "Supported Super Bowl Halftime Show, Oscars, and Grammys broadcasts (yes, that Super Bowl)",
        "Long-term trusted contractor - they keep calling me back for the important stuff"
      ],
      technologies: ["Rails", "Twilio", "Multi-tenancy", "High-stakes Events"]
    },
    {
      id: 4,
      company: "T2 Modus",
      position: "Software Engineer",
      period: "July 2019 - September 2020",
      location: "Remote",
      description: "Processed customer data for car dealerships using Ruby scripts and LexisNexis data.",
      highlights: [
        "Wrote Ruby scripts and used TriFacta to purchase and process the data from 1,000 - 25,000 customers daily using LexisNexis",
        "Packaged and provided the data deliverables to car dealerships across the southeast US",
        "Contributed to automating customer data scripts, allowing dealerships to manage their own data using a web interface and our inhouse credit bank we monitored to handle billing",
        "This automation effort resulted in cutting out 10+ hours of weekly engineer work across our team of six engineers",
        "Owned and documented the customer data process and taught newer developers on the team how to manage our customer data processing pipeline for generating leads from LexisNexis"
      ],
      technologies: ["Ruby", "Data Processing", "Automation", "LexisNexis"]
    },
    {
      id: 5,
      company: "Lambda School (now BloomTech)",
      position: "Teaching Assistant",
      period: "March 2018 - August 2018",
      location: "Remote",
      description: "Where I discovered teaching code is as rewarding as writing it.",
      highlights: [
        "Led 9 students to 100% course completion (still my proudest metric)",
        "Weekly 1:1s with each student - because learning to code is personal",
        "Daily solution lectures and PR reviews - turned code review into a teaching moment",
        "Proved that with enough care, anyone can learn to code"
      ],
      technologies: ["Teaching", "Mentoring", "JavaScript", "React"]
    },
    {
      id: 6,
      company: "AI-Powered Rapid Development",
      position: "Builder",
      period: "2024 - Current",
      location: "My Home Office",
      description: "Building 20+ projects with Claude & Claude Code",
      highlights: [
        "Built Hub (Rails boilerplate), austn.net, URL shortener, game trackers with AI assistance",
        "Created arena shooter and Minecraft planner using Three.js - learned 3D on the fly with Claude",
        "Developing TodayIn3Minutes, gitRAG, Overcommunicator - tools that automate my life",
        "YouTube channel documenting the journey - teaching others to leverage AI",
        "Proved that AI doesn't replace developers, it makes us 10x more ambitious"
      ],
      technologies: ["Claude AI", "Rails", "Three.js", "RAG Systems"]
    },
    {
      id: 7,
      company: "Boys & Girls Club of America",
      position: "Contract Developer",
      period: "2021",
      location: "Remote (High-stakes Project)",
      description: "When $2MM is on the line, they called me.",
      highlights: [
        "Built 'Donate Now' functionality processing $2MM+ for national fundraiser",
        "Zero downtime during live event - because failure wasn't an option",
        "Node.js + Express + Stripe + lots of testing = happy donors",
        "Delivered on time, on budget, and with my sanity intact (mostly)"
      ],
      technologies: ["Node.js", "Express", "Stripe", "Heroku"]
    }
  ];

  const toggleExpand = (id) => {
    if (expandedJob === id) {
      setExpandedJob(null);
    } else {
      setExpandedJob(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Austin French - Senior Backend Engineer</h1>
      <div className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        <p className="mb-2">Turlock, California | hi@austn.net | github.com/frogr</p>
        <p className="text-lg">
          I ship features that matter, mentor humans not resources, and believe the best code tells a story. 
          Currently obsessed with AI-powered development and making complex systems feel human.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="theme-card glass-morphism overflow-hidden relative">
            {/* Decorative elements for glass effect */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-xl"
              style={{ 
                background: 'rgba(100, 150, 255, 0.1)', 
                animation: 'pulse-slow 12s infinite, float 15s ease-in-out infinite'  
              }}
            ></div>
            <div 
              className="p-6 cursor-pointer flex justify-between items-center"
              onClick={() => toggleExpand(job.id)}
            >
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{job.company}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{job.position}</p>
              </div>
              <div className="text-right">
                <p style={{ color: 'var(--text-secondary)' }}>{job.period}</p>
                <p style={{ color: 'var(--text-muted)' }}>{job.location}</p>
              </div>
            </div>
            
            {expandedJob === job.id && (
              <div className="px-6 pb-6">
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{job.description}</p>
                
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Key Achievements:</h3>
                <ul className="list-disc pl-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {job.highlights.map((highlight, index) => (
                    <li key={index} className="mb-1">{highlight}</li>
                  ))}
                </ul>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.technologies.map((tech, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                        color: 'var(--accent-color)' 
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 theme-card glass-panel relative">
        {/* Subtle decorative accent for glass panel */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-md z-0">
          <div 
            className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-lg"
            style={{ 
              background: 'rgba(130, 80, 220, 0.05)',
              animation: 'pulse-slow 15s infinite'
            }}
          ></div>
        </div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>The Tools I Actually Use</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Daily Drivers</h3>
            <div className="flex flex-wrap gap-2">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Ruby (my first love)</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >JavaScript</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Python (for AI stuff)</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Frameworks & Philosophy</h3>
            <div className="flex flex-wrap gap-2">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Rails (the majestic monolith)</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >React</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Three.js</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >POODR principles</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Clean architecture</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>AI & The Future</h3>
            <div className="flex flex-wrap gap-2">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Claude (my pair programmer)</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >OpenAI API</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >RAG systems</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >PostgreSQL</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Redis</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Docker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkExperience;