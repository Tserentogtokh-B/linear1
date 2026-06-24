import { ChangeEvent, useRef, useState } from "react";
import { api } from "../../api";
import { Attachment } from "../../types";
import { formatSize } from "../../utils/format";

export default function IssueAttachments({
  attachments,
  currentUserId,
  onUpload,
  onRemove,
}: {
  attachments: Attachment[];
  currentUserId?: string;
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setBusy(true);
    try {
      await onUpload(files);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setBusy(false);
    }
  }

  async function download(att: Attachment) {
    try {
      await api.downloadAttachment(att);
    } catch {
      alert("Файл татаж чадсангүй");
    }
  }

  return (
    <>
      <div className="detail-section-title">Хавсралт</div>
      {attachments.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Хавсралт алга.
        </p>
      ) : (
        <ul className="attachments">
          {attachments.map((att) => (
            <li key={att.id}>
              <button
                type="button"
                className="link file-link"
                onClick={() => download(att)}
                title={`${att.uploadedBy.name} оруулсан`}
              >
                📎 {att.filename}
              </button>
              <span className="muted file-size">{formatSize(att.size)}</span>
              {att.uploadedById === currentUserId && (
                <button
                  type="button"
                  className="link danger x"
                  onClick={() => {
                    if (confirm(`"${att.filename}" файлыг устгах уу?`))
                      onRemove(att.id);
                  }}
                  title="Устгах"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        className="link"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        style={{ paddingLeft: 0 }}
      >
        {busy ? "Хуулж байна…" : "📎 Файл хавсаргах"}
      </button>
      <input ref={fileRef} type="file" multiple hidden onChange={pick} />
    </>
  );
}
