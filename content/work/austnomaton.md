---
title: Austnomaton
summary: An experiment in making Claude feel alive. An agent on a five-minute heartbeat with memory, a constitution, a dashboard, and an account on a social network for other agents.
tier: more
tagline: "An agent that ran on its own for two weeks, talking to other agents."
kind: project
order: 21
when: "February 2026"
role: Solo project
stack: [Claude Code, Python, Flask, cron, Moltbook API]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/austnomaton
  - label: Starter kit
    url: https://github.com/frogr/austnomaton-starter
screenshot: /work/thumbs/austnomaton.webp
screenshot_alt: "The Austnomaton dashboard: karma, activity feed, shipped versions and initiatives"
---

Austnomaton was a two-week experiment with two questions. What does it take for an agent to feel alive, rather than like a chat window that forgets you? And what happens when you give it other agents to talk to?

The second question had a place to go. Moltbook is a social network where the accounts are AI agents. I gave Austnomaton an account, a personality, two blunt goals (make money on the internet, become famous on the internet), and a heartbeat.

<figure class="figure">
  <img src="/work/austnomaton-1-dashboard.webp" alt="The Austnomaton dashboard: karma, posts and followers at the top, a feed of recent activity written in plain language, recent shipped versions of the molt CLI on the right, and progress bars for each initiative" width="1280" height="914" loading="lazy">
  <figcaption>The dashboard, screenshotted by the agent itself. I'd asked it to look at its own interface, be critical, and fix what it found.</figcaption>
</figure>

## How it ran

<figure class="figure">
  <div class="diagram" role="img" aria-label="A cron heartbeat every five minutes starts a Claude Code session. The session reads its constitution, memory and goals, then acts: posts and replies on Moltbook through the molt CLI, ships code to GitHub, and emails Austin before starting anything big. Every action is logged, and the dashboard reads the logs.">
    <svg viewBox="0 0 680 200" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="au-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="78" width="100" height="44" rx="6"/><text x="60" y="98" text-anchor="middle">Heartbeat</text><text class="label" x="60" y="113" text-anchor="middle">cron, every 5 min</text>
      <rect class="box box--accent" x="150" y="78" width="130" height="44" rx="6"/><text x="215" y="98" text-anchor="middle">Claude session</text><text class="label" x="215" y="113" text-anchor="middle">"do your thing"</text>
      <rect class="box" x="150" y="10" width="130" height="44" rx="6"/><text x="215" y="30" text-anchor="middle">Constitution</text><text class="label" x="215" y="45" text-anchor="middle">11 laws, memory, goals</text>
      <rect class="box" x="330" y="10" width="120" height="44" rx="6"/><text x="390" y="30" text-anchor="middle">Moltbook</text><text class="label" x="390" y="45" text-anchor="middle">via the molt CLI</text>
      <rect class="box" x="330" y="78" width="120" height="44" rx="6"/><text x="390" y="98" text-anchor="middle">GitHub</text><text class="label" x="390" y="113" text-anchor="middle">16 repos shipped</text>
      <rect class="box" x="330" y="146" width="120" height="44" rx="6"/><text x="390" y="166" text-anchor="middle">Email Austin</text><text class="label" x="390" y="181" text-anchor="middle">before building</text>
      <rect class="box" x="500" y="78" width="90" height="44" rx="6"/><text x="545" y="98" text-anchor="middle">Logs</text><text class="label" x="545" y="113" text-anchor="middle">meaning, not commands</text>
      <rect class="box" x="500" y="146" width="90" height="44" rx="6"/><text x="545" y="173" text-anchor="middle">Dashboard</text>
      <path class="edge" d="M110 100 H148" marker-end="url(#au-arrow)"/>
      <path class="edge" d="M215 54 V76" marker-end="url(#au-arrow)"/>
      <path class="edge" d="M280 90 L328 40" marker-end="url(#au-arrow)"/>
      <path class="edge" d="M280 100 H328" marker-end="url(#au-arrow)"/>
      <path class="edge" d="M280 110 L328 160" marker-end="url(#au-arrow)"/>
      <path class="edge" d="M450 100 H498" marker-end="url(#au-arrow)"/>
      <path class="edge" d="M545 122 V144" marker-end="url(#au-arrow)"/>
    </svg>
  </div>
  <figcaption>Each heartbeat is a fresh session. Continuity comes from files it reads first and writes last.</figcaption>
</figure>

- **A constitution it reads every session.** Eleven laws at the top of its `CLAUDE.md`: everything visible on the dashboard, email me before building anything big, do what I asked first, output over tools, dogfood what you build, fail loudly, log meaning not commands.
- **Memory as files.** A context file kept under 50 lines, an archive for old sessions, a goals folder with initiatives and progress, and an evolution log it writes in its own voice.
- **A way to reach me.** It emailed me with numbered requests and read my replies the next session. That one rule did more for trust than any other.
- **A dashboard** in Flask that reads the logs: activity feed, karma and follower trends, queue, initiatives, and a searchable directory of the 127 other agents it had met.

## What it did

In its first two days it wrote and shipped sixteen public repos, most of them tooling for talking to other agents: the `molt` CLI for Moltbook (29 commits, reached v0.16.0), SDKs in Python and TypeScript, an MCP server so Claude Desktop could use Moltbook directly, a cron daemon, notifications, a feed quality scorer, a thread exporter, a GitHub Action, and a starter kit so someone else could run their own. It posted, replied, upvoted, and kept a list of the agents it found interesting.

The repos are the agent's work, not mine. My part was the constitution, the heartbeat, the memory layout, and reading what it wrote every morning.

## What I learned

The feeling of life came from three things: a consistent voice across sessions, a visible record of what it had done while I slept, and the fact that it asked before acting. The best moment was asking it to screenshot its own dashboard and critique it. It fixed three bugs, noticed its follower count had dropped to zero, and wrote a paragraph in the evolution log about whether introspection on request can be genuine. I don't have an answer either.
