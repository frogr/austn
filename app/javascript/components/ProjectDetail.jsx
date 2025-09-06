import React from 'react';
import { useTheme } from './ThemeContext';

const ProjectDetail = ({ projectId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const projects = {
    'pages-ai': {
      title: 'Pages AI Assistant',
      category: 'AI-Powered Feature',
      description: 'Architected and shipped an AI-powered document generation feature at CompanyCam that uses natural language processing to help contractors create professional documents instantly.',
      technologies: ['Ruby on Rails', 'OpenAI API', 'React', 'PDF Processing', 'Redis', 'Sidekiq'],
      gradient: 'var(--gradient-accent)',
      highlights: [
        'Natural language interface for document generation',
        'Grew adoption from 4% to 11% of active companies',
        'Achieved 10x PDF file size optimization',
        'Processing thousands of documents daily',
        'Integrated OpenAI with existing Rails infrastructure',
        'Built intelligent template selection system'
      ],
      screenshot: null,
      accomplishments: [
        'Led the project from conception through production deployment, aligning with executives and product teams',
        'Optimized PDF generation pipeline, reducing file sizes by 90% while maintaining quality',
        'Designed a UI that made AI accessible to non-technical users in construction',
        'Built comprehensive error handling and fallback systems for AI failures',
        'Created detailed analytics to track feature adoption and user success metrics',
        'Mentored 3 developers through code reviews and architectural guidance'
      ],
      challenges: [
        'Challenge: Making AI responses consistent and reliable for business documents',
        'Solution: Implemented prompt engineering and validation layers to ensure quality',
      ]
    },
    'portfolio': {
      title: 'This Portfolio',
      category: 'Web Application',
      description: 'A modern portfolio website built with React and Rails, featuring a responsive design, dark mode support, and interactive project showcases.',
      technologies: ['React', 'Ruby on Rails', 'Tailwind CSS', 'JavaScript', 'Glass Morphism CSS'],
      gradient: 'var(--gradient-accent)',
      highlights: [
        'Server-side rendering with React on Rails',
        'Glass morphism design with custom CSS',
        'Dark/light theme support',
        'Responsive bento grid layout',
        'Interactive project showcases'
      ],
      screenshot: 'https://i.ibb.co/placeholder.png', // placeholder
      accomplishments: [
        'Built a fully responsive portfolio site that works seamlessly across all devices',
        'Implemented a custom theme system with dark/light mode toggle',
        'Created reusable React components for consistent design',
        'Integrated Rails backend with React frontend for optimal performance'
      ],
      challenges: []
    },
    'curl-lol': {
      title: 'curl.lol',
      category: 'SaaS Application',
      description: 'A fast and reliable URL shortener service with real-time analytics, custom domain support, and API access for developers.',
      technologies: ['Ruby on Rails', 'PostgreSQL', 'Redis', 'JavaScript', 'Sidekiq'],
      gradient: 'var(--gradient-vibrant)',
      externalLink: 'https://curl.lol',
      highlights: [
        'High-performance URL redirection',
        'Real-time click analytics',
        'Custom domain support',
        'RESTful API for developers',
        'QR code generation'
      ],
      screenshot: 'https://i.ibb.co/placeholder.png', // placeholder
      accomplishments: [
        'Built a scalable URL shortening service handling thousands of redirects daily',
        'Implemented real-time analytics using Redis for fast data access',
        'Created a RESTful API allowing developers to integrate the service',
        'Added custom domain support for branded short URLs'
      ],
      challenges: []
    },
    'hub': {
      title: 'Hub',
      category: 'SaaS Platform',
      description: 'A SaaS platform that helps developers get a jumpstart on their projects by providing production-ready React/Rails boilerplate code with authentication, payments, and more.',
      technologies: ['React', 'Rails', 'Stripe', 'Docker', 'PostgreSQL', 'AWS'],
      gradient: 'var(--gradient-cool)',
      highlights: [
        'Production-ready boilerplate code',
        'Integrated Stripe payments',
        'User authentication system',
        'Docker containerization',
        'CI/CD pipeline templates',
        'Multi-tenant architecture'
      ],
      screenshot: 'https://i.ibb.co/placeholder.png', // placeholder
      accomplishments: [
        'Created a comprehensive boilerplate solution saving developers weeks of setup time',
        'Integrated Stripe for seamless payment processing and subscription management',
        'Built a secure authentication system with JWT tokens and role-based access',
        'Implemented Docker containerization for easy deployment and scaling',
        'Built this 10x faster using Claude as my pair programmer'
      ],
      challenges: [
        'Challenge: Existing boilerplates were either too opinionated or not opinionated enough',
        'Solution: Created a balanced approach with sensible defaults but easy customization'
      ]
    },
    'bgca': {
      title: 'Boys & Girls Club Donation Platform',
      category: 'Non-profit Platform',
      description: 'Built the complete donation infrastructure for the Boys and Girls Club of America 2021 fundraiser, processing over $2 million in donations.',
      technologies: ['Node.js', 'Express', 'Stripe', 'Heroku', 'PostgreSQL'],
      gradient: 'linear-gradient(135deg, var(--pink-accent) 0%, var(--purple-accent) 100%)',
      highlights: [
        'Secure payment processing with Stripe',
        'High-availability architecture',
        'Real-time donation tracking',
        'Custom receipt generation',
        'Donor management system'
      ],
      screenshot: 'https://i.ibb.co/placeholder.png', // placeholder
      accomplishments: [
        'Successfully processed over $2MM in donations without any downtime',
        'Built a secure payment system compliant with PCI standards',
        'Implemented real-time donation tracking for campaign monitoring',
        'Created automated receipt generation and email delivery system',
        'Delivered on time despite tight deadline and high-pressure environment'
      ],
      challenges: [
        'Challenge: Zero tolerance for downtime during live fundraising event',
        'Solution: Built redundant systems and thoroughly tested every edge case',
      ]
    },
    'car-search': {
      title: 'Car Search Aggregator',
      category: 'Web Application',
      description: 'A web application that aggregates car listings from eBay and Craigslist, allowing users to search both platforms within a specified radius.',
      technologies: ['Node.js', 'React', 'Express', 'APIs', 'MongoDB'],
      gradient: 'linear-gradient(135deg, var(--indigo-accent) 0%, var(--teal-accent) 100%)',
      highlights: [
        'Integrated eBay and Craigslist APIs',
        'Location-based search',
        'Real-time data aggregation',
        'Responsive React frontend',
        'Advanced filtering options'
      ],
      screenshot: 'https://i.ibb.co/placeholder.png', // placeholder
      accomplishments: [
        'Successfully integrated multiple third-party APIs into a unified search interface',
        'Implemented location-based search with customizable radius',
        'Built efficient data aggregation to handle thousands of listings',
        'Created an intuitive UI for complex search filtering'
      ],
      challenges: []
    },
    'ai-experiments': {
      title: 'AI Experiments Lab',
      category: 'Personal Projects',
      description: 'A collection of 20+ projects built with Claude as my pair programmer. From CLI tools to web apps, these experiments push the boundaries of what\'s possible with AI-assisted development.',
      technologies: ['Claude AI', 'OpenAI', 'Python', 'Rails', 'JavaScript', 'RAG Systems'],
      
      gradient: 'linear-gradient(135deg, var(--pink-accent) 0%, var(--purple-accent) 100%)',
      highlights: [
        'TodayIn3Minutes - AI-powered news summarizer',
        'gitRAG - Repository knowledge extraction system',
        'Overcommunicator - Context-aware communication tool',
        'Obsidian to Web publishing pipeline',
        'Multiple game projects using Three.js',
        'YouTube channel documenting the process'
      ],
      screenshot: null,
      accomplishments: [
        'Built 20+ functional projects in record time using AI pair programming',
        'Created practical tools that solve real problems in my workflow',
        'Documented the entire process on YouTube to teach others',
        'Proved that AI accelerates development without sacrificing quality',
        'Developed a repeatable process for AI-assisted rapid prototyping'
      ],
      challenges: [
        'Challenge: Learning new technologies (like Three.js) quickly',
        'Solution: Used Claude to explain concepts and debug in real-time',
        'Challenge: Maintaining code quality while moving fast',
        'Solution: Established patterns and let AI handle boilerplate'
      ]
    },
    'backlit': {
      title: 'Backlit Platform Suite',
      category: 'Entertainment Industry',
      description: 'Long-term contractor building Rails applications for major television events including the Super Bowl, Oscars, and Grammys. Specialized in real-time coordination tools for live productions.',
      technologies: ['Ruby on Rails', 'Twilio', 'WebSockets', 'PostgreSQL', 'Redis', 'Multi-tenancy'],
      
      gradient: 'linear-gradient(135deg, var(--indigo-accent) 0%, var(--teal-accent) 100%)',
      highlights: [
        'SMS coordination system for 200+ Oscar nominees',
        'Multi-tenant platform for talent management',
        'Real-time communication during live broadcasts',
        'COVID-compliant venue coordination tools',
        'Supported Super Bowl, Oscars, and Grammys',
        'Built Backlit-Pro and Timeslot platforms'
      ],
      screenshot: null,
      accomplishments: [
        'Built SMS system that successfully coordinated 200+ people at Dolby Theatre during COVID',
        'Developed platforms used by major television productions without any failures',
        'Created multi-tenant architecture supporting hundreds of production companies',
        'Maintained long-term client relationship through consistent delivery',
        'Handled the pressure of live television events where failure wasn\'t an option'
      ],
      challenges: [
        'Challenge: Coordinating people during COVID restrictions at the Oscars',
        'Solution: Built SMS-based system with Twilio for contactless coordination',
        'Challenge: Supporting multiple production companies with different needs',
        'Solution: Implemented flexible multi-tenant architecture'
      ]
    },
    'minecraft-planner': {
      title: 'Minecraft Build Planner',
      category: 'Game Tool',
      description: 'A Three.js-based tool for planning Minecraft builds in 3D. Built entirely with Claude as my pair programmer while learning Three.js from scratch.',
      technologies: ['Three.js', 'JavaScript', 'React', 'WebGL'],
      
      gradient: 'linear-gradient(135deg, var(--green-accent) 0%, var(--blue-accent) 100%)',
      highlights: [
        '3D visualization of Minecraft builds',
        'Block placement and removal tools',
        'Save and load build designs',
        'Material selection system',
        'Camera controls for easy navigation',
        'Export builds as schematics'
      ],
      screenshot: null,
      accomplishments: [
        'Learned Three.js from zero to functional app in days with AI assistance',
        'Created intuitive 3D controls for complex building operations',
        'Built a tool that\'s actually useful for planning Minecraft projects',
        'Demonstrated how AI can accelerate learning new technologies'
      ],
      challenges: [
        'Challenge: Never worked with 3D graphics before',
        'Solution: Used Claude to explain concepts and debug rendering issues',
        'Challenge: Making 3D controls intuitive for users',
        'Solution: Iterated on UX with AI suggestions until it felt right'
      ]
    }
  };

  const project = projects[projectId];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Project Not Found</h1>
          <a href="/projects" className="btn btn-secondary">Back to Projects</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-8" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 readable-content">
        {/* Back Button */}
        <a href="/projects" className="inline-flex items-center gap-2 btn btn-secondary group mb-8">
          <span className="material-icons transform group-hover:-translate-x-1 transition-transform text-base">arrow_back</span>
          <span>Back to Projects</span>
        </a>

        {/* Project Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            {/* Emoji icon removed */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {project.title}
              </h1>
              <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>{project.category}</p>
            </div>
          </div>
          
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>

          {/* External Link */}
          {project.externalLink && (
            <a 
              href={project.externalLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn btn-primary mb-6"
            >
              Visit Live Site
              <span className="material-icons text-base">open_in_new</span>
            </a>
          )}

          {/* Technologies */}
          <div className="flex flex-wrap gap-2">
            {project.technologies.map(tech => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-sm glass-thick"
                style={{ color: 'var(--text-primary)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Screenshot Section */}
        {project.screenshot && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Preview</h2>
            <div className="glass-morphism rounded-lg overflow-hidden">
              <img 
                src={project.screenshot} 
                alt={`${project.title} screenshot`}
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.highlights.map((highlight, index) => (
              <div key={index} className="glass-panel p-4 rounded-lg flex items-start gap-3">
                <span className="material-icons text-lg" style={{ color: 'var(--accent-color)' }}>check_circle</span>
                <span style={{ color: 'var(--text-secondary)' }}>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accomplishments */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>What I Accomplished</h2>
          <div className="space-y-4">
            {project.accomplishments.map((accomplishment, index) => (
              <div key={index} className="glass-panel p-6 rounded-lg">
                <p style={{ color: 'var(--text-secondary)' }}>{accomplishment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges & Solutions */}
        {project.challenges && project.challenges.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Challenges & Solutions</h2>
            <div className="space-y-4">
              {project.challenges.map((item, index) => (
                <div key={index} className="glass-panel p-6 rounded-lg">
                  <p style={{ color: 'var(--text-secondary)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="glass-thick rounded-xl p-8 text-center relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10"
            style={{ background: project.gradient }}
          ></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Interested in this project?
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Let's discuss how I can help bring your ideas to life.
            </p>
            <a href="/#contact" className="btn btn-gradient-vibrant">
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
