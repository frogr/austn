---
title: LLM eval starter
summary: A small, readable test harness for LLM features. A golden set, graders, a diff between prompt versions, and a gate in CI. Free and open source, and the first step of my course.
tier: more
tagline: "A test suite for LLM features you can read in one sitting."
kind: project
order: 12
when: "2026"
role: Solo project
stack: [TypeScript, Node, Vitest, GitHub Actions]
hue: sun
art: true
offer: eval-sprint
links:
  - label: Code on GitHub
    url: https://github.com/frogr/llm-eval-starter
  - label: The course it starts
    url: /courses/evals-in-production
screenshot: /work/thumbs/llm-eval-starter.webp
screenshot_alt: "Terminal output of an eval run: 26 of 29 cases pass, with a pass rate bar for each tag"
---

An LLM feature is code that gives different output when you change a prompt, swap a model, or the provider ships an update. Most teams test it by trying a few inputs by hand and deciding it looks better. That works for about a week.

This repo is the fix I reach for first, small enough to read in a sitting: the same kind of test suite we write for any other code. A fixed set of realistic inputs with known-good answers (a golden set), graders that score outputs the same way every time, a diff that shows which cases changed between two prompt versions, and a gate in CI that fails the build when quality drops below a floor. The example feature is support-ticket triage. It runs offline with no API key, and with a key it calls Anthropic or OpenAI through plain `fetch`.

<figure class="figure">
  <img src="/work/llm-eval-starter-1-eval.webp" alt="Terminal output of npm run eval for prompt v2: 26 of 29 cases pass, pass rates by tag and by grader, three failing cases with reasons, and the gate passing" width="1280" height="1000" loading="lazy">
  <figcaption>One run of the revised prompt: 26 of 29 pass, the pass rate by tag and by grader, the three failures with reasons, and the gate. Real output, rendered from the terminal.</figcaption>
</figure>

## What the demo shows

The golden set is 29 synthetic tickets, and most of them are the hard ones: shouting, sarcasm, three issues in one message, a fake `SYSTEM:` tag, a message that just says "hi". Each case has tags, so a report can say prompt injection broke, not just that the score dropped.

The first-draft prompt passes 15 of 29 (51.7%) with 4 unparseable outputs and fails the gate. The revised prompt passes 26 of 29 (89.7%) and passes. That's about 38 points better, and you still shouldn't merge it without reading the diff:

<figure class="figure">
  <img src="/work/llm-eval-starter-2-compare.webp" alt="Terminal output of npm run compare v1 v2: overall 51.7% to 89.7%, per-tag deltas with multi-issue down 25 points, two regressions and thirteen fixes" width="1280" height="1000" loading="lazy">
  <figcaption>The compare step. Two cases went from pass to fail, and the multi-issue tag dropped 25 points while the total went up.</figcaption>
</figure>

A stricter length cap on summaries drops the third issue from a three-issue ticket, and a new escalation rule over-escalates a polite cancellation. The average hides both. The per-case diff doesn't. That's the lesson of the whole repo in one screenshot.

The numbers above come from a mock model, a keyword classifier with failure modes built in on purpose, so the harness runs in CI and in the README without a key. On a real model (Claude Haiku 4.5, one run each) the first prompt passes 13 of 29 and the revised one 17 of 29, and both fail the gate, mostly because the model hands tickets to a human that the golden set says it should handle alone. Neither prompt was written for that model, so those are a baseline, and the gate did what it's for: a prompt that looks fine on the mock does not get to merge. The reports are in the repo. Your prompts are what the sprint is for.

## What it's for

- **A team shipping its first LLM feature**, who wants a test suite before the second prompt change, not after the first incident.
- **Anyone comparing models.** Same golden set, two models, one diff, with cost and latency in the same report.
- **Learning how evals work** by reading one that fits in a sitting. No framework, no runtime dependencies.
- **The first week of a real eval setup.** Swap in your feature with the nine-step guide in the README. If you'd rather I did that week, it's the <a href="/hire#eval-sprint">eval setup sprint</a>.

