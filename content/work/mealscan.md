---
title: MealScan
summary: Photo-first food logging for iPhone. Snap a plate, get macros, and the pantry, recipes and shopping list update from there. All on-device.
tier: more
tagline: "Photograph a plate and it's logged with macros, on the phone."
kind: project
order: 16
when: "2026"
role: Solo project
stack: [Swift 6, SwiftUI, SwiftData, Foundation Models, MobileCLIP, Vision]
screenshot: /work/thumbs/mealscan.webp
screenshot_alt: "MealScan: the journal, a fridge scan, and dinner ideas"
---

MealScan is a kitchen app built around one loop. You photograph a meal and it's logged with macros in about a fifth of a second. Logging it depletes the pantry. The pantry drives the shopping list and ranks your recipes by what you can make right now. A photo of the fridge turns into three dinner ideas. Everything runs on the phone, and nothing leaves it except a barcode lookup.

<figure class="figure">
  <div class="phones">
    <img src="/work/mealscan-1-journal.webp" alt="Journal: a photographed plate logged as broccoli, squash and cauliflower, 105 kcal, with protein, carbs and fat" width="480" height="1044" loading="lazy">
    <img src="/work/mealscan-2-pantry.webp" alt="Pantry: fridge items with grams on hand and days until they expire" width="480" height="1044" loading="lazy">
    <img src="/work/mealscan-3-fridge.webp" alt="Scan the fridge: spaghetti squash and lemon recognised with confidence scores, and a button to add them to the pantry" width="480" height="1044" loading="lazy">
    <img src="/work/mealscan-4-ideas.webp" alt="Make tonight: three ranked dinner ideas, each listing what you have and what you'd need" width="480" height="1044" loading="lazy">
  </div>
  <figcaption>A logged plate, the pantry, a fridge scan, and the dinner ideas Apple's on-device model wrote from it.</figcaption>
</figure>

## The loop

<figure class="figure">
  <div class="diagram" role="img" aria-label="Snap a meal, it is logged with macros, the pantry depletes, the shopping list updates. In the other direction, a fridge photo updates the pantry, which produces make-tonight ideas, which you cook as a recipe, which loops back to logging.">
    <svg viewBox="0 0 680 170" width="680" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="ms-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs>
      <rect class="box box--accent" x="10" y="20" width="130" height="44" rx="6"/><text x="75" y="40" text-anchor="middle">Snap a meal</text><text class="label" x="75" y="55" text-anchor="middle">logged in ~0.2 s</text>
      <rect class="box" x="190" y="20" width="130" height="44" rx="6"/><text x="255" y="40" text-anchor="middle">Macros</text><text class="label" x="255" y="55" text-anchor="middle">USDA, 12,866 foods</text>
      <rect class="box" x="370" y="20" width="130" height="44" rx="6"/><text x="435" y="40" text-anchor="middle">Pantry depletes</text><text class="label" x="435" y="55" text-anchor="middle">soonest expiry first</text>
      <rect class="box" x="550" y="20" width="120" height="44" rx="6"/><text x="610" y="40" text-anchor="middle">Shopping list</text><text class="label" x="610" y="55" text-anchor="middle">needs minus on hand</text>
      <rect class="box" x="550" y="106" width="120" height="44" rx="6"/><text x="610" y="126" text-anchor="middle">Fridge photo</text><text class="label" x="610" y="141" text-anchor="middle">pantry upsert</text>
      <rect class="box" x="370" y="106" width="130" height="44" rx="6"/><text x="435" y="126" text-anchor="middle">Make tonight</text><text class="label" x="435" y="141" text-anchor="middle">on-device model</text>
      <rect class="box" x="190" y="106" width="130" height="44" rx="6"/><text x="255" y="126" text-anchor="middle">Cook a recipe</text><text class="label" x="255" y="141" text-anchor="middle">ranked by coverage</text>
      <path class="edge" d="M140 42 H188" marker-end="url(#ms-arrow)"/>
      <path class="edge" d="M320 42 H368" marker-end="url(#ms-arrow)"/>
      <path class="edge" d="M500 42 H548" marker-end="url(#ms-arrow)"/>
      <path class="edge" d="M610 64 V104" marker-end="url(#ms-arrow)"/>
      <path class="edge" d="M550 128 H502" marker-end="url(#ms-arrow)"/>
      <path class="edge" d="M370 128 H322" marker-end="url(#ms-arrow)"/>
      <path class="edge" d="M190 128 H75 V66" marker-end="url(#ms-arrow)"/>
    </svg>
  </div>
  <figcaption>One shared food catalog underneath. Each step feeds the next.</figcaption>
</figure>

## How the photo becomes a log entry

1. A bundled MobileCLIP model recognises the dish zero-shot against a vocabulary of about 1,450 dishes. It runs the same on the simulator and the device.
2. Vision sweeps regions of the photo and reads any packaging text.
3. Apple's Foundation Models framework breaks the plate into components with a typed `@Generable` result, so the output is a struct, not prose to parse.
4. Each component maps onto a bundled snapshot of USDA FoodData Central: 12,866 foods with household portion weights, so "one egg" has grams behind it.
5. The entry is written optimistically and refined in place as the steps finish.

The barcode scanner is the one feature that touches the network. It resolves a UPC against Open Food Facts and caches the answer on the phone for good.

## Status

iOS 26 only, since it leans on Foundation Models. 73 tests, including probes that prove the on-device model pipeline works in the simulator. It hasn't been submitted to the App Store yet.
