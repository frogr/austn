---
title: "How I Use Claude Code"
date: 2026-10-05
slug: how-i-use-claude-code
summary: "What my setup actually looks like after a year and a half: hooks, a status line, parallel sessions, and a pipeline with a person at the gates."
---

I started using Claude Code in the beta, back when it was billed by API usage. One of the first things I built with it was a Three.js tool for planning Minecraft builds. I'd never touched Three.js, and we had it working in about an hour. Now it's open most of my day.

This is what my setup actually looks like. An earlier version of this post had config in it that doesn't exist, so everything below is copied from things I run.

## Hooks so I don't have to watch the terminal

The thing that changed my day the most is small. I don't stare at a session waiting for it to finish. I built [claude-ding](https://github.com/frogr/claude-ding), which plays a sound when Claude finishes, needs my approval, or hits an error. It works through Claude Code's hooks, which live in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "claude-ding play task-complete" }] }
    ],
    "Notification": [
      { "matcher": "permission_prompt", "hooks": [{ "type": "command", "command": "claude-ding play need-input" }] }
    ],
    "PostToolUseFailure": [
      { "hooks": [{ "type": "command", "command": "claude-ding play error" }] }
    ]
  }
}
```

Each hook is just a command that runs on an event. That's enough to go do something else and come back when it actually needs me.

## A status line that tells me what I need

My status line shows the directory, the git branch and whether it's clean, the model, how much of the context window is used, and how close I am to the 5-hour and weekly limits. It's a small script that Claude Code runs and pipes session info into, and whatever it prints is the status line. When the context is nearly full, I wrap up and start a fresh session instead of letting it start forgetting things.

## Several sessions at once

At Tenex I was the only engineer on three client projects, so one session at a time wasn't going to work. I built a small tool to run several Claude Code sessions in parallel, each on its own task, and a Slack-to-PR flow that turns a bug report into a pull request I can review.

## Product doc to pull request, with gates

The bigger experiment was a pipeline built from Claude Code skills that goes from a product doc to a pull request:

1. Write a plan from the doc.
2. Grade the plan, and send it back if it's weak.
3. Turn it into tickets.
4. Plan each ticket, and grade again.
5. Build it and open a PR.

A person signs off at the steps that matter. The grading loops are there to catch bad plans before any code gets written.

## From my phone

I also run an agent in a Discord server that can work on my dev machine. I can send it a voice note with an idea and look at the PR later. [I wrote one post entirely that way.](/blog/hermes-agent-discord-ai-assistant)

## What I do differently now

When I rebuilt this site, a code review turned up bugs that had gone in while I was moving fast: a retry setting that silently stopped working on Rails 8, a lock that could expire mid-job, and a "fix" for a race condition that didn't fix it. The code looked right and the PRs looked clean. [I wrote up what broke.](/blog/building-an-ai-native-web-platform)

So I keep CI green before I merge, I read the diff, and I give the agent tests that can actually fail.
