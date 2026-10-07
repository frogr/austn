---
title: Gutenberg MCP
summary: An MCP server for reading and quoting public-domain books from Project Gutenberg. Its main tool checks whether a quote is really in the book, and shows what the book actually says.
tier: more
tagline: "Checks whether a quote is really in the book, and where."
kind: project
order: 13
when: "2026"
role: Solo project
stack: [TypeScript, Node, MCP SDK, Zod, Vitest]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/gutenberg-mcp
screenshot: /work/thumbs/gutenberg-mcp.webp
screenshot_alt: "quote_check on Elementary, my dear Watson: not in this book, with the closest real passage from The Adventures of Sherlock Holmes"
---

Language models misquote. They smooth out punctuation, swap a word ("Lead on, Macduff" for "Lay on, Macduff"), or credit a line from a film to the book it was based on. It reads right and it's wrong, and it ends up in essays and slides.

This is an MCP server (Model Context Protocol, the open standard that lets AI apps like Claude and Cursor call outside tools) for Project Gutenberg, the free library of public-domain ebooks. It finds books through Gutendex, a JSON API over the Gutenberg catalog, downloads the plain text, strips the license header, detects the chapters, and gives the model stable line numbers to read and cite. No API key, and no model inside it: every tool is deterministic.

<figure class="figure">
  <img src="/work/gutenberg-mcp-1-verbatim.webp" alt="quote_check on Call me Ishmael. in Moby Dick: Verbatim, line 815, CHAPTER 1 Loomings, with the book's own line shown" width="1280" height="800" loading="lazy">
  <figcaption>"Call me Ishmael." is verbatim, at line 815, in chapter 1.</figcaption>
</figure>

## quote_check

The tool checks a quote against the real text at four levels, strictest first, and reports the first one that matches: exact, typography only (curly vs straight quotes, dash styles), case only, or same words with different punctuation. Every hit comes back with its line numbers, chapter and the book's own lines, so the model quotes from the text instead of from memory.

When the quote isn't there, it returns the closest real passage and the words that are missing. A match can't start or end inside a word, and parts joined by `...` are checked in order.

<figure class="figure">
  <img src="/work/gutenberg-mcp-2-not-found.webp" alt="quote_check on Elementary, my dear Watson in The Adventures of Sherlock Holmes: not in this book, closest passage at line 1113 shares 3 of 4 words, missing word elementary" width="1280" height="800" loading="lazy">
  <figcaption>Holmes never says it in this book. The closest passage shares 3 of 4 words, and the tool names the missing one.</figcaption>
</figure>

## The eval, and how the numbers got there

I labeled 22 quotations by hand: 15 real ones (some with punctuation, case or apostrophes changed on purpose) and 7 well-known misquotes. Against live Gutenberg text, `quote_check` classifies all 22 as labeled.

Chapter detection was harder. I counted the printed structure of 21 books by hand (chapters, letters, staves, acts, scenes, prefaces) and it now matches all 21. That number deserves a caveat, so here it is: most of those books were used to tune the heuristics, and two rounds of new books each turned up real misses that I fixed. Only four books were never used for tuning, and they pass 4 of 4. That's a small sample. Expect misses on books with unusual headings.

Gutendex turned out to be fast for cached searches and very slow otherwise: 3 of 10 test searches took 42 to 50 seconds, and 2 timed out at 60. So search falls back to gutenberg.org's own search after 8 seconds, and the reading tools never wait on the catalog.

## What's checked

74 tests with recorded responses and no network, including the full MCP protocol in memory and the HTTP server with the official SDK client. The remote server has per-IP and daily limits, a body size limit and timeouts. Not checked yet: a real deploy, the Docker image, memory use under load on a small instance, and connecting it to Claude Desktop or Cursor. The npm package isn't published yet.
