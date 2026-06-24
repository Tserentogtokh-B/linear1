import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useWorkspace } from "../components/Layout";
import Topbar from "../components/Topbar";
import "./style/CreateTeam.css";

export default function CreateWorkspace() {
  const navigate = useNavigate();
  const { reloadWorkspaces } = useWorkspace();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const workspace = await api.createWorkspace({ name });
      await reloadWorkspaces();
      navigate(`/workspaces/${workspace.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Topbar crumbs={[{ label: "Шинэ workspace" }]} />
      <div className="main-scroll">
        <div className="page narrow">
          <h1>Шинэ workspace үүсгэх</h1>
          <p className="muted">
            Workspace бол төслүүд болон гишүүд хамтран ажиллах орон зай.
          </p>

          <form className="panel-form" onSubmit={handleSubmit}>
            <label className="field">
              Workspace-ийн нэр
              <input
                placeholder="ж: Aurora workspace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={saving}>
              {saving ? "Үүсгэж байна…" : "Workspace үүсгэх"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
