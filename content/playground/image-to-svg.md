---
title: Image to SVG
summary: Trace a raster image into a scalable vector with VTracer.
order: 6
kind: gpu
model: VTracer on ComfyUI
legacy_path: /vtracer
---

Upload a PNG or JPEG and get back an SVG you can scale to any size. Useful for logos and simple illustrations.

## How it worked

VTracer traces the image into color regions and turns their outlines into curves. The settings (how many colors, how much detail, how smooth the curves are) are type-checked and validated on the server before the job runs.

This one doesn't actually need a GPU. If I bring the tools back, it's the first that should run in the browser instead, so it can never go offline.
