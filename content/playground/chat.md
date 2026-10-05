---
title: Chat
summary: A chat box backed by a local model in LM Studio. Slow, but free and private.
order: 8
kind: gpu
model: Qwen 2.5 Coder 14B in LM Studio
legacy_path: /chat
---

A plain chat interface to a model running on my own GPU through LM Studio. The page said it up front: it will be slow.

## How it worked

- Each message becomes a job and waits its turn for the GPU like everything else, and the page polls for the reply.
- The system prompt is set on the server, roles are limited to user and assistant, and conversations are capped in length and rate-limited per visitor.
- Message content isn't logged.
