# Code Cleanup Implementation Plan

## Overview
This plan implements the findings from CLEANUP_FINDINGS.md in a safe, incremental manner. Each phase can be committed separately and rolled back if needed.

---

## Phase 1: Remove Empty and Unused Files (SAFE)
**Risk Level:** 🟢 None  
**Estimated Time:** 5 minutes  
**Rollback:** Easy (git revert)

### Actions:
1. Remove empty helper files:
   ```bash
   rm app/helpers/dashboard_helper.rb
   rm app/helpers/movement_demo_helper.rb
   ```

2. Remove Python/ML experimental files:
   ```bash
   rm test.py
   rm requirements.txt
   rm run_agent.sh
   rm -rf agent/
   ```

3. Remove unused CSS files:
   ```bash
   rm app/assets/stylesheets/highlight/github.css
   rm app/assets/stylesheets/bento-grid.css
   ```

### Verification:
```bash
# Ensure app still loads
bin/rails runner "puts 'Rails OK'"

# Check for any references to removed files
grep -r "dashboard_helper\|movement_demo_helper" app/
grep -r "test.py\|run_agent.sh" .
```

### Commit Message:
```
Remove unused files and empty helpers

- Remove empty helper modules (dashboard, movement_demo)
- Remove Python/ML experimental files (test.py, agent/)
- Remove unused CSS files (highlight/github.css, bento-grid.css)

These files are not referenced anywhere in the codebase and can be
safely removed without affecting functionality.
```

---

## Phase 2: Remove Console Logs (SAFE)
**Risk Level:** 🟢 None  
**Estimated Time:** 10 minutes  
**Rollback:** Easy (git revert)

### Actions:
Remove or wrap console.log statements in development checks:

**Files to update:**
- `app/javascript/application.js` (lines 48, 54, 57, 62, 85, 95)
- `app/javascript/components/GameCard.jsx` (lines 10, 20)
- `app/javascript/components/GamesGrid.jsx` (line 10)
- `app/javascript/movement_demo.js` (lines 5, 81, 89, 123, 166, 270-273)

**Strategy:** Remove debug logs, keep error logs

### Verification:
```bash
# Build frontend
yarn build

# Check for remaining console.logs
grep -r "console.log" app/javascript/
```

### Commit Message:
```
Remove debug console.log statements

Remove console.log statements from production code to improve
performance and prevent data exposure. Error logging is preserved.
```

---

## Phase 3: Remove Unused Dependencies (LOW RISK)
**Risk Level:** 🟢 Low  
**Estimated Time:** 10 minutes  
**Rollback:** Easy (restore Gemfile/package.json)

### Actions:

1. **Remove react-rails gem:**
   ```ruby
   # Gemfile - Remove line 78
   # gem "react-rails", "~> 3.2"
   ```

2. **Remove react-rails initializer:**
   ```bash
   rm config/initializers/react_server_rendering.rb
   ```

3. **Remove front_matter_parser gem:**
   ```ruby
   # Gemfile - Remove line 58
   # gem "front_matter_parser", "~> 1.0"
   ```

4. **Remove @types/three npm package:**
   ```json
   // package.json - Remove line 31
   // "@types/three": "^0.174.0"
   ```

5. **Run bundle and npm install:**
   ```bash
   bundle install
   npm install
   ```

### Verification:
```bash
# Ensure no references to removed gems
grep -r "react-rails\|ReactRailsUJS" app/ config/
grep -r "FrontMatterParser" app/

# Test Rails
bin/rails runner "puts 'Rails OK'"

# Test frontend build
yarn build
yarn build:css
```

### Commit Message:
```
Remove unused dependencies

- Remove react-rails gem (using esbuild instead)
- Remove front_matter_parser gem (using YAML.safe_load)
- Remove @types/three npm package (no TypeScript)
- Remove react_server_rendering initializer

These dependencies are not used in the current implementation.
```

---

## Phase 4: Simplify React Component Structure (LOW RISK)
**Risk Level:** 🟡 Low-Medium  
**Estimated Time:** 15 minutes  
**Rollback:** Medium (requires import updates)

