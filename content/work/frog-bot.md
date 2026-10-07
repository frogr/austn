---
title: frog_bot
summary: A Discord bot for my friends' server. Moderation commands, role swapping, and a log of who joined, who left, and what got deleted.
tier: more
kind: fun
order: 32
when: "2018-20"
role: Solo project, with one friend's pull request
stack: [Node, discord.js]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/frog_bot
---

The oldest project on this page, and still a real one. frog_bot ran on a private Discord server for my friends. Commands start with `frog.`: kick, ban, purge a run of messages, hand out a role, ping, say. Each moderation command checks the caller's role and the bot's own permissions before it does anything, and refuses without a reason.

<figure class="figure">
  <div class="diagram" role="img" aria-label="Discord sends events to discord.js. Messages that start with frog. go through a role check and a permissions check and then run a command: kick, ban, purge, role, say, ping. Member joins and leaves go to a member-logs channel, and deleted messages are copied to a deleted channel.">
    <svg viewBox="0 0 680 150" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="fb-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="50" width="100" height="44" rx="6"/><text x="60" y="70" text-anchor="middle">Discord</text><text class="label" x="60" y="85" text-anchor="middle">discord.js events</text>
      <rect class="box box--accent" x="170" y="10" width="140" height="44" rx="6"/><text x="240" y="30" text-anchor="middle">frog.&lt;command&gt;</text><text class="label" x="240" y="45" text-anchor="middle">role + permission check</text>
      <rect class="box" x="370" y="10" width="300" height="44" rx="6"/><text x="520" y="30" text-anchor="middle">kick · ban · purge · role · say · ping</text><text class="label" x="520" y="45" text-anchor="middle">a reason is required</text>
      <rect class="box" x="170" y="68" width="140" height="36" rx="6"/><text x="240" y="90" text-anchor="middle">join / leave</text>
      <rect class="box" x="370" y="68" width="140" height="36" rx="6"/><text x="440" y="90" text-anchor="middle">#member-logs</text>
      <rect class="box" x="170" y="112" width="140" height="36" rx="6"/><text x="240" y="134" text-anchor="middle">message deleted</text>
      <rect class="box" x="370" y="112" width="140" height="36" rx="6"/><text x="440" y="134" text-anchor="middle">#deleted</text>
      <path class="edge" d="M110 65 L168 36" marker-end="url(#fb-arrow)"/>
      <path class="edge" d="M110 78 H168" marker-end="url(#fb-arrow)"/>
      <path class="edge" d="M110 88 L168 126" marker-end="url(#fb-arrow)"/>
      <path class="edge" d="M310 32 H368" marker-end="url(#fb-arrow)"/>
      <path class="edge" d="M310 86 H368" marker-end="url(#fb-arrow)"/>
      <path class="edge" d="M310 130 H368" marker-end="url(#fb-arrow)"/>
    </svg>
  </div>
  <figcaption>Commands on top, logging underneath. The log channels are what the server actually used most.</figcaption>
</figure>

It's about 40 commits from 2018 to 2020, deployed with a Procfile, one file per command. A friend sent a pull request to fix the `say` command's permissions, which made it the first project of mine someone else contributed to. The code is a 2018 snapshot of me learning Node, and I've left it that way.