## Why it's built this way

<figure class="figure">
  <div class="diagram" role="img" aria-label="A golden set of cases with tags feeds a runner that calls the model, or a mock. Outputs go to code graders for things with a right answer and to a model judge only for things code can't check. Results go to a per-tag report, a diff against the previous prompt version, and a gate in CI with floors per tag.">
    <svg viewBox="0 0 680 170" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="ev-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="60" width="110" height="44" rx="6"/><text x="65" y="80" text-anchor="middle">Golden set</text><text class="label" x="65" y="95" text-anchor="middle">29 cases</text>
      <rect class="box" x="150" y="60" width="110" height="44" rx="6"/><text x="205" y="80" text-anchor="middle">Runner</text><text class="label" x="205" y="95" text-anchor="middle">model or mock</text>
      <rect class="box" x="290" y="20" width="130" height="44" rx="6"/><text x="355" y="40" text-anchor="middle">Code graders</text><text class="label" x="355" y="55" text-anchor="middle">JSON, category</text>
      <rect class="box box--accent" x="290" y="100" width="130" height="44" rx="6"/><text x="355" y="120" text-anchor="middle">Model judge</text><text class="label" x="355" y="135" text-anchor="middle">what code can't</text>
      <rect class="box" x="450" y="20" width="100" height="44" rx="6"/><text x="500" y="40" text-anchor="middle">Report</text><text class="label" x="500" y="55" text-anchor="middle">tags, cost, time</text>
      <rect class="box" x="450" y="100" width="100" height="44" rx="6"/><text x="500" y="120" text-anchor="middle">Diff</text><text class="label" x="500" y="135" text-anchor="middle">v1 vs v2</text>
      <rect class="box" x="570" y="60" width="100" height="44" rx="6"/><text x="620" y="80" text-anchor="middle">CI gate</text><text class="label" x="620" y="95" text-anchor="middle">floors per tag</text>
      <path class="edge" d="M120 82 H148" marker-end="url(#ev-arrow)"/>
      <path class="edge" d="M260 76 L288 48" marker-end="url(#ev-arrow)"/>
      <path class="edge" d="M260 88 L288 116" marker-end="url(#ev-arrow)"/>
      <path class="edge" d="M420 42 H448" marker-end="url(#ev-arrow)"/>
      <path class="edge" d="M420 122 H448" marker-end="url(#ev-arrow)"/>
      <path class="edge" d="M550 42 L568 72" marker-end="url(#ev-arrow)"/>
      <path class="edge" d="M550 122 L568 92" marker-end="url(#ev-arrow)"/>
    </svg>
  </div>
  <figcaption>Code grades what has a right answer. A model grades only what code can't, and has to give a reason.</figcaption>
</figure>

- **Code grades what has a right answer.** Valid JSON, the category, priority within a tolerance, length limits. Those graders are free and never disagree with themselves.
- **A model grades only what code can't.** Whether the summary is faithful, complete and in English. The judge gets independent pass/fail questions, not "rate this 1 to 10", and has to give a reason for each verdict.
- **Floors per tag, not just overall.** A strong average can't hide a category that collapsed. Prompt injection has to be 100%.
- **Cost and latency in the same report.** The revised prompt nearly triples input tokens, and that belongs next to the quality numbers.

It has no runtime dependencies, a response cache so re-grading costs nothing, and a nine-step guide in the README for swapping in your own feature. It's the free first step of my course, [Evals in Production](/courses/evals-in-production), which goes into building the golden set from production logs, calibrating the judge, and gating what ships without a person.

## What's next

Most of it is the course.

- **Golden sets from production logs**, scrubbed and labeled blind, so the cases are the ones your users actually send.
- **A calibrated judge**: measure the model judge against human labels before trusting it.
- **A nightly full run** that measures flakiness, and a PR comment people read.
