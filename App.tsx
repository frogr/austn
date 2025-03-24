import React from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Work from "./pages/Work";
import Contact from "./pages/Contact";
import Fun from "./pages/Fun";
import Games from "./pages/Games";
import NotFound from "./pages/NotFound";

// Background texture overlay
const BackgroundTexture = () => (
  <div className="fixed inset-0 z-[-1] pointer-events-none">
    <div className="absolute inset-0 bg-terminal-black"></div>
    <div className="absolute inset-0 noise-overlay opacity-15"></div>
    <div className="absolute inset-0" style={{
      backgroundImage: `
        radial-gradient(rgba(75, 0, 130, 0.075) 1px, transparent 0),
        radial-gradient(rgba(75, 0, 130, 0.075) 1px, transparent 0)
      `,
      backgroundSize: '30px 30px',
      backgroundPosition: '0 0, 15px 15px'
    }}></div>
    <div className="absolute inset-0 bg-matrix-pattern bg-[30px_30px]"></div>
  </div>
);

// App component with cleaner design
const App = () => (
  <React.Fragment>
    <BrowserRouter basename="/new">
      <BackgroundTexture />
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="blog" element={<Blog />} />
        <Route path="work" element={<Work />} />
        <Route path="contact" element={<Contact />} />
        <Route path="fun" element={<Fun />} />
        <Route path="games" element={<Games />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.Fragment>
);

export default App;