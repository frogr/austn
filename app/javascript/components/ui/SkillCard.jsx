import React from 'react';

const SkillCard = ({ title, skills, color }) => {
  return (
    <div className="card card-clickable">
      <h4 className="font-medium flex items-center gap-xs text-sm">
        <span 
          className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{ backgroundColor: color }}
        />
        {title}
      </h4>
      <p className="text-xs pl-5 mt-xs text-muted">
        {skills}
      </p>
    </div>
  );
};

export default SkillCard;