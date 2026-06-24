import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { ProjectRequest, RequestPriority, RequestStatus } from "../types";
import Topbar from "../components/Topbar";
import { PriorityIcon, StatusIcon } from "../components/Icons";
import "./style/MyIssues.css";

type Scope = "mine" | "all";
type StatusFilter = "active" | "resolved" | "all";

// Priority эрэмбэ — яаралтайгаас бага руу
const PRIORITY_RANK: Record<RequestPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const ACTIVE_STATUSES: RequestStatus[] = ["OPEN", "IN_PROGRESS"];

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [scope, setScope] = useState<Scope>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .requests({ mine: scope === "mine" })
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : "Алдаа"))
      .finally(() => setLoading(false));
  }, [scope]);

  const visible = useMemo(() => {
    const filtered = requests.filter((r) => {
      if (statusFilter === "active") return ACTIVE_STATUSES.includes(r.status);
      if (statusFilter === "resolved") return r.status === "RESOLVED";
      return true;
    });
    return filtered.sort(
      (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
    );
  }, [requests, statusFilter]);

  return (
    <>
      <Topbar crumbs={[{ label: "Миний хүсэлтүүд", icon: "◎" }]} />
      <div className="main-scroll">
        <div className="page my-issues-page">
          <div className="view-toolbar">
            <div className="seg">
              <button
                className={scope === "all" ? "active" : ""}
                onClick={() => setScope("all")}
              >
                Бүх хүсэлт
              </button>
              <button
                className={scope === "mine" ? "active" : ""}
                onClick={() => setScope("mine")}
              >
                Миний үүсгэсэн
              </button>
            </div>
            <div className="toolbar-spacer" />
            <div className="seg">
              <button
                className={statusFilter === "active" ? "active" : ""}
                onClick={() => setStatusFilter("active")}
              >
                Идэвхтэй
              </button>
              <button
                className={statusFilter === "resolved" ? "active" : ""}
                onClick={() => setStatusFilter("resolved")}
              >
                Шийдэгдсэн
              </button>
              <button
                className={statusFilter === "all" ? "active" : ""}
                onClick={() => setStatusFilter("all")}
              >
                Бүгд
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {loading && <p className="muted">Ачааллаж байна…</p>}
          {!loading && visible.length === 0 && (
            <p className="empty">Хүсэлт байхгүй.</p>
          )}

          <ul className="issue-rows" style={{ marginTop: 12 }}>
            {visible.map((r) => (
              <li
                key={r.id}
                className="issue-row"
                onClick={() =>
                  navigate(`/projects/${r.projectId}/requests/${r.id}`)
                }
              >
                <span className="ir-priority">
                  <PriorityIcon priority={r.priority} />
                </span>
                <span className="ir-status">
                  <StatusIcon status={r.status} />
                </span>
                <span className="ir-title">{r.title}</span>
                <span className="ir-meta">
                  {r.project && (
                    <span className="ir-project">{r.project.name}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
