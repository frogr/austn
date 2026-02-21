import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';

const BentoHome = ({ latestBlogPosts = [], featuredProjects = [] }) => {
  const { theme } = useTheme();
  const containerRef = useRef(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isDark = theme === 'dark';

  // Glass card shared style
  const glassCard = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
  };

  // AI Tools data
  const aiTools = [
    { label: 'Generate an Image', href: '/images', icon: 'image' },
    { label: 'Chat with AI', href: '/chat', icon: 'chat' },
    { label: 'Remove Background', href: '/rembg', icon: 'auto_fix_high' },
    { label: 'Text → Speech', href: '/tts', icon: 'record_voice_over' },
    { label: 'Split Audio into Stems', href: '/stems', icon: 'graphic_eq' },
    { label: 'Image → 3D Model', href: '/3d', icon: 'view_in_ar' },
    { label: 'Image → MIDI', href: '/midi', icon: 'music_note' },
    { label: 'Endless Content', href: '/endless', icon: 'all_inclusive' },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      <div ref={containerRef} className="bento-container relative z-10" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(0.75rem, 2vw, 2rem)' }}>

        {/* ===== HERO SECTION ===== */}
        <section className="bento-box bento-hero"
             style={{
               background: isDark
                 ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(191, 90, 242, 0.05) 100%)'
                 : 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(191, 90, 242, 0.08) 100%)',
               borderTop: 'none', borderLeft: 'none', borderRight: 'none',
               padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2.5rem)',
               marginBottom: '0'
             }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h1 className="font-black mb-1 hero-name" style={{
                fontSize: 'clamp(2.6rem, 9vw, 5rem)',
                letterSpacing: '-0.03em'
              }}>Austin French</h1>
              <p className="font-semibold" style={{
                fontSize: 'clamp(1.2rem, 4.2vw, 2.25rem)',
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
                marginBottom: '0.75rem'
              }}>Senior Backend Engineer</p>
            </div>
            {/* Social links inline with hero */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="https://github.com/frogr" target="_blank" rel="noopener noreferrer"
                 aria-label="GitHub profile"
                 className="inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
                 style={{
                   ...glassCard,
                   color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
                   fontSize: '0.9rem'
                 }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--accent-color)' }} aria-hidden="true">code</span>
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com/in/austindanielfrench" target="_blank" rel="noopener noreferrer"
                 aria-label="LinkedIn profile"
                 className="inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
                 style={{
                   ...glassCard,
                   color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
                   fontSize: '0.9rem'
                 }}>
                <span className="material-icons" style={{ fontSize: '1.1rem', color: 'var(--accent-color)' }} aria-hidden="true">business</span>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </section>

        {/* ===== SECTION DIVIDER ===== */}
        <div style={{ height: 'clamp(1.5rem, 3vw, 2.5rem)' }} aria-hidden="true" />

        {/* ===== AI TOOLS SECTION ===== */}
        <section aria-labelledby="ai-tools-heading">
          <h2 id="ai-tools-heading" className="font-extrabold" style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: isDark ? '#fff' : '#000',
            marginBottom: 'clamp(0.75rem, 1.5vw, 1.25rem)',
            paddingLeft: '0.25rem'
          }}>AI Tools</h2>
          <div className="ai-tools-grid">
            {aiTools.map(tool => (
              <a key={tool.href} href={tool.href}
                 className="ai-tool-card"
                 aria-label={tool.label}
                 style={glassCard}>
                <span className="material-icons" aria-hidden="true"
                      style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>{tool.icon}</span>
                <span style={{
                  fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)',
                  fontWeight: 600,
                  color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'
                }}>{tool.label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ===== SECTION DIVIDER ===== */}
        <div style={{ height: 'clamp(1.5rem, 3vw, 2.5rem)' }} aria-hidden="true" />

        {/* ===== EXPLORE SECTION (consolidated Engage) ===== */}
        <section aria-labelledby="explore-heading">
          <h2 id="explore-heading" className="font-extrabold" style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: isDark ? '#fff' : '#000',
            marginBottom: 'clamp(0.75rem, 1.5vw, 1.25rem)',
            paddingLeft: '0.25rem'
          }}>Explore</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(0.375rem, 1vw, 0.75rem)'
          }}>
            {/* Projects - primary CTA */}
            <a href="/projects" className="bento-box"
               aria-label="View projects"
               style={{
                 backgroundColor: 'var(--accent-color)',
                 color: '#000',
                 border: 'none',
                 flexDirection: 'row',
                 alignItems: 'center',
                 gap: '0.75rem',
                 padding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
               }}>
              <span className="material-icons" style={{ fontSize: '1.4rem' }} aria-hidden="true">rocket_launch</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', fontWeight: 700, color: '#000' }}>Projects</span>
            </a>

            {/* Blog - primary CTA */}
            <a href="/blog" className="bento-box"
               aria-label="Read blog posts"
               style={{
                 ...glassCard,
                 flexDirection: 'row',
                 alignItems: 'center',
                 gap: '0.75rem',
                 padding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
               }}>
              <span className="material-icons" style={{ fontSize: '1.4rem', color: 'var(--accent-color)' }} aria-hidden="true">article</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', fontWeight: 600 }}>Blog</span>
            </a>

            {/* Currently Reading */}
            <a href="/reading" className="bento-box"
               aria-label="See what I'm currently reading"
               style={{
                 ...glassCard,
                 flexDirection: 'row',
                 alignItems: 'center',
                 gap: '0.75rem',
                 padding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
               }}>
              <span className="material-icons" style={{ fontSize: '1.4rem', color: 'var(--accent-color)' }} aria-hidden="true">menu_book</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', fontWeight: 600 }}>Currently Reading</span>
            </a>

            {/* Useful Resources */}
            <a href="/resources" className="bento-box"
               aria-label="Browse useful resources"
               style={{
                 ...glassCard,
                 flexDirection: 'row',
                 alignItems: 'center',
                 gap: '0.75rem',
                 padding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
               }}>
              <span className="material-icons" style={{ fontSize: '1.4rem', color: 'var(--accent-color)' }} aria-hidden="true">link</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', fontWeight: 600 }}>Useful Resources</span>
            </a>

            {/* Fun Links */}
            <a href="/fun-links" className="bento-box"
               aria-label="Browse fun links"
               style={{
                 ...glassCard,
                 flexDirection: 'row',
                 alignItems: 'center',
                 gap: '0.75rem',
                 padding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
               }}>
              <span className="material-icons" style={{ fontSize: '1.4rem', color: 'var(--accent-color)' }} aria-hidden="true">toys</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', fontWeight: 600 }}>Fun Links</span>
            </a>
          </div>
        </section>

        {/* ===== SECTION DIVIDER ===== */}
        <div style={{ height: 'clamp(1.5rem, 3vw, 2.5rem)' }} aria-hidden="true" />

        {/* ===== PROJECTS + BLOG ROW ===== */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(0.375rem, 1vw, 0.75rem)'
        }}>
          {/* PROJECTS SECTION */}
          <div className="bento-box" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', padding: 'clamp(0.75rem, 1.5vw, 1.25rem)' }}>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-extrabold" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', color: isDark ? '#fff' : '#000' }}>Projects</h3>
              <a href="/projects" className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }} aria-label="View all projects">View all</a>
            </div>
            <div className="space-y-2">
              {(featuredProjects || []).slice(0, 3).map(project => (
                <a key={project.id} href={`/projects/${project.id}`} className="block p-3 rounded-md transition-all hover:scale-[1.01]"
                   aria-label={`View project: ${project.title}`}
                   style={glassCard}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate" style={{ color: isDark ? '#fff' : '#000', fontSize: 'clamp(1.05rem, 1.7vw, 1.25rem)' }}>{project.title}</h4>
                      <p className="opacity-90 line-clamp-1" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)' }}>{project.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* BLOG SECTION */}
          <div className="bento-box" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', padding: 'clamp(0.75rem, 1.5vw, 1.25rem)' }}>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-extrabold" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', color: isDark ? '#fff' : '#000' }}>Blog</h3>
              <a href="/blog" className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }} aria-label="View all blog posts">View all</a>
            </div>
            <div className="space-y-2">
              {(latestBlogPosts || []).slice(0, 3).map(post => (
                <a key={post.id} href={`/blog/${post.slug}`} className="block p-3 rounded-md transition-all hover:scale-[1.01]"
                   aria-label={`Read blog post: ${post.title}`}
                   style={glassCard}>
                  <h4 className="font-semibold line-clamp-1" style={{ color: isDark ? '#fff' : '#000', fontSize: 'clamp(1.05rem, 1.7vw, 1.25rem)' }}>{post.title}</h4>
                  <p className="opacity-90 mt-1" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)' }}>{formatDate(post.created_at)}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION DIVIDER ===== */}
        <div style={{ height: 'clamp(1.5rem, 3vw, 2.5rem)' }} aria-hidden="true" />

        {/* ===== GET IN TOUCH / CTA ===== */}
        <section className="bento-box" style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(191, 90, 242, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(191, 90, 242, 0.12) 100%)',
          borderBottom: 'none', borderLeft: 'none', borderRight: 'none',
          padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 2vw, 2rem)'
        }}>
          <div style={{ maxWidth: '800px' }}>
            <h2 className="font-black mb-3" style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.02em',
              color: isDark ? '#fff' : '#000'
            }}>Get in touch</h2>
            <p className="mb-4" style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'
            }}>
              I build Rails apps and integrate AI into real products. If you've got something interesting, I'd love to hear about it.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a href="mailto:hi@austn.net" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                 aria-label="Send email to hi@austn.net"
                 style={{ backgroundColor: 'var(--accent-color)', color: '#000', fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)' }}>
                <span className="material-icons text-lg" aria-hidden="true">email</span>
                <span>hi@austn.net</span>
              </a>
              <a href="/projects" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                 aria-label="Browse projects"
                 style={{
                   background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                   border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                   color: isDark ? '#fff' : '#000',
                   fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)'
                 }}>
                <span className="material-icons text-lg" aria-hidden="true">rocket_launch</span>
                <span>See My Work</span>
              </a>
              <a href="/resume" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                 aria-label="View resume"
                 style={{
                   background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                   border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                   color: isDark ? '#fff' : '#000',
                   fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)'
                 }}>
                <span className="material-icons text-lg" aria-hidden="true">description</span>
                <span>Resume</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BentoHome;
