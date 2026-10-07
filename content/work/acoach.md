---
title: aCoach
summary: An AI coach that reviews a ranked League of Legends game for about ten cents, and every sentence it writes points at a timestamp it can prove.
tier: more
tagline: "Reviews a League game from Riot's match data for about ten cents."
kind: project
order: 11
when: "2026"
role: Solo project
stack: [Python, FastAPI, Postgres, HTMX, Anthropic API]
screenshot: /work/thumbs/acoach.webp
screenshot_alt: "aCoach match page: result header, performance score, gold bar and a ten-player scoreboard"
---

Paste a Riot ID, pick a game, and aCoach writes a review of it: the three things to fix, then one section per moment that mattered, each with what happened, why it cost you, and what to do instead. It reads Riot's match and timeline data, not video. The whole pipeline costs about ten cents a game, and the cost is printed at the bottom of every review.

<figure class="figure">
  <img src="/work/acoach-1-match.webp" alt="aCoach match page: a Defeat header for Ahri mid versus Syndra, a 6.0 performance score, a gold-difference bar, and a scoreboard for all ten players with KDA, damage, gold, CS, vision and items" width="1280" height="1000" loading="lazy">
  <figcaption>The match page, built from Riot data only. Scores are lobby-relative and role-aware. This is the seeded demo game.</figcaption>
</figure>

## Deterministic below, probabilistic above

The design rule is that the model never decides what happened. Pure functions do.

<figure class="figure">
  <div class="diagram" role="img" aria-label="Riot match and timeline data is normalised into a GameModel, run through detectors that produce moments, then a question bank produces typed evidence rows from the API and from an LLM. An assembler picks the moments, a writer LLM writes the review, and a validator checks that every claim traces back to an evidence row.">
    <svg viewBox="0 0 680 200" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="ac-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <text class="label" x="10" y="20">deterministic: no model, no network</text>
      <rect class="box" x="10" y="30" width="100" height="44" rx="6"/><text x="60" y="50" text-anchor="middle">Riot data</text><text class="label" x="60" y="65" text-anchor="middle">match + timeline</text>
      <rect class="box" x="140" y="30" width="100" height="44" rx="6"/><text x="190" y="50" text-anchor="middle">GameModel</text><text class="label" x="190" y="65" text-anchor="middle">normalised</text>
      <rect class="box" x="270" y="30" width="100" height="44" rx="6"/><text x="320" y="50" text-anchor="middle">Detectors</text><text class="label" x="320" y="65" text-anchor="middle">deaths, backs, roams...</text>
      <rect class="box" x="400" y="30" width="100" height="44" rx="6"/><text x="450" y="50" text-anchor="middle">Moments</text><text class="label" x="450" y="65" text-anchor="middle">with severity</text>
      <rect class="box" x="530" y="30" width="140" height="44" rx="6"/><text x="600" y="50" text-anchor="middle">Evidence rows</text><text class="label" x="600" y="65" text-anchor="middle">typed, with a source</text>
      <text class="label" x="10" y="122">probabilistic: the only places a model runs</text>
      <rect class="box box--accent" x="140" y="132" width="110" height="44" rx="6"/><text x="195" y="152" text-anchor="middle">LLM questions</text><text class="label" x="195" y="167" text-anchor="middle">4 of 15 in the bank</text>
      <rect class="box box--accent" x="290" y="132" width="110" height="44" rx="6"/><text x="345" y="152" text-anchor="middle">Writer</text><text class="label" x="345" y="167" text-anchor="middle">drafts the review</text>
      <rect class="box" x="440" y="132" width="110" height="44" rx="6"/><text x="495" y="152" text-anchor="middle">Validator</text><text class="label" x="495" y="167" text-anchor="middle">every claim cites a row</text>
      <rect class="box" x="590" y="132" width="80" height="44" rx="6"/><text x="630" y="159" text-anchor="middle">Review</text>
      <path class="edge" d="M110 52 H138" marker-end="url(#ac-arrow)"/>
      <path class="edge" d="M240 52 H268" marker-end="url(#ac-arrow)"/>
      <path class="edge" d="M370 52 H398" marker-end="url(#ac-arrow)"/>
      <path class="edge" d="M500 52 H528" marker-end="url(#ac-arrow)"/>
      <path class="edge" d="M600 74 V100 H195 V130" marker-end="url(#ac-arrow)"/>
      <path class="edge" d="M250 154 H288" marker-end="url(#ac-arrow)"/>
      <path class="edge" d="M400 154 H438" marker-end="url(#ac-arrow)"/>
      <path class="edge" d="M550 154 H588" marker-end="url(#ac-arrow)"/>
    </svg>
  </div>
  <figcaption>The top row is pure functions over a normalised game, tested on synthetic timelines. The model only answers questions and writes.</figcaption>
</figure>

- **Detectors** for deaths, backs, lane swings, objectives, roams, vision, fights and builds turn the timeline into moments. Each has synthetic-timeline tests, plus two real games checked in as fixtures with assertions.
- **A question bank** (YAML, versioned by hash) asks typed questions about each moment. Most are answered straight from the data. A few go to a model.
- **The writer** gets evidence rows, not the game, and the validator rejects any sentence that doesn't trace back to one.
- **An eval harness** scores reviews against golden games, and a cost ledger records every model call.

<figure class="figure">
  <img src="/work/acoach-2-timeline.webp" alt="aCoach timeline tab: a scrubber at 25:10, a minimap with all ten champions, a team gold difference chart with event markers, and a filtered event feed" width="1280" height="1000" loading="lazy">
  <figcaption>The timeline tab plays the game back. Champions move on the minimap, the gold chart marks events, and clicking a moment opens its evidence.</figcaption>
</figure>

## What else is in there

A match page with five tabs (overview, timeline, builds, runes, stats), a profile page with rank history that grows each time you visit, a job queue in Postgres using `SKIP LOCKED` with backoff and a reaper, a daily cap per Riot ID, PostHog events, and a `demo` command that builds a whole review from a synthetic game with no API keys, which is how the screenshots here were made. Mid lane only for now, NA only, ranked solo only. Those are deliberate.
