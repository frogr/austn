---
title: Marginalia
summary: Ask questions about twelve classic novels and get answers that cite the text. Every quote is checked word for word against the passage it cites, and retrieval is measured, not guessed.
tier: more
tagline: "Answers about twelve novels, every quote checked against the text."
kind: project
order: 12
when: "2026"
role: Solo project
stack: [TypeScript, Node, Hono, BM25, Vitest]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/marginalia
screenshot: /work/thumbs/marginalia.webp
screenshot_alt: "A Marginalia answer about the Queen's croquet game in Alice in Wonderland, with a Verified quotes 3/3 badge and the cited passage highlighted"
---

A RAG app (retrieval-augmented generation: find the right passages first, then answer from them) over twelve public-domain novels from Project Gutenberg, about 1.6 million words. Pride and Prejudice, Moby-Dick, Dracula, Crime and Punishment and eight more.

Every answer cites the text, and the page shows its working: which passages were retrieved, how they scored, and which quotes passed the check. It works with no API key, using extractive answers (the best-matching sentences from the best passages). With an Anthropic or OpenAI key, a model writes the answer, and the same checks apply.

<figure class="figure">
  <img src="/work/marginalia-1-answer.webp" alt="An extractive answer to what the Queen used for croquet mallets and balls: the sentence about live hedgehogs and flamingoes, a Verified quotes 3/3 badge, and the cited passage from chapter VIII with the quote highlighted" width="1280" height="800" loading="lazy">
  <figcaption>An answer with no API key. The citation opens the passage it came from, with the quote highlighted.</figcaption>
</figure>

## Three steps

1. **Retrieve.** Paragraph-based chunks of about 240 words that never cross a chapter. Search is BM25, a standard keyword ranking formula, plus a boost when query words sit next to each other, a boost for a book named in the question, and a share of the best neighboring chunk's score.
2. **Answer.** A model returns JSON where every claim carries exact quotes from numbered passages. Without a key, the answer is extractive.
3. **Check.** The validator looks for each quote in the passage it cites, ignoring whitespace, quote-mark style, dashes and case. A quote that fails is shown as unverified, never dropped quietly. A model gets one retry with the failures listed.

<figure class="figure">
  <img src="/work/marginalia-2-working.webp" alt="The How this answer was made panel: eight retrieved passages with scores and BM25 ranks, then how the answer was picked and how quotes are checked" width="1280" height="800" loading="lazy">
  <figcaption>The "how this answer was made" panel. Every answer has one.</figcaption>
</figure>

## Measured, including where it's weak

I wrote 46 questions in four types (direct, paraphrased, no names, and names that appear in more than one book) and found each answer's passage by searching the text. Then I added one change at a time and kept what moved the numbers.

| | Found in top 1 | Top 5 | Top 10 |
| --- | --- | --- | --- |
| Plain BM25, 160-word chunks | 30.4% | 52.2% | 56.5% |
| Shipped config | 34.8% | 58.7% | 65.2% |
| Shipped config, 12 held-out questions | 41.7% | 58.3% | 58.3% |

The change came from reading every miss. Most fell into two groups. In one, a scene names its people a paragraph before the event, so the chunk with the answer shares no words with the question. Bigger chunks and the neighbor score were aimed at that. In the other, the question is a pure paraphrase ("what advice did Nick's dad give him" vs "criticizing anyone" and "my father"). Keyword search can't fix that without overfitting, and paraphrased questions still only find their passage in the top 10 a quarter of the time. That's what the optional vector search is for, and it's the first thing to measure once there's a key.

The held-out set exists because I tuned on the first 46, and it's small: one question there is 8 points. These are numbers for comparing configs on this corpus, not an accuracy claim.

The quote validator is tested the other way around. For each question, the eval plants fake quotes in the passages actually retrieved: invented sentences, one word changed, a real quote cited to the wrong passage, real pieces in the wrong order. It caught 320 of 320, and passed 136 of 136 real quotes. CI fails if either drops. What it can't catch is a real quote attached to a claim it doesn't support. It proves the words are in the book, not that the claim follows from them.

## What's not verified

No real model has answered a question yet: the Anthropic and OpenAI paths are tested against mocked responses only, so how often a model's quotes pass on the first try is unknown. Hybrid vector search has no eval numbers for the same reason. It hasn't been deployed. 60 tests, no network.
