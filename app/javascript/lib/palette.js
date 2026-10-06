// The visitor's palette, for code that can't use CSS variables (canvas).
// Names are the tokens in palettes.css: ground, ink, line, brand, sun, sky,
// clay, moss, plum and so on. Inline styles should use var(--name) instead.
export function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
}

// A token as [r, g, b]. Tokens are hex, so this parses them.
export function tokenRgb(name) {
  const hex = token(name).replace("#", "")
  if (hex.length !== 6) return null
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16))
}

// A token with an alpha, as rgba().
export function tokenAlpha(name, alpha) {
  const rgb = tokenRgb(name)
  return rgb ? `rgba(${rgb.join(", ")}, ${alpha})` : token(name)
}

// Two tokens blended: t is 0 for all of `a`, 1 for all of `b`. Canvas meters
// use this to slide from one hue to another as a level rises.
export function tokenMix(a, b, t, alpha = 1) {
  const from = tokenRgb(a)
  const to = tokenRgb(b)
  if (!from || !to) return token(a)
  const k = Math.max(0, Math.min(1, t))
  const rgb = from.map((v, i) => Math.round(v + (to[i] - v) * k))
  return `rgba(${rgb.join(", ")}, ${alpha})`
}
