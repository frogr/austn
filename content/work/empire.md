---
title: EMPIRE://36
summary: A turn-based roguelike set in New York in 2036. Every world seed simulates the ten years before you arrive, and you find the history as graffiti, shrines and flood lines.
tier: more
tagline: "A roguelike that simulates ten years of New York first."
kind: project
order: 17
when: "2026"
role: Solo project
stack: [TypeScript, Vite, Canvas, Web Workers, Node, SQLite]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/empire
screenshot: /work/thumbs/empire.webp
screenshot_alt: "EMPIRE://36's city map of New York with neighborhood stats"
---

EMPIRE://36 is a glyph-rendered, keyboard-only roguelike. A new mayor takes office in January 2026. The game simulates the decade that follows, fresh for every seed: collapses, cults, leagues, wars between landlords and gods. Then it drops you into what's left and lets you try to get rich before the city kills you.

The map is real. 122 NYC neighborhoods with the borough coastlines, rivers and routes where they belong, and procedurally generated streets, blocks and interiors inside each one. You can die in Bushwick.

<figure class="figure">
  <img src="/work/empire-1-street.webp" alt="EMPIRE://36 street view: a glyph map of a Carroll Gardens intersection lit around the player, with HP, cash and the date in the header, a hint bar, and a message log at the bottom" width="1280" height="673" loading="lazy">
  <figcaption>Turn 22 on Suydam St and Cypress Ave. You see what your character can see.</figcaption>
</figure>

<figure class="figure">
  <img src="/work/empire-2-map.webp" alt="The city map: borough landmass in colour with crime, money, infrastructure and faith stats for Carroll Gardens, transit lines, and flooded-out areas marked" width="1280" height="673" loading="lazy">
  <figcaption>The travel map. Each neighborhood has its own crime, money, infrastructure and faith, and the decade changed them.</figcaption>
</figure>

## The city runs without you

<figure class="figure">
  <div class="diagram" role="img" aria-label="Worldgen simulates 2026 to 2036 from a seed, writing a chronicle and leaving residue on the map. At play time, three tiers of simulation run: tier one actors around the player, tier two neighborhood records, and tier three a citywide daily tick. A street director stages what the simulation decides as scenes near the player. The simulation runs in a Web Worker and the render thread only draws.">
    <svg viewBox="0 0 680 200" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="em-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="20" width="110" height="44" rx="6"/><text x="65" y="40" text-anchor="middle">Seed</text><text class="label" x="65" y="55" text-anchor="middle">shareable in the URL</text>
      <rect class="box box--accent" x="160" y="20" width="130" height="44" rx="6"/><text x="225" y="40" text-anchor="middle">2026 to 2036</text><text class="label" x="225" y="55" text-anchor="middle">~90 event templates</text>
      <rect class="box" x="330" y="20" width="110" height="44" rx="6"/><text x="385" y="40" text-anchor="middle">Chronicle</text><text class="label" x="385" y="55" text-anchor="middle">faiths, factions, leagues</text>
      <rect class="box" x="480" y="20" width="190" height="44" rx="6"/><text x="575" y="40" text-anchor="middle">Residue on the map</text><text class="label" x="575" y="55" text-anchor="middle">graffiti, shrines, flood lines, burn scars</text>
      <text class="label" x="10" y="110">at play time, in a Web Worker</text>
      <rect class="box" x="10" y="120" width="130" height="44" rx="6"/><text x="75" y="140" text-anchor="middle">Tier 3: city</text><text class="label" x="75" y="155" text-anchor="middle">daily tick, 5 arcs</text>
      <rect class="box" x="170" y="120" width="140" height="44" rx="6"/><text x="240" y="140" text-anchor="middle">Tier 2: neighborhood</text><text class="label" x="240" y="155" text-anchor="middle">records, prosperity, heat</text>
      <rect class="box" x="340" y="120" width="130" height="44" rx="6"/><text x="405" y="140" text-anchor="middle">Tier 1: actors</text><text class="label" x="405" y="155" text-anchor="middle">in your bubble</text>
      <rect class="box box--accent" x="500" y="120" width="170" height="44" rx="6"/><text x="585" y="140" text-anchor="middle">Street director</text><text class="label" x="585" y="155" text-anchor="middle">stages crowds, vigils, blackouts</text>
      <path class="edge" d="M120 42 H158" marker-end="url(#em-arrow)"/>
      <path class="edge" d="M290 42 H328" marker-end="url(#em-arrow)"/>
      <path class="edge" d="M440 42 H478" marker-end="url(#em-arrow)"/>
      <path class="edge" d="M140 142 H168" marker-end="url(#em-arrow)"/>
      <path class="edge" d="M310 142 H338" marker-end="url(#em-arrow)"/>
      <path class="edge" d="M470 142 H498" marker-end="url(#em-arrow)"/>
      <path class="edge" d="M575 64 V118" marker-end="url(#em-arrow)"/>
    </svg>
  </div>
  <figcaption>History is generated once per seed and discovered as residue. The live city is three tiers of simulation, with a director that puts what it decides on the street in front of you.</figcaption>
</figure>

<figure class="figure">
  <img src="/work/empire-3-chronicle.webp" alt="The Decade: a chronicle of 2026 to 2036 for this seed, year by year, with events like the Hollow Kings rising out of Brownsville and the Throgs Neck miracle of 2026" width="1280" height="673" loading="lazy">
  <figcaption>The chronicle for seed "austn". Generated once, then left for you to find in the world.</figcaption>
</figure>

- **Determinism is a feature.** Same seed, same decade, same city. Tests check it.
- **The simulation is off the render thread.** It runs in a Web Worker and sends state across as transferable buffers, so the turn resolves in under a frame and the canvas only draws.
- **Money becomes position.** A black-market fence, a property ladder from an SRO cot to a storefront that earns and draws shakedowns, hired muscle that stays dead, and a profile that makes loud wealth a target.
- **Institutions you can join and rise in**: a law firm, a clinic network, a transit-salvage crew, a faith hierarchy, a street crew. Five citywide arcs run whether you're in them or not and repaint the map when they resolve.
- **A vertical city.** Sewers and dead subway tubes under every neighborhood. Go in debt and you take the drop: stripped and dumped underground instead of killed.
- **Permadeath with continuity.** Dead characters leave graves, stashes and obituaries in the same world for the next one.

Server-side saves with username and password (argon2id), autosave, a localStorage fallback, a CRT shader, and 51 tests covering determinism, map connectivity, performance budgets and an end-to-end simulated run. Every actor with behaviour or dialogue is fictional; real public figures only appear as datelines.
