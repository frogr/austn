
import { useState, useEffect, useRef } from 'react';

type CommandHistoryItem = {
  command: string;
  responses?: string[];
  timestamp?: string;
};

type TerminalWindowProps = {
  commands?: string[];
  responses?: string[][];
  prompt?: string;
  theme?: 'rails' | 'postgres' | 'default' | 'bash';
  autoType?: boolean;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  height?: string;
};

const TerminalWindow = ({
  commands = [],
  responses = [],
  prompt = "$ ",
  theme = 'default',
  autoType = true,
  autoScroll = true,
  showTimestamps = true,
  height = "100%"
}: TerminalWindowProps) => {
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [typeIndex, setTypeIndex] = useState(0);
  const [commandIndex, setCommandIndex] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Theme settings
  const themeColors = {
    rails: {
      prompt: "#CC0000",
      text: "#d0d0d0",
      background: "#1a1a1a",
      success: "#32CD32"
    },
    postgres: {
      prompt: "#336791",
      text: "#d0d0d0",
      background: "#1a1a1a",
      success: "#32CD32"
    },
    default: {
      prompt: "#39ff14",
      text: "#d0d0d0",
      background: "#1a1a1a",
      success: "#32CD32"
    },
    bash: {
      prompt: "#FFFFFF",
      text: "#d0d0d0",
      background: "#1a1a1a",
      success: "#32CD32"
    }
  };
  
  const currentTheme = themeColors[theme];
  
  // Generate a timestamp in terminal format
  const generateTimestamp = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `[${hours}:${minutes}:${seconds}]`;
  };
  
  // Add a command to the history
  const addCommandToHistory = (cmd: string, resp?: string[]) => {
    setHistory(prev => [
      ...prev, 
      {
        command: cmd,
        responses: resp || ["Command executed successfully"],
        timestamp: showTimestamps ? generateTimestamp() : undefined
      }
    ]);
  };
  
  // Simulate typing
  useEffect(() => {
    if (!autoType || commands.length === 0 || commandIndex >= commands.length) return;
    
    const currentCmd = commands[commandIndex];
    
    if (typeIndex < currentCmd.length) {
      const typingTimer = setTimeout(() => {
        setCurrentCommand(prev => prev + currentCmd[typeIndex]);
        setTypeIndex(prev => prev + 1);
      }, Math.random() * 50 + 30); // Random typing speed for realism
      
      return () => clearTimeout(typingTimer);
    } else {
      // Finished typing the command
      const commandResponses = responses[commandIndex] || ["Command executed successfully"];
      
      const executionTimer = setTimeout(() => {
        addCommandToHistory(currentCmd, commandResponses);
        setCurrentCommand("");
        setTypeIndex(0);
        setCommandIndex(prev => prev + 1);
      }, 500); // Wait before executing
      
      return () => clearTimeout(executionTimer);
    }
  }, [autoType, commands, commandIndex, typeIndex, responses]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history, currentCommand]);
  
  return (
    <div className="flex flex-col h-full w-full terminal-container font-mono text-xs bg-terminal-dark overflow-hidden rounded-md border border-gray-700" style={{ height }}>
      {/* Terminal header with macOS buttons */}
      <div className="flex items-center px-3 py-2 bg-terminal-gray border-b border-gray-700">
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-terminal-error"></div>
          <div className="w-3 h-3 rounded-full bg-terminal-warning"></div>
          <div className="w-3 h-3 rounded-full bg-terminal-success"></div>
        </div>
        <div className="ml-2 text-xs text-gray-400">
          {theme === 'rails' ? 'rails console' : theme === 'postgres' ? 'psql shell' : 'bash'}
        </div>
      </div>
      <div 
        ref={outputRef}
        className="terminal-output flex-grow overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {history.map((item, i) => (
          <div key={i} className="terminal-line">
            <div className="flex">
              <span style={{ color: currentTheme.prompt }}>{prompt}</span>
              <span className="ml-1" style={{ color: currentTheme.text }}>{item.command}</span>
            </div>
            
            {item.responses && item.responses.map((response, j) => (
              <div key={j} className="pl-4 text-gray-400">
                {response}
              </div>
            ))}
            
            {item.timestamp && (
              <div className="text-gray-500 text-xs">{item.timestamp}</div>
            )}
          </div>
        ))}
        
        {/* Current typing command */}
        {currentCommand && (
          <div className="terminal-line">
            <div className="flex">
              <span style={{ color: currentTheme.prompt }}>{prompt}</span>
              <span className="ml-1" style={{ color: currentTheme.text }}>
                {currentCommand}<span className="animate-blink">▋</span>
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Terminal status bar */}
      <div className="terminal-status-bar flex justify-between items-center text-xs text-gray-500 border-t border-gray-800 px-3 py-1.5">
        <div>session: {theme === 'rails' ? 'rails' : theme === 'postgres' ? 'psql' : 'bash'}</div>
        <div>utf-8</div>
        <div>exit: ctrl+d</div>
      </div>
    </div>
  );
};

export default TerminalWindow;
