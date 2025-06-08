# Bento Grid System Documentation

## Overview
The bento grid system provides a consistent, responsive layout system for all pages. All bento styles are centralized in `bento-system.css`.

## Breakpoints
- **Base**: < 640px (1 column)
- **Small (sm)**: 640px+ (4 columns home, 2 columns projects)
- **Medium (md)**: 768px+ (6 columns home, 2 columns projects)
- **Large (lg)**: 1024px+ (8 columns home, 3 columns projects)
- **Extra Large (xl)**: 1280px+ (12 columns home, 3 columns projects)

## Grid Systems

### Home Page (`bento-grid-home`)
- 12-column grid at xl, 8 at lg, 6 at md, 4 at sm, 1 on mobile
- Gap increases with screen size: 1rem → 2rem
- Uses size classes: hero, large, medium, small, wide, tall

### Projects Page (`bento-grid-projects`)
- 3-column grid at lg+, 2 at sm-md, 1 on mobile
- Equal height cards with `grid-auto-rows: 1fr`
- Min-heights: 300px → 400px (scales with breakpoints)

## Size Classes
- `.bento-hero`: Full width, 2 rows tall on lg+
- `.bento-large`: 6 columns on lg+
- `.bento-medium`: 4 columns on lg+
- `.bento-small`: 3 columns on xl, 2 on smaller
- `.bento-wide`: 8 columns on lg+
- `.bento-tall`: 4 columns, 2-3 rows tall

## Base Styles
- Padding: 1rem → 2.5rem (scales with breakpoints)
- Border radius: 1rem → 1.75rem (scales with breakpoints)
- Glass morphism effect with backdrop blur
- Consistent hover: translateY(-2px) with shadow

## Special Classes
- `.bento-gradient-1/2/3`: Predefined gradient backgrounds
- `.bento-stats`: Centered content for stat boxes
- `.bento-contact`: Special z-index handling

## Usage
```jsx
<div className="bento-container bento-grid-home">
  <div className="bento-box bento-hero">Hero content</div>
  <div className="bento-box bento-medium">Medium box</div>
  <div className="bento-box bento-small bento-stats">Stats</div>
</div>
```

## Migration Notes
- Remove inline padding/sizing from components
- Use size classes instead of custom grid spans
- Let bento-system.css handle all responsive behavior