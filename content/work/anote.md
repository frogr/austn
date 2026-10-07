---
title: aNote
summary: Voice-first notes for iPhone. Talk, and what comes back is already a note, titled and structured, linked to what you've said before. Nothing leaves the phone.
tier: more
tagline: "Talk and it writes the note. Nothing leaves the phone."
kind: project
order: 15
when: "2026"
role: Solo project
stack: [Swift 6, SwiftUI, GRDB, Speech, Foundation Models, NaturalLanguage]
screenshot: /work/thumbs/anote.webp
screenshot_alt: "aNote: the notes list, a note, and the related-notes strip"
---

Most note apps make you type, then tidy. aNote starts recording the moment the capture view appears (the tap is to stop), transcribes on the phone as you talk, and hands the raw ramble to Apple's on-device language model, which gives back a titled, lightly structured markdown note with tags. The transcript is always one tap away. Then it quietly finds the notes you've written before that connect to this one.

<figure class="figure">
  <div class="phones">
    <img src="/work/anote-1-talk.webp" alt="Onboarding: a microphone icon, the words Just talk, and a Start talking button" width="480" height="1044" loading="lazy">
    <img src="/work/anote-2-list.webp" alt="The notes list with two notes, On feeling behind and Walking to the train, each with its kind and tags, and a Talk button" width="480" height="1044" loading="lazy">
    <img src="/work/anote-3-note.webp" alt="A note titled Morning focus ritual with tags attention, focus and mornings, a two-sentence body, and a Connects to card listing related notes" width="480" height="1044" loading="lazy">
    <img src="/work/anote-4-related.webp" alt="A note titled Launch timeline with a Connects to card: four related notes, each with a one-line reason and a Keep this link button" width="480" height="1044" loading="lazy">
  </div>
  <figcaption>Onboarding, the list, a note, and the related strip. Sample notes, seeded in a debug build.</figcaption>
</figure>

## How a ramble becomes a note

<figure class="figure">
  <div class="diagram" role="img" aria-label="Talk goes through on-device speech recognition to a transcript, then through the on-device Foundation Models to a structured note. The note's summary is embedded with NaturalLanguage, compared by cosine similarity against past notes, and the closest ones appear in a Related strip. Everything is on the phone, no network.">
    <svg viewBox="0 0 680 190" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="an-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box" x="10" y="30" width="100" height="44" rx="6"/><text x="60" y="50" text-anchor="middle">Talk</text><text class="label" x="60" y="65" text-anchor="middle">live waveform</text>
      <rect class="box" x="150" y="30" width="120" height="44" rx="6"/><text x="210" y="50" text-anchor="middle">Transcript</text><text class="label" x="210" y="65" text-anchor="middle">Speech, on-device</text>
      <rect class="box box--accent" x="310" y="30" width="130" height="44" rx="6"/><text x="375" y="50" text-anchor="middle">Structured note</text><text class="label" x="375" y="65" text-anchor="middle">Foundation Models</text>
      <rect class="box" x="480" y="30" width="110" height="44" rx="6"/><text x="535" y="50" text-anchor="middle">Embedding</text><text class="label" x="535" y="65" text-anchor="middle">NaturalLanguage</text>
      <rect class="box" x="480" y="120" width="110" height="44" rx="6"/><text x="535" y="140" text-anchor="middle">Past notes</text><text class="label" x="535" y="155" text-anchor="middle">SQLite via GRDB</text>
      <rect class="box box--accent" x="310" y="120" width="130" height="44" rx="6"/><text x="375" y="140" text-anchor="middle">Related strip</text><text class="label" x="375" y="155" text-anchor="middle">with a one-line why</text>
      <path class="edge" d="M110 52 H148" marker-end="url(#an-arrow)"/>
      <path class="edge" d="M270 52 H308" marker-end="url(#an-arrow)"/>
      <path class="edge" d="M440 52 H478" marker-end="url(#an-arrow)"/>
      <path class="edge" d="M535 74 V118" marker-end="url(#an-arrow)"/>
      <path class="edge" d="M480 142 H442" marker-end="url(#an-arrow)"/>
      <text class="label" x="640" y="100" text-anchor="middle">no network</text>
    </svg>
  </div>
  <figcaption>Every box runs on the phone. Related notes are found by cosine similarity over sentence embeddings.</figcaption>
</figure>

- **Capture is optimistic.** Recording starts when the view appears. Stopping is the only tap.
- **The note is typed output, not prose.** The on-device model is asked for a title, a structure keyed to the kind of note (a list, a meeting, a thought), and tags. Prompts and the structurer have their own tests.
- **Related notes are earned.** Each note's summary is embedded with Apple's NaturalLanguage framework and compared to every past note. The closest ones show up in a "Related" strip with a one-sentence reason, and one tap makes the link permanent.
- **It knows your calendar.** A note can attach to the meeting it came from through EventKit.
- Siri and Shortcuts through App Intents, a quick-capture widget, and a Live Activity while recording.

## Status

Swift 6, SwiftUI, GRDB over SQLite, with 13 test files including live tests against the on-device model and the embedding pipeline. It hasn't been submitted to the App Store yet.
