
import { useState, useEffect } from 'react';
import { Server, Database, Zap, GitMerge } from 'lucide-react';

type StatusType = 'online' | 'offline' | 'warning';

type Service = {
  name: string;
  status: StatusType;
  latency: number;
  icon: React.ReactNode;
  message?: string;
};

const ApiStatus = () => {
  const [services, setServices] = useState<Service[]>([
    { 
      name: 'API', 
      status: 'online', 
      latency: 42, 
      icon: <Zap size={14} className="text-neon-green" />,
      message: '200 OK'
    },
    { 
      name: 'Database', 
      status: 'online', 
      latency: 82, 
      icon: <Database size={14} className="text-neon-blue" />,
      message: 'Connected'
    },
    { 
      name: 'Server', 
      status: 'online', 
      latency: 5, 
      icon: <Server size={14} className="text-neon-purple" />,
      message: 'Running'
    },
    { 
      name: 'CI/CD', 
      status: 'warning', 
      latency: 0, 
      icon: <GitMerge size={14} className="text-terminal-warning" />,
      message: 'Build in progress'
    }
  ]);

  // Simulate random latency changes
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => 
        prev.map(service => {
          const latencyChange = Math.floor(Math.random() * 30) - 10;
          const newLatency = Math.max(1, service.latency + latencyChange);
          
          let status: StatusType = 'online';
          if (newLatency > 200) status = 'warning';
          if (newLatency > 500) status = 'offline';
          
          // Don't change CI/CD status
          if (service.name === 'CI/CD') return service;
          
          return {
            ...service,
            latency: newLatency,
            status
          };
        })
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full font-mono text-xs">
      <div className="text-gray-400 mb-2">// systems status</div>
      <div className="space-y-2">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {service.icon}
              <span>{service.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`
                ${service.status === 'online' ? 'text-terminal-success' : 
                  service.status === 'warning' ? 'text-terminal-warning' : 'text-terminal-error'}
              `}>
                {service.message}
              </span>
              <div className={`
                w-2 h-2 rounded-full 
                ${service.status === 'online' ? 'bg-terminal-success animate-server-pulse' : 
                  service.status === 'warning' ? 'bg-terminal-warning' : 'bg-terminal-error'}
              `}></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-700">
        <div className="flex justify-between text-gray-400">
          <span>uptime:</span>
          <span className="text-neon-green">99.98%</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>last incident:</span>
          <span>14d ago</span>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
