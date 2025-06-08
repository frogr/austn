import React from 'react';
import { useTheme } from './ThemeContext';

const ProjectDetail = ({ projectId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const projects = {
    'portfolio': {
      title: 'This Portfolio',
      category: 'Web Application',
      description: 'A modern portfolio website built with React and Rails, featuring a responsive design, dark mode support, and interactive project showcases.',
      technologies: ['React', 'Ruby on Rails', 'Tailwind CSS', 'JavaScript', 'Glass Morphism CSS'],
      image: '🌐',
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
      ]
    },
    'curl-lol': {
      title: 'curl.lol',
      category: 'SaaS Application',
      description: 'A fast and reliable URL shortener service with real-time analytics, custom domain support, and API access for developers.',
      technologies: ['Ruby on Rails', 'PostgreSQL', 'Redis', 'JavaScript', 'Sidekiq'],
      image: '🔗',
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
      ]
    },
    'hub': {
      title: 'Hub',
      category: 'SaaS Platform',
      description: 'A SaaS platform that helps developers get a jumpstart on their projects by providing production-ready React/Rails boilerplate code with authentication, payments, and more.',
      technologies: ['React', 'Rails', 'Stripe', 'Docker', 'PostgreSQL', 'AWS'],
      image: '🚀',
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
        'Implemented Docker containerization for easy deployment and scaling'
      ]
    },
    'bgca': {
      title: 'Boys & Girls Club Donation Platform',
      category: 'Non-profit Platform',
      description: 'Built the complete donation infrastructure for the Boys and Girls Club of America 2021 fundraiser, processing over $2 million in donations.',
      technologies: ['Node.js', 'Express', 'Stripe', 'Heroku', 'PostgreSQL'],
      image: '💝',
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
        'Created automated receipt generation and email delivery system'
      ]
    },
    'car-search': {
      title: 'Car Search Aggregator',
      category: 'Web Application',
      description: 'A web application that aggregates car listings from eBay and Craigslist, allowing users to search both platforms within a specified radius.',
      technologies: ['Node.js', 'React', 'Express', 'APIs', 'MongoDB'],
      image: '🚗',
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
      ]
    }
  };

  const project = projects[projectId];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Project Not Found</h1>
          <a href="/projects" className="btn btn-primary">Back to Projects</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <a href="/projects" className="inline-flex items-center gap-2 mb-8 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
          <span className="material-icons text-base">arrow_back</span>
          Back to Projects
        </a>

        {/* Project Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">{project.image}</div>
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