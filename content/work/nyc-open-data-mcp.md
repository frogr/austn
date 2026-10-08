---
title: NYC Open Data MCP
summary: An MCP server that lets Claude or Cursor answer questions from New York City's public data, like restaurant grades and 311 complaints. Local or remote, with a web playground.
tier: more
tagline: "Lets an AI assistant query NYC restaurant grades, 311 and more."
kind: project
order: 13
when: "2026"
role: Solo project
stack: [TypeScript, Node, MCP SDK, Zod, Vitest]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/nyc-open-data-mcp
screenshot: /work/thumbs/nyc-open-data-mcp.webp
screenshot_alt: "The playground running restaurant_inspections for ramen in 10003, with letter grades and violation counts"
---

MCP (Model Context Protocol) is the open standard that lets AI apps like Claude and Cursor call outside tools. This server gives them read-only access to NYC Open Data, the city's catalog of 2,400+ public datasets, through Socrata, the API the city publishes them on. No API key needed.

Ask "which ramen spots in 10003 have an A grade?" or "what were the top 311 complaints in the East Village last month?" and the assistant calls a tool, gets real rows back, and answers from them. It runs on your own machine over stdio, or as a remote server over Streamable HTTP (the current MCP transport for servers on the web), with a playground page where you can run every tool in a browser.

<figure class="figure">
  <img src="/work/nyc-open-data-mcp-1-restaurants.webp" alt="The playground's restaurant_inspections tool: a form on the left with name ramen and ZIP 10003, results on the right with four restaurants, their latest grades, inspection dates, scores and critical violation counts" width="1280" height="800" loading="lazy">
  <figcaption>The same tool the assistant calls, run from the playground against live city data on 2026-10-07.</figcaption>
</figure>

## Four tools, chosen on purpose

Two tools answer the questions people actually ask, and do the awkward parts on the server. Two are general, for everything else.

- **`restaurant_inspections`.** The city stores one row per violation, so the tool groups by restaurant to page through restaurants, then fetches the history for just that page and works out the latest grade. That grade isn't always from the latest inspection, because a re-inspection can leave it pending.
- **`service_requests_311`.** The 311 dataset is about 22.7 million rows. The tool runs three small aggregate queries on Socrata's side instead of downloading anything.
- **`search_datasets`** returns column names with each dataset, so the model can write a valid filter on its first try.
- **`query_dataset`** runs read-only queries against any dataset, capped at 500 rows and about 60 KB per response, with the offset to continue from when it cuts something off.

<figure class="figure">
  <img src="/work/nyc-open-data-mcp-2-311.webp" alt="The service_requests_311 tool for ZIPs 10003 and 10009 in September 2026: 4,823 requests, with Encampment, Noise - Residential and Illegal Parking at the top" width="1280" height="800" loading="lazy">
  <figcaption>East Village 311 for September 2026: 4,823 requests, counted on Socrata's side.</figcaption>
</figure>

## Safe to put on the internet

- Every value that goes into a query is escaped, so `x' OR '1'='1` stays a string. Dataset ids, ZIPs, dates and boroughs are validated before any request.
- Upstream errors come back as plain hints the model can act on ("use search_datasets to find a valid dataset id"), never as stack traces.
- The remote server has a per-IP rate limit (30 a minute), a daily cap, a 64 KB body limit checked while streaming, and timeouts on every request.

## What's checked

60 tests, none of which touch the network. The HTTP tests start the real server on a local port and connect with the official MCP SDK client. Live calls against city data were run by hand and recorded in the repo's PROOF file, along with what wasn't checked: it hasn't been deployed yet, the Docker image wasn't built, and it hasn't been connected to Claude Desktop or Cursor over HTTP, only to the SDK client those apps build on. The npm package isn't published yet, so for now it installs from GitHub.
