
import { ReactNode } from 'react';

type CodeSnippetProps = {
  children?: ReactNode;
  language?: string;
  customCode?: boolean;
  theme?: 'rails' | 'postgres' | 'default';
};

const CodeSnippet = ({ children, language = 'typescript', customCode = false, theme = 'default' }: CodeSnippetProps) => {
  const themeClasses = {
    rails: 'bg-[#1c1c1c] border-[#CC0000]/30',
    postgres: 'bg-[#1c1c1c] border-[#336791]/30',
    default: 'bg-[#1c1c1c] border-[#39ff14]/30'
  };
  
  const keywordColor = theme === 'rails' ? 'text-[#CC0000]' : 
                        theme === 'postgres' ? 'text-[#336791]' : 
                        'text-[#569cd6]';
  
  const stringColor = theme === 'rails' ? 'text-[#ff9787]' : 
                      theme === 'postgres' ? 'text-[#66c2ff]' : 
                      'text-[#ce9178]';
                      
  const commentColor = theme === 'rails' ? 'text-[#888888]' : 
                      theme === 'postgres' ? 'text-[#888888]' : 
                      'text-[#6a9955]';
  
  return (
    <div className={`code-snippet w-full h-full overflow-auto ${themeClasses[theme]} border rounded-md`}>
      {/* MacOS window decorations */}
      <div className="flex items-center px-3 py-2 bg-terminal-gray border-b border-gray-700">
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-terminal-error"></div>
          <div className="w-3 h-3 rounded-full bg-terminal-warning"></div>
          <div className="w-3 h-3 rounded-full bg-terminal-success"></div>
        </div>
        <div className="ml-2 font-mono text-xs text-gray-400">
          skills.{language}
        </div>
      </div>
      {/* Line numbers column */}
      <div className="flex">
        <div className="text-gray-500 text-right pr-2 select-none border-r border-gray-700 font-mono text-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <div key={num} className="px-2">{num}</div>
          ))}
        </div>
        
        {/* Code content */}
        <div className="flex-1 text-left pl-3 font-mono text-xs">
          {!customCode ? (
            <pre>
              <code>
                <span className={keywordColor}>interface</span> <span>Skills</span> {"{"}
                <br />
                {"  "}<span className="text-[#9cdcfe]">backend</span>: <span className={stringColor}>'Node.js | Ruby on Rails'</span>;
                <br />
                {"  "}<span className="text-[#9cdcfe]">databases</span>: <span className={stringColor}>'MongoDB, PostgreSQL'</span>;
                <br />
                {"  "}<span className="text-[#9cdcfe]">devops</span>: <span className={stringColor}>'Docker, AWS, CI/CD'</span>;
                <br />
                {"  "}<span className="text-[#9cdcfe]">architecture</span>: <span className={stringColor}>'Microservices, Serverless'</span>;
                <br />
                {"  "}<span className="text-[#9cdcfe]">languages</span>: <span className={stringColor}>'TypeScript, Ruby, Go'</span>;
                <br />
                {"  "}<span className="text-[#9cdcfe]">tools</span>: <span className={stringColor}>'Git, Kubernetes, Terraform'</span>;
                <br />
                {"}"}
                <br />
                <span className={commentColor}>// Constantly learning and improving...</span>
              </code>
            </pre>
          ) : (
            children
          )}
        </div>
      </div>
      
      {/* Editor status bar */}
      <div className="border-t border-gray-700 px-2 py-1 text-xs flex justify-between text-gray-400">
        <div>ln 9, col 42</div>
        <div>UTF-8</div>
        <div>{language.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default CodeSnippet;
