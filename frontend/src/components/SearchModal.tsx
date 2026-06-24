import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { SearchResults } from "../types";
import { PriorityIcon, StatusIcon } from "./Icons";

const emptyResults: SearchResults = {
  requests: [],
  projects: [],
  workspaces: [],
};

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Бичих болгонд 200мс хүлээгээд хайна (debounce)
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults(emptyResults);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      api
        .search(term)
        .then(setResults)
        .catch(() => setResults(emptyResults))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  function go(path: string) {
    navigate(path);
    onClose();
  }

  const nothing =
    !loading &&
    q.trim() &&
    results.requests.length === 0 &&
    results.projects.length === 0 &&
    results.workspaces.length === 0;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Хүсэлт, төсөл, workspace хайх…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
        <div className="search-results">
          {loading && <div className="search-hint muted">Хайж байна…</div>}
          {nothing && <div className="search-hint muted">Илэрц олдсонгүй.</div>}

          {results.requests.map((r) => (
            <button
              key={r.id}
              className="search-row"
              onClick={() => go(`/projects/${r.projectId}/requests/${r.id}`)}
            >
              <span className="ir-priority">
                <PriorityIcon priority={r.priority} />
              </span>
              <span className="ir-id">{r.project.name}</span>
              <span className="ir-status">
                <StatusIcon status={r.status} />
              </span>
              <span className="search-title">{r.title}</span>
            </button>
          ))}
          {results.projects.map((p) => (
            <button
              key={p.id}
              className="search-row"
              onClick={() =>
                go(`/workspaces/${p.workspaceId}/projects/${p.id}`)
              }
            >
              <span className="ir-status" />
              <span className="ir-id">Төсөл</span>
              <span className="search-title">{p.name}</span>
            </button>
          ))}
          {results.workspaces.map((w) => (
            <button
              key={w.id}
              className="search-row"
              onClick={() => go(`/workspaces/${w.id}`)}
            >
              <span className="ir-status">
                <span className="team-avatar">{w.name[0]?.toUpperCase()}</span>
              </span>
              <span className="ir-id">Workspace</span>
              <span className="search-title">{w.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
