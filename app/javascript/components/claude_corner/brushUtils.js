/**
 * Brush utilities for Claude Corner drawings.
 * These create organic, hand-painted marks on a canvas.
 * Never modify these — they are battle-tested.
 */

export function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function brushStroke(ctx, x1, y1, x2, y2, opts = {}) {
  const {
    color = "#E8734A",
    width = 4,
    opacity = 0.6,
    roughness = 0.5,
    seed = 42,
  } = opts;

  const rand = seededRandom(seed);
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const steps = Math.max(Math.floor(dist / 2), 8);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const perpX = Math.cos(angle + Math.PI / 2);
  const perpY = Math.sin(angle + Math.PI / 2);

  for (let pass = 0; pass < 3; pass++) {
    ctx.globalAlpha = opacity * (0.3 + pass * 0.25);
    ctx.strokeStyle = color;
    ctx.lineWidth = width * (1.2 - pass * 0.3);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pressure = 1 - Math.abs(t - 0.5) * 1.2;
      const wobble = roughness * width * (rand() - 0.5) * pressure;
      const px = x1 + (x2 - x1) * t + perpX * wobble + (rand() - 0.5) * roughness * 2;
      const py = y1 + (y2 - y1) * t + perpY * wobble + (rand() - 0.5) * roughness * 2;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function paintWash(ctx, cx, cy, radius, opts = {}) {
  const {
    color = "#E8734A",
    opacity = 0.08,
    layers = 6,
    seed = 77,
  } = opts;

  const rand = seededRandom(seed);
  for (let l = 0; l < layers; l++) {
    const r = radius * (0.4 + (l / layers) * 0.7);
    const ox = (rand() - 0.5) * radius * 0.3;
    const oy = (rand() - 0.5) * radius * 0.3;
    ctx.globalAlpha = opacity * (1 - l / layers * 0.5);
    ctx.fillStyle = color;
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const wobble = r * (0.8 + rand() * 0.4);
      const px = cx + ox + Math.cos(a) * wobble;
      const py = cy + oy + Math.sin(a) * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else {
        const cpA = ((i - 0.5) / points) * Math.PI * 2;
        const cpR = r * (0.8 + rand() * 0.4);
        ctx.quadraticCurveTo(
          cx + ox + Math.cos(cpA) * cpR,
          cy + oy + Math.sin(cpA) * cpR,
          px, py
        );
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function hatchFill(ctx, x, y, w, h, opts = {}) {
  const {
    color = "#2a2018",
    opacity = 0.15,
    density = 12,
    angle = -0.3,
    seed = 123,
  } = opts;

  const rand = seededRandom(seed);
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";

  for (let i = 0; i < density; i++) {
    const t = i / density;
    const sx = x + rand() * w;
    const sy = y + t * h + (rand() - 0.5) * 10;
    const len = 20 + rand() * 40;
    ctx.lineWidth = 0.5 + rand() * 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function looseCurve(ctx, points, opts = {}) {
  const {
    color = "#E8734A",
    width = 3,
    opacity = 0.5,
    roughness = 1,
    seed = 99,
  } = opts;

  const rand = seededRandom(seed);

  for (let pass = 0; pass < 2; pass++) {
    ctx.globalAlpha = opacity * (pass === 0 ? 0.4 : 0.7);
    ctx.strokeStyle = color;
    ctx.lineWidth = width * (pass === 0 ? 1.4 : 0.8);
    ctx.lineCap = "round";
    ctx.beginPath();

    points.forEach((p, i) => {
      const jx = (rand() - 0.5) * roughness * 3;
      const jy = (rand() - 0.5) * roughness * 3;
      if (i === 0) ctx.moveTo(p[0] + jx, p[1] + jy);
      else {
        const prev = points[i - 1];
        const cpx = (prev[0] + p[0]) / 2 + jx * 2;
        const cpy = (prev[1] + p[1]) / 2 + jy * 2;
        ctx.quadraticCurveTo(cpx, cpy, p[0] + jx, p[1] + jy);
      }
    });
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
