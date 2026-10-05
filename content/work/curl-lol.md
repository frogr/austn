---
title: curl.lol
summary: A Rails URL shortener with event-based click analytics.
tier: more
order: 21
when: "2023-24"
role: Solo project
stack: [Ruby on Rails, PostgreSQL, Ahoy]
legacy_ids: [curl-lol]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/url_shortener
---

A URL shortener I ran at curl.lol. The domain has since lapsed, so the code is the thing to look at now.

Links get short slugs. Every create and every click is recorded as an event with [Ahoy](https://github.com/ankane/ahoy), so click counts come from the event log instead of a counter column, and the same events can answer other questions later.
