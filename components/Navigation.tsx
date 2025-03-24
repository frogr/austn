
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, FileCode, Database, Wifi, Keyboard, Mic } from 'lucide-react';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  command: string;
};

const navItems: NavItem[] = [
  { icon: Terminal, label: 'Home', path: '/', command: 'cd ~' },
  { icon: FileCode, label: 'Blog', path: '/blog', command: 'cat ~/blog/posts.md' },
  { icon: Database, label: 'Work', path: '/work', command: 'ls -la ~/projects/' },
  { icon: Wifi, label: 'Contact', path: '/contact', command: 'curl -X POST api.austin.dev/contact' },
  { icon: Mic, label: 'Fun', path: '/fun', command: 'play ~/music/favorite.mp3' },
  { icon: Keyboard, label: 'Games', path: '/games', command: './games/start.sh' },
];

const Navigation = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [typedCommand, setTypedCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  
  // Set active index based on location
  useEffect(() => {
    const index = navItems.findIndex(item => item.path === location.pathname);
    setActiveIndex(index !== -1 ? index : 0);
    const command = navItems[index !== -1 ? index : 0].command;
    setCurrentCommand(command);
  }, [location]);
  
  // Type out the command when active index changes
  useEffect(() => {
    if (currentCommand) {
      setIsTyping(true);
      setTypedCommand('');
      
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < currentCommand.length) {
          setTypedCommand(prev => prev + currentCommand[i]);
          i++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          
          // Add command to history after typing is complete
          setTimeout(() => {
            setHistory(prev => [...prev.slice(-4), currentCommand]);
          }, 300);
        }
      }, 50);
      
      return () => clearInterval(typeInterval);
    }
  }, [currentCommand]);
  
  return (
    <div className="fixed top-0 left-0 right-0 z-40 px-3 py-3 flex justify-center">
      <nav className="bg-terminal-dark/90 backdrop-blur-lg border border-gray-800 shadow-lg shadow-black/30 w-full max-w-2xl rounded-md overflow-hidden">
        <div className="flex flex-col">
          {/* Terminal header with command history - macOS style */}
          <div className="bg-terminal-gray px-3 py-1 font-mono text-xs border-b border-gray-700 flex items-center">
            <div className="flex space-x-1.5 mr-3">
              <div className="w-2.5 h-2.5 rounded-full bg-terminal-error"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-terminal-warning"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-terminal-success"></div>
            </div>
            <div className="text-center text-gray-400 flex-grow">bash ~ austin@server</div>
          </div>
          
          {/* Command history visualization */}
          <div className="px-3 py-1 font-mono text-xs text-gray-500 max-h-12 overflow-y-auto bg-terminal-black/60">
            {history.map((cmd, i) => (
              <div key={i} className="opacity-60">
                <span className="text-[#CC0000]">austin@server:~$ </span>
                <span>{cmd}</span>
              </div>
            ))}
          </div>
          
          {/* Current command line */}
          <div className="px-3 py-2 font-mono text-xs text-neon-green flex items-center border-b border-gray-800">
            <span className="text-[#CC0000] mr-1">austin@server:~$</span>
            <span className="text-[#39ff14]">{typedCommand}</span>
            <span className={`animate-blink ml-0.5 ${!isTyping ? 'opacity-100' : 'opacity-0'}`}>▋</span>
          </div>
          
          {/* Navigation links styled as command line tools */}
          <ul className="flex flex-wrap items-center justify-between px-1 py-1">
            {navItems.map((item, index) => (
              <li key={item.label} className="relative">
                <Link
                  to={item.path}
                  className={`relative px-2 py-1 flex items-center gap-1 transition-all duration-300 ${
                    index === activeIndex 
                      ? 'text-neon-green' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => {
                    setActiveIndex(index);
                    setCurrentCommand(item.command);
                  }}
                >
                  <item.icon size={14} className="opacity-80" />
                  <span className="text-[10px] font-mono">
                    {item.label === 'Home' ? 'cd' : 
                     item.label === 'Blog' ? 'cat' : 
                     item.label === 'Work' ? 'ls' : 
                     item.label === 'Contact' ? 'curl' : 
                     item.label === 'Fun' ? 'play' : 
                     './run'}
                  </span>
                  {index === activeIndex && (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-neon-green/50"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
