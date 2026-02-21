import React from 'react';
import { useTheme } from './ThemeContext';

const ProjectDetail = ({ projectId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const projects = {
    'ai-tools': {
      title: 'Austn.net AI Tools Suite',
      category: 'AI Platform',
      description: 'Self-hosted AI platform running on personal GPU infrastructure. Integrates ComfyUI for image generation, Chatterbox for voice cloning/TTS, Hunyuan3D for 3D model generation, and local LLMs via LMStudio. All tools are free to use and demonstrate real-world local LLM deployment.',
      technologies: ['Ruby on Rails', 'Python', 'ComfyUI', 'LMStudio', 'React', 'Sidekiq'],
      gradient: 'var(--gradient-accent)',
      externalLink: 'https://austn.net/ai',
      highlights: [
        '7+ AI tools accessible from a single platform',
        'Self-hosted on personal GPU — no API costs',
        'Image generation with ComfyUI and Stable Diffusion',
        'Voice cloning and text-to-speech with Chatterbox',
        '3D model generation with Hunyuan3D',
        'Local LLMs that actually work in production'
      ],
      screenshot: null,
      accomplishments: [
        'Built a unified platform integrating 7+ AI tools under one interface',
        'Self-hosted everything on personal GPU infrastructure eliminating API costs',
        'Integrated ComfyUI workflows for production-quality image generation',
        'Set up voice cloning and TTS with Chatterbox',
        'Deployed Hunyuan3D for 3D model generation from text and images',
        'Made all tools free and open for anyone to try'
      ],
      challenges: [
        'Challenge: Running multiple AI models on consumer GPU hardware',
        'Solution: Optimized model loading and memory management to share GPU resources',
        'Challenge: Making AI tools accessible to non-technical users',
        'Solution: Built intuitive web interfaces with Rails and React for each tool'
      ]
    },
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
    'tinyrails': {
      title: 'TinyRails',
      category: 'Learning Project',
      description: 'Rebuilt Rails from scratch to understand how web frameworks actually work. Educational project implementing core framework features including routing, controllers, and data persistence.',
      technologies: ['Ruby 3.1+', 'Rack', 'JSON', 'ERB Templates', 'Web Frameworks'],
      gradient: 'var(--gradient-cool)',
      externalLink: 'https://github.com/frogr/tinyrails',
      highlights: [
        'Custom routing system mapping URLs to controllers',
        'Rack interface integration for web server communication',
        'Controller architecture with automatic template rendering',
        'FileModel: JSON-based database with CRUD operations',
        'Working demo app (best_tweets) validating functionality',
        'Ruby 3.1+ implementation with modern patterns'
      ],
      screenshot: null,
      accomplishments: [
        'Demystified web framework internals by rebuilding core Rails features from scratch',
        'Implemented custom router that parses URLs and dispatches to controller actions',
        'Built Rack integration enabling communication with standard Ruby web servers',
        'Created file-based JSON database proving you don\'t always need PostgreSQL',
        'Developed working companion app demonstrating the framework handles real use cases',
        'Gained deep understanding of request/response cycles and MVC architecture'
      ],
      challenges: [
        'Challenge: Understanding how routing actually maps URLs to code execution',
        'Solution: Built custom router handling path parsing and controller dispatch step-by-step',
        'Challenge: Making it actually work like Rails without copying Rails code',
        'Solution: Focused on core concepts and implemented the simplest version that could work'
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
    'ai-lab': {
      title: 'AI Experiments Lab',
      category: 'Personal Projects',
      description: 'A comprehensive collection of 20+ projects spanning gaming apps, web platforms, developer tools, games, hardware projects, and AI/ML experiments. Built with Claude as my pair programmer, these projects demonstrate rapid prototyping and AI-assisted development.',
      technologies: ['Claude AI', 'React', 'Rails', 'Python', 'Node.js', 'Three.js', 'OpenDota API', 'Arduino', 'Godot', 'Stable Diffusion'],

      gradient: 'linear-gradient(135deg, var(--pink-accent) 0%, var(--purple-accent) 100%)',
      highlights: [
        'Gaming: Dota 2 Progress Tracker with OpenDota API integration, League of Matchups with live search',
        'Web Apps: ECHOROOMS ($20/month subscription platform), TodayIn3Minutes (AI productivity digest)',
        'Developer Tools: austncoder (local LLM agent), GitRAG (git history query tool), GitHub Minifier',
        'Games: Frogger and Chess in React, Godot 2D/3D game prototypes',
        'Hardware: Arduino LED projects, Morse code transmitter, PiHole ad blocking',
        'AI/ML: BirdOrNot classifier, ComfyUI workflows with Stable Diffusion',
        'Learning Projects: TinyRails, C++ servers, database fundamentals'
      ],
      screenshot: null,
      accomplishments: [
        'Built full-stack Dota 2 tracker with match history, hero analytics, performance graphs, and MMR tracking',
        'Set up local AI image generation with ComfyUI workflows and custom prompting pipelines',
        'Hardware projects: Multiple LED circuits with PWM control, morse code communication systems',
        'Deployed PiHole for network-wide ad blocking on Raspberry Pi',
        'Developed TodayIn3Minutes: daily productivity digest synthesizing Gmail, Calendar, and Slack with OAuth',
        'Built austncoder: Python app using local models for agentic codebase search similar to Claude Code',
        'Created functional games: Frogger with collision detection, Chess with AI opponent',
        'Built wardrobe fitting scheduling system replacing Excel-based workflows with capacity tracking',
        'Developed Discord-like IRC MVP with accounts, friends, private messages, and role management',
        'Prototyped 2D physics platformers and 3D Zelda-like games while learning Godot'
      ],
      challenges: [
        'Challenge: Integrating complex APIs like OpenDota and U.GG scraping',
        'Solution: Used Claude to debug API responses and handle rate limiting gracefully',
        'Challenge: Building subscription platform with Stripe integration from scratch',
        'Solution: Leveraged AI pair programming to implement payment flows and user management quickly',
        'Challenge: Learning Three.js, Godot, and Arduino simultaneously',
        'Solution: Used Claude to explain fundamentals and debug issues in real-time',
        'Challenge: Building RAG systems and embedding-based search',
        'Solution: Iterated on architecture with AI assistance to implement semantic search correctly'
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
    <div className="min-h-screen p-2 sm:p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <a 
            href="/projects" 
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.9)'
            }}
          >
            ← Back to Projects
          </a>
        </div>

        {/* Main Content Card */}
        <div 
          className="rounded-lg overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Header Section */}
          <div className="px-3 sm:px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  {project.title}
                </h1>
                <p className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {project.category}
                </p>
              </div>
              {project.externalLink && (
                <a 
                  href={project.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded font-medium transition-all hover:opacity-90"
                  style={{
                    background: 'var(--accent-color)',
                    color: '#000'
                  }}
                >
                  Visit Live Site ↗
                </a>
              )}
            </div>
            
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {project.description}
            </p>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {project.technologies.map(tech => (
                <span
                  key={tech}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Screenshot Section */}
          {project.screenshot && (
            <div className="px-3 sm:px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>
                Preview
              </h2>
              <div 
                className="rounded overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <img 
                  src={project.screenshot} 
                  alt={`${project.title} screenshot`}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Key Features */}
          <div className="px-3 sm:px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {project.highlights.map((highlight, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded flex items-start gap-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-green-400 text-sm mt-0.5">✓</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Accomplishments */}
          <div className="px-3 sm:px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>
              What I Accomplished
            </h2>
            <div className="space-y-3">
              {project.accomplishments.map((accomplishment, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {accomplishment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges & Solutions */}
          {project.challenges && project.challenges.length > 0 && (
            <div className="px-3 sm:px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>
                Challenges & Solutions
              </h2>
              <div className="space-y-3">
                {project.challenges.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="px-3 sm:px-6 py-6 text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Interested in this project?
            </h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Book a time to chat or send me an email.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2 rounded font-medium transition-all hover:scale-105"
                style={{ background: 'var(--accent-color)', color: '#000' }}
              >
                <span className="material-icons text-sm">calendar_today</span>
                Book a Meeting
              </a>
              <a
                href="mailto:hi@austn.net"
                className="inline-flex items-center gap-2 px-5 py-2 rounded font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              >
                <span className="material-icons text-sm">email</span>
                hi@austn.net
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
