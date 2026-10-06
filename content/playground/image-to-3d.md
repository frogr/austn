---
title: Image to 3D
summary: Turn a photo of one object into a 3D model you can spin around in the browser, with Hunyuan3D.
order: 7
kind: gpu
model: Hunyuan3D 2.1 on ComfyUI
legacy_path: /3d
screenshot: /playground/image-to-3d.webp
screenshot_caption: "The image to 3D page when it was live."
---

Upload a picture of a single object on a plain background, wait a minute or two, and get a 3D model back as a GLB file, with a preview you can rotate in the browser.

## How it worked

- The ComfyUI workflow runs Hunyuan3D 2.1: generate a mesh from the image, decode it, clean it up, and export it.
- The preview uses react-three-fiber, so the model renders right on the page.
- It works best with one object and a clean background. Busy photos give you lumpy shapes.
