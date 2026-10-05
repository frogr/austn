---
title: Music generation
summary: Full songs with vocals from lyrics and style tags, using ACE-Step.
order: 2
kind: gpu
model: ACE-Step on ComfyUI
legacy_path: /music
screenshot: /playground/music-generation.webp
screenshot_caption: "The music tool as it looked when it was live."
---

The tool that surprised people most. You write lyrics with structure tags like `[verse]`, `[chorus]` and `[bridge]`, add style tags ("dark, death metal, electric guitar, 140 BPM, A minor"), pick a length, and get back a whole song with vocals.

## How it worked

- Presets (instrumental, full song, rap, ambient) fill in sensible tags and settings, and anything you set yourself wins.
- Duration, inference steps and the guidance scales are clamped on the server before anything reaches the GPU. Length tops out at four minutes.
- A song can take minutes to render, so the job's hold on the GPU lock is sized to the longest song it allows. Otherwise the lock could expire mid-song and let a second job onto the GPU.
- The finished audio could be downloaded as a file.
