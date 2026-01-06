import React from 'react';
import { useTheme } from './ThemeContext';

const Resume = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const experience = [
    {
      company: "CompanyCam",
      companyUrl: "https://companycam.com/",
      companyDescription: "CompanyCam is the #1 photo documentation app in construction. 140,000+ contractors use it to capture GPS/time-stamped job site photos, generate reports, and communicate with clients.",
      position: "Backend Engineer",
      location: "Remote",
      period: "Nov 2023 - Aug 2025",
      highlights: [
        "Built Pages AI Assistant allowing contractors to type or speak into their phone on a job site and get professional documentation generated instantly. 3,000+ daily generations across the platform.",
        "Drove Pages adoption from 4% to 11% of users by offering AI-generated automations after improving RubyLLM infrastructure and tooling enabling voice commands, context-aware invoice generation, and natural language search across the platform",
        "Optimized PDF exports achieving 10x size reduction implementing streaming, compression, and async processing for 10,000+ daily exports",
        "Architected Share Link feature for all user-generated assets to enable users to safely and securely share their assets with clients, payers, and other stakeholders off-platform",
        "Mentored 3 developers, accelerating their onboarding through code reviews and architectural guidance"
      ],
      techStack: ["Ruby on Rails", "PostgreSQL", "GraphQL", "Sidekiq", "Node", "AWS", "Redis", "React", "TypeScript"]
    },
    {
      company: "CoverMyMeds",
      companyUrl: "https://www.covermymeds.health/",
      companyDescription: "CoverMyMeds is the industry standard for electronic prior authorization. Connected to 950,000+ healthcare providers, 50,000+ pharmacies, and nearly every US health plan. Part of McKesson.",
      position: "Software Engineer",
      location: "Remote",
      period: "July 2021 - October 2023",
      highlights: [
        "Generated $10M+ ARR launching 9 pharmaceutical brands, increasing SaaS platform coverage by 40%",
        "Tech lead for major launches (Spravato, Renflexis, Ontruzant), coordinating across engineering and stakeholders. Built Configuration Station to automate brand launches which freed engineering from repetitive work and let non-technical staff handle new brand onboarding independently",
        "Created VEST Framework for technical debt tracking, adopted company-wide",
        "Mentored 5 developers including transitioning a CSM into engineering role"
      ],
      techStack: ["Ruby on Rails", "Hotwire", "Stimulus", "PostgreSQL", "Node", "AWS", "Redis", "Kafka"]
    },
    {
      company: "Backlit",
      companyUrl: "https://getbacklit.com/",
      companyDescription: "Backlit manages talent logistics for major live entertainment events, coordinating performers, schedules, and compliance across productions.",
      position: "Web Development Contractor",
      location: "Remote",
      period: "October 2018 - April 2019, December 2020 - April 2021, October 2023 - March 2025",
      highlights: [
        "Built systems for major events (Super Bowl, Oscars, Grammys) handling 100K+ performer's workflows",
        "Developed SMS coordination system managing 200+ Oscars attendees for COVID compliance"
      ],
      techStack: []
    },
    {
      company: "T2 Modus",
      companyUrl: "https://t2modus.com/",
      companyDescription: "T2 Modus provides identity verification and compliance tools for auto dealerships.",
      position: "Software Engineer",
      location: "Remote",
      period: "July 2019 - September 2020",
      highlights: [
        "Reduced onboarding time from 3 weeks to 1 week through documentation and training",
        "Automated data pipeline processing 25K daily customers using batch processing and database partitioning, saving 10+ engineer-hours weekly and reducing job runtime from 6 hours to 45 minutes"
      ],
      techStack: []
    },
    {
      company: "Lambda School (BloomTech)",
      companyUrl: null,
      companyDescription: null,
      position: "Teaching Assistant",
      location: "Remote",
      period: "March 2018 - August 2018",
      highlights: [
        "100% student completion rate through personalized mentoring of 9 students. Delivered daily technical lectures and code reviews"
      ],
      techStack: []
    }
  ];

  const projects = [
    {
      title: "Tinyrails",
      year: "2025",
      description: "To dive deeper into the fundamentals of Ruby on Rails, I rebuilt the framework from scratch using Ruby and Rack. Supports MVC CRUD operations using Rack to route requests to controllers, Eribus for template rendering, and a JSON database."
    },
    {
      title: "Austn.net",
      year: "2025",
      description: "Built austn.net, my blog/portfolio that also hosts a suite of 9 AI-powered tools (image generation, image to 3D models, voice cloning, song stem file separation, background removal, songwriting, etc.) self-hosted on personal GPU infrastructure via Python Flask server utilizing ComfyUI, LMStudio, and Hunyuan3D"
    },
    {
      title: "Boys and Girls Club of America",
      year: "2021",
      description: "Subcontracted by a previous employer to build out the \"Donate Now\" functionality for the Boys and Girls Club of America 2021 fundraiser donation page, processing $2MM+ in donations using NodeJS, Express, Stripe, and Heroku."
    }
  ];

  const skills = {
    languages: ["Ruby", "JavaScript", "SQL"],
    frameworks: ["Rails", "Node.js", "Express", "React"],
    infrastructure: ["PostgreSQL", "Redis", "Sidekiq", "Docker", "AWS", "Heroku"],
    tools: ["Git", "CI/CD (Jenkins, GitHub Actions)", "Monitoring (Sentry, DataDog, Splunk)"],
    practices: ["TDD/BDD", "API Design", "Performance Optimization", "Code Review", "Agile/Scrum"]
  };

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Austin French
          </h1>
          <p className="text-xl mb-4" style={{ color: 'var(--accent-color)' }}>
            Software Engineer - Rails/JS
          </p>
          <div className="flex flex-wrap gap-4 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            <span>Turlock, California, 95382</span>
            <span className="hidden sm:inline">|</span>
            <span>(209) 447-9691</span>
            <span className="hidden sm:inline">|</span>
            <a href="mailto:austindanielfrench@gmail.com" className="hover:underline" style={{ color: 'var(--accent-color)' }}>
              austindanielfrench@gmail.com
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="https://austn.net/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent-color)' }}>
              My website
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="https://github.com/frogr" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent-color)' }}>
              GitHub
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="https://www.linkedin.com/in/austindanielfrench/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent-color)' }}>
              LinkedIn
            </a>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            Summary
          </h2>
          <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Backend-focused engineer with 7 years of Ruby on Rails and JavaScript experience, and a passion for data-oriented product engineering. Built AI tools at CompanyCam giving contractors dozens of weekly hours back from rote documentation. At CoverMyMeds, launched $10M+ in pharmaceutical brands first then built the automations that let non-engineers do it going forward. I love to run experiments, research user behavior, and deeply understand business cases to deliver impact at scale. Recently I've been working on adding AI-superpowers to my website: austn.net!
          </p>
        </section>

        {/* Experience */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            Experience
          </h2>
          <div className="space-y-8">
            {experience.map((job, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {job.companyUrl ? (
                        <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent-color)' }}>
                          {job.company}
                        </a>
                      ) : (
                        job.company
                      )}
                      <span style={{ color: 'var(--text-secondary)' }}>, {job.location}</span>
                    </h3>
                    <p className="italic" style={{ color: 'var(--text-secondary)' }}>{job.position}</p>
                  </div>
                  <p className="text-sm mt-1 sm:mt-0 sm:text-right whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {job.period}
                  </p>
                </div>

                {job.companyDescription && (
                  <p className="text-sm italic mb-3" style={{ color: 'var(--text-muted)' }}>
                    {job.companyDescription}
                  </p>
                )}

                <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  {job.highlights.map((highlight, hIndex) => (
                    <li key={hIndex}>{highlight}</li>
                  ))}
                </ul>

                {job.techStack.length > 0 && (
                  <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Tech Stack:</span>{' '}
                    {job.techStack.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            Projects
          </h2>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {project.title}{' '}
                  <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({project.year})</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Skills */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            Technical Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Languages</h4>
              <div className="flex flex-wrap gap-2">
                {skills.languages.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      color: 'var(--accent-color)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Frameworks</h4>
              <div className="flex flex-wrap gap-2">
                {skills.frameworks.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      color: 'var(--accent-color)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Infrastructure</h4>
              <div className="flex flex-wrap gap-2">
                {skills.infrastructure.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      color: 'var(--accent-color)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Tools</h4>
              <div className="flex flex-wrap gap-2">
                {skills.tools.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      color: 'var(--accent-color)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Practices</h4>
              <div className="flex flex-wrap gap-2">
                {skills.practices.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      color: 'var(--accent-color)'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Download/Print */}
        <div className="text-center pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--accent-color)', color: '#000' }}
          >
            <span className="material-icons text-base">print</span>
            Print Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resume;
