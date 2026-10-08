---
title: Marginalia
summary: Ask a question about one of twelve classic novels and get an answer that cites the text. Every quote is checked word for word against the passage it cites, and retrieval is measured, not guessed.
tier: more
tagline: "Answers about twelve novels, every quote checked against the text."
kind: project
order: 12
when: "2026"
role: Solo project
stack: [TypeScript, Node, Hono, BM25, Vitest]
hue: sky
art: true
demo_url: https://marginalia-mlu0.onrender.com
offer: rag
links:
  - label: Code on GitHub
    url: https://github.com/frogr/marginalia
screenshot: /work/thumbs/marginalia.webp
screenshot_alt: "A Marginalia answer about the Queen's croquet game in Alice in Wonderland, with a Verified quotes 3/3 badge and the cited passage highlighted"
---

Marginalia is a reading companion for twelve novels everyone has heard of and fewer have finished: Pride and Prejudice, Moby-Dick, Dracula, Crime and Punishment, Jane Eyre, Gatsby and six more. Type a question. Get an answer with the passages it came from. Click a citation and the passage opens with the quote highlighted, and a link to read the whole chapter. Every quote has been checked against that passage before you see it, and the page tells you so.

It's also the clearest example I have of how I think RAG should be built. RAG (retrieval-augmented generation) means find the right passages first, then answer from them. Most demos stop at "it answered." This one measures the search, checks the quotes by code, shows its working on every answer, and tells you where it's weak.

<figure class="figure">
  <img src="/work/marginalia-1-answer.webp" alt="A Marginalia answer: the sentence about live hedgehogs and flamingoes, a Verified quotes 3/3 badge, and the cited passage from chapter VIII open underneath with the quote highlighted" width="1280" height="800" loading="lazy">
  <figcaption>"What did the Queen use for croquet mallets and balls?" The answer, the badge, and the passage it came from with the quote highlighted. Made with no model at all. <a href="https://marginalia-mlu0.onrender.com">Ask it something yourself.</a></figcaption>
</figure>

## What it's for

- **Reading groups and students.** "Which Bible story does Sonia read to Raskolnikov?" "What did Amy burn after quarreling with Jo?" Answers point at the page, so you can go read it.
- **Checking a half-remembered line.** Ask in your own words. If the words don't match, it still finds the scene most of the time, and shows you which passages it looked at.
- **Seeing how RAG behaves.** Every answer has a "how this answer was made" panel: the retrieved passages with their scores, how the answer was picked, and how each quote was checked. It's the panel I wish every RAG demo had.
- **Your documents.** Swap the twelve novels for a product manual, a policy library or a contract set, and the same shape applies: measured retrieval, checked citations, a visible trace. That's the <a href="/hire#rag">answers from your documents</a> offer on my hire page.

## Three steps

<figure class="figure">
  <div class="diagram" role="img" aria-label="A question goes to retrieval: BM25 over paragraph chunks of about 240 words that never cross a chapter, with boosts for adjacent words and a named book. The top passages go to an answerer, which is a model when there is a key and an extractive picker when there is not. The answer's quotes go to a validator that looks for each one in the passage it cites. Failures are shown as unverified; a model gets one retry.">
    <svg viewBox="0 0 680 190" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="mg-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="70" width="100" height="44" rx="6"/><text x="60" y="90" text-anchor="middle">Question</text><text class="label" x="60" y="105" text-anchor="middle">in your words</text>
      <rect class="box" x="150" y="70" width="130" height="44" rx="6"/><text x="215" y="90" text-anchor="middle">Retrieve</text><text class="label" x="215" y="105" text-anchor="middle">BM25 over chunks</text>
      <rect class="box" x="150" y="130" width="130" height="44" rx="6"/><text x="215" y="150" text-anchor="middle">Twelve novels</text><text class="label" x="215" y="165" text-anchor="middle">1.6 million words</text>
      <rect class="box box--accent" x="320" y="40" width="130" height="44" rx="6"/><text x="385" y="60" text-anchor="middle">Model writes</text><text class="label" x="385" y="75" text-anchor="middle">with a key</text>
      <rect class="box" x="320" y="100" width="130" height="44" rx="6"/><text x="385" y="120" text-anchor="middle">Extractive</text><text class="label" x="385" y="135" text-anchor="middle">best sentences</text>
      <rect class="box" x="490" y="70" width="110" height="44" rx="6"/><text x="545" y="90" text-anchor="middle">Check quotes</text><text class="label" x="545" y="105" text-anchor="middle">in its passage</text>
      <rect class="box" x="620" y="70" width="50" height="44" rx="6"/><text x="645" y="97" text-anchor="middle">Page</text>
      <path class="edge" d="M110 92 H148" marker-end="url(#mg-arrow)"/>
      <path class="edge" d="M215 130 V116" marker-end="url(#mg-arrow)"/>
      <path class="edge" d="M280 86 L318 66" marker-end="url(#mg-arrow)"/>
      <path class="edge" d="M280 98 L318 118" marker-end="url(#mg-arrow)"/>
      <path class="edge" d="M450 66 L488 86" marker-end="url(#mg-arrow)"/>
      <path class="edge" d="M450 118 L488 98" marker-end="url(#mg-arrow)"/>
      <path class="edge" d="M600 92 H618" marker-end="url(#mg-arrow)"/>
      <path class="edge edge--fast" d="M545 70 V20 H385 V38" marker-end="url(#mg-arrow)"/>
      <text class="label" x="465" y="16" text-anchor="middle">one retry, with the failures listed</text>
    </svg>
  </div>
  <figcaption>The model, when there is one, only writes. Retrieval and checking are code.</figcaption>
