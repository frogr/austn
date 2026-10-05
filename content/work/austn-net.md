---
title: austn.net's GPU tools
summary: Nine AI tools on one GPU in my apartment, open to anyone on the web. It handled tens of thousands of jobs. This page covers how it worked and what broke.
tier: featured
order: 5
when: 2025-26
role: Solo project
stack: [Ruby on Rails, Sidekiq, Redis, Python, Flask, ComfyUI, Tailscale]
legacy_ids: [ai-tools, ai-lab]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/austn
  - label: The tools, one by one
    url: /playground
---

From August 2025 to February 2026, anyone on the internet could use nine AI tools on this site, including image generation, music, text to speech, stem splitting, background removal, image to SVG, image to 3D, and chat. They all ran on one consumer GPU at my place in California. Together they handled tens of thousands of inference jobs.

Then I moved to New York and the GPU didn't come with me. The tools are offline now. This page is about how they worked, and what I'd change.

## The setup

<figure class="figure">
  <div class="diagram" role="img" aria-label="Browser to Rails on a VPS, to Sidekiq on the gpu queue, over Tailscale to the home GPU box running ComfyUI, the TTS server and LM Studio">
    <svg viewBox="0 0 680 230" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="a-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6c756f"/></marker></defs>
      <rect class="box" x="10" y="90" width="90" height="44" rx="6"/><text x="55" y="117" text-anchor="middle">Browser</text>
      <rect class="box" x="130" y="90" width="120" height="44" rx="6"/><text x="190" y="110" text-anchor="middle">Rails</text><text class="label" x="190" y="125" text-anchor="middle">VPS</text>
      <rect class="box box--accent" x="280" y="90" width="120" height="44" rx="6"/><text x="340" y="110" text-anchor="middle">Sidekiq</text><text class="label" x="340" y="125" text-anchor="middle">gpu queue + lock</text>
      <rect class="box" x="430" y="10" width="240" height="210" rx="8" stroke-dasharray="4 4"/><text class="label" x="550" y="30" text-anchor="middle">home GPU box, over Tailscale</text>
      <rect class="box" x="460" y="45" width="180" height="40" rx="6"/><text x="550" y="70" text-anchor="middle">ComfyUI (6 tools)</text>
      <rect class="box" x="460" y="100" width="180" height="40" rx="6"/><text x="550" y="125" text-anchor="middle">TTS server (Flask)</text>
      <rect class="box" x="460" y="155" width="180" height="40" rx="6"/><text x="550" y="180" text-anchor="middle">LM Studio (chat)</text>
      <path class="edge" d="M100 112 H128" marker-end="url(#a-arrow)"/>
      <path class="edge" d="M250 112 H278" marker-end="url(#a-arrow)"/>
      <path class="edge" d="M400 105 L458 65" marker-end="url(#a-arrow)"/>
      <path class="edge" d="M400 112 H458" marker-end="url(#a-arrow)"/>
      <path class="edge" d="M400 120 L458 175" marker-end="url(#a-arrow)"/>
    </svg>
  </div>
  <figcaption>The website and the GPU lived in different places. Everything between them went through one queue.</figcaption>
</figure>

The site is a Rails app on a small DigitalOcean server. The GPU box sat at home and was reachable only over Tailscale, so nothing on it was exposed to the internet. Six tools ran as ComfyUI workflows. ComfyUI is an open-source app that runs image and audio models as a graph of steps, and it has an HTTP API. Text to speech ran on its own Flask server. Chat went to LM Studio.

## One GPU, many tools, strangers on the internet

The hard constraint was simple: one GPU can only do one heavy thing at a time, and I had no control over when people showed up.

Every request became a Sidekiq job on a dedicated `gpu` queue. A job takes a Redis lock before it touches the GPU. If the lock is taken, the job puts itself back on the queue a few seconds later. The page polls for status, and shows your place in line.

The lock stores the job's id as its value, and only the job holding it can release it. Release is a single compare-and-delete script in Redis:

```ruby
module Gpu
  class Lock
    RELEASE_SCRIPT = <<~LUA.freeze
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      end
      return 0
    LUA

    def acquire(holder, ttl:)
      @redis.set(@key, holder, nx: true, ex: ttl.to_i)
    end

    def release(holder)
      @redis.eval(RELEASE_SCRIPT, keys: [ @key ], argv: [ holder ]) == 1
    end
  end
end
```

## Keeping an eye on it

A health check pinged each backend (ComfyUI's system stats, the TTS server's health route, LM Studio's model list) and stored a status per tool. Each tool page showed whether its backend was up. Generation endpoints are rate-limited per IP so one person can't hog the GPU.

## What broke

- **The lock could expire mid-job.** It lived for five minutes, but stem separation could run for fifteen. A long job would lose the lock and a second job would start on the same GPU. Each tool now sets a lock lifetime longer than its longest run.
- **Release wasn't atomic.** It was a read and then a delete, with a small window to delete someone else's lock. That's what the script above fixes.
- **A retry setting broke on the Rails upgrade.** `:exponentially_longer` was removed in Rails 7.2, so on Rails 8 the first failure raised inside the retry handler instead of retrying. Now it retries dropped connections with backoff and gives up straight away when the box is offline.
- **Uploads rode inside the job.** Files were base64-encoded into Sidekiq's job arguments, so a 10 MB song became a 13 MB job sitting in Redis and getting re-queued every few seconds while it waited. Now the upload is stored and the job gets an id.
- **Nothing degraded gracefully.** When I moved, every tool kept accepting work, timed out, and showed visitors a raw connection error with the GPU's private address in it. Now a tool checks its backend before taking work, visitors see a plain message, and the pages point here.

Most of these turned up in a code review after the move. The fixes are in the repo, with tests.

## What I'd do differently

- Put a hosted fallback behind the same client, with a daily spend cap, so a tool can keep working when the box is down.
- Have the GPU box push a heartbeat instead of the app probing it, so the app never waits on a dead host.
- Use websockets from ComfyUI for progress instead of polling it from inside a worker.
- Record a short demo of every tool on day one.
