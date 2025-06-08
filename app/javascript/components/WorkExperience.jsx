import React, { useState, useContext } from 'react';
import { ThemeContext } from './ThemeContext';

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
      position: "Software Engineer",
      period: "Nov 2023 - Current (April 2025)",
      location: "Remote",
      description: "Working on the Workflows and Outputs teams to deliver key features and build team capacity.",
      highlights: [
        "Worked on the Workflows team to deliver key pieces of work: Report Share Links, Project Page share links, DocRaptor PDF API endpoints, and more",
        "Built out the Outputs team as the sole backend engineer, with a focus on hiring/onboarding new folks",
        "Consistently demonstrated Show Up values through key initiatives like the Engineering Book Club, where we reviewed Fowler's Refactoring and Metz's POODR"
      ],
      technologies: ["Ruby", "Rails", "Backend Development", "Team Building"]
    },
    {
      id: 2,
      company: "CoverMyMeds",
      position: "Software Engineer",
      period: "July 2021 - October 2023",
      location: "Remote",
      description: "Worked in the Program Launch BU to launch pharmaceutical brands and improve platform capabilities.",
      highlights: [
        "Worked in the Program Launch BU to launch eight brands into CoverMyMeds, increasing the amount of pharmaceutical brands on our platform by 30% and delivering on sales generating >$10MM in ARR",
        "Developed VEST Framework and reporting system for collecting Technical Debt encountered by members of our Product and Engineering team",
        "Onboarded five new developers, caught them up to speed about our system, team processes, and set up their local machines remotely",
        "Mentored a non-technical CMM employee, teaching basic HTML, CSS, JS, and Ruby to build skills required to land first job as an associate developer at CMM",
        "Tech Lead for Spravato, Renflexis, and Ontruant launches",
        "Responsible for the refactoring of CoverMyMeds' Loyaltyscript client, making it easier to launch new brands' Copay and Adherence programs and improving automation across the board"
      ],
      technologies: ["Ruby", "Rails", "Technical Leadership", "Mentoring"]
    },
    {
      id: 3,
      company: "Backlit",
      position: "Web Developer",
      period: "December 2020 - April 2021",
      location: "Remote",
      description: "Developed enhancements/features for Ruby on Rails applications used by television clients.",
      highlights: [
        "Continued developing enhancements/features for our Ruby on Rails application used by television clients",
        "Spearheaded the construction of our new SaaS platform: Backlit-Pro, a Rails application that allows performers to build searchable user profiles and producers to build projects with multi-tenancy support",
        "Built an SMS contact-book tool used to direct 200+ Oscars nominees and production staff in and out of the Dolby theater in order to remain COVID-19 compliant. Written using Ruby on Rails and used Twilio to send the texts"
      ],
      technologies: ["Ruby on Rails", "Twilio", "SaaS", "Multi-tenancy"]
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
      company: "Backlit",
      position: "Web Developer",
      period: "October 2018 - April 2019",
      location: "Remote",
      description: "Sole developer for flagship Ruby on Rails product used by television clients.",
      highlights: [
        "Sole developer dedicated to developing features, enhancements, and bug fixes for our flagship Ruby on Rails product used by television clients like the Superbowl and ABC television"
      ],
      technologies: ["Ruby on Rails", "Full Stack Development"]
    },
    {
      id: 6,
      company: "Lambda School AKA BloomTech",
      position: "Teaching Assistant",
      period: "March 2018 - August 2018",
      location: "Remote",
      description: "Leveraged passion for teaching to lead students in small classroom environments.",
      highlights: [
        "Leveraged my passion for teaching to lead 9 students in a small classroom environment",
        "Had 1:1 interviews with each student every week, leading to a 100% course completion rate",
        "Gave solution lectures and reviewed pull requests daily"
      ],
      technologies: ["Teaching", "Mentoring", "Code Review"]
    },
    {
      id: 7,
      company: "Scrimbox",
      position: "Junior Web Developer",
      period: "April 2017 - September 2017",
      location: "Remote",
      description: "Worked with MEAN stack for production gaming application.",
      highlights: [
        "Worked within the MEAN stack for a production gaming application and Wordpress for minor website edits"
      ],
      technologies: ["MEAN Stack", "MongoDB", "Express", "Angular", "Node.js", "WordPress"]
    },
    {
      id: 8,
      company: "Boys and Girls Club of America",
      position: "Contract Developer",
      period: "2021",
      location: "Project",
      description: "Built donation functionality handling over $2MM in transactions for major nonprofit.",
      highlights: [
        "Subcontracted by a previous employer to build out the \"Donate Now\" functionality for the Boys and Girls Club of America 2021 fundraiser donation page, handling over $2MM dollars in transactions",
        "Used NodeJS and Express to build a Stripe Integration along with a webserver to build and serve the content to the frontend, with Heroku for deployment"
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
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Austin French - Web Developer</h1>
      <div className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        <p className="mb-2">Turlock, California | (209) 447-9691 | austindanielfrench@gmail.com</p>
        <p className="text-lg">
          Experienced Ruby on Rails developer with expertise in building robust backend systems, mentoring teams, and delivering high-value features.
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
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Technical Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Libraries/Frameworks</h3>
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
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >REST API design</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >OOP design</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Tools/Databases</h3>
            <div className="flex flex-wrap gap-2">
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
              >MongoDB</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >GraphQL</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Git</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Jenkins</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Sentry</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Splunk</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >DataDog</span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: isDark ? '#374151' : '#f3f4f6', 
                  color: 'var(--accent-color)' 
                }}
              >Heroku</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkExperience;