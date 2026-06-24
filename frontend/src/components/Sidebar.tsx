import { useState, type CSSProperties } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { Workspace } from "../types";
import { Icon } from "./Icons";
import ThemeToggle from "./ThemeToggle";
import WorkspaceMenu from "./WorkspaceMenu";
import { teamColor } from "../utils/teamColor";

export default function Sidebar({
  workspaces,
  unread,
  loading,
  onSearch,
}: {
  workspaces: Workspace[];
  unread: number;
  loading: boolean;
  onSearch: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [wsOpen, setWsOpen] = useState(true);
  const [tryOpen, setTryOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const orgName = user?.name || "Aurora";

  // Эхний workspace руу аваачих (эсвэл шинээр үүсгэх)
  function goFirst() {
    if (workspaces[0]) navigate(`/workspaces/${workspaces[0].id}`);
    else navigate("/workspaces/new");
  }

  return (
    <aside className="sidebar">
      {/* Org switcher */}
      <div className="ws-header">
        <button
          className="ws-switcher"
          onClick={() => setMenuOpen((v) => !v)}
          title="Цэс"
        >
          <span className="ws-badge">{orgName[0]?.toUpperCase() || "A"}</span>
          <span className="ws-title">{orgName}</span>
          <span className="ws-chevron">
            <Icon name="chevron" size={14} />
          </span>
        </button>
        <div className="ws-actions">
          <button className="icon-btn" title="Хайх (Ctrl+K)" onClick={onSearch}>
            <Icon name="search" />
          </button>
          <button className="icon-btn" title="Workspace руу" onClick={goFirst}>
            <Icon name="edit" />
          </button>
        </div>
        {menuOpen && (
          <WorkspaceMenu
            workspaces={workspaces}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>

      {/* Inbox / My requests */}
      <nav className="nav-section">
        <NavLink to="/inbox" className="nav-item">
          <span className="ico">
            <Icon name="inbox" />
          </span>
          <span className="label">Inbox</span>
          {unread > 0 && <span className="nav-badge">{unread}</span>}
        </NavLink>
        <NavLink to="/my-requests" className="nav-item">
          <span className="ico">
            <Icon name="target" />
          </span>
          <span className="label">Миний хүсэлтүүд</span>
        </NavLink>
        <NavLink to="/views" className="nav-item">
          <span className="ico">
            <Icon name="grid" />
          </span>
          <span className="label">Сүүлд харсан</span>
        </NavLink>
      </nav>

      {/* Workspaces */}
      <div className="nav-section spaced">
        <div className="nav-label">
          <button
            className="section-toggle"
            onClick={() => setWsOpen((v) => !v)}
          >
            <span className={`caret ${wsOpen ? "" : "closed"}`}>
              <Icon name="chevron" size={12} />
            </span>
            Workspaces
          </button>
          <span className="spacer" />
          <NavLink
            to="/workspaces/new"
            className="nav-add"
            title="Шинэ workspace"
          >
            <Icon name="plus" size={14} />
          </NavLink>
        </div>

        {wsOpen && (
          <>
            {loading && <div className="nav-hint">Ачааллаж байна…</div>}
            {!loading && workspaces?.length === 0 && (
              <NavLink to="/workspaces/new" className="nav-hint link">
                + Эхний workspace-аа үүсгэ
              </NavLink>
            )}

            {workspaces?.map((w) => {
              const color = teamColor(w.id);
              return (
                <NavLink
                  key={w.id}
                  to={`/workspaces/${w.id}`}
                  className="nav-item"
                >
                  <span
                    className="team-avatar"
                    style={{ "--team-color": color } as CSSProperties}
                  >
                    {w.name[0]?.toUpperCase()}
                  </span>
                  <span className="label">{w.name}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </div>

      {/* Try */}
      <div className="nav-section spaced">
        <div className="nav-label">
          <button
            className="section-toggle"
            onClick={() => setTryOpen((v) => !v)}
          >
            <span className={`caret ${tryOpen ? "" : "closed"}`}>
              <Icon name="chevron" size={12} />
            </span>
            Try
          </button>
        </div>
        {tryOpen && (
          <NavLink to="/invite" className="nav-item">
            <span className="ico">
              <Icon name="user-plus" />
            </span>
            <span className="label">Гишүүн урих</span>
          </NavLink>
        )}
      </div>

      {/* Footer: user + theme + logout */}
      <div className="sidebar-foot">
        <span className="avatar">{(user?.name || "?")[0].toUpperCase()}</span>
        <div className="foot-user">
          <strong>{user?.name}</strong>
          <span className="muted">{user?.email}</span>
        </div>
        <ThemeToggle />
        <button className="icon-btn" title="Гарах" onClick={logout}>
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}
