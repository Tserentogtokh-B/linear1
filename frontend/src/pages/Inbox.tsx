import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Notification } from "../types";
import { useWorkspace } from "../components/Layout";
import Topbar from "../components/Topbar";
import "./style/Inbox.css";

export default function Inbox() {
  const { refreshUnread } = useWorkspace();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setItems(await api.notifications());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    await api.markRead(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    refreshUnread();
  }

  async function markAll() {
    await api.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    refreshUnread();
  }

  const hasUnread = items.some((n) => !n.read);

  return (
    <>
      <Topbar
        crumbs={[{ label: "Inbox", icon: "📥" }]}
        actions={
          hasUnread ? (
            <button className="link" onClick={markAll}>
              Бүгдийг уншсан болгох
            </button>
          ) : undefined
        }
      />
      <div className="main-scroll">
        <div className="page inbox-page">
          {loading && <p className="muted">Ачааллаж байна…</p>}
          {!loading && items.length === 0 && (
            <p className="empty">Мэдэгдэл алга.</p>
          )}

          <ul className="notif-list">
            {items.map((n) => (
              <li key={n.id} className={`notif-row ${n.read ? "" : "unread"}`}>
                {!n.read && <span className="unread-dot" />}
                <div className="notif-body">
                  <span>{n.message}</span>
                  {n.requestId && n.projectId && (
                    <Link
                      to={`/projects/${n.projectId}/requests/${n.requestId}`}
                      className="notif-link"
                    >
                      Хүсэлт рүү очих →
                    </Link>
                  )}
                </div>
                {!n.read && (
                  <button className="link" onClick={() => markRead(n.id)}>
                    Уншсан
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
