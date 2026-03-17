---
title: "Building an AI-Native Web Platform as a Solo Developer"
date: 2026-03-17
slug: building-an-ai-native-web-platform
draft: false
---

I built a 40,000-line full-stack platform with 8 GPU-powered AI tools, a booking system, an invoicing system, a browser-based DAW, and a code review harness. A complete invoicing system with PDF generation shipped in under a minute. A booking system with calendar UI, email confirmations, and ICS attachments — 2,301 lines — merged in 5 minutes. Tonight I built an email briefing system, audited the entire codebase, fixed every performance issue, and cleaned up all dead code in a single Discord session.

This is what AI-native development looks like in 2026.

## The Acceleration Curve

The commit history tells the real story. austn.net started as a portfolio site in February 2025. For months it was a side project — 10 commits here, 15 there. Then something clicked.

| Month | Commits | What happened |
|---|---|---|
| Feb–Oct 2025 | ~97 | Portfolio site, basic tools, experimenting |
| Dec 2025 | 34 | Started taking it seriously |
| Jan 2026 | **88** | AI workflow clicked — shipped 8 major features |
| Feb 2026 | **53** | Booking, invoicing, music gen, video gen, pitch detection |
| Mar 2026 | **19** (and counting) | Code review harness, agent integration, full codebase audit |

194 of 291 total commits happened in the last 3 months. The codebase didn't grow linearly — it exploded once I figured out how to work with AI effectively.

## Speed Runs

Here are actual PR timestamps from the git history. These aren't cherry-picked — this is just how fast things ship now:

| Feature | Lines | Time to merge |
|---|---|---|
| Booking system (calendar, email, ICS) | +2,301 | 5 minutes |
| Invoice system (PDF gen, line items, payments) | +1,730 | 37 seconds |
| Video + Music generation | +1,946 | 5 seconds |
| Code review harness (diff parsing, LLM pipeline) | +1,701 | 21 seconds |
| Pitch detection tool with piano roll | +1,327 | 12 seconds |
| Claude Corner (AI content showcase) | +1,181 | 11 seconds |

Those merge times aren't typos. When you trust your AI workflow and your test suite, reviewing a well-structured PR takes seconds.

And tonight — in a single session from Discord — my agent built a briefing email system, audited 40,000 lines for performance issues, fixed every critical finding, cleaned up all dead code, and created the blog post you're reading right now. Total time: about 2.5 hours. Total PRs: 4. Net result: +413 lines added, -467 removed, and the codebase is healthier than it started.

## The Stack

austn.net runs on Rails 8, React, PostgreSQL, Redis, and Sidekiq, deployed on Hatchbox with auto-deploy on merge to main. The AI tools talk to a self-hosted ComfyUI instance running on my own GPU over Tailscale.

| | |
|---|---|
| **Total lines of code** | ~40,000 |
| **Models** | 20 |
| **Controllers** | 39 |
| **Services** | 23 |
| **Background jobs** | 22 |
| **React components** | 48 |
| **Developers** | 1 (+ AI) |

## The Architecture That Makes It Work

Every GPU-powered tool on the site follows the exact same pattern:

**Controller → Job → ComfyUI Client → Redis Service → ActionCable**

1. User hits `/generate`. Controller queues a background job, returns a `generation_id` immediately.
2. The job inherits from `GpuJob` — a 129-line base class that handles Redis-based GPU locking (one task at a time), automatic retries with exponential backoff, and health status tracking.
3. The job talks to ComfyUI through `ComfyuiClient` — a single 182-line API client that handles workflow submission, polling, and output retrieval for every AI tool.
4. Results get cached in Redis through a service inheriting from `BaseRedisService`, which provides namespaced keys and configurable TTLs.
5. ActionCable pushes real-time updates so the UI reflects progress instantly.

The shared infrastructure is about 400 lines. Each new tool adds roughly 60-80 lines of tool-specific code. I have 8 tools running on this pattern. Adding a 9th would take 30 minutes.

That's the real lesson: the time investment isn't in building features, it's in designing the abstraction correctly. `GpuJob` took maybe an hour to get right. It saved weeks across everything that followed.

## The Tools

### Text-to-Speech

![TTS Tool](/blog/tts-screenshot.png)

Upload text, pick a voice, tweak exaggeration and CFG weight. Generates speech using a self-hosted model. Supports batch processing — upload a CSV, generate dozens of clips. Results are shareable via unique links.

### Music Generation

![Music Generation](/blog/music-screenshot.png)

The most feature-rich tool. Enter lyrics, pick a genre/mood preset or write custom tags, set duration and guidance. Generates full songs with vocals using ACE-Step on ComfyUI. This one consistently surprises people.

### Stem Separation

![Stem Separation](/blog/stems-screenshot.png)

