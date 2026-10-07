---
title: Gutenberg MCP
summary: Claude checks a quotation against the real book before it repeats it. Any of the 75,000 public-domain books on Project Gutenberg, with line numbers, and no model inside.
tier: more
tagline: "Checks whether a quote is really in the book, and where."
kind: project
order: 13
when: "2026"
role: Solo project
stack: [TypeScript, Node, MCP SDK, Zod, Vitest]
hue: sun
art: true
offer: mcp-server
demo_url: https://gutenberg-mcp.onrender.com
links:
  - label: Code on GitHub
    url: https://github.com/frogr/gutenberg-mcp
screenshot: /work/thumbs/gutenberg-mcp.webp
screenshot_alt: "The Gutenberg MCP playground: a question about Sherlock Holmes, the quote_check call it becomes, and the result saying the line is not in the book"
---

Language models misquote. They smooth out punctuation, swap a word ("Lead on, Macduff" for "Lay on, Macduff"), or credit a line from a film to the book it was based on. It reads right and it's wrong, and it ends up in essays and slides. I wanted a tool that makes that impossible for the books we can all read for free.

So this is an MCP server for Project Gutenberg. MCP (Model Context Protocol) is the open standard that lets AI apps like Claude and Cursor call outside tools. Once it's connected, you talk to Claude as usual. When a question touches a book, Claude calls a tool, gets the book's own lines back, and answers from those instead of from memory. There's no model inside the server. It reads, counts and compares.

## Ask it

The question is yours. The tool call and the result are what happens underneath. This exchange ran against the live server on 2026-10-07.

<ol class="chat">
  <li class="chat-you"><span class="chat-who">You</span><p>Does Holmes say "Elementary, my dear Watson" in The Adventures of Sherlock Holmes?</p></li>
  <li class="chat-tool"><span class="chat-who">Claude calls</span><code><b>quote_check</b>(id: 1661, quote: "Elementary, my dear Watson")</code></li>
  <li class="chat-result"><span class="chat-who">gutenberg-mcp returns</span>
    <dl>
      <dt>match</dt><dd>none. Not in this book. The closest passage (line 1113) shares 3 of 4 words.</dd>
      <dt>closest</dt><dd>Line 1,113, "The Red-Headed League": <em>"You could not possibly have come at a better time, my dear Watson," he</em></dd>
      <dt>missing words</dt><dd>elementary</dd>
    </dl>
  </li>
  <li class="chat-them"><span class="chat-who">Claude</span><p>No. That line isn't in The Adventures of Sherlock Holmes. The closest the book comes is line 1,113 in "The Red-Headed League": "You could not possibly have come at a better time, my dear Watson." The word "elementary" doesn't appear in that passage. If you want a real Holmes line, I can quote from the text.</p></li>
</ol>

My favourite result is the near miss. The words are right and the punctuation isn't, which is exactly the kind of error that gets copied into a slide and never caught.

<ol class="chat">
  <li class="chat-you"><span class="chat-who">You</span><p>Quote the opening line of Pride and Prejudice exactly.</p></li>
  <li class="chat-tool"><span class="chat-who">Claude calls</span><code><b>quote_check</b>(id: 1342, quote: "It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.")</code></li>
  <li class="chat-result"><span class="chat-who">gutenberg-mcp returns</span>
    <dl>
      <dt>match</dt><dd>words. Same words in the same order, but the punctuation differs.</dd>
      <dt>the book says</dt><dd>Lines 673-674, Chapter I: <em>It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.</em></dd>
    </dl>
  </li>
  <li class="chat-them"><span class="chat-who">Claude</span><p>Nearly. Austen wrote it with a comma after "acknowledged". The exact line, from lines 673 to 674 of the Gutenberg text: "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife."</p></li>
</ol>

You can run both of these, and every other tool, in the <a href="https://gutenberg-mcp.onrender.com">live playground</a>. Or connect it to your own Claude: the playground has the two lines to paste.

