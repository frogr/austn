---
title: Tenex
summary: Lead engineer on three client engagements at once. Document AI with evals and autonomy gates, retail analytics, a Databricks warehouse.
tagline: "Three client projects at once, as the lead engineer on each."
tier: featured
kind: job
order: 1
when: "2026"
role: Senior Forward Deployed Engineer
stats:
  - value: "3"
    label: "client engagements at once, as the lead engineer"
  - value: "1,500+"
    label: "stores in the placement analytics"
  - value: "96%"
    label: "of 300+ SKUs where the model called the direction of sales"
  - value: "Over half"
    label: "of documents run without human review"
stack: [TypeScript, Next.js, Python, Google Document AI, Databricks, Postgres]
blurb: "An AI consultancy. I was the engineer embedded with three clients: document extraction, retail analytics, a data warehouse."
---

Tenex is an AI consultancy that puts engineers directly with clients. I was a forward deployed engineer there from March to June 2026, and the lead engineer on three client engagements at the same time. On each one I went from discovery to architecture to delivery, and I ran the demos for the client's executives.

I've left out client names.

## Reading forms people used to type in by hand

One client had an outsourced team typing printed and handwritten forms into their system. Hundreds of forms a week.

I built a pipeline that reads them instead. Google Document AI does the OCR, then two LLM passes pull out the fields. Most of the work was deciding when the client could trust the output without a person checking it.

<figure class="figure">
  <div class="diagram" role="img" aria-label="Form pipeline: scan, OCR, two LLM passes, then evals and an autonomy gate decide between auto-accept and human review">
    <svg viewBox="0 0 680 190" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="t-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#6c756f"/></marker></defs>
      <rect class="box" x="10" y="70" width="100" height="44" rx="6"/><text x="60" y="97" text-anchor="middle">Scanned form</text>
      <rect class="box" x="140" y="70" width="110" height="44" rx="6"/><text x="195" y="90" text-anchor="middle">Document AI</text><text class="label" x="195" y="105" text-anchor="middle">OCR</text>
      <rect class="box" x="280" y="70" width="120" height="44" rx="6"/><text x="340" y="90" text-anchor="middle">LLM extraction</text><text class="label" x="340" y="105" text-anchor="middle">two passes</text>
      <rect class="box box--accent" x="430" y="70" width="100" height="44" rx="6"/><text x="480" y="90" text-anchor="middle">Evals +</text><text x="480" y="105" text-anchor="middle">gate</text>
      <rect class="box" x="560" y="20" width="110" height="44" rx="6"/><text x="615" y="47" text-anchor="middle">Auto-accept</text>
      <rect class="box" x="560" y="120" width="110" height="44" rx="6"/><text x="615" y="147" text-anchor="middle">Human review</text>
      <path class="edge" d="M110 92 H138" marker-end="url(#t-arrow)"/>
      <path class="edge" d="M250 92 H278" marker-end="url(#t-arrow)"/>
      <path class="edge" d="M400 92 H428" marker-end="url(#t-arrow)"/>
      <path class="edge" d="M530 85 L558 50" marker-end="url(#t-arrow)"/>
      <path class="edge" d="M530 100 L558 135" marker-end="url(#t-arrow)"/>
    </svg>
  </div>
  <figcaption>Every document gets checked. Only the ones that pass go through without a person.</figcaption>
</figure>

I wrote evals for the extraction and an autonomy gate on top of them. A document only skips review when it passes the checks. Everything else goes to a person, same as before. With the gates in place, over half of the documents ran without human review, and the client could start winding down the outsourced data entry.

## Retail placement analytics

Another client places products in stores. I built an analytics app over 1,500+ stores and several million historical sales records, in TypeScript and Next.js. Account execs use gondola-level heatmaps to compare stores, field vs. non-field accounts, and how placement affects sales.

To check the model, we held out a real historical placement change and asked it which way sales would move. It matched the observed direction for 96% of 300+ SKUs. The client uses it.

I also worked on RAG pipelines to make search across the platform's data more useful.

## Moving a manual data process into Databricks

One client was owned by a private equity firm. Together with the firm we stood up a Databricks warehouse: data moved from SQL Server into Databricks, and I wrote the Python ingestion pipelines. Those replaced a manual, screen-by-screen process that pulled the data with computer use, an AI agent clicking through screens.

## Scheduling for 120 reps

The third engagement replaced WhatsApp threads. Reps used to send their availability in chat and someone assembled the schedule by hand. I shipped a mobile scheduling app (TypeScript, Next.js) that collects availability and generates the shifts: hundreds a month for 120 representatives across 425 stores.

## Tools I built for myself

Leading three projects at once meant I needed help. I built:

- a tool to run several Claude Code sessions in parallel
- a Slack-to-PR flow that turns a bug report into a pull request for review
- git provenance tracking

I also prototyped a pipeline that takes a product doc to a pull request: plan, grade the plan, write tickets, plan each ticket, grade again, build, open the PR. A person signs off at the steps that matter.
