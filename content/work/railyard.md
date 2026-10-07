---
title: RailYard
summary: Draw your Rails models on a canvas, connect them with associations, and get a working Rails app out the other end.
tier: more
kind: fun
order: 22
when: "2025"
role: Solo project
stack: [Ruby, Sinatra, JavaScript]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/railyard
screenshot: /work/thumbs/railyard.webp
screenshot_alt: "RailYard canvas with five models and colour-coded association lines"
---

I got tired of scaffolding Rails apps by hand. RailYard is a canvas where you drag models around, add fields and associations by clicking, and hit Generate. The whole thing is about 1,900 lines, no build step, no npm.

- Drag from a model's right port to another's left port and pick the association type. Lines are colour-coded: belongs_to, has_many, has_one, has_and_belongs_to_many. A `through` association literally routes its line through the join model.
- Validations and callbacks are picked from dropdowns and show up in the generated code.
- Save the schema as JSON and load it back later.

<figure class="figure">
  <img src="/work/railyard-1-canvas.webp" alt="RailYard canvas: User, Post, Comment, Tag and Tagging models as cards with fields, and colour-coded association lines between their ports" width="1280" height="1040" loading="lazy">
  <figcaption>Five models and their associations. Blue is belongs_to, green dashed is has_many. The has_many :through line runs through Tagging.</figcaption>
</figure>

<figure class="figure">
  <div class="diagram" role="img" aria-label="The canvas in the browser produces a schema as JSON. The Sinatra backend parses it and builds a shell script of rails new and rails generate model commands, then runs it. The output is a Rails app with models, migrations, associations, validations and callbacks, database created and migrated.">
    <svg viewBox="0 0 680 100" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="ry-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="20" width="120" height="44" rx="6"/><text x="70" y="40" text-anchor="middle">Canvas</text><text class="label" x="70" y="55" text-anchor="middle">vanilla JS, LeaderLine</text>
      <rect class="box" x="170" y="20" width="110" height="44" rx="6"/><text x="225" y="40" text-anchor="middle">Schema</text><text class="label" x="225" y="55" text-anchor="middle">JSON</text>
      <rect class="box box--accent" x="320" y="20" width="130" height="44" rx="6"/><text x="385" y="40" text-anchor="middle">Rails builder</text><text class="label" x="385" y="55" text-anchor="middle">Sinatra, writes a script</text>
      <rect class="box" x="490" y="20" width="180" height="44" rx="6"/><text x="580" y="40" text-anchor="middle">rails new + generate model</text><text class="label" x="580" y="55" text-anchor="middle">migrated, ready to run</text>
      <path class="edge" d="M130 42 H168" marker-end="url(#ry-arrow)"/>
      <path class="edge" d="M280 42 H318" marker-end="url(#ry-arrow)"/>
      <path class="edge" d="M450 42 H488" marker-end="url(#ry-arrow)"/>
    </svg>
  </div>
  <figcaption>The backend doesn't template Rails files. It writes the generator commands Rails already has and runs them.</figcaption>
</figure>

The generated app lands in `output/` with the database created and migrated. `cd` in, `bundle install`, `rails server`.
