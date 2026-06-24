import { FormEvent, forwardRef, useState } from "react";
import { ProjectStatus } from "../../types";
import { PROJECT_STATUSES, STATUS_META } from "../../constants/ConstCreateProject";

interface Props {
  onCreate: (input: {
    name: string;
    description: string;
    status: ProjectStatus;
  }) => Promise<void>;
}

// Шинэ төсөл үүсгэх форм — өөрийн оруулгын төлвийг дотроо удирдана.
const ProjectCreateForm = forwardRef<HTMLDivElement, Props>(
  function ProjectCreateForm({ onCreate }, ref) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    async function submit(e: FormEvent) {
      e.preventDefault();
      setError("");
      const trimmed = name.trim();
      if (!trimmed) return;

      setCreating(true);
      try {
        await onCreate({ name: trimmed, description: description.trim(), status });
        setName("");
        setDescription("");
        setStatus("ACTIVE");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Алдаа гарлаа");
      } finally {
        setCreating(false);
      }
    }

    return (
      <div ref={ref} className="create-project-card">
        <div className="create-project-head">
          <div>
            <h2>Шинэ төсөл</h2>
            <p className="muted">Энэ workspace дотор шинэ төсөл үүсгэнэ.</p>
          </div>
          <span className="project-orb">⬡</span>
        </div>

        <form className="project-form" onSubmit={submit}>
          <label className="field">
            <span>Төслийн нэр</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Жишээ нь: Mobile app launch"
              required
            />
          </label>

          <label className="field">
            <span>Тайлбар</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Төслийн зорилго, хүрээг товч бичнэ..."
            />
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={creating}>
            {creating ? "Үүсгэж байна…" : "Төсөл үүсгэх"}
          </button>
        </form>
      </div>
    );
  },
);

export default ProjectCreateForm;
