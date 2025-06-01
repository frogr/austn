import React, { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

const ContactInfo = () => {
  // Use ThemeContext via useContext hook
  try {
    // This component uses CSS variables so we don't need to track theme state
    // Just ensure ThemeContext is properly initialized
    useContext(ThemeContext);
  } catch (e) {
    console.log('ThemeContext not available, using default theme');
  }

  // Contact information
  const contactDetails = {
    email: 'austindanielfrench at gmail.com',
    github: 'github.com/frogr',
  };

  // Social media links with icons
  const socialLinks = [
    { name: 'GitHub', url: `https://${contactDetails.github}`, icon: 'code' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-primary">Contact Me</h1>
      <p className="text-base md:text-lg mb-6 md:mb-8 text-secondary">
        Get in touch for collaborations, questions, or just to say hello!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information Card */}
        <div className="theme-card glass-effect p-4 md:p-6 relative overflow-hidden">
          
          <div className="relative z-1">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-primary">Contact Information</h2>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-center">
                <span className="material-icons mr-3 text-accent">email</span>
                <div>
                  <span className="font-medium block text-primary">Email</span>
                  <a href={`mailto:${contactDetails.email}`} className="text-secondary hover:text-accent transition-colors duration-200">
                    {contactDetails.email}
                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <span className="material-icons mr-3 text-accent">code</span>
                <div>
                  <span className="font-medium block text-primary">GitHub</span>
                  <a href={`https://${contactDetails.github}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors duration-200">
                    {contactDetails.github}
                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <span className="material-icons mr-3 text-accent">business</span>
                <div>
                  <span className="font-medium block text-primary">LinkedIn</span>
                  <a href={`https://${contactDetails.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors duration-200">
                    {contactDetails.linkedin}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Quick Contact Form Card */}
        <div className="theme-card glass-effect p-4 md:p-6 relative overflow-hidden">
          
          <div className="relative z-1">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-primary">Let's Connect</h2>
            <p className="mb-4 text-secondary">Feel free to reach out on any of my social platforms:</p>
            
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-pill flex items-center text-primary hover:text-accent transition-colors duration-200"
                >
                  <span className="material-icons mr-2 text-sm">{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
            
            <div className="mt-6">
              <p className="text-muted text-sm">Business inquiries only:</p>
              <p className="text-secondary">business@example.com</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Availability Section */}
      <div className="theme-card glass-effect mt-6 p-4 md:p-6 text-center relative overflow-hidden">
        
        <div className="relative z-1">
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-primary">Current Availability</h2>
          <p className="text-secondary mt-2">Currently employed, but feel free to reach out and say hello!</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;