Upload a song, get back isolated vocals, drums, bass, and other stems. Powered by Demucs. Great for remixes, karaoke, or just hearing what's buried in a mix.

### Background Removal

![Background Removal](/blog/rembg-screenshot.png)

Upload any image, get a transparent PNG. Multiple model options for different use cases — general purpose, human segmentation, anime.

### 3D Model Generation

![3D Model Generation](/blog/3d-screenshot.png)

Upload an image, get a 3D GLB model with an interactive preview right in the browser using react-three-fiber. Turns product photos and character art into usable 3D assets.

### The DAW

![MIDI Studio](/blog/daw-screenshot.png)

A full browser-based digital audio workstation. Piano roll editor, multiple synth engines (FM, AM, subtractive), effects chain (reverb, delay, distortion, filter), mixer with per-track controls, and pattern saving. Built with Tone.js and React. Not a GPU tool — runs entirely in the browser — but the most complex piece of the frontend.

### Booking System

![Booking System](/blog/booking-screenshot.png)

Full scheduling with availability management, calendar UI, time slot generation, email confirmations with ICS calendar attachments, and cancellation flows. Admin dashboard for managing everything.

### Code Review Harness

Submit a GitHub PR URL and get an AI-powered code review. The system fetches the diff, triages files by priority, reviews each section individually, then synthesizes findings. Clean pipeline architecture.

### Blog

Markdown-based with YAML frontmatter. I write in Obsidian, an import job copies posts into the app, uploads images to Cloudflare R2, and creates database records. Recently I've started writing posts by voice-messaging my AI agent on Discord — it transcribes, writes, commits, and pushes without me opening an editor.

## The Agent Layer

This is where the workflow gets interesting. I run [Hermes Agent](https://github.com/hermes-agent/hermes) — an open-source AI agent that lives in my Discord server with full access to my development machine.

What that means in practice:

**I voice-message an idea, it becomes a deployed feature.** Tonight I described a briefing email system in a few texts. The agent built the mailer, the API endpoint, the HTML template, committed it, pushed a PR, and set up a cron job to research news and send me digests every other day. I merged from my phone.

**I ask for a codebase audit, it finds real bugs.** "Look for performance issues" turned into a report that identified Redis connection leaks, memory-blowing zip downloads, missing database indexes, N+1 queries, and a race condition in invoice numbering. It then fixed all of them, ran tests locally, and opened a PR. 109 tests, 0 failures.

**I ask for a dead code cleanup, it removes 381 lines.** Found unused concerns, orphaned routes, dead JavaScript components, duplicate rake tasks, and a controller that would 500 in production because it never existed. Cleaned everything up, extracted a shared `MoneyFormattable` concern from three duplicate implementations, and fixed an auth bypass bug.

The agent isn't replacing me. It's removing every piece of friction between having an idea and shipping it. I decide what to build. It handles the git workflow, the testing, the deployment. The entire pipeline is automated: push to main → CI passes → Hatchbox deploys.

## What This Teaches

**Get the abstractions right and everything accelerates.** The `GpuJob` base class took an hour to design. It enabled 8 tools to ship in days instead of weeks. The same pattern applies to the agent workflow — once the PR → CI → deploy pipeline was automated, the cost of shipping dropped to nearly zero.

**Rails is criminally underrated for platforms like this.** ActiveJob, ActionCable, ActiveStorage, the mailer framework — Rails gives you the building blocks for a complex platform out of the box. I didn't need microservices. I needed a well-organized monolith.

**Self-hosting AI models is worth it.** Running ComfyUI on my own GPU means no API costs, no rate limits, full control. The `ComfyuiClient` is 182 lines and it's the gateway to every AI capability on the site.

**AI-assisted development is a force multiplier, not a replacement.** The architectural decisions — the base class hierarchy, the Redis caching strategy, the real-time update pattern — those came from experience. AI generated a lot of code. I designed the system. The difference matters.

**An AI agent as a team member changes the game.** Having an agent in Discord means I can ship from anywhere. Waiting in line? Voice message a feature request. On the couch? Review and merge a PR on my phone. The agent handles implementation. I handle direction.

## The Numbers

| | |
|---|---|
| **8** | GPU-powered AI tools sharing one architecture |
| **40,000** | lines of code |
| **194** | commits in the last 3 months |
| **109** | automated tests |
| **4** | PRs shipped in tonight's Discord session |
| **-381** | lines removed in dead code cleanup |
| **1** | developer |
| **0** | microservices |

The web is still the most powerful distribution platform. A URL is all anyone needs. Combine that with self-hosted AI, a well-designed monolith, and an agent-driven development workflow, and a single developer can build things that would have required a team two years ago.

That's not a prediction. That's what I did.
