import { ProjectStatus } from "../types";
type ViewKey = "all" | ProjectStatus;

export const PROJECT_STATUSES: ProjectStatus[] = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELED",
];

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; icon: string; className: string }
> = {
  ACTIVE: { label: "Идэвхтэй", icon: "▶", className: "status-started" },
  PAUSED: { label: "Түр зогссон", icon: "Ⅱ", className: "status-paused" },
  COMPLETED: { label: "Дууссан", icon: "✓", className: "status-done" },
  CANCELED: { label: "Цуцалсан", icon: "×", className: "status-canceled" },
};

export const VIEW_OPTIONS: { key: ViewKey; label: string }[] = [
  { key: "all", label: "Бүгд" },
  ...PROJECT_STATUSES.map((status) => ({
    key: status,
    label: STATUS_META[status].label,
  })),
];
