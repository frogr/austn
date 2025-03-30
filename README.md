# Austn.net

Personal website and portfolio built with Ruby on Rails and React.

## Development

- Development server: `bin/dev` (starts Rails server with Foreman)
- Build JS: `yarn build` (esbuild)
- Build CSS: `yarn build:css` (Tailwind)
- Tests: `bin/rails test` (run all tests)
- Single test: `bin/rails test TEST=path/to/test.rb:line_number`
- Lint Ruby: `bin/rubocop`

## Image Optimization

The site includes comprehensive image optimization features:

### For Developers

- React components:
  - `ResponsiveImage`: A component that handles WebP support, lazy loading, and proper sizing
  - Use it in JSX: `<ResponsiveImage src="/path/to/image.jpg" alt="Description" width={640} height={360} />`

- Rails helpers:
  - `responsive_image_tag`: Creates a responsive image tag with WebP support
  - `responsive_bg_image`: Creates a CSS background style with WebP fallback

### Rake Tasks

The following Rake tasks are available for image optimization:

```
# Convert images to WebP format (while preserving originals)
bin/rails images:convert_to_webp

# Resize and optimize all images
bin/rails images:optimize
```

### Game Assets

The arena shooter game includes optimized asset loading:
- Automatically uses WebP when supported
- Implements progressive loading (essential assets first)
- Provides fallbacks for unsupported formats
- Reduces GPU memory usage

## Features

- Dark/light theme support
- Responsive design
- React components
- WebGL-based games
- Blog with Markdown support
