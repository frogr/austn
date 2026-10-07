---
title: NYC Open Data MCP
summary: Ask Claude about New York City's public data and get real rows back. Restaurant grades, 311 complaints, and the other 2,400 datasets the city publishes, through one tool it can call.
tier: more
tagline: "Lets an AI assistant query NYC restaurant grades, 311 and more."
kind: project
order: 13
when: "2026"
role: Solo project
stack: [TypeScript, Node, MCP SDK, Zod, Vitest]
hue: clay
art: true
offer: mcp-server
links:
  - label: Code on GitHub
    url: https://github.com/frogr/nyc-open-data-mcp
screenshot: /work/thumbs/nyc-open-data-mcp.webp
screenshot_alt: "The NYC Open Data MCP playground: a question about East Village 311 complaints, the tool call, and a bar chart of the top complaint types"
---

New York publishes a lot of data: every restaurant inspection, every 311 call, every street tree. Getting an answer out of it means knowing which dataset, which columns, and how Socrata (the API the city publishes on) wants the query written. This server does that part, so you can ask Claude the question in English.

It's an MCP server (Model Context Protocol, the open standard that lets AI apps like Claude and Cursor call outside tools). Connect it once. Then "what were the top 311 complaints in the East Village last month?" turns into a tool call, real rows come back, and the answer is made from them. No API key needed.

## What a conversation looks like

These ran against live city data on 2026-10-07.

<ol class="chat">
  <li class="chat-you"><span class="chat-who">You</span><p>What were the top 311 complaints in the East Village last month?</p></li>
  <li class="chat-tool"><span class="chat-who">Claude calls</span><code><b>service_requests_311</b>(zip_codes: ["10003", "10009"], start_date: "2026-09-01", end_date: "2026-09-30", top_n: 10)</code></li>
  <li class="chat-result"><span class="chat-who">nyc-open-data-mcp returns</span>
    <dl>
      <dt>total_requests</dt><dd>4,823</dd>
      <dt>top types</dt><dd>Encampment 746 (15.5%), Noise - Residential 472 (9.8%), Illegal Parking 359 (7.4%), Noise - Street/Sidewalk 267, Noise - Commercial 245</dd>
      <dt>samples</dt><dd>5 recent requests with address, agency and status</dd>
    </dl>
  </li>
  <li class="chat-them"><span class="chat-who">Claude</span><p>There were 4,823 requests to 311 from ZIP codes 10003 and 10009 in September 2026. The most common was Encampment, with 746, about one in six. Then Noise - Residential at 472 and Illegal Parking at 359. Three of the top five were noise complaints of one kind or another.</p></li>
</ol>

<ol class="chat">
  <li class="chat-you"><span class="chat-who">You</span><p>What inspection grades do the ramen spots in 10003 have?</p></li>
  <li class="chat-tool"><span class="chat-who">Claude calls</span><code><b>restaurant_inspections</b>(name: "ramen", zip_code: "10003", limit: 10)</code></li>
  <li class="chat-result"><span class="chat-who">nyc-open-data-mcp returns</span>
    <dl>
      <dt>returned</dt><dd>4 restaurants, each with its latest grade, the date it was posted, and the latest inspection's score and violations</dd>
      <dt>rows</dt><dd>Ramen by Ra, A. Kyuramen, B. Ramen Takumi, A. Marufuku Ramen, B.</dd>
    </dl>
  </li>
  <li class="chat-them"><span class="chat-who">Claude</span><p>Four ramen places in 10003 have inspection records. Ramen by Ra on East 1st Street and Ramen Takumi on University Place both hold an A. Kyuramen on East 14th Street and Marufuku Ramen on 2nd Avenue hold a B. Kyuramen's most recent inspection, in July 2026, scored 33 points with three critical violations, so its posted B may change after the re-inspection.</p></li>
</ol>

<figure class="figure">
  <img src="/work/nyc-open-data-mcp-1-ask.webp" alt="The playground's Ask it section: the East Village 311 question as a chip, the service_requests_311 call, a result with 4,823 requests and a bar chart of complaint types, and the line Claude can now say" width="1280" height="800" loading="lazy">
  <figcaption>The same exchange in the server's web playground. Every example runs through the real MCP endpoint against live city data.</figcaption>
</figure>

## What it's for

- **Neighbors and renters.** "Any rodent complaints in Flushing in the last 30 days?" "How are the pizza places in Williamsburg doing on inspections?"
- **Journalists and researchers**, who know the question but not the dataset. "Is there a dataset of NYC street trees?" finds the 2015 Street Tree Census with its 45 columns. "What are the most common street trees in Brooklyn?" runs a grouped query on it: London planetree (34,886), honeylocust (16,921), pin oak (12,343).
- **Civic tech.** Anyone building on city data gets input validation, escaping, paging and plain-language errors for free, and a model-friendly shape for every response.
- **A template for your own data.** The city's API is just an API. The same server shape works for yours: a couple of tools for the questions people actually ask, and a general one for everything else. That's the <a href="/hire#mcp-server">custom MCP server</a> on my hire page.

