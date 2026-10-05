---
title: CompanyCam
summary: Led Pages AI from an idea to about 5,000 requests a day, and built the shared RubyLLM layer other teams' AI features run on.
tier: featured
order: 2
when: "2023-25"
role: Backend Engineer, Workflows & Outputs
stack: [Ruby on Rails, RubyLLM, PostgreSQL, pgvector, Sidekiq, React, TypeScript]
legacy_ids: [pages-ai]
links:
  - label: companycam.com
    url: https://companycam.com
---

CompanyCam is the photo app contractors use on job sites: 140,000+ contractors take photos, write reports and send them to customers. I was on the Workflows & Outputs team from November 2023 to August 2025, working in a large Rails monolith.

## Pages AI

Pages is CompanyCam's document builder. Contractors use it to turn job photos into reports and other documents for their customers. Writing those on a phone at a job site is slow, and most companies weren't using it.

I led the Pages AI assistant from the first idea to production. A contractor types or talks into their phone on the job site and gets finished documentation back. It grew to about 5,000 requests a day. The share of active companies using Pages went from 4% to 11%, and customers told us it saved them 2 to 5 hours a week.

We measured adoption by company, not by user. One company can have a lot of users who never make a document, so the per-company number was the more honest one.

## The shared AI layer

Every AI feature needs the same plumbing: picking a model, prompting it, calling tools, handling failures.

So I built shared Rails abstractions on top of [RubyLLM](https://rubyllm.com), and they were adopted across the product. RubyLLM doesn't care which provider you use, and we shipped on Anthropic, OpenAI and Groq. Voice commands, context-aware invoice generation and tool-calling workflows all ran on that layer.

I also worked on evals and autonomy gating for the AI features: checking output quality and deciding when the system could act on its own.

## Search with RAG

I worked on the RAG pipelines too. We indexed the backend records into pgvector so search could understand natural language, not just keywords. That included photos: type "cat" and you get the photos of cats.

## Other work

- **Share Link** (Rails, React/TypeScript): any asset a contractor has, they can share securely with clients and payers who aren't on CompanyCam.
- **PDF exports:** cut file size 10x with streaming, compression and async processing on Sidekiq and S3, for 10,000+ exports a day.
- Mentored three developers through code reviews and architecture discussions.
