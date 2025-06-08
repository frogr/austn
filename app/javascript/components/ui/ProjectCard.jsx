import React from 'react';

const ProjectCard = ({ title, description, tech, link }) => {
  const Card = link ? 'a' : 'div';
  const props = link ? { href: link, className: 'card card-clickable block' } : { className: 'card' };
  
  return (
    <Card {...props}>
      <h4 className="heading-sm mb-xs">{title}</h4>
      <p className="text-sm text-secondary mb-sm">{description}</p>
      <span className="text-xs" style={{ color: 'var(--accent-secondary)' }}>
        {tech}
      </span>
    </Card>
  );
};

export default ProjectCard;