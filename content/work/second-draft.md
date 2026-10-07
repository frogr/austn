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
hue: plum
art: true
demo_url: https://second-draft-kcpi.onrender.com
offer: agent
links:
  - label: Code on GitHub
    url: https://github.com/frogr/second-draft
screenshot: /work/thumbs/second-draft.webp
screenshot_alt: "Second Draft coaching a short fiction draft: highlights in the text and a first fix card with a before and after"
---

Most writing feedback is vague. "Tighten this." "Show, don't tell." I wanted a coach that has to point. Paste a draft of up to 3,000 words, pick a goal (tighter, more vivid, clearer, more like you), and you get the three fixes that would change the piece most. Each one quotes a sentence you wrote, shows a before and after, says why it matters, and gives you a short exercise. Revise, run it again, and watch the numbers move.

Three fixes at a time is the whole idea. A wall of red makes people close the tab. Three things you can do today gets a second draft written.

<figure class="figure">
  <img src="/work/second-draft-1-coached.webp" alt="A fiction draft with highlighted sentences on the left, and on the right the first fix card: swap the stock phrase dark and stormy night, with before, after and an exercise" width="1280" height="800" loading="lazy">
  <figcaption>A fiction opening, coached. The first fix quotes sentence one, strikes the stock phrase, and leaves a bracketed prompt where only the writer knows the answer. <a href="https://second-draft-kcpi.onrender.com">Paste your own draft.</a></figcaption>
</figure>

## What it's for

- **Writers revising a draft.** A story opening, an essay, a cover letter. Pick the goal and get three concrete moves.
- **Teachers**, who want feedback students can check against their own text instead of taking on faith.
- **Anyone who writes for work.** The "clearer" goal leans on passive voice, hedges, filler and dense sentences, which is most of what makes a memo hard to read.
- **Any agent that edits text someone else wrote.** The validator here is the reusable part: a quote has to be in the place it says it is, or it doesn't ship. That's the <a href="/hire#agent">agent build</a> on my hire page.

## Deterministic below, probabilistic above

<figure class="figure">
  <div class="diagram" role="img" aria-label="The draft goes to eleven detectors, pure functions that produce findings with character offsets, and to metrics. Without a key, a deterministic coach ranks the findings by leverage and builds rewrites in code. With a key, a model runs a tool-use loop with five tools and a turn limit, token budget and timeout. Either way, every item passes a validator that checks the sentence number and the verbatim quote; failures get one repair turn and are then dropped, and the deterministic coach fills any gap.">
    <svg viewBox="0 0 680 200" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="sd-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <text class="label" x="10" y="20">deterministic: code measures</text>
      <rect class="box" x="10" y="30" width="90" height="44" rx="6"/><text x="55" y="50" text-anchor="middle">Draft</text><text class="label" x="55" y="65" text-anchor="middle">3,000 words</text>
      <rect class="box" x="130" y="30" width="130" height="44" rx="6"/><text x="195" y="50" text-anchor="middle">11 detectors</text><text class="label" x="195" y="65" text-anchor="middle">facts with offsets</text>
      <rect class="box" x="290" y="30" width="110" height="44" rx="6"/><text x="345" y="50" text-anchor="middle">Metrics</text><text class="label" x="345" y="65" text-anchor="middle">grade level</text>
      <rect class="box" x="420" y="30" width="130" height="44" rx="6"/><text x="485" y="50" text-anchor="middle">Validator</text><text class="label" x="485" y="65" text-anchor="middle">verbatim quote check</text>
      <rect class="box" x="570" y="30" width="100" height="44" rx="6"/><text x="620" y="50" text-anchor="middle">Three fixes</text><text class="label" x="620" y="65" text-anchor="middle">one line each</text>
      <text class="label" x="10" y="122">probabilistic: the model decides what matters</text>
      <rect class="box box--accent" x="130" y="132" width="150" height="44" rx="6"/><text x="205" y="152" text-anchor="middle">Agent, with a key</text><text class="label" x="205" y="167" text-anchor="middle">5 tools, hard limits</text>
      <rect class="box" x="310" y="132" width="150" height="44" rx="6"/><text x="385" y="152" text-anchor="middle">Deterministic coach</text><text class="label" x="385" y="167" text-anchor="middle">leverage score</text>
      <path class="edge" d="M100 52 H128" marker-end="url(#sd-arrow)"/>
      <path class="edge" d="M260 52 H288" marker-end="url(#sd-arrow)"/>
      <path class="edge" d="M195 74 V130" marker-end="url(#sd-arrow)"/>
      <path class="edge" d="M345 74 L385 130" marker-end="url(#sd-arrow)"/>
      <path class="edge" d="M280 154 H308" marker-end="url(#sd-arrow)"/>
      <path class="edge" d="M240 132 L450 76" marker-end="url(#sd-arrow)"/>
      <path class="edge" d="M420 132 L470 76" marker-end="url(#sd-arrow)"/>
      <path class="edge" d="M550 52 H568" marker-end="url(#sd-arrow)"/>
      <text class="label" x="130" y="196">if the agent fails, the deterministic coach answers and the page says so</text>
    </svg>
  </div>
  <figcaption>The model picks and explains. It never measures, and it never gets to decide where a quote is.</figcaption>
