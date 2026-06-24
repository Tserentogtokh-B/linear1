import { ReactNode } from "react";
import { RequestPriority, RequestStatus } from "../types";

/* ------------------------------------------------------------------
   UI icon set — uniform 24-grid stroke icons (Aurora style).
   Use <Icon name="inbox" /> instead of emoji for crisp rendering.
------------------------------------------------------------------- */
export type IconName =
  | "search"
  | "edit"
  | "inbox"
  | "target"
  | "box"
  | "grid"
  | "list"
  | "plus"
  | "chevron"
  | "logout"
  | "user-plus"
  | "settings"
  | "sun"
  | "moon";

const ICON_PATHS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.4 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.5Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  box: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.4" />
      <rect x="14" y="3" width="7" height="7" rx="1.4" />
      <rect x="3" y="14" width="7" height="7" rx="1.4" />
      <rect x="14" y="14" width="7" height="7" rx="1.4" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.2 6h.01M3.2 12h.01M3.2 18h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  "user-plus": (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="ic"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

export const STATUS_META: Record<
  RequestStatus,
  { label: string; order: number; cls: string }
> = {
  OPEN: { label: "Нээлттэй", order: 0, cls: "todo" },
  IN_PROGRESS: { label: "Хийгдэж буй", order: 1, cls: "in_progress" },
  RESOLVED: { label: "Шийдэгдсэн", order: 2, cls: "done" },
  REJECTED: { label: "Татгалзсан", order: 3, cls: "canceled" },
  CANCELED: { label: "Цуцалсан", order: 4, cls: "canceled" },
};

export const STATUS_ORDER: RequestStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "CANCELED",
];

export const PRIORITY_META: Record<RequestPriority, { label: string }> = {
  URGENT: { label: "Яаралтай" },
  HIGH: { label: "Өндөр" },
  MEDIUM: { label: "Дунд" },
  LOW: { label: "Бага" },
};

export function StatusIcon({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`status-ico ${STATUS_META[status].cls}`}
      title={STATUS_META[status].label}
    />
  );
}

export function PriorityIcon({ priority }: { priority: RequestPriority }) {
  if (priority === "URGENT") {
    return <span className="prio urgent" title="Яаралтай" />;
  }
  const lit = priority === "HIGH" ? 3 : priority === "MEDIUM" ? 2 : 1;
  return (
    <span className={`prio ${lit >= 1 ? "on" : ""}`} title={PRIORITY_META[priority].label}>
      <i className="b1" style={{ opacity: lit >= 1 ? 1 : 0.35 }} />
      <i className="b2" style={{ opacity: lit >= 2 ? 1 : 0.35 }} />
      <i className="b3" style={{ opacity: lit >= 3 ? 1 : 0.35 }} />
    </span>
  );
}

export function Avatar({ name }: { name: string | null | undefined }) {
  if (!name)
    return (
      <span className="avatar empty" title="Оноогоогүй">
        ?
      </span>
    );
  return (
    <span className="avatar" title={name}>
      {name[0].toUpperCase()}
    </span>
  );
}
