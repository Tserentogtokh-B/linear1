import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useWorkspace } from "../components/Layout";
import Topbar from "../components/Topbar";
import { Avatar, Icon } from "../components/Icons";
import { MemberRole, WorkspaceDetail, WorkspaceMember } from "../types";
import "./style/Invite.css";

const ROLES: MemberRole[] = ["CLIENT", "ENGINEER", "ADMIN"];

export default function Invite() {
  const { workspaceId: routeId } = useParams<{ workspaceId?: string }>();
  const { workspaces } = useWorkspace();
  const [workspaceId, setWorkspaceId] = useState(routeId || "");
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("CLIENT");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError("");
    try {
      const w = await api.workspace(workspaceId);
      setWorkspace(w);
      setMembers(w.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      setWorkspace(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    setWorkspaceId(routeId || workspaces[0]?.id || "");
  }, [routeId, workspaces]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setSending(true);
    try {
      const m = await api.addWorkspaceMember(workspaceId, email.trim(), role);
      setMembers((prev) => [...prev, m]);
      setOk(`${m.user.name} (${m.user.email}) нэмэгдлээ.`);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSending(false);
    }
  }

  const selected =
    workspace ?? workspaces.find((w) => w.id === workspaceId) ?? null;
  const isWsInvite = Boolean(routeId);

  return (
    <>
      <Topbar
        crumbs={[
          ...(isWsInvite && workspace
            ? [{ label: workspace.name, to: `/workspaces/${workspace.id}` }]
            : []),
          { label: "Гишүүн урих" },
        ]}
      />
      <div className="main-scroll">
        <div className="page narrow">
          <div className="invite-hero">
            <span className="project-icon">
              <Icon name="user-plus" size={20} />
            </span>
            <div>
              <h1>Гишүүн урих</h1>
              <p className="muted">
                Бүртгэлтэй хэрэглэгчийг и-мэйлээр нь workspace-д нэмнэ.
              </p>
            </div>
          </div>

          {workspaces.length === 0 ? (
            <div className="empty">
              Эхлээд{" "}
              <Link to="/workspaces/new" className="link">
                workspace үүсгэнэ үү
              </Link>
              .
            </div>
          ) : (
            <>
              <form className="panel-form" onSubmit={handleSubmit}>
                {!isWsInvite && (
                  <label className="field">
                    Workspace
                    <select
                      value={workspaceId}
                      onChange={(e) => setWorkspaceId(e.target.value)}
                    >
                      {workspaces.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="field">
                  Хэрэглэгчийн и-мэйл
                  <input
                    type="email"
                    placeholder="ж: gishuun@aurora.mn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="field">
                  Role
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as MemberRole)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                {error && <div className="error">{error}</div>}
                {ok && <div className="success">{ok}</div>}

                <button type="submit" disabled={sending || !workspaceId}>
                  {sending ? "Уригдаж байна…" : "Урих"}
                </button>
              </form>

              <div className="invite-members">
                <h4>
                  {selected?.name} — гишүүд{" "}
                  <span className="muted">({members.length})</span>
                </h4>
                {loading ? (
                  <p className="muted">Ачааллаж байна…</p>
                ) : (
                  <ul className="member-list">
                    {members.map((m) => (
                      <li key={m.id}>
                        <Avatar name={m.user.name} />
                        <div className="member-info">
                          <strong>{m.user.name}</strong>
                          <span className="muted">{m.user.email}</span>
                        </div>
                        <span className="team-pill">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
