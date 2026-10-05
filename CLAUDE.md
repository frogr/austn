# Working on austn.net

This is Austin French's personal site, and it's linked from his resume.
Hiring managers read both the pages and the code, so the bar is: correct,
small, tested, and written plainly.

## Commands

- `bin/dev`: web, Tailwind watcher, Sidekiq
- `bin/rails test`: full suite (no GPU needed)
- `bin/rubocop`, `bin/brakeman`: CI fails on either
- `yarn build`: JS bundle (esbuild)

## Layout of the app

- Public pages (`/`, `/work`, `/blog`, `/playground`, `/resume`, `/now`, `/book`)
  use `layouts/site` and `site.css`. Server-rendered ERB, no JavaScript.
- Interactive pages (pitch, MIDI, Claude Corner, live GPU tools) and admin use
  `layouts/application`, which loads the JS bundle and the older Tailwind styles.
- Content lives in `content/` (YAML and markdown with front matter). Models:
  `Profile`, `Resume`, `WorkItem`, `PlaygroundItem`, `BlogPost`.

## Rules

- Facts about Austin come from `content/resume.yml` and `content/profile.yml`.
  Don't invent numbers, outcomes, client names or titles. If a claim needs a
  number we don't have, leave it out and say so.
- Tenex clients stay anonymous.
- Copy is in Austin's voice: plain words, short sentences, no em dashes, no
  closing aphorisms, no "Key Features / Challenges & Solutions" templates.
  Explain product names the first time they appear.
- GPU backends are configured only through ENV via `Gpu::Backend`. Never add a
  default host or IP.
- Visitors never see exception messages. Use `Gpu::PublicError` and log details.
- Anything a visitor can write must be validated, size-limited and rate-limited.
  Publishing and voice cloning are admin-only.
- Uploads go through `GpuUpload` and reach jobs as Active Storage ids, never as
  bytes in job arguments.

## Before you call something done

1. `bin/rails test`, `bin/rubocop` and `bin/brakeman` all pass.
2. New behavior has a test. A bug fix has a test that failed before the fix.
3. Read the diff. Check that comments and copy describe what the code does.
4. For page changes, load the page at desktop and phone widths.
