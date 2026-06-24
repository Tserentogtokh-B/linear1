import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth";
import { useWorkspace } from "../components/Layout";
import { useRequest } from "../hooks/useRequest";
import { useChanges } from "../hooks/useChanges";
import Topbar from "../components/Topbar";
import IssueAttachments from "../components/issue/IssueAttachments";
import RequestChanges from "../components/request/RequestChanges";
import RequestProperties from "../components/request/RequestProperties";
import "./style/IssueDetail.css";

export default function RequestDetail() {
  const { projectId, requestId } = useParams<{
    projectId: string;
    requestId: string;
  }>();
  const { refreshUnread } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { request, error, patch, attachFiles, removeAttachment, removeRequest } =
    useRequest(requestId);
  const changes = useChanges({ projectId, requestId });

  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  useEffect(() => {
    if (request) {
      setTitleDraft(request.title);
      setDescDraft(request.description ?? "");
    }
  }, [request]);

  function patchAndRefresh(data: Parameters<typeof patch>[0]) {
    patch(data);
    refreshUnread();
  }

  function saveTitle() {
    if (!request) return;
    if (titleDraft.trim() && titleDraft !== request.title) {
      patchAndRefresh({ title: titleDraft.trim() });
    } else {
      setTitleDraft(request.title);
    }
  }

  function saveDesc() {
    if (request) patchAndRefresh({ description: descDraft });
    setEditingDesc(false);
  }

  async function deleteRequest() {
    if (!request) return;
    if (!confirm(`"${request.title}" хүсэлтийг устгах уу?`)) return;
    await removeRequest();
    navigate(-1);
  }

  async function addChange(input: { title: string; description?: string }) {
    await changes.add(input);
    refreshUnread();
  }

  if (!request) {
    return (
      <>
        <Topbar crumbs={[{ label: "Хүсэлт" }]} />
        <div className="main-scroll">
          <div className="page">
            {error ? (
              <div className="error">{error}</div>
            ) : (
              <p className="muted">Ачааллаж байна…</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        crumbs={[
          { label: request.project?.name ?? "Төсөл" },
          { label: request.title },
        ]}
        actions={
          <button className="link danger" onClick={deleteRequest}>
            Устгах
          </button>
        }
      />

      {error && (
        <div style={{ padding: "8px 16px" }}>
          <div className="error">{error}</div>
        </div>
      )}

      <div className="issue-detail">
        <div className="detail-main">
          <div className="detail-inner">
            <input
              className="detail-title-input"
              style={{ width: "100%", marginBottom: 18 }}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />

            {editingDesc ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea
                  rows={6}
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={saveDesc}>
                    Хадгалах
                  </button>
                  <button
                    className="link"
                    onClick={() => {
                      setDescDraft(request.description ?? "");
                      setEditingDesc(false);
                    }}
                  >
                    Болих
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`detail-desc ${request.description ? "" : "empty-desc"}`}
                onClick={() => setEditingDesc(true)}
                style={{ cursor: "text" }}
              >
                {request.description || "Тайлбар нэмэхийн тулд дарна уу…"}
              </div>
            )}

            <IssueAttachments
              attachments={request.attachments ?? []}
              currentUserId={user?.id}
              onUpload={attachFiles}
              onRemove={removeAttachment}
            />

            <RequestChanges
              changes={changes.changes}
              currentUserId={user?.id}
              onAdd={addChange}
              onEdit={changes.edit}
              onRemove={changes.remove}
            />
          </div>
        </div>

        <RequestProperties request={request} onPatch={patchAndRefresh} />
      </div>
    </>
  );
}
