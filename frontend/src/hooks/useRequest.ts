import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { ProjectRequest } from "../types";
import { recordRecentView } from "../utils/recentViews";

// Нэг хүсэлтийн дата ачаалал, шинэчлэл, хавсралтыг удирдана.
export function useRequest(requestId?: string) {
  const [request, setRequest] = useState<ProjectRequest | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!requestId) return;
    setError("");
    try {
      const rq = await api.request(requestId);
      setRequest(rq);
      recordRecentView({
        kind: "request",
        id: rq.id,
        title: rq.title,
        subtitle: rq.project?.name,
        to: `/projects/${rq.projectId}/requests/${rq.id}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(data: Parameters<typeof api.updateRequest>[1]) {
    if (!request) return;
    try {
      setRequest(await api.updateRequest(request.id, data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }

  async function attachFiles(files: File[]) {
    if (!request || files.length === 0) return;
    for (const file of files) await api.uploadRequestAttachment(request.id, file);
    await load();
  }

  async function removeAttachment(id: string) {
    await api.deleteAttachment(id);
    await load();
  }

  async function removeRequest() {
    if (!request) return;
    await api.deleteRequest(request.id);
  }

  return {
    request,
    error,
    setError,
    patch,
    attachFiles,
    removeAttachment,
    removeRequest,
    reload: load,
  };
}