## What it's for

- **Writers and students** who want a quote right before it goes in. Ask for the line, get the line with its line number and chapter.
- **Editors and fact-checkers.** Paste a quote, learn whether it's verbatim, close, or not in the book at all, and what the book says instead.
- **Reading with an assistant.** "Read me the first stave of A Christmas Carol." "How is A Tale of Two Cities divided?" "Where does the white whale come up in Moby Dick?" That last one comes back as 108 matches across 32 chapters, thickest in "The Quarter-Deck" and "Moby Dick", 14 each.
- **Teaching.** Book stats on demand. Pride and Prejudice is 127,999 words, about 9 hours of reading, and the names that come up most are Elizabeth (605), Darcy (385), Miss (315) and Bennet (309).
- **Anything that quotes text.** The quote check doesn't care that the source is a novel. Point it at contracts, policies or documentation and it's the same tool. That's the version I'd build for you.

## How it works

<figure class="figure">
  <div class="diagram" role="img" aria-label="Claude calls the MCP server. The server finds books through Gutendex, downloads the plain text from a Gutenberg mirror, strips the license header, detects chapters and numbers the lines. quote_check compares a quote to those lines at four levels and returns the match level, line numbers, chapter and the book's own text. No model runs inside the server.">
    <svg viewBox="0 0 680 190" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="gb-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box box--accent" x="10" y="70" width="100" height="44" rx="6"/><text x="60" y="90" text-anchor="middle">Claude</text><text class="label" x="60" y="105" text-anchor="middle">the only model</text>
      <rect class="box" x="150" y="70" width="130" height="44" rx="6"/><text x="215" y="90" text-anchor="middle">gutenberg-mcp</text><text class="label" x="215" y="105" text-anchor="middle">6 tools, no model</text>
      <rect class="box" x="330" y="10" width="120" height="44" rx="6"/><text x="390" y="30" text-anchor="middle">Gutendex</text><text class="label" x="390" y="45" text-anchor="middle">catalog search</text>
      <rect class="box" x="330" y="70" width="120" height="44" rx="6"/><text x="390" y="90" text-anchor="middle">Text mirror</text><text class="label" x="390" y="105" text-anchor="middle">the plain-text book</text>
      <rect class="box" x="330" y="130" width="120" height="44" rx="6"/><text x="390" y="150" text-anchor="middle">Cache</text><text class="label" x="390" y="165" text-anchor="middle">parsed once, kept</text>
      <rect class="box" x="500" y="40" width="170" height="44" rx="6"/><text x="585" y="60" text-anchor="middle">Lines + chapters</text><text class="label" x="585" y="75" text-anchor="middle">header stripped</text>
      <rect class="box box--accent" x="500" y="100" width="170" height="44" rx="6"/><text x="585" y="120" text-anchor="middle">quote_check</text><text class="label" x="585" y="135" text-anchor="middle">four match levels</text>
      <path class="edge" d="M110 92 H148" marker-end="url(#gb-arrow)"/>
      <path class="edge" d="M280 84 L328 36" marker-end="url(#gb-arrow)"/>
      <path class="edge" d="M280 92 H328" marker-end="url(#gb-arrow)"/>
      <path class="edge" d="M280 100 L328 150" marker-end="url(#gb-arrow)"/>
      <path class="edge" d="M450 84 L498 68" marker-end="url(#gb-arrow)"/>
      <path class="edge" d="M585 84 V98" marker-end="url(#gb-arrow)"/>
      <path class="edge edge--fast" d="M500 130 L290 130 L215 114" marker-end="url(#gb-arrow)"/>
    </svg>
  </div>
  <figcaption>Every tool is deterministic. The server never guesses.</figcaption>
</figure>

