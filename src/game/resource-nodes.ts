/**
 * Resource node sprites (ore, trees, mushrooms, fishing spots).
 *
 * Nodes are drawn dynamically every frame (NOT baked into the world cache) so
 * that a harvested node can vanish and later respawn. Each node kind has its
 * own sprite; `id` seeds small per-node variations (ore tint, mushroom colors).
 */

export type NodeKind = "ore" | "tree" | "shroom" | "fish";

export type NodeDrawOpts = {
  /** Animation clock in seconds. */
  t: number;
  /** 0..1 spawn-in progress. 0 = hidden (depleted), 1 = fully grown. */
  appear: number;
  /** True while the player is gathering from this node (shakes it). */
  working?: boolean;
  /** True when the player is close enough to gather (draws a prompt ring). */
  near?: boolean;
};

/** Seconds a node stays depleted before it respawns. */
export const NODE_RESPAWN_SECONDS = 14;
export const NODE_RESPAWN_SECONDS_HARDCORE = 7;

/** Verb shown above a node when the player is close. */
export const NODE_VERB: Record<NodeKind, string> = {
  ore: "Mine",
  tree: "Chop",
  shroom: "Pick",
  fish: "Fish",
};

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shadow(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  g.fillStyle = "rgba(0,0,0,0.3)";
  g.beginPath();
  g.ellipse(x, y + 2, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function sparkle(g: CanvasRenderingContext2D, x: number, y: number, t: number, phase: number, color: string): void {
  const a = 0.5 + 0.5 * Math.sin(t * 3 + phase);
  if (a < 0.35) return;
  g.globalAlpha = a;
  g.fillStyle = color;
  g.fillRect(x - 1, y - 3, 2, 6);
  g.fillRect(x - 3, y - 1, 6, 2);
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- ORE */

const ORE_VEINS = [
  { vein: "#e08a4a", glint: "#ffd2a0" }, // copper
  { vein: "#8fb8d8", glint: "#e4f4ff" }, // iron / silver
  { vein: "#7ee0c0", glint: "#d8fff0" }, // teal crystal
];

function drawOre(g: CanvasRenderingContext2D, id: string, t: number): void {
  const v = ORE_VEINS[hash(id) % ORE_VEINS.length]!;
  shadow(g, 0, 0, 26, 8);
  // rock mass
  g.fillStyle = "#3a3436";
  g.beginPath();
  g.moveTo(-24, 2);
  g.lineTo(-20, -16);
  g.lineTo(-8, -26);
  g.lineTo(8, -24);
  g.lineTo(20, -14);
  g.lineTo(25, 2);
  g.closePath();
  g.fill();
  // lit face
  g.fillStyle = "#58504f";
  g.beginPath();
  g.moveTo(-20, -16);
  g.lineTo(-8, -26);
  g.lineTo(8, -24);
  g.lineTo(2, -10);
  g.lineTo(-12, -6);
  g.closePath();
  g.fill();
  // dark underside
  g.fillStyle = "#262122";
  g.fillRect(-24, -2, 49, 4);
  // small side rock
  g.fillStyle = "#4a4244";
  g.beginPath();
  g.moveTo(14, 2);
  g.lineTo(18, -8);
  g.lineTo(30, -4);
  g.lineTo(32, 2);
  g.closePath();
  g.fill();
  // ore veins
  g.fillStyle = v.vein;
  g.fillRect(-12, -18, 6, 5);
  g.fillRect(-6, -13, 5, 5);
  g.fillRect(6, -19, 6, 6);
  g.fillRect(10, -9, 5, 5);
  g.fillRect(-16, -7, 4, 4);
  g.fillStyle = v.glint;
  g.fillRect(-11, -17, 2, 2);
  g.fillRect(7, -18, 2, 2);
  g.fillRect(11, -8, 2, 2);
  sparkle(g, -9, -22, t, 0, v.glint);
  sparkle(g, 12, -16, t, 2.1, v.glint);
}

/* --------------------------------------------------------------- TREE */

function drawTree(g: CanvasRenderingContext2D, _id: string, t: number): void {
  shadow(g, 0, 0, 30, 9);
  // trunk
  g.fillStyle = "#2a180e";
  g.fillRect(-8, -34, 16, 38);
  g.fillStyle = "#5a3820";
  g.fillRect(-8, -34, 6, 38);
  // root flare
  g.fillStyle = "#2a180e";
  g.fillRect(-12, -2, 6, 6);
  g.fillRect(6, -2, 6, 6);
  // chop scar (shows it is harvestable)
  g.fillStyle = "#e8d2a0";
  g.fillRect(-2, -20, 6, 3);
  g.fillRect(-2, -14, 6, 3);
  // canopy
  g.fillStyle = "#1c3e22";
  g.beginPath();
  g.arc(0, -52, 30, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2b6a32";
  for (const [cx, cy, r] of [[-16, -60, 18], [16, -56, 17], [0, -72, 17]] as const) {
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
  }
  // highlights
  g.fillStyle = "#8fd06a";
  g.fillRect(-4, -84, 5, 6);
  g.fillRect(14, -66, 4, 5);
  g.fillRect(-20, -66, 4, 5);
  // hanging fruit / lanterns so node trees read differently from scenery
  g.fillStyle = "#e6c15a";
  g.fillRect(-14, -44, 4, 4);
  g.fillRect(10, -42, 4, 4);
  sparkle(g, 0, -64, t, 1.3, "#fff6c8");
}

/* ------------------------------------------------------------- SHROOM */

const SHROOM_CAPS = [
  { cap: "#9b6bd6", spot: "#e8d8ff", glow: "#c9a6ff" }, // dreamspore
  { cap: "#e0643a", spot: "#ffe0b0", glow: "#ffb070" }, // embercap
  { cap: "#4a9ae0", spot: "#d8f0ff", glow: "#9ad8ff" }, // blue lantern
];

function mushroom(g: CanvasRenderingContext2D, x: number, y: number, s: number, c: (typeof SHROOM_CAPS)[number]): void {
  // stem
  g.fillStyle = "#e8dcc0";
  g.fillRect(x - 2 * s, y - 8 * s, 4 * s, 9 * s);
  g.fillStyle = "#b8a888";
  g.fillRect(x + 1 * s, y - 8 * s, 1.5 * s, 9 * s);
  // cap
  g.fillStyle = c.cap;
  g.beginPath();
  g.ellipse(x, y - 9 * s, 8 * s, 6 * s, 0, Math.PI, 0);
  g.closePath();
  g.fill();
  g.fillStyle = "rgba(0,0,0,0.22)";
  g.fillRect(x - 8 * s, y - 9.5 * s, 16 * s, 1.5 * s);
  // spots
  g.fillStyle = c.spot;
  g.fillRect(x - 4 * s, y - 13 * s, 2 * s, 2 * s);
  g.fillRect(x + 2 * s, y - 12 * s, 2 * s, 2 * s);
  g.fillRect(x - 1 * s, y - 15 * s, 2 * s, 2 * s);
}

function drawShroom(g: CanvasRenderingContext2D, id: string, t: number): void {
  const h = hash(id);
  const a = SHROOM_CAPS[h % SHROOM_CAPS.length]!;
  const b = SHROOM_CAPS[(h + 1) % SHROOM_CAPS.length]!;
  const c = SHROOM_CAPS[(h + 2) % SHROOM_CAPS.length]!;
  shadow(g, 0, 0, 22, 6);
  // mossy patch
  g.fillStyle = "#24401f";
  g.beginPath();
  g.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#35582b";
  g.beginPath();
  g.ellipse(-3, -1, 14, 4, 0, 0, Math.PI * 2);
  g.fill();
  // soft glow
  const pulse = 0.5 + 0.2 * Math.sin(t * 2 + h);
  const glow = g.createRadialGradient(0, -10, 2, 0, -10, 26);
  glow.addColorStop(0, a.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  const prev = g.globalAlpha;
  g.globalAlpha = prev * pulse * 0.55;
  g.fillStyle = glow;
  g.beginPath();
  g.arc(0, -10, 26, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = prev;
  mushroom(g, -12, 0, 0.9, b);
  mushroom(g, 11, 1, 0.85, c);
  mushroom(g, 0, 2, 1.25, a);
  // spore motes
  sparkle(g, -6, -26, t, 0.4, a.glow);
  sparkle(g, 10, -22, t, 1.9, b.glow);
}

/* --------------------------------------------------------------- FISH */

function drawFish(g: CanvasRenderingContext2D, _id: string, t: number): void {
  // pond
  g.fillStyle = "#16384e";
  g.beginPath();
  g.ellipse(0, -2, 30, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2a78b0";
  g.beginPath();
  g.ellipse(0, -3, 26, 9, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#4aa0d8";
  g.beginPath();
  g.ellipse(-4, -4, 16, 5, 0, 0, Math.PI * 2);
  g.fill();
  // shoreline
  g.strokeStyle = "#d9c6a4";
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(0, -2, 30, 12, 0, 0, Math.PI * 2);
  g.stroke();
  // ripples
  for (let i = 0; i < 2; i++) {
    const k = (t * 0.7 + i * 0.5) % 1;
    g.globalAlpha = 0.7 * (1 - k);
    g.strokeStyle = "#e8f6ff";
    g.lineWidth = 1.5;
    g.beginPath();
    g.ellipse(6, -4, 4 + k * 16, 2 + k * 6, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.globalAlpha = 1;
  // jumping fish
  const jump = (t * 0.55) % 1;
  if (jump < 0.35) {
    const p = jump / 0.35;
    const fy = -4 - Math.sin(p * Math.PI) * 18;
    const fx = -8 + p * 14;
    g.save();
    g.translate(fx, fy);
    g.rotate((p - 0.5) * 1.6);
    g.fillStyle = "#c8d8e8";
    g.beginPath();
    g.ellipse(0, 0, 6, 2.6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#e07050";
    g.beginPath();
    g.moveTo(-5, 0);
    g.lineTo(-10, -3);
    g.lineTo(-10, 3);
    g.closePath();
    g.fill();
    g.restore();
  }
  // reeds
  g.fillStyle = "#3c6a30";
  g.fillRect(-32, -16, 2, 14);
  g.fillRect(-28, -20, 2, 18);
  g.fillRect(29, -14, 2, 12);
  g.fillStyle = "#6a4a2a";
  g.fillRect(-28, -22, 2, 4);
}

/* ---------------------------------------------------------------- API */

/**
 * Draw one resource node with its ground anchor at (x, y).
 * Does nothing while the node is depleted (appear <= 0) so it vanishes.
 */
export function drawResourceNode(
  g: CanvasRenderingContext2D,
  kind: NodeKind,
  id: string,
  x: number,
  y: number,
  o: NodeDrawOpts,
): void {
  if (o.appear <= 0.01) return;
  const grow = Math.min(1, o.appear);
  const ease = 1 - Math.pow(1 - grow, 3);
  g.save();
  g.translate(x, y);
  if (o.working) g.translate(Math.sin(o.t * 50) * 1.5, 0);
  g.globalAlpha = Math.min(1, ease * 1.4);
  g.scale(0.55 + 0.45 * ease, 0.4 + 0.6 * ease);
  switch (kind) {
    case "ore":
      drawOre(g, id, o.t);
      break;
    case "tree":
      drawTree(g, id, o.t);
      break;
    case "shroom":
      drawShroom(g, id, o.t);
      break;
    case "fish":
      drawFish(g, id, o.t);
      break;
  }
  g.restore();
  g.globalAlpha = 1;

  if (o.near && grow >= 1) {
    const bob = Math.sin(o.t * 4) * 1.5;
    g.save();
    g.font = "12px VT323, monospace";
    g.textAlign = "center";
    const label = NODE_VERB[kind];
    const ly = y - (kind === "tree" ? 104 : kind === "fish" ? 34 : 46) + bob;
    g.fillStyle = "#140e0c";
    g.fillText(label, x + 1, ly + 1);
    g.fillStyle = "#8fd06a";
    g.fillText(label, x, ly);
    g.restore();
  }
}
