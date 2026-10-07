---
title: CompanyCam
summary: Led Pages AI from an idea to about 5,000 requests a day, and built shared RubyLLM abstractions that were adopted across the product.
tagline: "Monolithic Rails app: RAG pipeline, generative AI features, AI agents."
tier: featured
kind: job
order: 2
when: "2023-25"
role: Backend Engineer, Workflows & Outputs
stats:
  - value: "~5,000"
    label: "requests a day to the Pages AI assistant"
  - value: "4% → 11%"
    label: "of active companies using Pages"
  - value: "2 to 5 hrs"
    label: "saved a week, customers told us"
  - value: "10x"
    label: "smaller PDF exports"
stack: [Ruby on Rails, RubyLLM, PostgreSQL, pgvector, Sidekiq, React, TypeScript]
legacy_ids: [pages-ai]
links:
  - label: companycam.com
    url: https://companycam.com
screenshot: /work/thumbs/companycam.webp
screenshot_alt: "The CompanyCam homepage: how field work moves forward"
blurb: "A photo app for contractors. Backend engineer on the team that turns photos into reports, including its AI assistant."
---

CompanyCam is the photo app contractors use on job sites: 140,000+ contractors take photos, write reports and send them to customers. I was on the Workflows & Outputs team from November 2023 to August 2025, working in a large Rails monolith.

## Pages AI

Pages is CompanyCam's document builder. Contractors use it to turn job photos into reports and other documents for their customers. Writing those on a phone at a job site is slow.

I led the Pages AI assistant from the first idea to production. A contractor types or talks into their phone on the job site and gets finished documentation back. It grew to about 5,000 requests a day. With the assistant, the share of active companies using Pages went from 4% to 11%, and customers told us it saved them 2 to 5 hours a week.

We measured adoption by company, not by user. One company can have a lot of users who never make a document, so the per-company number was the more honest one.

<figure class="figure">
  <img src="/work/companycam-1-pages.webp" alt="CompanyCam's Pages feature page: put your photos to work, build job documents, photo reports, SOPs and daily logs from the photos you're already taking" width="1280" height="740" loading="lazy">
  <figcaption>Pages, as CompanyCam sells it today. The assistant lives inside this.</figcaption>
</figure>

## The shared AI layer

Every AI feature needs the same plumbing: picking a model, prompting it, calling tools, handling failures.

So I built shared Rails abstractions on top of [RubyLLM](https://rubyllm.com), and they were adopted across the product. RubyLLM doesn't care which provider you use, and we shipped on Anthropic, OpenAI and Groq. Voice commands, context-aware invoice generation and tool-calling workflows all ran on that layer.

<figure class="figure">
  <div class="diagram" role="img" aria-label="Pages AI, voice commands, invoice generation and tool-calling workflows all go through one shared AI layer built on RubyLLM, which talks to Anthropic, OpenAI and Groq">
    <svg viewBox="0 0 680 222" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="cc-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6c756f"/></marker></defs>
      <rect class="box" x="10" y="12" width="180" height="38" rx="6"/><text x="100" y="36" text-anchor="middle">Pages AI</text>
      <path class="edge" d="M190 31 L258 111" marker-end="url(#cc-arrow)"/>
      <rect class="box" x="10" y="64" width="180" height="38" rx="6"/><text x="100" y="88" text-anchor="middle">Voice commands</text>
      <path class="edge" d="M190 83 L258 111" marker-end="url(#cc-arrow)"/>
      <rect class="box" x="10" y="116" width="180" height="38" rx="6"/><text x="100" y="140" text-anchor="middle">Invoice generation</text>
      <path class="edge" d="M190 135 L258 111" marker-end="url(#cc-arrow)"/>
      <rect class="box" x="10" y="168" width="180" height="38" rx="6"/><text x="100" y="192" text-anchor="middle">Tool-calling workflows</text>
      <path class="edge" d="M190 187 L258 111" marker-end="url(#cc-arrow)"/>
      <rect class="box box--accent" x="260" y="73" width="170" height="76" rx="6"/><text x="345" y="107" text-anchor="middle">Shared AI layer</text><text class="label" x="345" y="125" text-anchor="middle">Rails, on RubyLLM</text>
      <rect class="box" x="500" y="38" width="170" height="38" rx="6"/><text x="585" y="62" text-anchor="middle">Anthropic</text>
      <path class="edge" d="M430 111 L498 57" marker-end="url(#cc-arrow)"/>
      <rect class="box" x="500" y="90" width="170" height="38" rx="6"/><text x="585" y="114" text-anchor="middle">OpenAI</text>
      <path class="edge" d="M430 111 L498 109" marker-end="url(#cc-arrow)"/>
      <rect class="box" x="500" y="142" width="170" height="38" rx="6"/><text x="585" y="166" text-anchor="middle">Groq</text>
      <path class="edge" d="M430 111 L498 161" marker-end="url(#cc-arrow)"/>
    </svg>
  </div>
  <figcaption>Features on the left, providers on the right, one layer in between.</figcaption>
</figure>

I also worked on evals and autonomy gating for the AI features: checking output quality and deciding when the system could act on its own.

## Search with RAG

I worked on the RAG pipelines too. We indexed the backend records into pgvector so search could understand natural language, not just keywords. That included photos: type "cat" and you get the photos of cats.

## Other work

- **Share Link** (Rails, React/TypeScript): any asset a contractor has, they can share securely with clients and payers who aren't on CompanyCam.
- **PDF exports:** cut file size 10x with streaming, compression and async processing on Sidekiq and S3, for 10,000+ exports a day.
