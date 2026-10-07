---
title: curl.lol
summary: A Rails URL shortener with event-based click analytics.
tier: more
kind: fun
order: 31
when: "2023-24"
role: Solo project
stack: [Ruby on Rails, PostgreSQL, Ahoy]
legacy_ids: [curl-lol]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/url_shortener
screenshot: /work/thumbs/curl-lol.webp
screenshot_alt: "curl.lol: a form to shorten a URL and three shortened links as cards"
---

A URL shortener I ran at curl.lol. The domain has since lapsed, so the code is the thing to look at now.

<figure class="figure">
  <img src="/work/curl-lol-1-links.webp" alt="curl.lol running locally: a form to shorten a URL and three shortened links shown as cards with edit and copy buttons" width="1280" height="800" loading="lazy">
  <figcaption>Running locally for this screenshot, with three links made for the occasion.</figcaption>
</figure>

Links get short slugs. Every create and every click is recorded as an event with [Ahoy](https://github.com/ankane/ahoy), so click counts come from the event log instead of a counter column, and the same events can answer other questions later.
