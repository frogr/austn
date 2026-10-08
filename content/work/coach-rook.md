---
title: Coach Rook
summary: A live video chess coach. The model never does the chess; the board and Stockfish do.
tier: more
tagline: "A video chess coach. Stockfish judges the moves, the model talks."
kind: project
order: 10
when: "2026"
role: Solo project
stack: [Tavus CVI, Node, Stockfish, Postgres]
hue: moss
art: true
links:
  - label: Code on GitHub
    url: https://github.com/frogr/tavus-chess-coach
screenshot: /work/thumbs/coach-rook.webp
screenshot_alt: "Coach Rook: four coaches to pick from, a session form, and a chess puzzle on a board"
---

A chess coach you talk to over live video, built on Tavus, which does real-time AI video. You play on a real board in the browser while the coach watches every move, talks it through with you, and points at the squares it means. Ask it to play, review a game, or go back to puzzles, and it takes you there.

<figure class="figure">
  <video controls preload="none" playsinline poster="/work/coach-rook-ad-poster.webp" width="1280" height="720">
    <source src="/work/coach-rook-ad.mp4" type="video/mp4">
  </video>
  <figcaption>The ad, 50 seconds, sound on. Anna, Victor, Helen and Darius, recorded from live calls. The boards and numbers on screen come from the app's engine.</figcaption>
</figure>

## Why chess

A language model is confidently wrong about chess, and the right answer can always be checked. That makes it a good test of what a video agent needs in any real deployment: stay grounded in facts it didn't make up, act through tools instead of describing actions, and leave a record of what it said.

Seeing the best move isn't the same as learning it. The usual loop is blunder, best move, engine line, close the tab. This one is make a move, get a question, try again, understand why.

## One conversation

There are no menus to learn. Say what you want and the coach takes you there, mid-sentence.

- "Let's play. You at a thousand." A game starts.
- "Can we review the game we just played?" It opens, with your mistakes found.
- "Show me where it went wrong." The board goes back to that move.
- "Back to puzzles." You're back.

<figure class="figure">
  <video controls preload="none" playsinline poster="/work/coach-rook-call-poster.webp" width="1280" height="720">
    <source src="/work/coach-rook-call.mp4" type="video/mp4">
  </video>
  <figcaption>A real call, two minutes, uncut. The coach's replies are live and unscripted. The student's requests were typed instead of spoken.</figcaption>
</figure>

## Puzzles, play, review

**Puzzles.** Stuck? Say so. Help comes one step at a time, and each step leaves you something to find: a question ("What is your knight standing in front of?"), then a highlighted piece, then the pattern's name ("Think clearance"), then the solution, only when you ask for it. About 4,800 puzzles from the Lichess database.

**Play.** Pick a strength from 500 to 3000 and ask about the position at any point. The coaching thins out as the rating climbs.

| Strength | What the coach does |
| --- | --- |
| 500 | Mentions threats before they land. |
| 1000 | Says what a move let through, and why. |
| 1500 | Speaks up when the game turns. |
| 2000 | Comments on turning points only. |
| 2500 | Explains when asked. |
| 3000 | Says little until the game is over. |

**Review.** Paste a game. The board goes back to the move before each one that cost you, the coach asks what you were thinking, and you try again. Any move that holds the position counts; the engine's first choice is one of them, and often there are others.

**Four coaches.** Anna is patient and asks before she tells. Victor is a veteran club coach, fundamentals first, dry humour. Helen is exacting and makes you calculate. Darius is an energetic sparring partner who loves a tactic. Same engine, same rules, same memory of you.

<figure class="figure">
  <img src="/work/coach-rook-1-puzzle.webp" alt="Coach Rook: four coaches to choose from, a name and access code form, and a rated puzzle on a chess board with white to move" width="1280" height="800" loading="lazy">
  <figcaption>Pick a coach, start a session, and the board is live. Puzzle one, rated 857.</figcaption>
</figure>

## The engine checks, Rook teaches

The coach is never trusted to work out chess by itself. The board keeps the position. Stockfish judges the moves. The coach's job is to ask, explain and encourage.

> **Board:** Austin played Qd6. Queen from d1 to d6.<br>
> **Stockfish:** Mistake. Bd3 kept it equal (-0.1). Now Black is winning (-3.4).<br>
> **Coach:** "Look at your bishop on e4. What happens to it now?"

- **It acts through eleven tools:** analyze a move, point at squares, load a puzzle, start a game, take back a move, open a review, jump to a move. The browser carries them out and reports back.
- **Memory is the app's own record.** After each session the board writes down what happened: what you solved cleanly, what needed hints, which mistakes came up in your games. The coach reads it before saying hello. Every session is kept in Postgres, so the notes add up to a profile of what you're getting better at and what still catches you.

## Picking the model by test

I ran the same scripted requests against different models and counted the tool calls. The default model made one of four. `tavus-gpt-4.1` made four of four. That's the one it uses. Around 90 tests run with Tavus faked out.

The deployed version runs on my own Tavus account, so it isn't open to the public. The code is, and it runs locally with your own key.
