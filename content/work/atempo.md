---
title: aTempo
summary: A one-handed iOS rhythm game. Tap along to a beat, keep the tempo when the audio drops out, see how you did.
tier: more
tagline: "A rhythm game that tests your internal clock."
kind: project
order: 14
when: "2026"
role: Solo project
stack: [Swift 6, SwiftUI, AVAudioEngine, StoreKit]
screenshot: /work/thumbs/atempo.webp
screenshot_alt: "aTempo: home screen, the scoreboard, and stats"
---

aTempo is a small iPhone game about internal tempo. A run has three acts. You listen to a beat and tap along. Then the audio drops out and you keep tapping from your own clock. Then a scoreboard judges every tap: early, perfect, or late, and whether you were locked, rushed, or shaky.

<figure class="figure">
  <div class="phones">
    <img src="/work/atempo-1-home.webp" alt="aTempo home screen: a pulsing target ring, best score 927, 69% accuracy, a two day streak, and a One More button" width="480" height="1044" loading="lazy">
    <img src="/work/atempo-2-hold.webp" alt="The hold act: the screen goes almost black while you keep the tempo from memory" width="480" height="1044" loading="lazy">
    <img src="/work/atempo-3-result.webp" alt="Result screen: 757 out of 1000, rated Rushed, with a vertical strip showing each tap as early or late" width="480" height="1044" loading="lazy">
    <img src="/work/atempo-4-stats.webp" alt="Stats screen: score trend, best and average, accuracy, streaks, and match history" width="480" height="1044" loading="lazy">
  </div>
  <figcaption>Home, the hold act, the scoreboard, and stats. The dark screen in the middle is the game.</figcaption>
</figure>

## How it's built

- **Every run is deterministic.** A run is a seeded map of beats, so the same seed gives the same run on any phone. That makes runs reproducible and replayable, and it's the seam for a future replay-vs-replay 1v1.
- **Timing is counted in audio samples.** A tap is placed on the audio engine's sample clock at 48 kHz and compared to the beat grid there, not on the UI's frame clock, so a dropped frame doesn't become a late tap. That math has its own tests, because the number is the product.
- **No backend, no accounts.** All state is on the phone. The referral feature gifts a friend two weeks ad-free with a code they paste in, and it needs no server to do it.
- Swift 6 with strict concurrency, SwiftUI, and an Xcode project generated from a `project.yml` so the project file never has to be hand-merged.

Debug builds take an environment variable that jumps straight to any screen, which is how the screenshots above were taken.

## Status

It hasn't made it onto the App Store yet. The first submission was turned down over the in-app purchase, and that's the next thing to fix.
