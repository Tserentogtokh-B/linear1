import { useCallback, useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { api } from "../api";
// import { Team } from "../types";
import Sidebar from "./Sidebar";
import SearchModal from "./SearchModal";



// Хүүхэд хуудсууд энэ context-оор баг/мэдэгдлийн төлөвт хүрнэ
export function useWorkspace() {
  return useOutletContext<WorkspaceCtx>();
}

export default function Layout() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const reloadTeams = useCallback(async () => {
    try {
      setTeams(await api.teams());
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUnread = useCallback(() => {
    api
      .unreadCount()
      .then((r) => setUnread(r.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    reloadTeams();
    refreshUnread();
  }, [reloadTeams, refreshUnread]);

  // Ctrl/Cmd+K — хайлт нээх
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        teams={teams}
        unread={unread}
        loading={loading}
        onSearch={() => setSearchOpen(true)}
      />
      <main className="main-area">
        <Outlet context={{ teams, reloadTeams, refreshUnread }} />
      </main>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