</figure>

- **Eleven detectors** find facts with character offsets: passive voice, filler and hedges, adverbs, cliches, repeated words, dialogue tags, named emotions, sentence rhythm, paragraph shape, the opening line and dense sentences.
- **Without a key,** a deterministic coach ranks findings by a leverage score and every card shows its own arithmetic. Rewrites are built by code.
- **With a key,** an agent coaches. Claude or an OpenAI model runs a tool-use loop with five tools (analyze the draft, read findings, read sentences, compare drafts, submit), with a turn limit, a token budget and a timeout. Any failure falls back to the deterministic coach and says so on the page.
- **Every citation is checked.** An item only survives if its sentence number is real and its quote appears verbatim in that sentence. Offsets are computed from the draft, never taken from the model. Bad items get one repair turn, then they're dropped.

<figure class="figure">
  <img src="/work/second-draft-2-progress.webp" alt="The revised second draft with two remaining highlights, a progress panel showing fewer findings, and metric bars comparing draft 1 to now" width="1280" height="800" loading="lazy">
  <figcaption>The second draft, coached again. Grade level, longest sentence and passive share all moved. Sentence variety went down, and the page says so.</figcaption>
</figure>

## The eval, with the error list

The eval set is 25 synthetic passages (fiction, cover letters, essays, business notes, four clean controls) with 106 labeled problems, labeled from an editor's point of view before the detectors were run. The detectors find 86% of the labels, and 88% of what they flag is right.

That precision used to be 82%, and the way it got better is my favourite part of the project. Reading all 20 false positives, 12 came from the repeated-word detector: names at the start of a sentence, repetition a writer did on purpose ("every summer ... every summer"), and nouns that name the subject. Fixing the first two, dropping an opening-line rule whose 3 findings were all wrong, and one fix to passive voice got it to 12 false positives. Repeated words is still the weakest detector at 43% precision. Telling a clumsy echo from a needed noun takes meaning, which is the model's job, so it carries the lowest weight.

The citation validator was tested by planting 887 bad citations of the kinds a model plausibly makes. It catches all of them by construction, so the useful number was the other direction: on its first run it rejected 2 of 269 good citations, because a punctuation-only rewrite looked unchanged. That's fixed, with a test. 99 tests in all, including the agent loop against mocked Anthropic and OpenAI responses, turn by turn, with the 401, 429 and 5xx paths.

Then the agent ran for real: all 25 passages, once each, on three models. Claude Haiku 4.5 finished every passage without falling back, and 21 of its 25 first submissions passed the validator in full; the repair turn fixed the other four. Haiku 5.5 went 23 of 25 and never submitted a bad quote (its two misses were empty submissions), for three cents. Sonnet 5.5 went 22 of 25, and on two fiction passages every quote in its first attempt failed the verbatim check. The validator is the reason none of that reached the page. The per-passage rows are in the repo.

The set is small, and I wrote both the passages and the detectors. It's a regression harness and an honest error list, which is what I'd want from a tool before I trusted it with my own drafts.

## What's next

- **Run it more than once.** One run per model gives one number each; the variance between runs is the next thing to know.
- **A house style as a goal.** Feed it a few pieces you like and let "more like you" learn from them, with the same checks.
- **Longer work**, chapter by chapter, with progress across the whole thing instead of one draft.
- **The same loop for other documents.** A support reply, a report, a policy. Any agent that edits text someone else wrote should quote the line it's changing.
