import React, { useState } from 'react';

const WorkExperience = () => {
  const [expandedJob, setExpandedJob] = useState(null);

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
      <h1 className="text-3xl font-bold mb-6 text-white">My Professional Journey</h1>
      <p className="text-lg mb-8 text-gray-300">
        I'm a Ruby on Rails developer with expertise in building robust backend systems, mentoring teams, and delivering high-value features.
        Below are highlights from my professional experience:
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="dark-card overflow-hidden">
            <div 
              className="p-6 cursor-pointer flex justify-between items-center"
              onClick={() => toggleExpand(job.id)}
            >
              <div>
                <h2 className="text-xl font-semibold text-white">{job.company}</h2>
                <p className="text-gray-300">{job.position}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-300">{job.period}</p>
                <p className="text-gray-400">{job.location}</p>
              </div>
            </div>
            
            {expandedJob === job.id && (
              <div className="px-6 pb-6">
                <p className="mb-4 text-gray-300">{job.description}</p>
                
                <h3 className="font-semibold mb-2 text-white">Key Achievements:</h3>
                <ul className="list-disc pl-5 mb-4 text-gray-300">
                  {job.highlights.map((highlight, index) => (
                    <li key={index} className="mb-1">{highlight}</li>
                  ))}
                </ul>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.technologies.map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-700 text-yellow-300 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 dark-card">
        <h2 className="text-xl font-semibold mb-4 text-white">Technical Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2 text-white">Languages</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-700 text-yellow-300 rounded-full text-sm">Ruby</span>
              <span className="px-3 py-1 bg-gray-700 text-yellow-300 rounded-full text-sm">JavaScript</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-white">Frameworks/Libraries</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-700 text-yellow-300 rounded-full text-sm">Rails</span>
              <span className="px-3 py-1 bg-gray-700 text-yellow-300 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-gray-700 text-yellow-300 rounded-full text-sm">Node</span>
              <span className="px-3 py-1 bg-gray-700 text-yellow-300 rounded-full text-sm">Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkExperience;