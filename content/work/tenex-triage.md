---
title: Inbox triage
summary: Sorts your last 200 Gmail threads into buckets with an LLM, never overwrites your own moves, and costs about $0.002 a run.
tier: more
tagline: "Sorts 200 Gmail threads for $0.002 a run."
kind: project
order: 19
when: "2026"
role: Solo project
stack: [TypeScript, Next.js, Postgres, Prisma, OpenAI]
links:
  - label: Try it
    url: https://tenex-triage.vercel.app
  - label: Code on GitHub
    url: https://github.com/frogr/tenex-triage
screenshot: /work/thumbs/tenex-triage.webp
screenshot_alt: "Inbox triage landing page: your inbox is chaos, we fix that, sign in with Google"
---

Connects to Gmail with read-only access, pulls your latest ~200 threads, and sorts each one into buckets with GPT-4o-mini and a confidence score. You fix the mistakes with drag and drop.

<figure class="figure">
  <img src="/work/tenex-triage-1-landing.webp" alt="Inbox triage landing page: your inbox is chaos, we fix that. 200 emails, 5 seconds, zero stress, and a sign in with Google button" width="1280" height="800" loading="lazy">
  <figcaption>The front door. Everything past it needs your Gmail, so that's the part I can show here.</figcaption>
</figure>

Two rules made it usable:

- Only threads that haven't been classified yet go to the model, so a run costs about $0.002 for 200 threads.
- A thread you moved by hand is never moved again by the model.

Every classification is logged with its tokens and cost. 52 tests.
