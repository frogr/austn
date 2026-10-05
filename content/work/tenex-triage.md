---
title: Inbox triage
summary: Sorts your last 200 Gmail threads into buckets with an LLM, never overwrites your own moves, and costs about $0.002 a run.
tier: more
order: 13
when: "2026"
role: Solo project
stack: [TypeScript, Next.js, Postgres, Prisma, OpenAI]
links:
  - label: Try it
    url: https://tenex-triage.vercel.app
  - label: Code on GitHub
    url: https://github.com/frogr/tenex-triage
---

Connects to Gmail with read-only access, pulls your latest ~200 threads, and sorts each one into buckets with GPT-4o-mini and a confidence score. You fix the mistakes with drag and drop.

Two rules made it usable:

- Only threads that haven't been classified yet go to the model, so a run costs about $0.002 for 200 threads.
- A thread you moved by hand is never moved again by the model.

Every classification is logged with its tokens and cost. 52 tests.
