---
title: How I Use Claude Code
date: 2024-08-14
slug: how-i-use-claude-code
---

# How I Use Claude Code

I'm on the supermax ultra plan because the usage limits on the lower tiers felt a bit restrictive. Here's how I actually use Claude Code day-to-day.

## Running Multiple Sessions

I typically have 2-3 Claude Code interfaces running at once. This isn't about being fancy—it just lets me work on different parts of a project without losing context. I'll use Opus 4.1 to write comprehensive prompts that Claude Code then breaks down into planning and execution phases. It's like having multiple focused assistants rather than one overwhelmed one.

## The Playwright MCP

The Playwright MCP has been genuinely useful for web development. Claude Code can take screenshots and click through pages autonomously, which means I can ask it to check if all my pages look consistent after a CSS change, and it'll actually do it—navigate to each page, take screenshots, click around, and report back. No manual clicking required.

Here's a typical interaction:

```
Me: "Check if the navigation bar looks the same on all pages"

Claude Code: 
- Opens each route
- Screenshots the nav area
- Compares them
- Tells me about any differences
```

It's particularly nice when you're tired and don't want to manually check every single page after a refactor.

## Desktop Organization

My desktop was a disaster. PDFs everywhere, no system, duplicates all over. I asked Claude Code to organize it, and now I have:

```
Desktop/
├── Documents/
│   ├── PDFs/
│   │   ├── Receipts/
│   │   ├── Manuals/
│   │   └── Articles/
│   ├── Projects/
│   └── Archive/
├── Screenshots/
└── Quick Access/
```

The key thing is that the system makes sense, so I actually maintain it. Claude Code also renamed files consistently and dealt with all the duplicates. It even left a README explaining the structure, which was thoughtful.

## Obsidian Notes

Same story with my Obsidian vault—complete chaos. Notes everywhere, broken links, no consistent tagging. Now it looks like:

```
Notes/
├── Areas/
│   ├── Work/
│   ├── Personal/
│   └── Learning/
├── Projects/
│   ├── Active/
│   └── Archived/
├── Daily/
│   └── 2024/
└── Resources/
    ├── Templates/
    └── References/
```

Beyond just moving files around, Claude Code fixed all the broken internal links and added consistent frontmatter. The vault actually works as a connected system now instead of a pile of isolated markdown files.

## Status Line Configuration

The status line is one of those features you don't think about until you set it up properly. Mine shows:

```bash
status_line: "{cwd} | {branch} | {elapsed} | {memory}"
```

Simple, but I always know where I am, what branch I'm on, how long I've been working, and if memory is becoming an issue. The status line changes based on context too—it'll show test results when running tests, package operations during installs, that sort of thing.

## Using Subagents

Subagents are specialized versions of Claude Code that handle specific tasks. The main ones I use:

**General-purpose agent**: Great for research. If I need to understand how WebSockets are implemented in the codebase, I'll have this agent search around and compile examples rather than grep-ing myself.

**Status line agent**: Sets up your Claude Code environment. Much easier than editing config files manually.

**Output style agent**: Adjusts how Claude Code formats its responses. I have mine set to be concise with code examples rather than lengthy explanations.

The nice thing is you can launch multiple agents in parallel. While one is searching the codebase, another can be running tests.

## Other Useful Features

### Hooks
You can set up commands to run automatically on events. For example:
```bash
post_save_hook: "prettier --write {file}"
```

### CLAUDE.md
This file acts as project memory. I put coding standards, common commands, and project-specific gotchas in there. Claude Code reads it and remembers these preferences across sessions.

### TodoWrite
Claude Code maintains its own task list. It's surprisingly good at breaking down complex tasks and tracking what's done. You'll see it updating the list as it works through things.

### Smart File Operations
Claude Code always reads files before editing them, preserves formatting, and can batch operations across multiple files. It's cautious about destructive operations, which I appreciate.

## Workflow Tips

Start with a planning prompt when tackling something complex. Let Claude Code think through the approach before diving into code.

Run complementary tasks in different interfaces. I'll have one working on backend changes while another handles frontend updates.

Set up validation checks. I always ask Claude Code to run linting and tests after changes. Catches issues early.

Start simple and iterate. Get the basic version working first, then add error handling, edge cases, and polish.

## Common Mistakes to Avoid

Don't dump everything into one massive prompt. Break it down into focused requests.

Let Claude Code use its todo list for complex tasks. It helps track progress and ensures nothing gets missed.

Use subagents for specialized work. They're better at their specific domains than the general interface.

Automate repetitive tasks with hooks instead of asking Claude Code to do them manually each time.

## Final Thoughts

Claude Code works best when you think of it as a collaborator rather than a command executor. Give it context, let it plan, and leverage its ability to handle multi-step workflows autonomously. The productivity gains come not from it writing code faster, but from it handling entire workflows while you focus on the bigger picture.

---

## Quick Reference

| Feature                 | What It Does                      | Documentation                                                                       |
| ----------------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| **Parallel Interfaces** | Run multiple Claude Code sessions | [Common Workflows](https://docs.anthropic.com/en/docs/claude-code/common-workflows) |
| **Playwright MCP**      | Browser automation and testing    | [MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)                           |
| **Subagents**           | Specialized task handlers         | [CLI Reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)       |
| **Status Line**         | Customizable environment display  | [Settings](https://docs.anthropic.com/en/docs/claude-code/settings)                 |
| **TodoWrite**           | Task management                   | [Interactive Mode](https://docs.anthropic.com/en/docs/claude-code/interactive-mode) |
| **CLAUDE.md**           | Project memory                    | [Memory](https://docs.anthropic.com/en/docs/claude-code/memory)                     |
| **Hooks**               | Event automation                  | [Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)                       |