// Styles the Claude Corner cards share. Colours are palette tokens so the
// page follows the visitor's palette like the rest of the site.

// A panel, like .glass in theme.css.
export const cardStyle = {
  background: 'var(--ground-2)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)'
}

// A tape label in the playground's hue, like .label in site.css.
export const tapeStyle = {
  display: 'inline-block',
  background: 'var(--clay)',
  color: 'var(--ground)',
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  padding: '0.1rem 0.45rem',
  borderRadius: '0.25rem',
  transform: 'rotate(-1.5deg)',
  fontVariationSettings: '"CASL" 1'
}

export const tagStyle = {
  background: 'var(--ground-3)',
  color: 'var(--ink-2)',
  fontSize: '0.7rem',
  padding: '0.2rem 0.55rem',
  borderRadius: '9999px',
  border: '1px solid var(--line)'
}
