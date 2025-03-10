# Rails App Guidelines

## Commands
- Development: `bin/dev` (starts Rails server with Foreman)
- Build JS: `yarn build` (esbuild)
- Build CSS: `yarn build:css` (Tailwind)
- Tests: `bin/rails test` (run all tests)
- Single test: `bin/rails test TEST=path/to/test.rb:line_number`
- Lint Ruby: `bin/rubocop`

## Code Style
- Ruby: 2-space indentation, snake_case for variables/methods, CamelCase for classes
- JS/React: ES6 imports, functional components with hooks, arrow functions
- No TypeScript, use JSDoc comments for type hints where needed
- Error handling: Standard Rails controller responses, avoid naked rescue blocks
- React components in app/javascript/components/ following HelloWorld.jsx pattern
- Follow existing patterns in similar files when adding new code
- Keep components small and focused on a single responsibility
- Use Rails conventions for model relationships and validations