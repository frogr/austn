---
title: CoverMyMeds
summary: Tech lead on drug brand launches worth $10M+ ARR, then built the tool that let non-engineers run launches.
tagline: "Launched nine drug brands, then built the tool that lets non-engineers do it."
tier: featured
order: 4
when: 2021-23
role: Software Engineer, Launch team
stats:
  - value: "9"
    label: "pharmaceutical brands launched"
  - value: "$10M+"
    label: "in ARR from those launches"
  - value: "Months → hours"
    label: "to onboard a brand"
  - value: "40%"
    label: "more platform coverage"
stack: [Ruby on Rails, React, PostgreSQL, Hotwire, Elixir]
links:
  - label: covermymeds.com
    url: https://www.covermymeds.com
---

CoverMyMeds handles electronic prior authorization: the paperwork between a doctor, a pharmacy and an insurer before a drug gets covered. It's connected to 950,000+ providers, 50,000+ pharmacies and nearly every US health plan. I was there from July 2021 to October 2023.

## Launches

I was hired onto the Launch team, which brings new pharmaceutical brands onto the platform. The clients were large pharma companies, and each launch was a contract that showed up directly in revenue.

I launched nine brands representing $10M+ in ARR, which expanded the platform's supported coverage by 40%. I was the technical lead for the Spravato, Renflexis and Ontruzant launches: implementation planning, and coordinating engineering with the launch stakeholders.

## Configuration Station

Every launch needed engineers to set up the brand by hand. Onboarding a brand technically took months.

I built Configuration Station (Rails, React, PostgreSQL), an internal tool that let non-technical staff configure a launch themselves. Brand onboarding went from months to hours, and the Launch team was freed up to work on other parts of the platform.

<figure class="figure">
  <div class="diagram" role="img" aria-label="Before: a new brand waited for engineers to set it up by hand, which took months. After: launch staff configure it themselves in Configuration Station, in hours.">
    <svg viewBox="0 0 680 176" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="cmm-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6c756f"/></marker></defs>
      <text class="label" x="10" y="22">BEFORE</text>
      <rect class="box" x="10" y="32" width="130" height="44" rx="6"/><text x="75" y="59" text-anchor="middle">New brand</text>
      <rect class="box" x="210" y="32" width="250" height="44" rx="6"/><text x="335" y="59" text-anchor="middle">Engineers set it up by hand</text>
      <rect class="box" x="530" y="32" width="140" height="44" rx="6"/><text x="600" y="52" text-anchor="middle">Live</text><text class="label" x="600" y="67" text-anchor="middle">months</text>
      <path class="edge" d="M140 54 H208" marker-end="url(#cmm-arrow)"/>
      <path class="edge" d="M460 54 H528" marker-end="url(#cmm-arrow)"/>
      <text class="label" x="10" y="112">AFTER</text>
      <rect class="box" x="10" y="122" width="130" height="44" rx="6"/><text x="75" y="149" text-anchor="middle">New brand</text>
      <rect class="box box--accent" x="210" y="122" width="250" height="44" rx="6"/><text x="335" y="142" text-anchor="middle">Launch staff configure it</text><text class="label" x="335" y="157" text-anchor="middle">Configuration Station</text>
      <rect class="box" x="530" y="122" width="140" height="44" rx="6"/><text x="600" y="142" text-anchor="middle">Live</text><text class="label" x="600" y="157" text-anchor="middle">hours</text>
      <path class="edge edge--fast" d="M140 144 H208" marker-end="url(#cmm-arrow)"/>
      <path class="edge edge--fast" d="M460 144 H528" marker-end="url(#cmm-arrow)"/>
    </svg>
  </div>
  <figcaption>The same launch, before and after Configuration Station.</figcaption>
</figure>

## Other work

- Created VEST, a framework for prioritizing technical debt that was adopted across engineering.
- Did some Elixir work too.
- Mentored five developers, including helping a customer success manager move into engineering.
