---
title: Second Draft
summary: A writing coach that points at exact sentences. Paste a draft, pick a goal, and get the three fixes that would change it most, each quoting a sentence you wrote.
tier: more
tagline: "A writing coach that quotes your sentence before it fixes it."
kind: project
order: 12
when: "2026"
role: Solo project
stack: [TypeScript, Node, Anthropic API, OpenAI API, Vitest]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/second-draft
screenshot: /work/thumbs/second-draft.webp
screenshot_alt: "Second Draft coaching a short fiction draft: highlights in the text and a first fix card with a before and after"
---

Paste a draft of up to 3,000 words and pick a goal (tighter, more vivid, clearer, more like you). You get the three fixes that would change the piece most. Each one quotes a sentence you wrote, shows a before and after, says why it matters, and gives you a short exercise. Revise, run it again, and watch the numbers move.

<figure class="figure">
  <img src="/work/second-draft-1-coached.webp" alt="A fiction draft with highlighted sentences on the left, and on the right the first fix: swap the stock phrase dark and stormy night, with before, after and an exercise" width="1280" height="800" loading="lazy">
  <figcaption>The deterministic coach, no API key. The "after" keeps a bracketed prompt where only the writer knows the answer.</figcaption>
</figure>

## Deterministic below, probabilistic above

Code measures the text. A model, when there is one, decides what matters and explains it.

- **Eleven detectors** find facts with character offsets: passive voice, filler and hedges, adverbs, cliches, repeated words, dialogue tags, named emotions, sentence rhythm, paragraph shape, the opening line and dense sentences.
- **Without a key,** a deterministic coach ranks findings by a leverage score and every card shows its own arithmetic. Rewrites are built by code.
- **With a key,** an agent coaches. Claude or an OpenAI model runs a tool-use loop with five tools (analyze the draft, read findings, read sentences, compare drafts, submit), with a turn limit, a token budget and a timeout. Any failure falls back to the deterministic coach and says so on the page.
- **Every citation is checked.** An item only survives if its sentence number is real and its quote appears verbatim in that sentence. Offsets are computed from the draft, never taken from the model. Bad items get one repair turn, then they're dropped.

<figure class="figure">
  <img src="/work/second-draft-2-progress.webp" alt="The revised second draft with two remaining highlights, a progress panel showing 16 fewer findings, and metric bars comparing draft 1 to now" width="1280" height="800" loading="lazy">
  <figcaption>The second draft, coached again. Grade level, longest sentence and passive share all moved. Sentence variety went down, and the page says so.</figcaption>
</figure>

## The eval, with the error list

I wrote 25 synthetic passages (fiction, cover letters, essays, business notes, four clean controls) and labeled 106 problems in them from an editor's point of view, before running the detectors. Overall the detectors find 86% of the labels, and 88% of what they flag is right.

That precision used to be 82%. Reading all 20 false positives, 12 came from the repeated-word detector: names at the start of a sentence, repetition a writer did on purpose ("every summer ... every summer"), and nouns that name the subject. Fixing the first two, dropping an opening-line rule whose 3 findings were all wrong, and one fix to passive voice got it to 12 false positives. Repeated words is still the weakest detector at 43% precision. Telling a clumsy echo from a needed noun takes meaning, which is the model's job, so it carries the lowest weight.

The citation validator was tested by planting 887 bad citations of the kinds a model plausibly makes. It catches all of them by construction, so the useful number was the other direction: on its first run it rejected 2 of 269 good citations, because a punctuation-only rewrite looked unchanged. That's fixed, with a test.

The set is small, and I wrote both the passages and the detectors. Treat it as a regression harness and an honest error list, not a benchmark.

## What's not verified

The live model path is tested only against mocked Anthropic and OpenAI responses, turn by turn, including 401, 429 and 5xx handling. No real model has coached a draft yet. It hasn't been deployed, and CI hasn't run on GitHub yet, though the same commands pass locally. 99 tests.
