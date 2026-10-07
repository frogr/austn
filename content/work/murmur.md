---
title: Murmur
summary: On-device dictation and clipboard history for macOS. No cloud, no API keys. Finished and ready for the Mac App Store.
tier: more
tagline: "Dictation and clipboard history for macOS, all on-device."
kind: project
order: 4
when: "2026"
role: Solo project
stack: [Swift, SwiftUI, WhisperKit, llama.cpp, GRDB]
screenshot: /work/thumbs/murmur.webp
screenshot_alt: "Murmur dictating into a Notes window: Say it, Murmur types it, with a live waveform in the corner"
links:
  - label: Code on GitHub
    url: https://github.com/frogr/murmur
---

My own replacement for Wispr Flow and Paste, two Mac apps for dictation and clipboard history. Murmur does both and runs entirely on the Mac. It's finished and I use it every day. If one of these goes on the Mac App Store, it's this one.

- **Dictation anywhere.** Hold right ⌘, speak, let go, and cleaned-up text appears at the cursor in whatever app is in front. Prose, bullets or email modes if the local model is on.
- **Clipboard history.** ⌥⌘V opens a searchable list of everything you've copied. Enter pastes it without touching the mouse.
- **Meetings.** Record a meeting, get a transcript and a summary, on-device.
- **Fully on-device.** Whisper for speech to text, an optional local LLM for cleanup, SQLite for history. No accounts, nothing uploaded.

<figure class="figure">
  <img src="/work/murmur-1-hud.webp" alt="The Murmur HUD: a small dark card with a command key glyph and the words hold right command" width="1280" height="720" loading="lazy">
  <figcaption>The whole interface for dictation is this. Hold the key, talk, let go. From the promo video.</figcaption>
</figure>

## Never wait on the model

<figure class="figure">
  <div class="diagram" role="img" aria-label="Hold right command: CaptureKit records audio and shows live levels in the HUD. Release: TranscribeKit runs Whisper on-device, RefineKit applies rules and the personal dictionary, and InsertKit pastes at the cursor, all in under 1.5 seconds. In parallel, if a local LLM is available, RefineKit asks it for a better version with a 3 second budget and the HUD offers Replace.">
    <svg viewBox="0 0 680 190" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="mu-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="30" width="100" height="44" rx="6"/><text x="60" y="50" text-anchor="middle">Hold right ⌘</text><text class="label" x="60" y="65" text-anchor="middle">CaptureKit, 16 kHz</text>
      <rect class="box" x="150" y="30" width="110" height="44" rx="6"/><text x="205" y="50" text-anchor="middle">Transcribe</text><text class="label" x="205" y="65" text-anchor="middle">WhisperKit, on-device</text>
      <rect class="box" x="300" y="30" width="120" height="44" rx="6"/><text x="360" y="50" text-anchor="middle">Rules + dictionary</text><text class="label" x="360" y="65" text-anchor="middle">RefineKit, pure Swift</text>
      <rect class="box box--accent" x="460" y="30" width="110" height="44" rx="6"/><text x="515" y="50" text-anchor="middle">Paste at cursor</text><text class="label" x="515" y="65" text-anchor="middle">InsertKit, under 1.5 s</text>
      <rect class="box" x="300" y="120" width="120" height="44" rx="6"/><text x="360" y="140" text-anchor="middle">Local LLM</text><text class="label" x="360" y="155" text-anchor="middle">3 second budget</text>
      <rect class="box" x="460" y="120" width="110" height="44" rx="6"/><text x="515" y="140" text-anchor="middle">"Replace"</text><text class="label" x="515" y="155" text-anchor="middle">one click in the HUD</text>
      <path class="edge" d="M110 52 H148" marker-end="url(#mu-arrow)"/>
      <path class="edge" d="M260 52 H298" marker-end="url(#mu-arrow)"/>
      <path class="edge" d="M420 52 H458" marker-end="url(#mu-arrow)"/>
      <path class="edge" d="M260 60 L298 135" marker-end="url(#mu-arrow)"/>
      <path class="edge" d="M420 142 H458" marker-end="url(#mu-arrow)"/>
      <text class="label" x="610" y="160">late = discarded</text>
    </svg>
  </div>
  <figcaption>The top row always finishes first. The model is a bonus that has to earn its place within three seconds.</figcaption>
</figure>

Text goes in at the cursor right away, after fast rule-based cleanup and your personal dictionary. If the local LLM is on, it gets three seconds to produce a better version in the background, and the HUD offers to swap it in with one click. If the model misses the budget, its output is thrown away. Typing never waits on it.

<figure class="figure">
  <img src="/work/murmur-2-clipboard.webp" alt="Murmur's clipboard panel: a search field, then a list of recent copies including a phone number, a code snippet, a URL and an address, each tagged with the app it came from" width="1280" height="720" loading="lazy">
  <figcaption>⌥⌘V. Everything you've copied, with the app it came from. Passwords and other concealed types are never stored. From the promo video.</figcaption>
</figure>

## How it's built

A monorepo of small Swift packages, each with its own tests: capture, transcription, refinement, insertion, clipboard, and a llama.cpp engine for the local model (Qwen3 4B). The app is a thin menu bar shell that wires them together. No package depends on the app, and the core has zero dependencies, so the same code can go into an iOS keyboard later. It builds from a clean clone with one command, no Xcode needed.

<figure class="figure">
  <img src="/work/murmur-3-library.webp" alt="Murmur's library window: a list of past dictations with the time, the app they were spoken into, the first line, and the duration" width="1280" height="720" loading="lazy">
  <figcaption>Every dictation and copy, searchable. From the promo video.</figcaption>
</figure>

The frames above come from the promo video, which lives in the same repo as a Remotion project: the app's screens rebuilt as React components so every cut and pan is code. It renders in a headless browser and never takes over the screen, which I appreciated more than I expected.
