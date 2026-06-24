import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { ProjectDetail, ProjectHistory } from "../types";
import { useWorkspace } from "../components/Layout";
import RequestForm from "../components/RequestForm";
import Topbar from "../components/Topbar";
import { PriorityIcon, StatusIcon, STATUS_META, STATUS_ORDER } from "../components/Icons";
import { STATUS_META as PROJECT_STATUS_META } from "../constants/ConstCreateProject";
import { timeAgo } from "../utils/format";
import "./style/TeamBoard.css";

export default function ProjectBoard() {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const { refreshUnread } = useWorkspace();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [history, setHistory] = useState<ProjectHistory[]>([]);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setError("");
    try {
      const [proj, hist] = await Promise.all([
        api.project(projectId),
        api.history(projectId),
      ]);
      setProject(proj);
      setHistory(hist);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  function afterCreate() {
    load();
    refreshUnread();
  }

  if (!project) {
    return (
      <>
        <Topbar crumbs={[{ label: "Төсөл" }]} />
        <div className="main-scroll">
          <div className="page team-board-page">
            {error ? (
              <div className="error">{error}</div>
            ) : (
              <p className="muted">Ачааллаж байна…</p>
            )}
          </div>
        </div>
      </>
    );
  }

  const pMeta = PROJECT_STATUS_META[project.status];
  const requests = project.requests ?? [];

  return (
    <>
      <Topbar
        crumbs={[
          { label: project.workspace?.name ?? "Workspace", to: `/workspaces/${workspaceId}` },
          { label: project.name },
        ]}
        actions={
          <button className="btn-primary" onClick={() => setComposeOpen(true)}>
            + Шинэ хүсэлт
          </button>
        }
      />

      <div className="main-scroll">
        <div className="page">
          <div className="page-head">
            <div className="page-title">
              <h1>{project.name}</h1>
              <span className={`status-badge ${pMeta.className}`}>
                {pMeta.icon} {pMeta.label}
              </span>
            </div>
          </div>
          {project.description && (
            <p className="muted" style={{ marginTop: -8 }}>
              {project.description}
            </p>
          )}

          {error && <div className="error">{error}</div>}

          {requests.length === 0 && (
            <p className="empty">Хүсэлт алга. “Шинэ хүсэлт” дарж эхлүүлээрэй.</p>
          )}

          {STATUS_ORDER.map((status) => {
            const group = requests.filter((r) => r.status === status);
            if (group.length === 0) return null;
            return (
              <div className="issue-group" key={status}>
                <div className="group-head">
                  <StatusIcon status={status} />
                  <span>{STATUS_META[status].label}</span>
                  <span className="count">{group.length}</span>
                </div>
                <ul className="issue-rows">
                  {group.map((r) => (
                    <li
                      key={r.id}
                      className="issue-row"
                      onClick={() =>
                        navigate(`/projects/${project.id}/requests/${r.id}`)
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
                        {r.createdBy && (
                          <span className="ir-project">{r.createdBy.name}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {history.length > 0 && (
            <div className="issue-group">
              <div className="group-head">
                <span>Түүх</span>
                <span className="count">{history.length}</span>
              </div>
              <ul className="comment-list">
                {history.map((h) => (
                  <li key={h.id} className="comment">
                    <div className="comment-body">
                      <div className="comment-head">
                        <strong>{h.title}</strong>
                        <span className="muted">{timeAgo(h.createdAt)}</span>
                        {h.actor && (
                          <span className="muted">· {h.actor.name}</span>
                        )}
                      </div>
                      {h.description && (
                        <div className="comment-content">{h.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <RequestForm
        project={{ id: project.id, name: project.name }}
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={afterCreate}
      />
    </>
  );
}
