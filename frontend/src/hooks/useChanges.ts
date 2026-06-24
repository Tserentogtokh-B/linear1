import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { ProjectChange } from "../types";

// Хүсэлтийн өөрчлөлтүүдийг ачаалж, нэмэх/засах/устгах үйлдлийг удирдана.
export function useChanges(opts: { projectId?: string; requestId?: string }) {
  const { projectId, requestId } = opts;
  const [changes, setChanges] = useState<ProjectChange[]>([]);

  const load = useCallback(async () => {
    if (!projectId && !requestId) return;
    try {
      setChanges(await api.changes({ projectId, requestId }));
    } catch {
      setChanges([]);
    }
  }, [projectId, requestId]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(input: { title: string; description?: string }) {
    if (!projectId) return;
    await api.createChange({
      projectId,
      requestId,
      title: input.title,
      description: input.description,
    });
    await load();
  }

  async function edit(id: string, data: Parameters<typeof api.updateChange>[1]) {
    const updated = await api.updateChange(id, data);
    setChanges((cs) => cs.map((c) => (c.id === id ? updated : c)));
  }

  async function remove(id: string) {
    await api.deleteChange(id);
    setChanges((cs) => cs.filter((c) => c.id !== id));
  }

  return { changes, add, edit, remove, reload: load };
}
