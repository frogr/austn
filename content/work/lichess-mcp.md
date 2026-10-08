---
title: Lichess MCP
summary: An MCP server that gives an AI assistant your Lichess games, the mistakes the engine flagged, evaluations and puzzles. The model never does the chess.
tier: more
tagline: "Chess data for AI assistants. Lichess judges, the model explains."
kind: project
order: 13
when: "2026"
role: Solo project
stack: [TypeScript, Node, MCP SDK, chess.js, Vitest]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/lichess-mcp
screenshot: /work/thumbs/lichess-mcp.webp
screenshot_alt: "Game review in the playground: a player's recent games, a board with the played move in red and Lichess's move in green, and a list of flagged moves"
---

Lichess is the free, open-source chess site. This is an MCP server for it (Model Context Protocol, the open standard that lets AI apps like Claude and Cursor call outside tools). It gives the assistant a player's profile and recent games, the mistakes Lichess's engine flagged in them, cloud engine evaluations, exact endgame results, puzzles and opening statistics.

It follows the same rule as [Coach Rook](/work/coach-rook) and [aCoach](/work/acoach): the model never decides what happened. Language models are fluent about chess and often wrong about it, in the same confident tone either way. So the work is split:

- **Lichess does the chess.** Per-move evaluations and mistake labels come from its server analysis, position evaluations from its cloud cache, and positions with 7 pieces or fewer from the endgame tablebase.
- **The code does bookkeeping.** chess.js validates positions, replays games and converts engine notation (`e7e5`) to normal notation (`e5`). It never judges a position.
- **The model explains.**
- **Missing data stays missing.** An unanalysed game or a position the cloud cache doesn't have comes back as "not available" with the next step, and the tool tells the model not to estimate.

<figure class="figure">
  <img src="/work/lichess-mcp-1-review.webp" alt="The playground's game review: recent games for thibault with accuracy badges, and a board showing the played move Bf5 in red and Lichess's preferred b6 in green, next to a list of inaccuracies and blunders" width="1280" height="800" loading="lazy">
  <figcaption>The playground's game review, on live data. Red is the move played, green is the move Lichess preferred.</figcaption>
</figure>

## Checked against Lichess's own data

A live check script takes a player's recent games, runs `find_mistakes` on every analysed one, and checks the server's bookkeeping against what Lichess recorded. Across two players, 40 recent games (32 with analysis) and 175 flagged moves: every played move replayed to Lichess's own notation, every best move converted to the move Lichess named, and every engine line was legal from the position before.

The same run showed that "not available" is the common case, not the edge case. For one player, 8 of 20 recent games had no analysis, and 13 of 15 real mistake positions weren't in the cloud cache. The cloud endpoint also rate-limits anonymous callers quickly, so after a 429 the client stops calling Lichess for 60 seconds, the way Lichess asks.

<figure class="figure">
  <img src="/work/lichess-mcp-2-puzzle.webp" alt="Puzzle of the day in the playground: black to move, rating 1940, played 104,075 times, with Hint and Show solution buttons" width="1280" height="800" loading="lazy">
  <figcaption>The daily puzzle. The solution stays hidden until you ask, which is how a coach would use it.</figcaption>
</figure>

## What's checked

95 tests against recorded Lichess responses, with no network. The remote server has the same limits as my other MCP servers: per-IP rate limit, daily cap, body size limit, timeouts. Not checked: `opening_stats` with a real token (Lichess's opening explorer now requires one, and I don't have one here), a real deploy, the Docker image, and connecting it to Claude Desktop or Cursor. The npm package will be `lichess-coach-mcp`, since `lichess-mcp` is taken by an unrelated project, and it isn't published yet, so for now it installs from GitHub.