`quote_check` tests a quote against the real text at four levels, strictest first, and reports the first that matches: exact, typography only (curly vs straight quotes, dash styles), case only, or the same words with different punctuation. Every hit comes back with its line numbers, its chapter and the book's own lines. When the quote isn't there, it returns the closest real passage and the words that are missing. A match can't start or end inside a word, and parts joined by `...` are checked in order.

The other five tools are for reading: search the catalog, get a book's chapters, read a passage by chapter or line, find a phrase, and get stats. They give the model stable line numbers, so it can cite.

The part that took longest wasn't the quote check. It was chapters. Gutenberg books print their structure a dozen ways: chapters, letters, staves, acts, scenes, prefaces, roman numerals with and without titles. I built a labeled set of 21 books and kept adding ones that broke the detector until it matched all 21. Two rounds of new books each turned up real misses. The four I never tuned on pass too.

## Measured

- **22 quotations**, 15 real (some with punctuation, case or apostrophes changed on purpose) and 7 well-known misquotes. Against live Gutenberg text, `quote_check` classifies all 22 as labeled. The first run scored 21, and the miss turned out to be a wrong label, not a wrong answer.
- **21 books** with hand-labeled structure, all detected correctly. Books with unusual headings may still surprise it.
- **Gutendex is slow when it's cold.** 3 of 10 test searches took 42 to 50 seconds and 2 timed out at 60. So search falls back to gutenberg.org's own search after 8 seconds, and the reading tools never wait on the catalog. Book downloads go to a mirror Project Gutenberg runs, because their robot policy asks programs to stay off the main site.
- **77 tests** with recorded responses and no network, including the full MCP protocol in memory and the HTTP server with the official SDK client. The remote server has per-IP and daily limits, a body size limit and timeouts.

## The playground

Every MCP server I build ships with one of these. It runs the real tools against the real endpoint, builds each form from the tool's own input schema, and shows the raw JSON next to the friendly view. It's how I test, and it's how you'd show a colleague what the assistant actually gets.

<figure class="figure">
  <img src="/work/gutenberg-mcp-2-runner.webp" alt="The playground's Run a tool section: the find_in_book form on the left with id 2701 and query white whale, and on the right 108 matches across 32 chapters, a bar chart of the chapters with the most mentions, and the first match with its line numbers" width="1280" height="800" loading="lazy">
  <figcaption>"White whale" in Moby Dick: 108 matches, where they cluster, and the first five with line numbers.</figcaption>
</figure>

## Gutenberg MCP and Marginalia

I built both, and they're easy to mix up. Both check quotes against the text. They're different products.

<table class="compare-table">
  <thead><tr><th scope="col"></th><th scope="col">Gutenberg MCP</th><th scope="col"><a href="/work/marginalia">Marginalia</a></th></tr></thead>
  <tbody>
    <tr><td>what it is</td><td>A tool your assistant calls</td><td>An app you ask questions</td></tr>
    <tr><td>who answers</td><td>Claude, Cursor, or whatever you connect it to</td><td>The app itself, with a model or without one</td></tr>
    <tr><td>books</td><td>Any of 75,000+, fetched on demand</td><td>Twelve novels, prepared ahead of time</td></tr>
    <tr><td>search</td><td>Find a phrase in one book</td><td>Ranked retrieval across all twelve, measured on a question set</td></tr>
    <tr><td>the check</td><td>Any quote against the whole book, four match levels</td><td>Every quote in an answer against the passage it cites</td></tr>
    <tr><td>model inside</td><td>Never</td><td>Optional</td></tr>
  </tbody>
</table>

If you want to ask a question about a novel and get an answer, Marginalia. If you want your own assistant to stop misquoting, this.

## What's next

- **Publish to npm**, so the install is one short line instead of a GitHub clone.
- **Which book is this from?** Quote checking across the whole library, not one book at a time.
- **A citation the model can paste**: title, author, chapter, line, link.
- **Your texts.** The same server over a company's documents, with the same four-level check. That's the <a href="/hire#mcp-server">custom MCP server</a> on my hire page.
