
import { ChevronLeft, Terminal, Star, Codepen, FileDigit, Server, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BentoBox from '../components/BentoBox';
import CodeSnippet from '../components/CodeSnippet';
import TerminalWindow from '../components/TerminalWindow';
import ApiStatus from '../components/ApiStatus';

const Fun = () => {
  const [activePattern, setActivePattern] = useState(1);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);
  
  // Generate matrix-like characters
  useEffect(() => {
    const chars = [];
    for (let i = 0; i < 50; i++) {
      // Random characters from various alphabets and symbols
      const char = String.fromCharCode(Math.floor(Math.random() * 93) + 33);
      chars.push(char);
    }
    setMatrixChars(chars);
  }, []);
  
  const generatePixelPattern = (patternId: number) => {
    let pattern = [];
    const size = 8;
    
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        let value = false;
        
        // Different patterns based on patternId
        switch (patternId) {
          case 1: // Checkerboard
            value = (i + j) % 2 === 0;
            break;
          case 2: // Cross
            value = i === j || i === size - j - 1;
            break;
          case 3: // Frame
            value = i === 0 || j === 0 || i === size - 1 || j === size - 1;
            break;
          case 4: // Random
            value = Math.random() > 0.5;
            break;
          default:
            value = false;
        }
        
        row.push(value);
      }
      pattern.push(row);
    }
    
    return pattern;
  };

  const funFacts = [
    "I've optimized databases handling 500+ million records without downtime",
    "I built a CI/CD pipeline that reduced deployment time by 78%",
    "My first server was a repurposed gaming PC running Linux",
    "I've contributed to over 20 open source backend libraries",
    "I once debugged a production issue for 36 hours straight",
    "I can write regex patterns without looking up the syntax"
  ];

  const hobbies = [
    "Mechanical keyboards",
    "Home server setup",
    "Cybersecurity CTFs",
    "CLI tool development",
    "Linux distro hopping",
    "Retro computing"
  ];

  return (
    <div className="min-h-screen pt-20 px-3 md:px-6 lg:px-12 pb-12 animate-page-transition">
      <Link to="/" className="inline-flex items-center text-xs mb-8 px-3 py-1.5 bg-terminal-dark backdrop-blur-sm rounded-md border border-gray-800 hover:bg-terminal-gray/50 transition-all">
        <ChevronLeft size={14} />
        <span className="ml-1 font-mono">cd ~</span>
      </Link>
      
      <div className="mb-10 text-center">
        <h1 className="font-mono text-2xl mb-2 text-neon-purple glitch-effect" data-text="01001000 01101111 01100010 01100010 01101001 01100101 01110011">Fun && Hobbies</h1>
        <p className="text-gray-400 max-w-xl mx-auto font-mono text-sm">
          <span className="text-neon-green">const</span> <span className="text-neon-blue">hobbies</span> = <span className="text-neon-purple">getRandomInterests</span>(<span className="text-neon-green">developer</span>);
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 max-w-6xl mx-auto">
        {/* API Status */}
        <BentoBox size="md" heading="System Status" className="col-span-1 md:col-span-2" status="online">
          <ApiStatus />
        </BentoBox>
        
        {/* Terminal Command List */}
        <BentoBox 
          size="md" 
          heading="Latest Commits" 
          className="col-span-1 md:col-span-2"
          terminal={true}
        >
          <TerminalWindow 
            commands={[
              "git commit -m 'feat: optimize database queries'",
              "git push origin main",
              "npm run deploy:prod",
              "docker-compose up -d"
            ]}
          />
        </BentoBox>
        
        {/* Skills as Code */}
        <BentoBox size="md" heading="Personal Config" className="col-span-1 md:col-span-2">
          <CodeSnippet />
        </BentoBox>
        
        {/* Fun Facts Section as Terminal Output */}
        <BentoBox size="lg" className="col-span-1 md:col-span-3" terminal={true}>
          <div className="h-full pt-6">
            <div className="font-mono text-sm text-left mb-2 text-gray-400">// fun facts about me</div>
            <ul className="space-y-3 text-left">
              {funFacts.map((fact, index) => (
                <li key={index} className="flex items-start">
                  <div className="min-w-4 h-4 mt-1 mr-2 text-neon-purple">&gt;</div>
                  <span className="text-sm font-mono">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </BentoBox>
        
        {/* Hobbies Section as Server Rack */}
        <BentoBox size="lg" className="col-span-1 md:col-span-3">
          <div className="w-full h-full">
            <div className="font-mono text-sm text-left mb-4 text-gray-400">// hobbies && interests</div>
            <div className="grid grid-cols-2 gap-2">
              {hobbies.map((hobby, index) => (
                <div key={index} className="bg-terminal-gray border border-gray-700 rounded-sm p-3 text-center flex flex-col items-center">
                  {index === 0 && <Cpu size={20} className="mb-2 text-neon-blue" />}
                  {index === 1 && <Server size={20} className="mb-2 text-neon-purple" />}
                  {index === 2 && <Codepen size={20} className="mb-2 text-neon-green" />}
                  {index === 3 && <Terminal size={20} className="mb-2 text-retro-orange" />}
                  {index === 4 && <FileDigit size={20} className="mb-2 text-retro-teal" />}
                  {index === 5 && <Star size={20} className="mb-2 text-retro-pink" />}
                  <span className="font-mono text-xs">{hobby}</span>
                </div>
              ))}
            </div>
          </div>
        </BentoBox>
        
        {/* Pixel Art Playground with Matrix-Inspired Animation */}
        <BentoBox size="xl" className="col-span-1 md:col-span-6" gradient={true}>
          <div className="w-full h-full">
            <div className="font-mono text-sm text-left mb-4 text-gray-300">// interactive pixel matrix</div>
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-8 gap-1 mb-6 relative">
                {generatePixelPattern(activePattern).map((row, i) => (
                  row.map((cell, j) => (
                    <div 
                      key={`${i}-${j}`} 
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-sm transition-colors duration-300 ${
                        cell ? 'bg-neon-purple hover:bg-neon-blue' : 'bg-terminal-gray hover:bg-terminal-dark'
                      }`}
                      onClick={() => setActivePattern(Math.floor(Math.random() * 4) + 1)}
                    ></div>
                  ))
                ))}
                
                {/* Matrix rain effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {matrixChars.map((char, index) => (
                    <div 
                      key={index}
                      className="absolute text-neon-green text-opacity-50 animate-matrix-drop font-mono"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${Math.random() * 3 + 1}s`
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                {[1, 2, 3, 4].map((id) => (
                  <button
                    key={id}
                    onClick={() => setActivePattern(id)}
                    className={`px-3 py-1.5 rounded-sm transition-colors font-mono text-xs ${
                      activePattern === id 
                        ? 'bg-neon-purple text-black' 
                        : 'bg-terminal-gray hover:bg-terminal-gray/80 text-gray-300'
                    }`}
                  >
                    Pattern_{id}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 font-mono text-xs text-gray-400 text-center">
                <p>Click on the grid to generate a random pattern</p>
                <p className="mt-1 text-neon-green">&gt; Matrix initialization complete</p>
              </div>
            </div>
          </div>
        </BentoBox>
      </div>
    </div>
  );
};

export default Fun;
