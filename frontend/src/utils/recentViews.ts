export type RecentKind = "request" | "project";

export interface RecentItem {
  kind: RecentKind;
  id: string;
  title: string;
  subtitle?: string;
  to: string;
  viewedAt: number;
}

const KEY = "recent-views";
const MAX = 20;

export function getRecentViews(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Сүүлд харсан зүйлийг бүртгэнэ — давхардсаныг дээш нь зөөж, MAX хүртэл хадгална
export function recordRecentView(item: Omit<RecentItem, "viewedAt">): void {
  try {
    const next: RecentItem = { ...item, viewedAt: Date.now() };
    const rest = getRecentViews().filter(
      (r) => !(r.kind === item.kind && r.id === item.id),
    );
    const list = [next, ...rest].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage боломжгүй бол алдааг чимээгүй өнгөрүүлнэ
  }
}
