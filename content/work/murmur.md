---
title: Murmur
summary: On-device dictation and clipboard history for macOS. No cloud, no API keys.
tier: more
order: 12
when: "2026"
role: Solo project
stack: [Swift, WhisperKit, llama.cpp, SQLite]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/murmur
---

My own replacement for Wispr Flow and Paste, two Mac apps for dictation and clipboard history. Murmur runs entirely on the Mac.

- **Dictation anywhere.** Hold right ⌘, speak, let go, and cleaned-up text appears at the cursor in whatever app is in front.
- **Clipboard history.** ⌥⌘V opens a searchable list of everything you've copied.
- **Fully on-device.** Whisper for speech to text, an optional local LLM for cleanup, SQLite for history.

## Never wait on the model

Text goes in at the cursor right away, after fast rule-based cleanup. If the local LLM is on, it gets three seconds to produce a better version in the background, and the HUD offers to swap it in with one click. If the model misses the budget, its output is thrown away. Typing never waits on it.

It's a monorepo of small Swift packages (capture, transcription, cleanup, insertion), each with its own tests, and it builds from a clean clone with one command.
