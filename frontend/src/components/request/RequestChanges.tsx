import { useState } from "react";
import { ProjectChange } from "../../types";
import { Avatar } from "../Icons";
import { timeAgo } from "../../utils/format";

export default function RequestChanges({
  changes,
  currentUserId,
  onAdd,
  onEdit,
  onRemove,
}: {
  changes: ProjectChange[];
  currentUserId?: string;
  onAdd: (input: { title: string; description?: string }) => Promise<void>;
  onEdit: (id: string, data: { title?: string; description?: string }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  async function post() {
    if (!title.trim()) return;
    setPosting(true);
    try {
      await onAdd({ title: title.trim(), description: description.trim() || undefined });
      setTitle("");
      setDescription("");
    } finally {
      setPosting(false);
    }
  }

  async function saveEdit(id: string) {
    if (!editDraft.trim()) return;
    await onEdit(id, { description: editDraft.trim() });
    setEditingId(null);
  }

  return (
    <>
      <div className="detail-section-title">Өөрчлөлтүүд</div>
      {changes.length === 0 && (
        <p className="muted" style={{ fontSize: 13 }}>
          Өөрчлөлт алга. Эхнийхийг бүртгээрэй.
        </p>
      )}
      <ul className="comment-list">
        {changes.map((c) => (
          <li key={c.id} className="comment">
            <Avatar name={c.engineer?.name} />
            <div className="comment-body">
              <div className="comment-head">
                <strong>{c.engineer?.name ?? "Инженер"}</strong>
                <span className="muted">{timeAgo(c.createdAt)}</span>
                {c.engineerId === currentUserId && editingId !== c.id && (
                  <span className="comment-actions">
                    <button
                      className="link"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditDraft(c.description ?? "");
                      }}
                    >
                      Засах
                    </button>
                    <button
                      className="link danger"
                      onClick={() => {
                        if (confirm("Энэ өөрчлөлтийг устгах уу?")) onRemove(c.id);
                      }}
                    >
                      Устгах
                    </button>
                  </span>
                )}
              </div>
              <div className="comment-content">
                <strong>{c.title}</strong>
                {editingId === c.id ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}
                  >
                    <textarea
                      rows={3}
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-primary" onClick={() => saveEdit(c.id)}>
                        Хадгалах
                      </button>
                      <button className="link" onClick={() => setEditingId(null)}>
                        Болих
                      </button>
                    </div>
                  </div>
                ) : (
                  c.description && <div style={{ marginTop: 4 }}>{c.description}</div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="comment-compose">
        <input
          className="title-input"
          placeholder="Өөрчлөлтийн гарчиг (ж: Алдаа зассан)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          rows={3}
          placeholder="Дэлгэрэнгүй тайлбар…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <button className="btn-primary" disabled={posting || !title.trim()} onClick={post}>
            {posting ? "Илгээж байна…" : "Өөрчлөлт нэмэх"}
          </button>
        </div>
      </div>
    </>
  );
}
