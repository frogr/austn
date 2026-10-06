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

## Design

The design system is two files. Read their headers first.

- `palettes.css` holds every colour, as one set of tokens per palette. Visitors
  pick a palette in the footer (a cookie, read by `current_palette`), and
  `/palettes` shows them side by side. `app/models/palette.rb` is the list. A
  new palette must keep the contrast contract at the top of `palettes.css`.
- `site.css` never names a hex value. Each section has a hue (work sun, writing
  sky, playground clay, resume moss, now and booking plum) and a page gets
  `--accent` from `body.s-<section>`. The mark, the main button and pages
  outside a section use `--brand`.
- One typeface, Recursive, self-hosted in `app/assets/fonts`. Set the `--casl`
  and `--mono` properties to change its feel. Don't add another font.
- Reuse the pieces that exist: `.label` and `.section-title` (tape labels),
  `.rows`, `.worklist`, `.posts`, `.toys`, `.tiles`, `.stats`, `.compare`,
  `.diagram`, `.button`, `.note`, `.facts`.
- Drawings on tiles live in `shared/_toy_art`, one per slug, drawn in
  `currentColor` and animated with the `art-*` classes.
- The home page fits on one laptop screen without scrolling. If you add to it,
  check 1280x720 and 1470x796.
- Motion is CSS only and must stop for `prefers-reduced-motion`. No pulsing
  status dots.
- `layouts/application` repeats the header in an inline style block. Keep the
  two in step. Its pages (the tools, admin) get their colours through
  `theme.css`, where the old names (`--accent-color`, `--bg-card`...) are
  aliases for the palette tokens. React inline styles use `var(--brand)` and
  friends; canvas code reads them with `token()` from `lib/palette.js`. No
  hex values there either, except the recorded Claude Corner drawings.
- `public/og.png` and the PNG icons are screenshots of the mark and home page
  styles in the default palette. Regenerate them if that palette or the mark
  changes.

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
