import React from 'react';

const DebugComponent = ({ name = 'Unknown', props = {} }) => {
  console.log(`DebugComponent rendering: ${name}`, props);
  
  return (
    <div className="p-4 border border-red-500 rounded mb-4">
      <h3 className="text-xl font-bold mb-2 text-red-500">Debug Component: {name}</h3>
      <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  );
};

export default DebugComponent;