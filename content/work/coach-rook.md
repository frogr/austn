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
links:
  - label: Code on GitHub
    url: https://github.com/frogr/tavus-chess-coach
screenshot: /work/thumbs/coach-rook.webp
screenshot_alt: "Coach Rook: four coaches to pick from, a session form, and a chess puzzle on a board"
---

A chess coach you talk to over live video, built on Tavus, which does real-time AI video. You play on a real board in the browser while the coach watches every move, talks it through with you, and points at the squares it means. Ask it to play, review a game, or go back to puzzles, and it takes you there.

<figure class="figure">
  <img src="/work/coach-rook-1-puzzle.webp" alt="Coach Rook: four coaches to choose from, a name and access code form, and a rated puzzle on a chess board with white to move" width="1280" height="800" loading="lazy">
  <figcaption>Pick a coach, start a session, and the board is live. Puzzle one, rated 857.</figcaption>
</figure>

## Why chess

A language model is confidently wrong about chess, and the right answer can always be checked. That makes it a good test of what a video agent needs in any real deployment: stay grounded in facts it didn't make up, act through tools instead of describing actions, and leave a record of what it said.

## How it works

- **The model never does chess.** The board validates every move and Stockfish judges it. The coach is told the position and the verdict in plain English.
- **It acts through eleven tools:** analyze a move, point at squares, load a puzzle, start a game, take back a move, open a review, jump to a move. The browser carries them out and reports back.
- **Memory is the app's own record.** Every session is kept in Postgres, and the notes the coach reads are rebuilt from that record.

## Picking the model by test

I ran the same scripted requests against different models and counted the tool calls. The default model made one of four. `tavus-gpt-4.1` made four of four. That's the one it uses.

It has about 4,800 puzzles from the Lichess database, six playing strengths from 500 to 3000, four coaches with their own faces and voices, and around 90 tests with Tavus faked out.

The deployed version runs on my own Tavus account, so it isn't open to the public. The code is, and it runs locally with your own key.
