---
title: claude-ding
summary: Sound for Claude Code. A chime when it finishes, a different one when it needs you, an error buzz when a tool fails. On npm.
tier: more
kind: fun
order: 20
when: "2026"
role: Solo project
stack: [TypeScript, Node, Claude Code hooks]
links:
  - label: On npm
    url: https://www.npmjs.com/package/claude-ding
  - label: Code on GitHub
    url: https://github.com/frogr/claude-ding
screenshot: /work/thumbs/claude-ding.webp
screenshot_alt: "claude-ding's command list and sound presets in a terminal"
---

I spend most of the day in Claude Code (Anthropic's terminal coding agent), often with several sessions going. The problem is knowing when one of them wants me without staring at it. claude-ding plays a sound instead.

```
npm install -g claude-ding
claude-ding init
```

That picks a preset, sets the volume, and writes hooks into Claude Code's settings. There are six presets: minimal UI tones, sci-fi, fantasy, retro chiptune, Doom (shotgun rack when it finishes), and NASA mission control with Quindar beeps.

<figure class="figure">
  <img src="/work/claude-ding-1-cli.webp" alt="Terminal output of claude-ding --help listing its commands, and claude-ding preset listing the six presets with doom selected" width="1280" height="866" loading="lazy">
  <figcaption>The CLI. I run the Doom preset.</figcaption>
</figure>

<figure class="figure">
  <div class="diagram" role="img" aria-label="Claude Code fires hook events: Stop, Notification with a permission prompt or idle prompt, PostToolUseFailure, SessionStart. Each hook runs claude-ding play with a sound name. claude-ding reads the config for the preset, volume and quiet hours, then plays the preset's file for that sound.">
    <svg viewBox="0 0 680 190" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="cd-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="10" width="150" height="170" rx="6"/><text x="85" y="30" text-anchor="middle">Claude Code</text>
      <text class="label" x="22" y="58">Stop</text>
      <text class="label" x="22" y="84">Notification: permission</text>
      <text class="label" x="22" y="110">Notification: idle</text>
      <text class="label" x="22" y="136">PostToolUseFailure</text>
      <text class="label" x="22" y="162">SessionStart</text>
      <rect class="box" x="220" y="10" width="150" height="170" rx="6"/><text x="295" y="30" text-anchor="middle">Hooks</text>
      <text class="label" x="232" y="58">play task-complete</text>
      <text class="label" x="232" y="84">play need-input</text>
      <text class="label" x="232" y="110">play idle</text>
      <text class="label" x="232" y="136">play error</text>
      <text class="label" x="232" y="162">play session-start</text>
      <rect class="box box--accent" x="430" y="60" width="110" height="60" rx="6"/><text x="485" y="82" text-anchor="middle">claude-ding</text><text class="label" x="485" y="97" text-anchor="middle">preset, volume,</text><text class="label" x="485" y="110" text-anchor="middle">quiet hours</text>
      <rect class="box" x="580" y="60" width="90" height="60" rx="6"/><text x="625" y="82" text-anchor="middle">Sound</text><text class="label" x="625" y="97" text-anchor="middle">6 presets</text><text class="label" x="625" y="110" text-anchor="middle">or your file</text>
      <path class="edge" d="M160 54 H218" marker-end="url(#cd-arrow)"/>
      <path class="edge" d="M160 80 H218" marker-end="url(#cd-arrow)"/>
      <path class="edge" d="M160 106 H218" marker-end="url(#cd-arrow)"/>
      <path class="edge" d="M160 132 H218" marker-end="url(#cd-arrow)"/>
      <path class="edge" d="M160 158 H218" marker-end="url(#cd-arrow)"/>
      <path class="edge" d="M370 90 H428" marker-end="url(#cd-arrow)"/>
      <path class="edge" d="M540 90 H578" marker-end="url(#cd-arrow)"/>
    </svg>
  </div>
  <figcaption>Each Claude Code event maps to one named sound. The hook is one shell command, so you can wire your own.</figcaption>
</figure>

A few details I cared about:

- **Hooks are plain commands.** Each entry is `claude-ding play <name>`, so if you don't like the mapping you can edit the settings file by hand, or add your own hook for an event I didn't cover.
- **Any sound can be overridden** with your own file, per sound, without leaving the preset.
- **Quiet hours.** Set a start and end time and it stays silent at night.
- **`uninstall` removes exactly what `install` added** and nothing else in your settings.

Built in TypeScript with tsup and tested with Vitest. It's the kind of tool I'd rather install than build, but nobody had, so I did.
