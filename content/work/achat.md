---
title: achat and irc.austn.net
summary: A terminal IRC client with a three-pane TUI, built for the IRC server I run.
tier: more
kind: fun
order: 18
when: "2026"
role: Solo project
stack: [TypeScript, Ink, React, irc-framework, Ergo]
links:
  - label: Code on GitHub
    url: https://github.com/frogr/achat
screenshot: /work/thumbs/achat.webp
screenshot_alt: "achat's three-pane terminal UI connected to irc.austn.net"
---

I run an IRC server at `irc.austn.net`. It's Ergo, a modern IRC server in Go, behind TLS with a real certificate. IRC is old and it still works, and it's a nice thing for friends and bots to share.

achat is the client I wanted for it: three panes, channels on the left, messages in the middle, users on the right, and a prompt at the bottom. It connects over TLS, authenticates with SASL the way the protocol intends, reconnects cleanly, and stays out of the way.

<figure class="figure">
  <img src="/work/achat-1-tui.webp" alt="achat in a terminal: channels pane on the left with #general selected, the message pane showing a join line and a hello message, a users pane on the right, the prompt at the bottom, and a key hint bar" width="1280" height="734" loading="lazy">
  <figcaption>Connected to irc.austn.net over TLS as a guest. The hint bar always shows what the keys do.</figcaption>
</figure>

## How it's put together

<figure class="figure">
  <div class="diagram" role="img" aria-label="The IRC server talks to irc-framework, which is wrapped in an IrcService that turns its loose events into one typed event union. App state reduces those events into channel buffers and member lists. Ink renders the state as the three-pane UI, and commands typed at the prompt go back through the service.">
    <svg viewBox="0 0 680 120" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="ch-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="30" width="110" height="44" rx="6"/><text x="65" y="50" text-anchor="middle">irc.austn.net</text><text class="label" x="65" y="65" text-anchor="middle">Ergo, TLS, SASL</text>
      <rect class="box box--accent" x="160" y="30" width="120" height="44" rx="6"/><text x="220" y="50" text-anchor="middle">IrcService</text><text class="label" x="220" y="65" text-anchor="middle">one typed event union</text>
      <rect class="box" x="320" y="30" width="110" height="44" rx="6"/><text x="375" y="50" text-anchor="middle">App state</text><text class="label" x="375" y="65" text-anchor="middle">buffers, members</text>
      <rect class="box" x="470" y="30" width="90" height="44" rx="6"/><text x="515" y="50" text-anchor="middle">Ink UI</text><text class="label" x="515" y="65" text-anchor="middle">three panes</text>
      <rect class="box" x="590" y="30" width="80" height="44" rx="6"/><text x="630" y="57" text-anchor="middle">Terminal</text>
      <path class="edge" d="M120 52 H158" marker-end="url(#ch-arrow)"/>
      <path class="edge" d="M280 52 H318" marker-end="url(#ch-arrow)"/>
      <path class="edge" d="M430 52 H468" marker-end="url(#ch-arrow)"/>
      <path class="edge" d="M560 52 H588" marker-end="url(#ch-arrow)"/>
      <path class="edge" d="M630 74 V100 H220 V76" marker-end="url(#ch-arrow)"/>
      <text class="label" x="425" y="112" text-anchor="middle">/commands and messages go back the other way</text>
    </svg>
  </div>
  <figcaption>The protocol library never leaks past the service, so the state and the UI are tested without a network.</figcaption>
</figure>

- **The protocol stays behind one wall.** `irc-framework` handles parsing, capabilities and SASL, and a thin `IrcService` turns its events into a single typed union. Nothing else in the app sees the library.
- **The service owns membership.** IRC's quit and nick events don't say which channels they touched, so the client tracks who is in each channel itself and re-sorts the user list by prefix on every change.
- **Secrets stay in one file**, written with `600` permissions and ignored by git. Flags on the command line override it, but the password never goes on the command line.
- **The UI is tested headless** with `ink-testing-library`, plus a smoke test that runs the real binary in a pseudo-terminal.

I wrote the brief and ran the build as an agent, and kept a `DECISIONS.md` with every choice, the reason, and the alternative that lost. It's a good way to build a small tool: the decisions are the part worth reading later.
