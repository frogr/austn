---
title: Lichess MCP
summary: Ask Claude about your chess games and get a coach that never makes up the chess. Every evaluation and every "that was a mistake" comes from Lichess's engine. The model only explains.
tier: more
tagline: "Chess data for AI assistants. Lichess judges, the model explains."
kind: project
order: 13
when: "2026"
role: Solo project
stack: [TypeScript, Node, MCP SDK, chess.js, Vitest]
hue: moss
art: true
demo_url: https://lichess-mcp.onrender.com
offer: mcp-server
links:
  - label: Code on GitHub
    url: https://github.com/frogr/lichess-mcp
screenshot: /work/thumbs/lichess-mcp.webp
screenshot_alt: "The Lichess MCP playground: a request to review a player's last game, the two tool calls it becomes, the mistakes Lichess flagged, and the line Claude can now say"
---

Language models are fluent about chess and often wrong about it. They suggest illegal moves, miss one-move tactics, and give confident evaluations no engine would agree with, in the same tone as when they're right. For a coach, that's the worst kind of error, because the student can't tell. I've built two chess coaches now (<a href="/work/coach-rook">Coach Rook</a> was the first), and both run on the same rule: the model never does the chess.

This one is an MCP server for Lichess, the free, open-source chess site. MCP (Model Context Protocol) is the open standard that lets AI apps like Claude and Cursor call outside tools. It gives the assistant a player's games, the mistakes Lichess's engine flagged in them, cloud evaluations, exact endgame results and puzzles. The model reads what Lichess said and talks to you about it.

## Ask it

This one is two tool calls. It ran against live Lichess data on 2026-10-07, on a public account that belongs to Lichess's founder.

<ol class="chat">
  <li class="chat-you"><span class="chat-who">You</span><p>Review thibault's last analysed game. What were the worst moves?</p></li>
  <li class="chat-tool"><span class="chat-who">Claude calls</span><code><b>recent_games</b>(username: "thibault", max: 20)</code></li>
  <li class="chat-result"><span class="chat-who">lichess-mcp returns</span>
    <dl>
      <dt>games</dt><dd>20, of which 13 have Lichess analysis</dd>
      <dt>first analysed</dt><dd>AfOSXTLe: blitz 300+3, white vs sonderbonbon (1730), won by resignation, Caro-Kann Advance, accuracy 87</dd>
    </dl>
  </li>
  <li class="chat-tool"><span class="chat-who">Claude calls</span><code><b>find_mistakes</b>(game_id: "AfOSXTLe", for_player: "thibault")</code></li>
  <li class="chat-result"><span class="chat-who">lichess-mcp returns</span>
    <dl>
      <dt>summary</dt><dd>accuracy 87, 1 inaccuracy, 1 mistake, 1 blunder</dd>
      <dt>worst</dt><dd>20. Ne4, blunder. Lichess preferred Ne2. Eval went from +0.39 to -6.52, 45.3% winning chances lost.</dd>
      <dt>also</dt><dd>8. Be2, inaccuracy (Qh5 was best). 13. Be5, mistake (Bg4 was best).</dd>
    </dl>
  </li>
  <li class="chat-them"><span class="chat-who">Claude</span><p>Your last analysed game was a blitz win as White against sonderbonbon, in the Advance Caro-Kann, at 87% accuracy. Lichess flagged three moves. The one that mattered was 20. Ne4: the position went from slightly better for you to lost, about 45 points of winning chances, and the engine wanted Ne2 instead. Earlier, 8. Be2 (Qh5 was better) and 13. Be5 (Bg4) each cost around 10 points. You won anyway, so your opponent gave it back later. Want to look at the position before move 20?</p></li>
</ol>

You can run this one, and four others, in the <a href="https://lichess-mcp.onrender.com">live playground</a>.

Notice what the model didn't do. It didn't say why Ne4 was bad, because Lichess didn't say. It can ask for the engine's line and explain that, or send you to the analysis board. What it won't do is invent a reason.

## What it's for

- **Players who want a coach between games.** "Review my last blitz game." "What's my worst opening as Black?" The data is already on Lichess; this puts it in front of an assistant that can talk about it.
- **Positions, not just games.** Paste a FEN (the standard text format for a chess position) and ask "what does the engine say?" The answer comes from Lichess's cloud evaluation cache, with the depth: after 1. e4 e5 2. Nf3 Nc6 it's depth 65, best move Bb5 at +0.22, then Bc4 at +0.19.
- **Endgames, exactly.** Positions with seven pieces or fewer go to the tablebase, which is perfect play. King and pawn versus king on e5 and e6: White to move wins, mate in 11; Kd6 and Kf6 win, Kd5 only draws.
- **Puzzles the way a coach gives them.** "Give me today's puzzle, but don't tell me the answer." The solution stays hidden until you ask, and the tool tells the model not to work it out itself.
- **Any domain where something authoritative judges.** Medical codes, legal citations, financial figures: wherever a model's fluency outruns its accuracy, the same split applies. Something authoritative judges, code keeps the books, the model explains.

## Who does what

