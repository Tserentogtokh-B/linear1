import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useTheme } from "../hooks/useTheme";
import { Workspace } from "../types";
import { Icon } from "./Icons";

export default function WorkspaceMenu({
  workspaces,
  onClose,
}: {
  workspaces: Workspace[];
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // Гадна талд дарах / ESC дарах үед хаана
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function go(path: string) {
    navigate(path);
    onClose();
  }

  return (
    <div className="ws-menu" ref={ref}>
      <div className="ws-menu-head">
        <span className="avatar">{(user?.name || "?")[0].toUpperCase()}</span>
        <div className="foot-user">
          <strong>{user?.name}</strong>
          <span className="muted">{user?.email}</span>
        </div>
      </div>

      <button className="ws-menu-item" onClick={() => go("/invite")}>
        <span className="ico">
          <Icon name="user-plus" />
        </span>
        Гишүүн урих
      </button>

      {workspaces[0] && (
        <button
          className="ws-menu-item"
          onClick={() => go(`/workspaces/${workspaces[0].id}`)}
        >
          <span className="ico">
            <Icon name="settings" />
          </span>
          Workspace
        </button>
      )}

      <button className="ws-menu-item" onClick={toggle}>
        <span className="ico">
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </span>
        {theme === "dark" ? "Гэрэл горим" : "Харанхуй горим"}
      </button>

      <button
        className="ws-menu-item danger"
        onClick={() => {
          logout();
          onClose();
        }}
      >
        <span className="ico">
          <Icon name="logout" />
        </span>
        Гарах
      </button>
    </div>
  );
}
