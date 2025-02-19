import React, { useState } from 'react'

const HelloWorld = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4 bg-yellow-100 rounded-lg">
      <p className="mb-2">Hello from React!</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
      >
        Count: {count}
      </button>
    </div>
  )
}

export default HelloWorld