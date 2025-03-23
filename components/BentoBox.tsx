
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type BentoBoxProps = {
  children: ReactNode;
  className?: string;
  heading?: string;
  subheading?: string;
  to?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  terminal?: boolean;
  status?: 'online' | 'offline' | 'warning' | null;
  variant?: 'default' | 'rails' | 'postgres' | 'code';
  animation?: 'none' | 'vu-meter' | 'loading-bar' | 'sine-wave' | 'pulse';
};

const BentoBox = ({ 
  children, 
  className = "", 
  heading, 
  subheading,
  to,
  size = 'md',
  gradient = false,
  terminal = false,
  status = null,
  variant = 'default',
  animation = 'none'
}: BentoBoxProps) => {
  
  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 row-span-2',
    lg: 'col-span-2 row-span-1',
    xl: 'col-span-2 row-span-2',
  };
  
  const statusColors = {
    online: 'bg-terminal-success',
    offline: 'bg-terminal-error',
    warning: 'bg-terminal-warning'
  };
  
  const variantClasses = {
    default: 'border-gray-700',
    rails: 'card-rails',
    postgres: 'card-postgres',
    code: 'border-neon-green/30'
  };

  // Different animation styles
  const renderAnimation = () => {
    switch(animation) {
      case 'vu-meter':
        return <div className="vu-meter w-0"></div>;
      case 'loading-bar':
        return <div className="loading-bar w-0"></div>;
      case 'sine-wave':
        return <div className="sine-wave h-2"></div>;
      case 'pulse':
        return <div className="pulse-dot"></div>;
      default:
        return null;
    }
  };
  
  const content = (
    <div className={`
      relative overflow-hidden p-3
      transition-all duration-300 ease-out
      ${gradient ? 'bg-cyber-gradient bg-opacity-20' : 'bg-terminal-dark bg-opacity-80 backdrop-blur-sm'}
      border ${variantClasses[variant]} shadow-lg
      hover:shadow-[0_0_8px_rgba(155,135,245,0.3)] 
      ${variant === 'rails' ? 'hover:shadow-[0_0_8px_rgba(204,0,0,0.3)]' : ''}
      ${variant === 'postgres' ? 'hover:shadow-[0_0_8px_rgba(51,103,145,0.3)]' : ''}
      ${variant === 'code' ? 'hover:shadow-[0_0_8px_rgba(57,255,20,0.3)]' : ''}
      group
      ${sizeClasses[size]}
      ${className}
    `}
    style={{
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 98% 100%, 0% 100%)'
    }}
    >
      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay"></div>
      
      {/* Terminal title bar */}
      {terminal && (
        <div className="absolute top-0 left-0 right-0 h-6 bg-terminal-gray flex items-center px-2 border-b border-gray-700">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-terminal-error"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-terminal-warning"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-terminal-success"></div>
          </div>
          <div className="text-center text-xs text-gray-400 flex-grow font-mono">
            {heading ? heading : 'terminal'}
          </div>
        </div>
      )}
      
      {/* Status indicator */}
      {status && (
        <div className="absolute top-2 right-2 flex items-center">
          <span className="text-xs mr-2 font-mono">{status === 'online' ? 'ONLINE' : status === 'offline' ? 'OFFLINE' : 'WARNING'}</span>
          <div className={`w-2 h-2 ${statusColors[status]} ${status === 'online' ? 'animate-server-pulse' : ''}`}
               style={{ clipPath: 'polygon(50% 0%, 90% 50%, 50% 100%, 10% 50%)' }}></div>
        </div>
      )}
      
      {/* Animation container at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4">
        {renderAnimation()}
      </div>
      
      {/* Content */}
      <div className={`h-full flex flex-col ${terminal ? 'pt-6' : ''}`}>
        {!terminal && heading && (
          <h3 className="text-lg font-bold mb-1 font-mono group-hover:text-neon-purple text-glitch transition-colors duration-300" data-text={heading}>
            {heading}
            {variant === 'rails' && <span className="rails-red">_</span>}
            {variant === 'postgres' && <span className="postgres-blue">_</span>}
            {variant === 'code' && <span className="text-neon-green">_</span>}
          </h3>
        )}
        {subheading && (
          <p className="text-sm text-gray-400 mb-2 font-mono">{subheading}</p>
        )}
        <div className="flex-grow">{children}</div>
      </div>
      
      {/* Pixel corner decoration */}
      <div className="absolute top-0 right-0 w-4 h-4 opacity-60"
        style={{ 
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          background: variant === 'rails' ? '#CC0000' : 
                      variant === 'postgres' ? '#336791' : 
                      variant === 'code' ? '#39ff14' : '#bc13fe'
        }}
      ></div>
    </div>
  );
  
  if (to) {
    return (
      <Link to={to} className="block transition-transform duration-300 hover:-translate-y-0.5">
        {content}
      </Link>
    );
  }
  
  return content;
};

export default BentoBox;
