
import { useState, useEffect } from 'react';
import BentoBox from '../components/BentoBox';
import CodeSnippet from '../components/CodeSnippet';
import TerminalWindow from '../components/TerminalWindow';
// MatrixRain component is removed for cleaner design
import { FileCode, Database, Terminal, Wifi, Keyboard, Mic } from 'lucide-react';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate a loading effect
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const skills = [
    { name: 'Ruby on Rails', command: '$ gem install rails' },
    { name: 'PostgreSQL', command: '$ psql -d myapp' },
    { name: 'TypeScript', command: '$ tsc --init' },
    { name: 'Node.js', command: '$ npm start' },
    { name: 'Docker', command: '$ docker-compose up' },
    { name: 'AWS', command: '$ aws ec2 describe-instances' }
  ];

  return (
    <div className={`min-h-screen px-2 py-6 md:px-4 lg:px-6 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Matrix rain removed for cleaner design */}
      
      {/* Header */}
      <header className="mb-8 text-center pt-6">
        <div className="inline-block mb-4 px-3 py-1 bg-terminal-dark text-neon-green border border-neon-green/30 text-xs font-mono rounded">
          <span className="animate-blink">▋</span> Backend Developer / System Architect
        </div>
        <h1 className="font-mono text-4xl md:text-5xl mb-4 text-white text-glitch">
          Austin <span className="rails-red">French</span>
        </h1>
        <div className="waveform-divider w-40 mx-auto mb-4"></div>
        <p className="text-gray-400 max-w-xl mx-auto font-mono text-sm">
          Crafting robust backend systems and databases with clean, efficient code.
        </p>
      </header>

      {/* Bento Layout */}
      <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {/* About Me */}
        <BentoBox size="lg" heading="About Me" className="md:col-span-2" variant="rails">
          <p className="text-gray-400 mb-3 text-sm">
            Backend developer specializing in Ruby on Rails, PostgreSQL, and API design with 
            5+ years of experience building scalable systems.
          </p>
          <p className="text-gray-400 text-sm">
            Passionate about optimizing database performance and crafting clean, maintainable code.
          </p>
          <div className="mt-3">
            <div className="mech-key">backend</div>
            <div className="mech-key">devops</div>
            <div className="mech-key">database</div>
          </div>
        </BentoBox>

        {/* Blog */}
        <BentoBox to="/blog" heading="Blog" subheading="Technical writings" variant="postgres">
          <div className="flex items-center justify-center h-full">
            <FileCode size={36} className="postgres-blue opacity-60" />
          </div>
        </BentoBox>

        {/* Work */}
        <BentoBox to="/work" heading="Work" subheading="Portfolio projects" variant="rails">
          <div className="flex items-center justify-center h-full">
            <Database size={36} className="rails-red opacity-60" />
          </div>
        </BentoBox>

        {/* Skills Terminal */}
        <BentoBox heading="Skills" size="md" terminal={true} variant="code">
          <div className="h-full">
            <TerminalWindow 
              commands={skills.map(s => s.command)} 
              prompt="$ "
              theme="default"
              height="200px"
            />
          </div>
        </BentoBox>

        {/* Featured Project */}
        <BentoBox size="lg" heading="Featured Project" className="md:col-span-2" terminal={true} variant="postgres">
          <div className="flex flex-col h-full">
            <div className="flex-grow">
              <TerminalWindow
                commands={[
                  "psql -d ecommerce_platform",
                  "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days';",
                  "rails c",
                  "OrderAnalytics.generate_weekly_report"
                ]}
                theme="postgres"
                height="200px"
              />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-terminal-dark text-gray-300 px-2 py-0.5 text-xs font-mono border border-gray-700">
                  Rails
                </span>
                <span className="bg-terminal-dark text-gray-300 px-2 py-0.5 text-xs font-mono border border-gray-700">
                  PostgreSQL
                </span>
                <span className="bg-terminal-dark text-gray-300 px-2 py-0.5 text-xs font-mono border border-gray-700">
                  Redis
                </span>
              </div>
            </div>
          </div>
        </BentoBox>

        {/* Contact, Fun, and Games in a row */}
        <div className="grid grid-cols-3 gap-3 md:col-span-3 lg:col-span-4">
          <BentoBox to="/contact" heading="Contact" subheading="Get in touch" variant="code" gradient={false}>
            <div className="flex items-center justify-center h-full">
              <Wifi size={36} className="text-neon-green opacity-60" />
            </div>
          </BentoBox>

          <BentoBox to="/fun" heading="Fun Stuff" subheading="Hobbies & audio gear" variant="postgres" gradient={false}>
            <div className="flex items-center justify-center h-full">
              <Mic size={36} className="postgres-blue opacity-60" />
            </div>
          </BentoBox>

          <BentoBox to="/games" heading="Games" subheading="Mini coding games" variant="code" gradient={false}>
            <div className="flex items-center justify-center h-full">
              <Keyboard size={36} className="text-neon-green opacity-60" />
            </div>
          </BentoBox>
        </div>
      </main>
      
      {/* Code snippet at the bottom - moved up */}
      <div className="mt-3 max-w-6xl mx-auto">
        <BentoBox heading="My Toolset" terminal={true}>
          <CodeSnippet theme="rails" />
        </BentoBox>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-xs font-mono">
        <div className="waveform-divider w-32 mx-auto mb-3"></div>
        <p>© 2023 Austin French. All rights reserved.</p>
        <p className="mt-1 text-[10px]">Built with TypeScript + React</p>
      </footer>
    </div>
  );
};

export default Index;
