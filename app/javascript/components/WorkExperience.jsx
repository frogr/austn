import React, { useState, useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

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
      period: "Nov 2023 - Current (March 2025)",
      location: "Remote",
      description: "Working on advanced Ruby on Rails applications with a focus on enabling new features and improving developer workflows.",
      highlights: [
        "Built a self-sufficient \"Backend Experiments\" system enabling Activity Feeds and consolidated PDF generation",
        "Established the Outputs team as a mentor figure, bringing new hires up to speed",
        "Solved security issues with permanent URLs visible in the public internet",
        "Worked on the Workflows team to enable new features and collect user data"
      ],
      technologies: ["Ruby", "Rails", "Backend Development", "Mentoring"]
    },
    {
      id: 2,
      company: "CoverMyMeds",
      position: "Software Engineer",
      period: "July 2021 - August 2023",
      location: "Remote",
      description: "Worked in the Program Launch Business Unit to expand the platform's pharmaceutical brand offerings, delivering significant value.",
      highlights: [
        "Launched nine brands into CoverMyMeds, increasing pharmaceutical brands by 40% and generating >$10MM in ARR",
        "Developed VEST Framework for collecting Technical Debt encountered by Product and Engineering",
        "Served as Tech Lead for Spravato, Renflexis, and Ontruant launches",
        "Refactored Loyaltyscript client, reducing effort to launch new brands' Copay and Adherence programs",
        "Onboarded five new developers and mentored a non-technical employee into their first dev role"
      ],
      technologies: ["Ruby", "Rails", "Technical Leadership", "Mentoring"]
    },
    {
      id: 3,
      company: "Backlit",
      position: "Web Developer",
      period: "December 2020 - April 2021",
      location: "Remote",
      description: "Developed Ruby on Rails applications for television clients, including innovative solutions for COVID-19 compliance at major events.",
      highlights: [
        "Spearheaded construction of Backlit-Pro SaaS platform for performers to build searchable profiles with multi-tenancy support",
        "Built SMS contact-book tool using Rails and Twilio to direct 200+ Oscars nominees during COVID-19 protocols",
        "Enhanced Rails applications used by television clients"
      ],
      technologies: ["Ruby on Rails", "Twilio", "SaaS", "Multi-tenancy"]
    },
    {
      id: 4,
      company: "Boys and Girls Club of America",
      position: "Contract Developer",
      period: "2021",
      location: "Project",
      description: "Built donation functionality handling over $2MM in transactions for a major nonprofit organization.",
      highlights: [
        "Implemented \"Donate Now\" functionality for the 2021 fundraiser donation page",
        "Built Stripe integration using NodeJS and Express",
        "Created webserver to build and serve content to the frontend",
        "Deployed solution using Heroku"
      ],
      technologies: ["NodeJS", "Express", "Stripe", "Heroku"]
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
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>My Professional Journey</h1>
      <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
        I'm a Ruby on Rails developer with expertise in building robust backend systems, mentoring teams, and delivering high-value features.
        Below are highlights from my professional experience:
      </p>
      
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
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Technical Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Languages</h3>
            <div className="flex flex-wrap gap-2">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Ruby</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >JavaScript</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Frameworks/Libraries</h3>
            <div className="flex flex-wrap gap-2">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Rails</span>
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
              >Node</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkExperience;