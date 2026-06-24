// Багийн id/key-ээс тогтвортой өнгө гаргана (sidebar avatar, dots).
const PALETTE = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#ef4444", // red
  "#22c55e", // green
  "#0ea5e9", // sky
  "#a855f7", // purple
  "#f97316", // orange
];

export function teamColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
