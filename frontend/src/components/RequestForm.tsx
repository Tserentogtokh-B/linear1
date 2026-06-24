import { useState, FormEvent, ChangeEvent } from "react";
import { api } from "../api";
import { RequestPriority } from "../types";
import { PRIORITY_META } from "./Icons";

const PRIORITIES: RequestPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

// "Шинэ хүсэлт" модал. open/onClose-оор гаднаас удирдана.
export default function RequestForm({
  project,
  open,
  onClose,
  onCreated,
}: {
  project: { id: string; name: string };
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("MEDIUM");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setFiles([]);
    setError("");
  }

  function close() {
    reset();
    onClose();
  }

  function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files ? Array.from(e.target.files) : []);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const request = await api.createRequest({
        projectId: project.id,
        title,
        description: description || undefined,
        priority,
      });
      for (const file of files) {
        await api.uploadRequestAttachment(request.id, file);
      }
      reset();
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="team-avatar">{project.name[0]?.toUpperCase()}</span>
          <span>{project.name} • Шинэ хүсэлт</span>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <input
            className="title-input"
            placeholder="Хүсэлтийн гарчиг"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <textarea
            className="desc-input"
            placeholder="Тайлбар нэмэх…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="task-form-row">
            <label>
              Чухал зэрэг
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            Файл хавсаргах (заавал биш)
            <input type="file" multiple onChange={onPickFiles} />
          </label>
          {files.length > 0 && (
            <div className="muted file-hint">
              {files.length} файл: {files.map((f) => f.name).join(", ")}
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <div className="task-form-actions">
            <button type="button" className="link" onClick={close}>
              Болих
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Хадгалж байна..." : "Хүсэлт үүсгэх"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
