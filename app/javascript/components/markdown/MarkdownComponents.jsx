import React from 'react';

const MarkdownComponents = {
  // Heading components
  h1: ({node, children, ...props}) => (
    <h1 className="text-4xl font-bold mt-6 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({node, children, ...props}) => (
    <h2 className="text-3xl font-bold mt-5 mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({node, children, ...props}) => (
    <h3 className="text-2xl font-bold mt-4 mb-3" {...props}>
      {children}
    </h3>
  ),
  h4: ({node, children, ...props}) => (
    <h4 className="text-xl font-bold mt-3 mb-2" {...props}>
      {children}
    </h4>
  ),
  h5: ({node, children, ...props}) => (
    <h5 className="text-lg font-bold mt-3 mb-2" {...props}>
      {children}
    </h5>
  ),
  h6: ({node, children, ...props}) => (
    <h6 className="text-base font-bold mt-3 mb-2" {...props}>
      {children}
    </h6>
  ),
  
  // List components
  ul: ({node, children, ...props}) => (
    <ul 
      className="markdown-list-disc list-disc pl-8 my-4" 
      style={{listStyleType: 'disc', paddingLeft: '2em'}} 
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({node, children, ...props}) => (
    <ol 
      className="markdown-list-decimal list-decimal pl-8 my-4" 
      style={{listStyleType: 'decimal', paddingLeft: '2em'}} 
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({node, children, ...props}) => (
    <li className="mb-2" style={{display: 'list-item'}} {...props}>
      {children}
    </li>
  ),
  
  // Code components
  code: ({node, inline, className, children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="code-block-wrapper">
        <div className="code-block-header">{match[1]}</div>
        <pre className={className}>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    ) : (
      <code className={className || 'inline-code'} {...props}>
        {children}
      </code>
    );
  },
  
  // Blockquote components
  blockquote: ({node, children, ...props}) => (
    <blockquote 
      className="pl-4 border-l-4 border-gray-300 italic my-4" 
      {...props}
    >
      {children}
    </blockquote>
  ),
  
  // Table components
  table: ({node, children, ...props}) => (
    <div className="overflow-x-auto my-4">
      <table className="table-auto border-collapse w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({node, children, ...props}) => (
    <thead className="bg-gray-100" {...props}>
      {children}
    </thead>
  ),
  tbody: ({node, children, ...props}) => (
    <tbody {...props}>
      {children}
    </tbody>
  ),
  tr: ({node, children, ...props}) => (
    <tr className="border-b border-gray-200" {...props}>
      {children}
    </tr>
  ),
  th: ({node, children, ...props}) => (
    <th className="px-4 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({node, children, ...props}) => (
    <td className="px-4 py-2 border-gray-200" {...props}>
      {children}
    </td>
  ),
  
  // Text styling components
  strong: ({node, children, ...props}) => (
    <strong className="font-bold" {...props}>
      {children}
    </strong>
  ),
  em: ({node, children, ...props}) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
};

export default MarkdownComponents;