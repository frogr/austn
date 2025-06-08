import React from 'react';

const StatsCard = ({ value, label, icon, gradient }) => {
  return (
    <div className="card text-center">
      <div className="heading-lg gradient-text mb-xs" style={{ backgroundImage: gradient }}>
        {value}
      </div>
      <p className="text-sm text-muted flex items-center justify-center gap-xs">
        {icon && <span className="material-icons icon-sm">{icon}</span>}
        {label}
      </p>
    </div>
  );
};

export default StatsCard;