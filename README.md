# austn.net

Austin French's personal site: case studies, writing, a resume, and a playground
of AI tools that used to run on a GPU at home.

Rails 8 on a small DigitalOcean server (deployed with Hatchbox), Postgres, Redis
and Sidekiq. The public pages are server-rendered ERB with one stylesheet and no
JavaScript. React is only used for the interactive pages (MIDI studio, Claude
Corner, chat) and the admin code review tool.

## What's where

| Part | Where it lives |
| --- | --- |
| Profile (name, headline, links) | `content/profile.yml`, read by `Profile` |
| Resume page and PDF | `content/resume.yml`, read by `Resume`; PDF by `ResumePdf` (Prawn) |
| Case studies (`/work`) | `content/work/*.md`, markdown with front matter, read by `WorkItem` |
| Playground write-ups (`/playground`) | `content/playground/*.md`, read by `PlaygroundItem` |
| Blog (`/blog`) | `content/blog_posts/*.md`, imported into `BlogPost` on deploy by `ImportObsidianNotesJob` |
| GPU tools | `app/jobs/gpu_job.rb`, `app/lib/gpu/`, the `*Service` classes and `workflows/` (ComfyUI) |
| Booking (`/book`, short link `/meet`) | `AvailabilityRule`, `BookingSchedule`, `Booking` |
| Claude Corner (`/claude`) | `ClaudeCornerEntry`, drafted monthly by `ClaudeCornerDraftJob`, published from admin |
| Admin (`/admin`) | One password from ENV, rate-limited login, 30-day "remember this device" |

To change what the site says, edit the files in `content/`. Every page that shows
a number reads it from there, so it only lives in one place.

## The GPU tools

The tools (image generation, music, text to speech, stems, background removal,
image to SVG, image to 3D, chat) ran on a GPU box at home, reached over
Tailscale. The box isn't connected right now, so their public pages redirect to
the write-ups in the Playground.

How it works when it's online:

- Each request becomes a job on the `gpu` Sidekiq queue. `Gpu::Lock` (a Redis
  mutex with compare-and-delete release) keeps one job on the GPU at a time.
- Backend URLs come only from ENV (`COMFYUI_URL`, `TTS_URL`, `LMSTUDIO_URL`).
  Unset means offline. There is no default host.
- `RequiresGpu` refuses work with a 503 when a tool's backend is unconfigured or
  marked offline, and `GpuHealthCheckJob` keeps the status current.
- Visitors only ever see `Gpu::PublicError` messages. Exception details go to
  the logs.
- Uploads are size- and type-checked, stored with Active Storage, and passed to
  jobs by id.

## Running it

```sh
bin/setup          # gems, JS packages, database
bin/dev            # web, Tailwind watcher, Sidekiq
```

Needs Ruby 3.3, Node with Yarn, Postgres and Redis. Seed the default booking
hours with `bin/rails runner 'AvailabilityRule.create_defaults!'`.

## Tests and checks

```sh
bin/rails test     # the whole suite; no GPU needed, backends are stubbed
bin/rubocop
bin/brakeman
```

CI runs all three, and deploys only happen when they pass. `test/models/site_content_test.rb`
also checks the content files: required front matter, no broken links in case
studies, no em dashes.

## Environment

| Variable | What it's for |
| --- | --- |
| `ADMIN_USER_NAME`, `ADMIN_PASSWORD` | Admin login. Required; admin is closed if either is missing. |
| `ADMIN_EMAIL` | Where booking and low-availability emails go (defaults to hi@austn.net) |
| `RESEND_API_KEY`, `MAILER_FROM` | Outgoing email |
| `ANTHROPIC_API_KEY`, `CLAUDE_CORNER_MODEL` | Claude Corner drafts |
| `COMFYUI_URL`, `TTS_URL`, `LMSTUDIO_URL` | GPU backends. Leave unset while the box is offline. |
| `TTS_API_KEY` | The TTS and image JSON APIs |
| `LOW_AVAILABILITY_THRESHOLD` | Email a reminder when fewer open slots than this are left in the next 14 days (default 5) |
| `REDIS_URL` | Sidekiq, caching, the GPU lock |

## Deploying

Hatchbox deploys `main`. After each deploy, `PostDeployJob` imports the blog
posts from `content/blog_posts`. Run migrations as usual.
