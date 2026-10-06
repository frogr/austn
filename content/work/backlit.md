---
title: Backlit at the Super Bowl
summary: Only engineer on site for the Super Bowl LX halftime show. Took the slowest pages from 10+ seconds to under 400ms.
tagline: "Seven seasons on contract, ending as the only engineer on site for Super Bowl LX."
tier: featured
order: 3
when: "seasonal, 2018-26"
role: Full Stack / Forward Deployed Engineer (seasonal contract)
stats:
  - value: "10s → 400ms"
    label: "page loads"
  - value: "500+ → ~10"
    label: "database queries per page"
  - value: "100%"
    label: "of the halftime show's non-union performers paid through the platform"
  - value: "$2M+"
    label: "in donations for Boys & Girls Clubs of America"
stack: [Ruby on Rails, PostgreSQL, Twilio, Zeal, Yardstik]
legacy_ids: [backlit, bgca]
links:
  - label: backlit.com
    url: https://backlit.com
---

Backlit runs talent logistics for big live productions: onboarding, scheduling, payments and compliance for 10,000+ performers across the Super Bowl, the Oscars and the Grammys. I worked with them every event season for seven years, on contract, alongside my full-time jobs.

## On site at Super Bowl LX

For the Super Bowl LX halftime show I was the only engineer on site. I ran talent check-in on the platform, watched where the workflow was slowing people down, and turned what the operations team needed into same-day fixes.

## 10 seconds to under 400ms

Under the live-event deadline, some pages were taking more than 10 seconds to load. The cause was a classic N+1: one page was making 500+ database queries.

I rewrote the SQL and the ActiveRecord usage behind those pages and got them down to about 10 queries each. Load times went from 10+ seconds to under 400ms.

<figure class="figure">
  <div class="compare" role="img" aria-label="Before and after. Page load: more than 10 seconds before, under 400 milliseconds after. Queries per page: more than 500 before, about 10 after.">
    <div class="compare-row">
      <span class="compare-what">Page load</span>
      <span class="compare-bar"><i style="--w: 100%"></i><b>10+ seconds</b></span>
      <span class="compare-bar compare-bar--after"><i style="--w: 4%"></i><b>under 400ms</b></span>
    </div>
    <div class="compare-row">
      <span class="compare-what">Queries per page</span>
      <span class="compare-bar"><i style="--w: 100%"></i><b>500+</b></span>
      <span class="compare-bar compare-bar--after"><i style="--w: 2%"></i><b>about 10</b></span>
    </div>
  </div>
  <figcaption>Before and after, drawn to scale.</figcaption>
</figure>

## Getting people paid and cleared

- Paid 100% of the halftime show's non-union performers through the platform, using Zeal for payroll.
- Integrated Twilio for messaging, Yardstik for background checks, and the NFL's SEMS APIs for event compliance.

## Earlier events

During COVID, the Oscars needed a contactless way to coordinate people at the Dolby Theatre. I built an SMS system on Twilio that coordinated 200+ of them.

## Boys & Girls Clubs of America

Through Backlit I also built the donation flow for the Boys & Girls Clubs of America's 2021 fundraiser, in Node.js and Express with Stripe. It took in over $2 million.
