---
title: "Eight AI Models on One GPU in My Apartment, and What Broke"
date: 2026-10-05
slug: building-an-ai-native-web-platform
summary: "How austn.net ran its AI tools off one home GPU for six months, the bugs a code review found afterward, and what I changed."
---

For about six months, this site ran AI tools off a single GPU at my place in California: image generation, music, text to speech, stem splitting, background removal, image to SVG, image to 3D, and chat. Anyone could use them, no account needed. They handled tens of thousands of jobs.

In March I wrote a post about building all of it with an AI agent. It bragged about how fast pull requests merged, a few of them in under a minute. When I moved to New York and the GPU stayed behind, I had the codebase reviewed properly, and that post didn't hold up. This is the version I should have written.

## How it worked

The site is a Rails app on a small DigitalOcean server. The GPU box sat at home, reachable only over Tailscale. Six of the tools ran as ComfyUI workflows, text to speech had its own small Flask server, and chat went to LM Studio.

Every request became a Sidekiq job on a dedicated `gpu` queue. A job takes a Redis lock before it touches the GPU, because one consumer GPU can only do one heavy thing at a time. If the lock is taken, the job re-queues itself a few seconds later. The page polls for status.

That pattern held up. Adding a tool mostly meant writing a ComfyUI workflow and a small job class.

## What the review found

The architecture was fine. The details weren't.

- **A retry setting that silently stopped working.** `wait: :exponentially_longer` was removed in Rails 8. The first failure of any GPU job crashed the retry handler instead of retrying.
- **A lock that could expire mid-job.** It lived for five minutes. Stem separation can take fifteen. A long job could lose the lock, and a second job would start on the same GPU, which is the one thing the lock was for.
- **A release that wasn't atomic.** Read the lock, then delete it, with a small window to delete someone else's.
- **Health checks that crashed on success.** The status table only knew about three of the eight tools, so for the other five, every successful job blew up at the very end and ran a second time.
- **Uploads inside the job.** Files were base64-encoded into the job's arguments, so a song sat in Redis as a job payload and got re-queued every few seconds while it waited.
- **A race-condition "fix" that didn't fix anything.** Invoice numbering took a database lock and released it before the insert.
- **No graceful failure.** When the GPU went away, every tool kept accepting work, timed out, and showed visitors a raw error with the box's private address in it.

Some of those PRs had merged while CI was failing. Fast merges were the headline of the old post, and they're also why these got through.

## What I changed

- Retries now only happen for dropped connections, with backoff. An offline backend gives up right away and marks the tool offline.
- Each tool holds the lock for longer than its longest run, and release is a single compare-and-delete script in Redis.
- The health status covers every tool.
- Uploads are stored, and the job gets an id.
- Invoice numbers take a transaction-level lock.
- Before a tool accepts work it checks that its backend is configured and up. Visitors get a plain message, never an exception.
- Brakeman and the test suite now gate deploys.

Each fix came with a test. [The case study](/work/austn-net) has the architecture diagram and the lock code. [The Playground](/playground) has a page for each tool, with how it worked.

## What I'd do next time

- Put a hosted fallback behind the same client, with a daily spend cap, so a tool keeps working when the box is down.
- Have the GPU box push a heartbeat instead of the app probing it.
- Record a short demo of every tool on the first day it works.
- Keep CI green before merging, no matter how good the diff looks.