</figure>

1. **Retrieve.** Paragraph-based chunks of about 240 words that never cross a chapter. Search is BM25, a standard keyword ranking formula, plus a boost when query words sit next to each other, a boost for a book named in the question, and a share of the best neighboring chunk's score.
2. **Answer.** With an Anthropic or OpenAI key, a model returns JSON where every claim carries exact quotes from numbered passages. Without a key, the answer is extractive: the sentences from the best passages that best cover the question.
3. **Check.** The validator looks for each quote in the passage it cites, ignoring whitespace, quote-mark style, dashes and case. A quote that fails is shown as unverified, never dropped quietly. A model gets one retry with the failures listed.

<figure class="figure">
  <img src="/work/marginalia-2-working.webp" alt="The How this answer was made panel: eight retrieved passages with scores and BM25 ranks, then how the answer was picked and how quotes are checked" width="1280" height="800" loading="lazy">
  <figcaption>The "how this answer was made" panel. Every answer has one, and I open it more than the answer.</figcaption>
</figure>

## Measured, including where it's weak

The eval is 46 questions in four types (direct, paraphrased, no names, and names that appear in more than one book), each with its answer's passage found by searching the text. Then I added one change at a time and kept the changes that helped overall.

| | Found in top 1 | Top 5 | Top 10 |
| --- | --- | --- | --- |
| Plain BM25, 160-word chunks | 30.4% | 52.2% | 56.5% |
| Shipped config | 34.8% | 58.7% | 65.2% |
| Shipped config, 12 held-out questions | 41.7% | 58.3% | 58.3% |

The improvement came from reading every miss, which is the part of this work I like most. The misses fell into two groups. In one, a scene names its people a paragraph before the event, so the chunk with the answer shares no words with the question. Bigger chunks and the neighbor score were aimed at that. In the other, the question is a pure paraphrase ("what advice did Nick's dad give him" against "criticizing anyone" and "my father"). Keyword search can't fix that without overfitting, and paraphrased questions still only find their passage in the top 10 a quarter of the time. That's what the optional vector search is for, and it's the first thing I'll measure with a key.

The held-out set is small: one question there is 8 points. These are numbers for comparing configs on this corpus, not an accuracy claim, and I'd rather say that than round up.

With a real model writing the answers (Claude Haiku 4.5, one run over all 58 questions), 62 of 67 quotes passed the check on the first reply. Three answers needed the retry, and two were shown with a quote flagged as unverified. The model said "not found" 19 times, and in 17 of those the right passage wasn't among the eight it was given, so it declined instead of inventing. When the right passage was there, a verified quote came from it 34 times out of 35. The whole run cost 25 cents. The code and the full table are in the repo.

The quote validator is tested the other way around. For each question, the eval plants fake quotes in the passages actually retrieved: invented sentences, one word changed, a real quote cited to the wrong passage, real pieces in the wrong order. It caught 320 of 320, and passed 136 of 136 real quotes. CI fails if either drops. What it can't catch is a real quote attached to a claim it doesn't support. It proves the words are in the book, not that the claim follows from them. 61 tests, no network.

## Marginalia and Gutenberg MCP

Both check quotes against the text, and I built both. Marginalia is the app: it retrieves, answers and checks, for twelve books it has already prepared. <a href="/work/gutenberg-mcp">Gutenberg MCP</a> is a tool for someone else's assistant: it checks any quote against any of 75,000 books, and never answers anything itself. If you have a question, use this. If you want Claude to stop misquoting, use that.

## What's next

- **Run it more than once**, and on a second model. One run gives one number; the variance between runs is the next thing to know.
- **Turn on hybrid search** and rerun the eval. The vector path is built; the numbers aren't.
- **More books**, chosen by what people ask. The corpus build is one command.
- **Your documents instead of novels.** The eval set comes from your real questions, and the validator checks quotes against your sources.
