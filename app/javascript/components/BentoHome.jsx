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

  // Fit-to-viewport sizing for desktop: hero + two rows (no scroll at full size)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const applySizes = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop) {
        el.style.removeProperty('--hero-h');
        el.style.removeProperty('--row-medium-h');
        el.style.removeProperty('--row-tall-h');
        return;
      }

      const header = document.querySelector('.site-header');
      const headerH = header ? header.offsetHeight : 0;
      const available = Math.max(400, window.innerHeight - headerH - 8);
      const hero = Math.max(150, Math.round(available * 0.28));
      const medium = Math.max(180, Math.round(available * 0.26));
      const tall = Math.max(200, available - hero - medium);

      el.style.setProperty('--hero-h', `${hero}px`);
      el.style.setProperty('--row-medium-h', `${medium}px`);
      el.style.setProperty('--row-tall-h', `${tall}px`);
    };

    applySizes();
    window.addEventListener('resize', applySizes);
    return () => window.removeEventListener('resize', applySizes);
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      <div ref={containerRef} className="bento-container bento-grid-home relative z-10">
        {/* HERO */}
        <div className="bento-box bento-full bento-hero"
             style={{
               background: isDark
                 ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(191, 90, 242, 0.05) 100%)'
                 : 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(191, 90, 242, 0.08) 100%)',
               borderTop: 'none', borderLeft: 'none', borderRight: 'none'
             }}>
          <div className="w-full h-full" style={{ display: 'grid', alignContent: 'center', justifyContent: 'start' }}>
            <h1 className="font-black mb-1 hero-name" style={{
              fontSize: 'clamp(2.6rem, 9vw, 5rem)',
              letterSpacing: '-0.03em'
            }}>Austin French</h1>
            <p className="font-semibold mb-4" style={{
              fontSize: 'clamp(1.2rem, 4.2vw, 2.25rem)',
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'
            }}>Senior Backend Engineer</p>
          </div>
        </div>

        {/* ENGAGE (left half) */}
        <div id="contact" className="bento-box bento-2x1 bento-row-medium" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
          <h3 className="font-extrabold mb-3" style={{ fontSize: 'clamp(1.45rem, 2.2vw, 1.75rem)', color: isDark ? '#fff' : '#000' }}>Engage</h3>
          <div className="engage-grid">
            <a href="/projects" className="engage-item gap-3 px-5 py-3.5 rounded-md font-semibold"
               style={{ backgroundColor: 'var(--accent-color)', color: '#000' }}>
              <span className="material-icons text-lg">rocket_launch</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>Projects</span>
            </a>
            <a href="/blog" className="engage-item gap-3 px-5 py-3.5 rounded-md font-semibold"
               style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)' }}>
              <span className="material-icons text-lg">article</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>Blog</span>
            </a>
            <a href="/fun-links" className="engage-item gap-3 px-5 py-3.5 rounded-md font-semibold"
               style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)' }}>
              <span className="material-icons text-lg">toys</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>Fun Links</span>
            </a>
            <a href="/reading" className="engage-item gap-3 px-5 py-3.5 rounded-md font-semibold"
               style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)' }}>
              <span className="material-icons text-lg">menu_book</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>Currently Reading</span>
            </a>
            <a href="/resources" className="engage-item gap-3 px-5 py-3.5 rounded-md font-semibold"
               style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)' }}>
              <span className="material-icons text-lg">link</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>Useful Resources</span>
            </a>
            <a href="mailto:hi@austn.net" className="engage-item gap-3 px-4 py-3.5 rounded-md font-semibold"
               style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
              <span className="material-icons text-lg" style={{ color: 'var(--accent-color)' }}>email</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>hi@austn.net</span>
            </a>
            <a href="https://github.com/frogr" target="_blank" rel="noopener noreferrer" className="engage-item gap-3 px-4 py-3.5 rounded-md font-semibold"
               style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
              <span className="material-icons text-lg" style={{ color: 'var(--accent-color)' }}>code</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>GitHub</span>
            </a>
            <a href="https://linkedin.com/in/austindanielfrench" target="_blank" rel="noopener noreferrer" className="engage-item gap-3 px-4 py-3.5 rounded-md font-semibold"
               style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
              <span className="material-icons text-lg" style={{ color: 'var(--accent-color)' }}>business</span>
              <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* ABOUT (right half next to Engage) */}
        <div className="bento-box bento-2x1 bento-row-medium" style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)' }}>
          <h3 className="font-extrabold mb-3" style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', color: isDark ? '#fff' : '#000' }}>About</h3>
          <p className="text-base" style={{ lineHeight: 1.8, fontSize: 'clamp(0.98rem, 1.45vw, 1.12rem)' }}>
            Senior backend engineer with 6+ years building scalable SaaS applications and integrating AI/ML solutions. Shipped production AI features processing 5,000+ daily operations at CompanyCam, launched products generating $10M+ ARR at CoverMyMeds. Expert in Ruby on Rails, API design, and LLM integration. Currently exploring advanced ML through FastAI coursework and local LLM development.
          </p>
          <p className="mt-3" style={{ lineHeight: 1.6, fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
            All AI tools on this site run on my home GPU — no API costs, no sign-ups, no data collection.
          </p>
        </div>

        {/* PROJECTS (left half, bottom row) */}
        <div className="bento-box bento-2x1 bento-row-tall" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-extrabold" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', color: isDark ? '#fff' : '#000' }}>Projects</h3>
            <a href="/projects" className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }}>View all</a>
          </div>
          <div className="space-y-2">
            {(featuredProjects || []).slice(0, 3).map(project => (
              <a key={project.id} href={`/projects/${project.id}`} className="block p-3 rounded-md transition-all hover:scale-[1.01]"
                 style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
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

        {/* BLOG (right half, bottom row) */}
        <div className="bento-box bento-2x1 bento-row-tall" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-extrabold" style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)', color: isDark ? '#fff' : '#000' }}>Blog</h3>
            <a href="/blog" className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }}>View all</a>
          </div>
          <div className="space-y-2">
            {(latestBlogPosts || []).slice(0, 3).map(post => (
              <a key={post.id} href={`/blog/${post.slug}`} className="block p-3 rounded-md transition-all hover:scale-[1.01]"
                 style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <h4 className="font-semibold line-clamp-1" style={{ color: isDark ? '#fff' : '#000', fontSize: 'clamp(1.05rem, 1.7vw, 1.25rem)' }}>{post.title}</h4>
                <p className="opacity-90 mt-1" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)' }}>{formatDate(post.created_at)}</p>
              </a>
            ))}
          </div>
        </div>

        {/* CTA FOOTER */}
        <div className="bento-box bento-full" style={{
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
              I build Rails apps and integrate AI into real products. If you've got something interesting, book a time or send me an email.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a href="/book" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                 style={{ backgroundColor: 'var(--accent-color)', color: '#000', fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)' }}>
                <span className="material-icons text-lg">calendar_today</span>
                <span>Book a Meeting</span>
              </a>
              <a href="mailto:hi@austn.net" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                 style={{
                   background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                   border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                   color: isDark ? '#fff' : '#000',
                   fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)'
                 }}>
                <span className="material-icons text-lg">email</span>
                <span>hi@austn.net</span>
              </a>
              <a href="/resume" className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
                 style={{
                   background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                   border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                   color: isDark ? '#fff' : '#000',
                   fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)'
                 }}>
                <span className="material-icons text-lg">description</span>
                <span>Resume</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BentoHome;
