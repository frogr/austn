---
title: Stem separation
summary: Split a song into vocals, drums, bass and everything else, with Demucs.
order: 4
kind: gpu
model: Demucs (htdemucs, htdemucs_ft) on ComfyUI
legacy_path: /stems
---

Upload a song and get back four tracks: vocals, drums, bass, and everything else. Good for karaoke, remixes, or hearing what's buried in a mix.

## How it worked

- Two Demucs models to choose from: the standard one, and a fine-tuned version that's slower but cleaner.
- Uploads are checked for size and type before they're read, stored, and handed to the job by id.
- Separation is the slowest tool on the site, up to about fifteen minutes for a long track. That's the job that exposed the GPU lock expiring too early. Each tool now holds the lock for longer than its longest run.
- Each stem downloads on its own, or all four as a zip.
