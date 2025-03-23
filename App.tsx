import React from 'react'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="app-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px' }}>New Frontend at /new</h1>
      </header>
      
      <nav style={{ 
        backgroundColor: '#222', 
        padding: '10px', 
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <ul style={{ 
          display: 'flex', 
          listStyle: 'none', 
          gap: '15px',
          margin: 0,
          padding: 0
        }}>
          <li><a href="/new" style={{ color: '#fff' }}>Home</a></li>
          <li><a href="/new/blog" style={{ color: '#fff' }}>Blog</a></li>
          <li><a href="/new/work" style={{ color: '#fff' }}>Work</a></li>
          <li><a href="/new/contact" style={{ color: '#fff' }}>Contact</a></li>
          <li><a href="/new/fun" style={{ color: '#fff' }}>Fun</a></li>
          <li><a href="/new/games" style={{ color: '#fff' }}>Games</a></li>
        </ul>
      </nav>
      
      <main style={{ backgroundColor: '#333', padding: '20px', borderRadius: '4px' }}>
        <h2 style={{ color: '#fff', marginTop: 0 }}>Welcome to the New Frontend</h2>
        <p style={{ color: '#ddd' }}>
          This is a simple React application served at the /new route. 
          If you can see this, the setup is working correctly!
        </p>
      </main>
    </div>
  )
}

export default App