## Four tools, chosen on purpose

<figure class="figure">
  <div class="diagram" role="img" aria-label="Claude calls the server. Two ready-made tools, restaurant_inspections and service_requests_311, do the awkward parts on the server: grouping violations by restaurant and working out the latest grade, and running aggregate queries on Socrata's side. Two general tools, search_datasets and query_dataset, cover the other 2,400 datasets. Every value in a query is escaped and validated before it reaches Socrata.">
    <svg viewBox="0 0 680 200" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="ny-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box box--accent" x="10" y="78" width="100" height="44" rx="6"/><text x="60" y="98" text-anchor="middle">Claude</text><text class="label" x="60" y="113" text-anchor="middle">in English</text>
      <rect class="box" x="150" y="10" width="170" height="44" rx="6"/><text x="235" y="30" text-anchor="middle">restaurant_inspections</text><text class="label" x="235" y="45" text-anchor="middle">latest grade per place</text>
      <rect class="box" x="150" y="64" width="170" height="44" rx="6"/><text x="235" y="84" text-anchor="middle">service_requests_311</text><text class="label" x="235" y="99" text-anchor="middle">3 aggregates, 22.7M rows</text>
      <rect class="box" x="150" y="118" width="170" height="44" rx="6"/><text x="235" y="138" text-anchor="middle">search_datasets</text><text class="label" x="235" y="153" text-anchor="middle">with column names</text>
      <rect class="box" x="150" y="172" width="170" height="24" rx="6"/><text x="235" y="188" text-anchor="middle">query_dataset</text>
      <rect class="box" x="370" y="78" width="130" height="44" rx="6"/><text x="435" y="98" text-anchor="middle">Validate + escape</text><text class="label" x="435" y="113" text-anchor="middle">ids, ZIPs, dates</text>
      <rect class="box" x="550" y="78" width="120" height="44" rx="6"/><text x="610" y="98" text-anchor="middle">Socrata</text><text class="label" x="610" y="113" text-anchor="middle">2,400+ datasets</text>
      <path class="edge" d="M110 92 L148 36" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M110 98 H148" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M110 104 L148 138" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M110 110 L148 182" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M320 36 L368 86" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M320 92 H368" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M320 140 L368 108" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M320 184 L368 116" marker-end="url(#ny-arrow)"/>
      <path class="edge" d="M500 100 H548" marker-end="url(#ny-arrow)"/>
    </svg>
  </div>
  <figcaption>Two tools for the questions people ask most, two for everything else. Nothing reaches the city's API without going through the validator.</figcaption>
</figure>

- **`restaurant_inspections`.** The city stores one row per violation, so the tool groups by restaurant to page through restaurants, then fetches the history for just that page and works out the latest grade. That grade isn't always from the latest inspection, because a re-inspection can leave it pending.
- **`service_requests_311`.** The 311 dataset is about 22.7 million rows. The tool runs three small aggregate queries on Socrata's side instead of downloading anything.
- **`search_datasets`** returns column names with each dataset, so the model can write a valid filter on its first try.
- **`query_dataset`** runs read-only queries against any dataset, capped at 500 rows and about 60 KB per response, with the offset to continue from when it cuts something off.

<figure class="figure">
  <img src="/work/nyc-open-data-mcp-2-restaurants.webp" alt="The playground's Run a tool section: the restaurant_inspections form with name ramen and ZIP 10003, and four restaurants on the right with their letter grades, inspection dates, scores and critical violation counts" width="1280" height="800" loading="lazy">
  <figcaption>The runner view of the same tool, for testing by hand. Grades are coloured by the kit's good, close and bad tokens.</figcaption>
</figure>

## Safe to put on the internet

- Every value that goes into a query is escaped, so `x' OR '1'='1` stays a string. Dataset ids, ZIPs, dates and boroughs are validated before any request.
- Upstream errors come back as plain hints the model can act on ("use search_datasets to find a valid dataset id"), never as stack traces.
- The remote server has a per-IP rate limit (30 a minute), a daily cap, a 64 KB body limit checked while streaming, and timeouts on every request.

## Where it could go

Plans, not features.

- **More ready-made tools** for the next questions people ask: housing violations, crashes, school data. Each one is a day's work on top of what's here.
- **Other cities.** Socrata runs hundreds of open-data portals. The server is written against Socrata, not against New York, so a Chicago or Seattle version is mostly configuration.
- **Your data.** A company's own database behind the same shape: a few tools for the real questions, a validated general query, and the model never touching SQL directly.

## What's checked

61 tests, none of which touch the network. The HTTP tests start the real server on a local port and connect with the official MCP SDK client. Live calls against city data were run by hand and recorded in the repo's PROOF file, along with what wasn't checked: it hasn't been deployed yet, the Docker image wasn't built, and it hasn't been connected to Claude Desktop or Cursor over HTTP, only to the SDK client those apps build on. The npm package isn't published yet, so for now it installs from GitHub.