### Actions:

1. **Remove ThemeContext.jsx re-export:**
   ```bash
   rm app/javascript/components/ThemeContext.jsx
   ```

2. **Update imports in consuming files:**
   - `app/javascript/components/GameCard.jsx` line 2
   - `app/javascript/components/BentoHome.jsx` line 2
   - Any other files importing from ThemeContext

   Change:
   ```javascript
   import { ThemeContext } from './ThemeContext'
   ```
   To:
   ```javascript
   import { ThemeContext } from './Theme'
   ```

3. **Remove MarkdownRenderer.jsx re-export:**
   ```bash
   rm app/javascript/components/MarkdownRenderer.jsx
   ```

4. **Update application.js:**
   Change line 14:
   ```javascript
   MarkdownRenderer: () => import('./components/MarkdownRenderer'),
   ```
   To:
   ```javascript
   MarkdownRenderer: () => import('./components/markdown/MarkDownRenderer'),
   ```

### Verification:
```bash
# Build and check for errors
yarn build

# Check for broken imports
grep -r "from './ThemeContext'" app/javascript/
grep -r "from './MarkdownRenderer'" app/javascript/

# Test in browser
bin/dev
# Navigate to pages using these components
```

### Commit Message:
```
Simplify React component structure

- Remove ThemeContext.jsx re-export, use Theme.jsx directly
- Remove MarkdownRenderer.jsx re-export, use markdown/MarkDownRenderer.jsx directly
- Update all imports to reference source files

This reduces indirection and makes the component structure clearer.
```

---

## Phase 5: Verify and Test (REQUIRED)
**Risk Level:** N/A  
**Estimated Time:** 15 minutes  

### Actions:

1. **Run full test suite:**
   ```bash
   bin/rails test
   ```

2. **Build frontend assets:**
   ```bash
   yarn build
   yarn build:css
   ```

3. **Start development server and test manually:**
   ```bash
   bin/dev
   ```

4. **Test critical paths:**
   - Homepage loads correctly
   - Projects page displays
   - Blog posts render
   - Games grid shows
   - Chat interface works
   - Movement demo loads

5. **Check for JavaScript errors:**
   - Open browser console
   - Navigate through all pages
   - Verify no errors

### Success Criteria:
- ✅ All tests pass
- ✅ Frontend builds without errors
- ✅ No console errors in browser
- ✅ All pages render correctly
- ✅ No broken images or styles

---

## Phase 6: Optional - Architectural Improvements (DEFERRED)
**Risk Level:** 🔴 High  
**Estimated Time:** 2-4 hours  
**Recommendation:** Defer to separate PR

These changes require more careful consideration and testing:

1. **Choose between importmap vs esbuild**
   - Current: Both configured (redundant)
   - Decision needed: Which to keep?

2. **Consolidate CSS files**
   - Merge application.css and application.tailwind.css
   - Remove duplication

3. **Review Stimulus usage**
   - Determine if needed in production
   - Consider removing if only for dev

4. **Verify PostDeployJob**
   - Check deployment scripts
   - Document or remove

---

## Rollback Plan

### If Phase 1-3 Fails:
```bash
git revert HEAD
bundle install
npm install
```

### If Phase 4 Fails:
```bash
git revert HEAD
yarn build
```

### If Phase 5 Reveals Issues:
1. Identify which phase caused the issue
2. Revert that specific commit
3. Re-test
4. Fix and retry

---

## Post-Cleanup Metrics

### Expected Results:
- **Files removed:** 10+
- **Lines of code removed:** ~2,000+
- **Dependencies removed:** 3 gems, 1 npm package
- **Build time:** Same or faster
- **Bundle size:** Slightly smaller

### Monitoring:
- Watch for any production errors
- Monitor build times
- Check bundle sizes
- Verify all features work

---

## Notes

- Each phase should be a separate commit
- Test after each phase before proceeding
- Keep CLEANUP_FINDINGS.md for reference
- Update this plan if issues arise
- Consider creating a PR for review before merging
