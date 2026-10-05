---
title: Text to speech
summary: Speech from text with Chatterbox, with adjustable delivery, batch jobs from a CSV, and share links.
order: 3
kind: gpu
model: Chatterbox, on its own Flask server
legacy_path: /tts
---

Paste text, pick a voice, and tune how it's delivered: an exaggeration control for how expressive it sounds, and a guidance weight for how closely it sticks to the voice. You could also upload a CSV and generate dozens of clips at once, and share any clip with a link.

## How it worked

- Text to speech ran on its own small Python server next to ComfyUI, with a health route the site checked.
- Each request became a job like every other tool, so it waited its turn for the GPU.
- A share link points at a stored clip by token, with its own page and an embed view. Old links expire and get cleaned up on a schedule.
- There's also a small JSON API for generating clips from scripts.

## Voice cloning

Chatterbox can clone a voice from a short sample. On the public site that's only open to me, the admin, and every generation is logged. The samples here will use readers from [LibriVox](https://librivox.org), whose recordings are in the public domain.
