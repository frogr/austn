import { brushStroke, paintWash, hatchFill, looseCurve, seededRandom } from '../brushUtils';

export const metadata = {
  id: "night-cartography",
  title: "Night Cartography",
  description: "A hand-drawn star chart. I wanted to paint the sky the way old cartographers drew coastlines — with confidence and imprecision.",
  tags: ["constellations", "canvas-api", "cartography"],
  mood: "quiet",
  created_at: "2026-02-22T21:00:00Z",
};

export function buildSteps(W, H) {
  // Pre-compute all star positions and constellation connections
  const rand0 = seededRandom(500);

  // Generate star field — mix of bright and faint
  const stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: rand0() * W,
      y: rand0() * H,
      r: 2 + rand0() * 6,
      bright: rand0() > 0.7,
      opacity: 0.03 + rand0() * 0.07,
    });
  }

  // A made-up constellation — 7 main stars connected by lines
  const constellation = [
    [W * 0.28, H * 0.22],
    [W * 0.35, H * 0.35],
    [W * 0.42, H * 0.30],
    [W * 0.50, H * 0.42],
    [W * 0.58, H * 0.35],
    [W * 0.63, H * 0.50],
    [W * 0.55, H * 0.58],
  ];

  // A second smaller constellation — lower left
  const constellation2 = [
    [W * 0.12, H * 0.65],
    [W * 0.18, H * 0.72],
    [W * 0.25, H * 0.68],
    [W * 0.22, H * 0.78],
  ];

  // A third — upper right, just three stars
  const constellation3 = [
    [W * 0.75, H * 0.15],
    [W * 0.82, H * 0.22],
    [W * 0.78, H * 0.30],
  ];

  // Pre-compute nebula positions
  const nebula1 = { x: W * 0.40, y: H * 0.38, r: W * 0.22 };
  const nebula2 = { x: W * 0.15, y: H * 0.70, r: W * 0.12 };
  const nebula3 = { x: W * 0.78, y: H * 0.22, r: W * 0.10 };

  // Pre-compute background scatter values
  const bgRand = seededRandom(600);
  const bgScatter = Array.from({ length: 18 }, () => ({
    x: bgRand() * W,
    y: bgRand() * H,
    r: 15 + bgRand() * 30,
    op: 0.02 + bgRand() * 0.03,
  }));

  // Pre-compute hatch params
  const hatchRand = seededRandom(700);
  const hatchParams = Array.from({ length: 4 }, () => ({
    x: hatchRand() * W * 0.6,
    y: hatchRand() * H * 0.6,
    w: 80 + hatchRand() * 120,
    h: 60 + hatchRand() * 80,
    angle: -0.4 + hatchRand() * 0.8,
    density: 6 + Math.floor(hatchRand() * 8),
  }));

  // Pre-compute dust motes
  const dustRand = seededRandom(800);
  const dustMotes = Array.from({ length: 30 }, () => ({
    x1: dustRand() * W,
    y1: dustRand() * H,
    dx: (dustRand() - 0.5) * 8,
    dy: (dustRand() - 0.5) * 8,
    w: 0.5 + dustRand() * 1.0,
  }));

  return [
    // === ACT 1: The paper ===
    {
      delay: 200,
      thought: "Start with the dark. Not black — a warm almost-black, like the sky actually is when you look long enough.",
      minThought: 3000,
      fn: (ctx) => {
        // Base wash — very dark warm ground
        paintWash(ctx, W / 2, H / 2, W * 0.7, {
          color: '#18100a',
          opacity: 0.3,
          layers: 8,
          seed: 10,
        });
      },
    },

    // Paper texture — scattered dark hatching
    ...hatchParams.map((hp, i) => ({
      delay: 80,
      fn: (ctx) => {
        hatchFill(ctx, hp.x, hp.y, hp.w, hp.h, {
          color: '#110c06',
          opacity: 0.08,
          density: hp.density,
          angle: hp.angle,
          seed: 710 + i * 7,
        });
      },
    })),

    // === ACT 2: Nebula clouds ===
    {
      delay: 300,
      thought: "Nebulae first. They're behind everything, the oldest light.",
      minThought: 2500,
      fn: (ctx) => {
        // Main nebula — warm orange glow around the primary constellation
        paintWash(ctx, nebula1.x, nebula1.y, nebula1.r, {
          color: '#E8734A',
          opacity: 0.025,
          layers: 10,
          seed: 20,
        });
      },
    },
    {
      delay: 200,
      fn: (ctx) => {
        paintWash(ctx, nebula1.x - 20, nebula1.y + 15, nebula1.r * 0.7, {
          color: '#f0a070',
          opacity: 0.018,
          layers: 8,
          seed: 25,
        });
      },
    },
    {
      delay: 200,
      fn: (ctx) => {
        // Secondary nebula — lower left, cooler
        paintWash(ctx, nebula2.x, nebula2.y, nebula2.r, {
          color: '#b8a898',
          opacity: 0.02,
          layers: 6,
          seed: 30,
        });
      },
    },
    {
      delay: 150,
      fn: (ctx) => {
        // Third nebula — upper right
        paintWash(ctx, nebula3.x, nebula3.y, nebula3.r, {
          color: '#f5c4a0',
          opacity: 0.02,
          layers: 5,
          seed: 35,
        });
      },
    },

    // === ACT 3: Background star scatter ===
    {
      delay: 250,
      thought: "Scatter the faint ones. Most stars are just noise — that's what makes the named ones matter.",
      minThought: 3000,
      fn: () => {},
    },
    ...bgScatter.map((s, i) => ({
      delay: 40,
      fn: (ctx) => {
        paintWash(ctx, s.x, s.y, s.r, {
          color: '#f5efe6',
          opacity: s.op,
          layers: 3,
          seed: 100 + i * 3,
        });
      },
    })),

    // === ACT 4: Bright stars (the constellation anchors) ===
    {
      delay: 400,
      thought: "Now the anchor stars. Each one gets a tiny bloom — not a dot, a small burst of paint, the way a real star bleeds into your retina.",
      minThought: 3500,
      fn: () => {},
    },
    ...constellation.map((star, i) => ({
      delay: 120,
      fn: (ctx) => {
        // Outer glow
        paintWash(ctx, star[0], star[1], 12, {
          color: '#f5c4a0',
          opacity: 0.06,
          layers: 4,
          seed: 200 + i * 5,
        });
        // Inner bright core
        paintWash(ctx, star[0], star[1], 5, {
          color: '#ffe0c0',
          opacity: 0.15,
          layers: 3,
          seed: 205 + i * 5,
        });
      },
    })),

    // Second constellation stars
    ...constellation2.map((star, i) => ({
      delay: 100,
      fn: (ctx) => {
        paintWash(ctx, star[0], star[1], 9, {
          color: '#f5c4a0',
          opacity: 0.05,
          layers: 3,
          seed: 250 + i * 5,
        });
        paintWash(ctx, star[0], star[1], 4, {
          color: '#ffe0c0',
          opacity: 0.12,
          layers: 3,
          seed: 253 + i * 5,
        });
      },
    })),

    // Third constellation stars
    ...constellation3.map((star, i) => ({
      delay: 100,
      fn: (ctx) => {
        paintWash(ctx, star[0], star[1], 8, {
          color: '#f5c4a0',
          opacity: 0.05,
          layers: 3,
          seed: 280 + i * 5,
        });
        paintWash(ctx, star[0], star[1], 4, {
          color: '#ffe0c0',
          opacity: 0.13,
          layers: 3,
          seed: 283 + i * 5,
        });
      },
    })),

    // === ACT 5: Constellation lines ===
    {
      delay: 500,
      thought: "The lines are the invention. The stars don't know they're connected. We just decided they were, thousands of years ago, and kept the story going.",
      minThought: 4000,
      fn: () => {},
    },
    // Main constellation — connect the dots
    ...[
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [3, 6]
    ].map(([a, b], i) => ({
      delay: 180,
      fn: (ctx) => {
        brushStroke(ctx, constellation[a][0], constellation[a][1],
          constellation[b][0], constellation[b][1], {
            color: '#f5efe6',
            width: 1.2,
            opacity: 0.18,
            roughness: 0.8,
            seed: 300 + i * 7,
          });
      },
    })),

    // Second constellation lines
    ...[
      [0, 1], [1, 2], [2, 3]
    ].map(([a, b], i) => ({
      delay: 150,
      fn: (ctx) => {
        brushStroke(ctx, constellation2[a][0], constellation2[a][1],
          constellation2[b][0], constellation2[b][1], {
            color: '#f5efe6',
            width: 1.0,
            opacity: 0.14,
            roughness: 0.9,
            seed: 340 + i * 7,
          });
      },
    })),

    // Third constellation lines
    ...[
      [0, 1], [1, 2]
    ].map(([a, b], i) => ({
      delay: 150,
      fn: (ctx) => {
        brushStroke(ctx, constellation3[a][0], constellation3[a][1],
          constellation3[b][0], constellation3[b][1], {
            color: '#f5efe6',
            width: 1.0,
            opacity: 0.14,
            roughness: 0.9,
            seed: 370 + i * 7,
          });
      },
    })),

    // === ACT 6: Label mark ===
    {
      delay: 400,
      thought: "Old star charts always have a little cartographer's mark. A small curve near the main figure, like an initial or a flourish.",
      minThought: 3000,
      fn: (ctx) => {
        // A small decorative curve near the main constellation — like a cartographer's annotation
        looseCurve(ctx, [
          [W * 0.62, H * 0.60],
          [W * 0.65, H * 0.63],
          [W * 0.70, H * 0.62],
          [W * 0.73, H * 0.64],
        ], {
          color: '#E8734A',
          width: 1.0,
          opacity: 0.2,
          roughness: 1.2,
          seed: 400,
        });
      },
    },

    // Another small flourish near the second constellation
    {
      delay: 200,
      fn: (ctx) => {
        looseCurve(ctx, [
          [W * 0.08, H * 0.82],
          [W * 0.12, H * 0.84],
          [W * 0.16, H * 0.83],
        ], {
          color: '#E8734A',
          width: 0.8,
          opacity: 0.15,
          roughness: 1.0,
          seed: 410,
        });
      },
    },

    // === ACT 7: Dust and atmosphere ===
    {
      delay: 300,
      thought: "Now dust. Little scratches of light, the kind you only see when you let your eyes relax.",
      minThought: 2800,
      fn: () => {},
    },
    ...dustMotes.map((d, i) => ({
      delay: 25,
      fn: (ctx) => {
        brushStroke(ctx, d.x1, d.y1, d.x1 + d.dx, d.y1 + d.dy, {
          color: '#f5efe6',
          width: d.w,
          opacity: 0.04,
          roughness: 0.3,
          seed: 450 + i * 3,
        });
      },
    })),

    // === ACT 8: Final atmospheric wash ===
    {
      delay: 300,
      thought: "One more wash over everything. Atmosphere. The air between us and the light.",
      minThought: 2500,
      fn: (ctx) => {
        paintWash(ctx, W * 0.45, H * 0.35, W * 0.35, {
          color: '#E8734A',
          opacity: 0.012,
          layers: 6,
          seed: 550,
        });
      },
    },
    {
      delay: 200,
      fn: (ctx) => {
        paintWash(ctx, W * 0.55, H * 0.55, W * 0.25, {
          color: '#f5c4a0',
          opacity: 0.01,
          layers: 5,
          seed: 560,
        });
      },
    },

    // === ACT 9: Edge hatching ===
    {
      delay: 250,
      thought: "Rough up the edges. Real charts have margins that show the hand that drew them.",
      minThought: 2500,
      fn: (ctx) => {
        hatchFill(ctx, 0, 0, W * 0.15, H, {
          color: '#3d2e20',
          opacity: 0.06,
          density: 10,
          angle: -0.2,
          seed: 580,
        });
        hatchFill(ctx, W * 0.85, 0, W * 0.15, H, {
          color: '#3d2e20',
          opacity: 0.06,
          density: 10,
          angle: 0.2,
          seed: 590,
        });
      },
    },

    // === ACT 10: The very last marks ===
    {
      delay: 400,
      thought: "I like how the constellations feel invented rather than discovered. That's the honest version of what they are.",
      minThought: 3500,
      fn: (ctx) => {
        // A couple of final bright star accents — tiny concentrated washes
        paintWash(ctx, constellation[3][0], constellation[3][1], 3, {
          color: '#ffe0c0',
          opacity: 0.2,
          layers: 2,
          seed: 600,
        });
        paintWash(ctx, constellation[0][0], constellation[0][1], 3, {
          color: '#ffe0c0',
          opacity: 0.18,
          layers: 2,
          seed: 605,
        });
      },
    },
  ];
}
