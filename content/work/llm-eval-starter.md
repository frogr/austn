---
title: LLM eval starter
summary: A small, readable test harness for LLM features. A golden set, graders, a diff between prompt versions, and a gate in CI. Free and open source.
tier: more
tagline: "A test suite for LLM features you can read in one sitting."
kind: project
order: 12
when: "2026"
role: Solo project
stack: [TypeScript, Node, Vitest, GitHub Actions]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/llm-eval-starter
screenshot: /work/thumbs/llm-eval-starter.webp
screenshot_alt: "Terminal output of an eval run: 26 of 29 cases pass, with a pass rate bar for each tag"
---

An LLM feature is code that gives different output when you change a prompt, swap a model, or the provider ships an update. Most teams test it by trying a few inputs by hand and deciding it looks better. That works for about a week.

This repo is the fix I'd reach for first: the same kind of test suite we write for any other code. A fixed set of realistic inputs with known-good answers (a golden set), graders that score outputs the same way every time, a diff that shows which cases changed between two prompt versions, and a gate in CI that fails the build when quality drops below a floor. The example feature is support-ticket triage. It runs offline with no API key, and with a key it calls Anthropic or OpenAI through plain `fetch`.

<figure class="figure">
  <img src="/work/llm-eval-starter-1-eval.webp" alt="Terminal output of npm run eval for prompt v2: 26 of 29 cases pass, pass rates by tag and by grader, three failing cases with reasons, and the gate passing" width="1280" height="1000" loading="lazy">
  <figcaption>A run of the revised prompt against the built-in mock model. Real output, rendered from the terminal.</figcaption>
</figure>

## What the demo shows

The golden set is 29 hand-written tickets, and most of them are the hard ones: shouting, sarcasm, three issues in one message, a fake `SYSTEM:` tag, a message that just says "hi". Each case has tags, so a report can say prompt injection broke, not just that the score dropped.

The first-draft prompt passes 15 of 29 (51.7%) with 4 unparseable outputs and fails the gate. The revised prompt passes 26 of 29 (89.7%) and passes. That's 38 points better, and you still shouldn't merge it without reading the diff:

<figure class="figure">
  <img src="/work/llm-eval-starter-2-compare.webp" alt="Terminal output of npm run compare v1 v2: overall 51.7% to 89.7%, per-tag deltas with multi-issue down 25 points, two regressions and thirteen fixes" width="1280" height="1000" loading="lazy">
  <figcaption>The compare step. Two cases went from pass to fail, and the multi-issue tag dropped 25 points while the total went up. Long lines are cut off on the right.</figcaption>
</figure>

A stricter length cap on summaries drops the third issue from a three-issue ticket, and a new escalation rule over-escalates a polite cancellation. The average hides both. The per-case diff doesn't.

These numbers come from a mock model, a keyword classifier with failure modes built in on purpose, so the harness can run in CI and in the README without a key. They show the harness working. They say nothing about how a real model does on your prompts.

## Why it's built this way

- **Code grades what has a right answer.** Valid JSON, the category, priority within a tolerance, length limits. Those graders are free and never disagree with themselves.
- **A model grades only what code can't.** Whether the summary is faithful, complete and in English. The judge gets independent pass/fail questions, not "rate this 1 to 10", and has to give a reason for each verdict.
- **Floors per tag, not just overall.** A strong average can't hide a category that collapsed. Prompt injection has to be 100%.
- **Cost and latency in the same report.** The revised prompt nearly triples input tokens, and that belongs next to the quality numbers.

It has no runtime dependencies, a response cache so re-grading costs nothing, and a nine-step guide in the README for swapping in your own feature. It's the free first step of my course, [Evals in Production](/courses/evals-in-production), which goes into building the golden set from production logs, calibrating the judge, and gating what ships without a person.

The live-model path is written to the Anthropic and OpenAI docs but hasn't been run here against either API.
