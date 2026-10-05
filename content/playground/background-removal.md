---
title: Background removal
summary: Upload an image, get a transparent PNG. Seven models for different kinds of pictures.
order: 5
kind: gpu
model: rembg on ComfyUI (u2net family, ISNet)
legacy_path: /rembg
screenshot: /playground/background-removal.webp
screenshot_caption: "The background removal page when it was live."
---

Upload an image and get it back with the background removed, as a transparent PNG.

## How it worked

Different pictures need different models, so you could pick one:

| Model | Good for |
| --- | --- |
| u2net | General use, the default |
| u2netp | A smaller, faster u2net |
| u2net_human_seg | People |
| u2net_cloth_seg | Clothing |
| silueta | A lighter general model |
| isnet-general-use | General use, sharper edges |
| isnet-anime | Illustrations and anime |

The model name is checked against that list on the server, so nothing else reaches the workflow.
