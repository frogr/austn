---
title: Follow-up engine
summary: Decides which open quotes get a follow-up, drafts it, and sends it through guardrails it can't skip. Includes a check that the tests catch broken guardrails.
tier: more
order: 11
when: "2026"
role: Take-home, solo
stack: [Ruby, SQLite]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/robby-followup-engine
---

A take-home for a company that builds sales software for home-service businesses. For a given "now", the engine decides which open quotes deserve a follow-up, drafts a message for each, and moves it through draft, approve and send into an outbox. Nothing is actually delivered: the outbox table stands in for the SMS provider.

It's plain Ruby and SQLite with one CLI. "Now" is always an argument, so every output in the README can be reproduced from an empty database.

## The guardrails

The send step is where a mistake costs a customer, so the rules live in the database statement that sends, not in a check before it:

- a cooldown between follow-ups to the same person
- no follow-up on a quote that's already accepted
- never send the same message twice, even when a send is retried
- a cap on follow-ups per quote

Every re-run is a no-op: a second ingest, draft, send or retry changes nothing.

## Tests that can fail

The repo also checks its own tests: it weakens the code on purpose, one guardrail at a time, and confirms the suite fails each time.

The README also covers how I'd run it for 50 shops: which follow-ups can go out on their own, and which need a person to approve them until the shop trusts it.
