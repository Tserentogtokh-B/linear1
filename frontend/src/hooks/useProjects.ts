import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { Project, ProjectStatus } from "../types";
import { recordRecentView } from "../utils/recentViews";

export type ViewKey = "all" | ProjectStatus;

// Нэг workspace доторх төслүүдийн жагсаалт ба үйлдлийг удирдана.
export function useProjects(workspaceId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError("");
    try {
      setProjects(await api.projects(workspaceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const countRequests = useCallback(
    (project: Project) => project._count?.requests ?? 0,
    [],
  );

  async function createProject(input: {
    name: string;
    description: string;
    status: ProjectStatus;
  }) {
    if (!workspaceId) return;
    await api.createProject({
      workspaceId,
      name: input.name,
      description: input.description || null,
      status: input.status,
    });
    await load();
  }

  async function deleteProject(id: string) {
    await api.deleteProject(id);
    await load();
  }

  async function setStatus(id: string, status: ProjectStatus) {
    await api.updateProject(id, { status });
    await load();
  }

  function rememberProject(project: Project) {
    recordRecentView({
      kind: "project",
      id: project.id,
      title: project.name,
      subtitle: project.workspace?.name,
      to: `/workspaces/${project.workspaceId}/projects/${project.id}`,
    });
  }

  return {
    projects,
    loading,
    error,
    setError,
    countRequests,
    createProject,
    deleteProject,
    setStatus,
    rememberProject,
    reload: load,
  };
}