<figure class="figure">
  <div class="diagram" role="img" aria-label="Three rows. Lichess does the chess: server analysis labels mistakes, the cloud cache evaluates positions, the tablebase gives exact endgame results. The code does bookkeeping with chess.js: validates positions, replays games, converts engine notation. The model explains. Missing data is returned as not available and the model is told not to estimate.">
    <svg viewBox="0 0 680 200" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="lc-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <text class="label" x="10" y="20">Lichess does the chess</text>
      <rect class="box" x="10" y="28" width="130" height="44" rx="6"/><text x="75" y="48" text-anchor="middle">Server analysis</text><text class="label" x="75" y="63" text-anchor="middle">evals and labels</text>
      <rect class="box" x="160" y="28" width="130" height="44" rx="6"/><text x="225" y="48" text-anchor="middle">Cloud eval</text><text class="label" x="225" y="63" text-anchor="middle">cached positions</text>
      <rect class="box" x="310" y="28" width="130" height="44" rx="6"/><text x="375" y="48" text-anchor="middle">Tablebase</text><text class="label" x="375" y="63" text-anchor="middle">7 pieces or fewer</text>
      <rect class="box" x="460" y="28" width="100" height="44" rx="6"/><text x="510" y="48" text-anchor="middle">Puzzles</text><text class="label" x="510" y="63" text-anchor="middle">hidden answer</text>
      <text class="label" x="10" y="106">the code does bookkeeping</text>
      <rect class="box" x="10" y="114" width="430" height="40" rx="6"/><text x="225" y="131" text-anchor="middle">lichess-mcp + chess.js</text><text class="label" x="225" y="146" text-anchor="middle">validate FENs, replay games, e7e5 to e5, say "not available"</text>
      <rect class="box" x="460" y="114" width="100" height="40" rx="6"/><text x="510" y="139" text-anchor="middle">9 tools</text>
      <text class="label" x="10" y="184">the model explains</text>
      <rect class="box box--accent" x="580" y="28" width="90" height="126" rx="6"/><text x="625" y="86" text-anchor="middle">Claude</text><text class="label" x="625" y="101" text-anchor="middle">reads, talks</text>
      <path class="edge" d="M75 72 V112" marker-end="url(#lc-arrow)"/>
      <path class="edge" d="M225 72 V112" marker-end="url(#lc-arrow)"/>
      <path class="edge" d="M375 72 V112" marker-end="url(#lc-arrow)"/>
      <path class="edge" d="M510 72 V112" marker-end="url(#lc-arrow)"/>
      <path class="edge" d="M440 134 H458" marker-end="url(#lc-arrow)"/>
      <path class="edge" d="M560 134 H578" marker-end="url(#lc-arrow)"/>
    </svg>
  </div>
  <figcaption>Every number in an answer comes from the top row. The code never judges a position, and the model never fills a gap.</figcaption>
</figure>

- **Lichess does the chess.** Per-move evaluations and mistake labels come from its server analysis, position evaluations from its cloud cache, and positions with 7 pieces or fewer from the endgame tablebase.
- **The code does bookkeeping.** chess.js validates positions, replays games and converts engine notation (`e7e5`) to normal notation (`e5`). It never judges a position.
- **Missing data stays missing.** An unanalysed game or a position the cloud cache doesn't have comes back as "not available" with the next step, and the tool tells the model not to estimate.
- **Rate limits are respected.** The cloud endpoint rate-limits anonymous callers quickly, so after a 429 the client stops calling Lichess for 60 seconds, the way Lichess asks.

Coach Rook runs its own engine inside its own app. This is a thin, tested layer over Lichess for whatever assistant you already use. Same rule, different place to stand.

## Measured against Lichess's own data

A live check script takes a player's recent games, runs `find_mistakes` on every analysed one, and checks the server's bookkeeping against what Lichess recorded. Across two players, 40 recent games (32 with analysis) and 175 flagged moves: every played move replayed to Lichess's own notation, every best move converted to the move Lichess named, and every engine line was legal from the position before.

The same run taught me that "not available" is the common case, not the edge case. For one player, 8 of 20 recent games had no analysis, and 13 of 15 real mistake positions weren't in the cloud cache. A coach that guessed in those gaps would be guessing most of the time. 96 tests run against recorded Lichess responses, with no network.

## The playground

Every MCP server I build ships with one of these. This one has a board. Enter a username, pick a game, and see the moves Lichess flagged with the move it preferred, drawn as arrows. Below it, today's puzzle with the solution hidden until you ask.

<figure class="figure">
  <img src="/work/lichess-mcp-2-puzzle.webp" alt="Puzzle of the day in the playground: a board with the position, side to move, rating and themes, with Hint and Show solution buttons and the solution hidden" width="1280" height="800" loading="lazy">
  <figcaption>The daily puzzle. The solution stays hidden until you ask, which is how a coach would use it.</figcaption>
</figure>

## What's next

- **A study plan from a month of games**: the openings where the mistakes cluster, with the positions to drill. All the data is there; it's a tool that calls the other tools.
- **Opening statistics** with a token. The explorer tool is built and tested against recordings; Lichess's explorer now wants a token to answer.
- **The same shape for other engines of record**: a sports data API, a credit model, a compliance ruleset. Whatever judges, the model explains it.
