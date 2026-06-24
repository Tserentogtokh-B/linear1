import { useState } from "react";
import { Project, ProjectStatus } from "../../types";
import { PROJECT_STATUSES, STATUS_META } from "../../constants/ConstCreateProject";
import { formatDate } from "../../utils/FormatDate";

export default function ProjectCard({
  project,
  requestCount,
  onOpen,
  onSetStatus,
  onDelete,
}: {
  project: Project;
  requestCount: number;
  onOpen: (project: Project) => void;
  onSetStatus: (id: string, status: ProjectStatus) => void;
  onDelete: (project: Project) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const meta = STATUS_META[project.status];

  return (
    <article className="project-card clickable" onClick={() => onOpen(project)}>
      <div className="project-card-head">
        <div className="project-icon">⬡</div>
        <div className="project-title-wrap">
          <div className="project-title-row">
            <h3>{project.name}</h3>
            <span className={`status-badge ${meta.className}`}>
              {meta.icon} {meta.label}
            </span>
          </div>
          <div className="project-meta-line">
            <span className="muted">{requestCount} хүсэлт</span>
            <span className="muted">Үүсгэсэн {formatDate(project.createdAt)}</span>
          </div>
        </div>
        <div className="project-actions" onClick={(e) => e.stopPropagation()}>
          <div className="project-more-wrap">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setMoreOpen((open) => !open)}
              title="More"
            >
              ⋯
            </button>
            {moreOpen && (
              <div className="dropdown-menu project-more-menu">
                {PROJECT_STATUSES.filter((s) => s !== project.status).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onSetStatus(project.id, s);
                      setMoreOpen(false);
                    }}
                  >
                    → {STATUS_META[s].label}
                  </button>
                ))}
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    onDelete(project);
                    setMoreOpen(false);
                  }}
                >
                  Устгах
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {project.description && (
        <p className="project-description">{project.description}</p>
      )}
    </article>
  );
}
