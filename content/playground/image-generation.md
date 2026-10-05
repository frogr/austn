---
title: Image generation
summary: Text to image with Stable Diffusion 1.5, run through ComfyUI.
order: 1
kind: gpu
model: Stable Diffusion 1.5 (fp16) on ComfyUI
legacy_path: /images
---

Type a prompt, pick a size, get an image.

## How it worked

1. The page posts the prompt to Rails, which validates and clamps the size and batch settings and queues a job on the `gpu` queue.
2. The job waits for the GPU lock, fills in a ComfyUI workflow (checkpoint loader, text encoders, sampler, VAE decode, save) with the prompt and settings, and submits it.
3. It polls ComfyUI until the image is ready, stores the result in Redis for a short time, and marks the request complete.
4. The page polls the status endpoint and shows the image when it's done.

A default negative prompt keeps out the usual artifacts: blur, pixelation, compression noise.
