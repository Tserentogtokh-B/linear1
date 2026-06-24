import { useEffect, useRef, useState } from "react";
import { Project } from "../../types";
import { VIEW_OPTIONS } from "../../constants/ConstCreateProject";
import { ViewKey } from "../../hooks/useProjects";

export default function ProjectToolbar({
  projects,
  filteredCount,
  view,
  onViewChange,
  onCreateClick,
}: {
  projects: Project[];
  filteredCount: number;
  view: ViewKey;
  onViewChange: (view: ViewKey) => void;
  onCreateClick: () => void;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Гадна талд дарвал цэсийг хаана
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (viewRef.current && !viewRef.current.contains(target))
        setViewOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function countFor(key: ViewKey): number {
    return key === "all"
      ? projects.length
      : projects.filter((p) => p.status === key).length;
  }

  return (
    <div className="project-toolbar">
      <span className="project-count">{filteredCount} төсөл</span>

      <div className="dropdown-root" ref={viewRef}>
        <button
          type="button"
          className="toolbar-button"
          onClick={() => setViewOpen((open) => !open)}
        >
          View <span className="chevron">▾</span>
        </button>
        {viewOpen && (
          <div className="dropdown-menu view-dropdown">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={view === option.key ? "active" : ""}
                onClick={() => {
                  onViewChange(option.key);
                  setViewOpen(false);
                }}
              >
                <span>{option.label}</span>
                <span className="menu-count">{countFor(option.key)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="btn-primary" onClick={onCreateClick}>
        + Шинэ төсөл
      </button>
    </div>
  );
}
